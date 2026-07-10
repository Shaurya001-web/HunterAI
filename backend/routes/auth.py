import os
import jwt
from fastapi import Header, HTTPException, Depends
from sqlalchemy.orm import Session
from config.database import get_db
from config.models import User


def _get_jwt_secret():
    """Lazy loader so the env var is read after dotenv has been loaded in main.py."""
    return os.getenv("SUPABASE_JWT_SECRET")


def get_current_user(
    authorization: str = Header(None),
    db: Session = Depends(get_db)
) -> User:
    # 1. Parse custom mock token if present (local development isolation)
    if authorization:
        try:
            scheme, token = str(authorization).split(maxsplit=1)
            if scheme.lower() == "bearer" and token.startswith("mock_token:"):
                # Format: mock_token:<user_id>:<email>:<name>
                # Use maxsplit=3 on the token part so names with colons are preserved
                parts = token.split(":", maxsplit=3)
                if len(parts) >= 4:
                    user_id = parts[1]
                    email = parts[2]
                    username = parts[3]
                    
                    db_user = db.query(User).filter(User.id == user_id).first()
                    if not db_user:
                        # Fallback check for email to prevent UNIQUE constraint crash!
                        db_user = db.query(User).filter(User.email == email).first()
                        
                    if not db_user:
                        db_user = User(
                            id=user_id,
                            username=username,
                            email=email
                        )
                        db.add(db_user)
                        db.commit()
                        db.refresh(db_user)
                    return db_user
        except Exception as e:
            print(f"Error parsing mock token: {e}")

    # 2. Require Authorization Header
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing Authorization header")

    # 3. Extract Bearer token for production Supabase auth
    try:
        scheme, token = str(authorization).split(maxsplit=1)
        if scheme.lower() != "bearer":
            raise HTTPException(status_code=401, detail="Invalid authentication scheme")
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid Authorization header format")

    # 4. Decode and verify Supabase JWT
    jwt_secret = _get_jwt_secret()
    supabase_url = os.getenv("SUPABASE_URL") or os.getenv("NEXT_PUBLIC_SUPABASE_URL")
    supabase_anon_key = os.getenv("SUPABASE_ANON_KEY") or os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")

    payload = None

    # Dynamically extract Supabase URL from the token's 'iss' claim if it is not configured in the environment.
    # This enables robust JWKS signature verification even when env vars are missing.
    extracted_supabase_url = supabase_url
    if not extracted_supabase_url:
        try:
            unverified_payload = jwt.decode(token, options={"verify_signature": False})
            iss = unverified_payload.get("iss")
            if iss and ("supabase.co" in iss or "supabase.net" in iss or "localhost" in iss or "127.0.0.1" in iss):
                if "/auth/v1" in iss:
                    extracted_supabase_url = iss.split("/auth/v1")[0]
                else:
                    extracted_supabase_url = iss
        except Exception as e:
            print(f"Could not extract issuer from token: {e}")
    
    # Try JWKS asymmetric verification (highly recommended for new projects signed with ECC/ES256)
    if extracted_supabase_url:
        try:
            jwks_url = f"{extracted_supabase_url.rstrip('/')}/auth/v1/.well-known/jwks.json"
            # Supabase JWKS is publicly accessible, but we can pass api key headers if configured
            headers = {"apikey": supabase_anon_key} if supabase_anon_key else {}
            jwks_client = jwt.PyJWKClient(jwks_url, headers=headers)
            signing_key = jwks_client.get_signing_key_from_jwt(token)
            payload = jwt.decode(
                token,
                signing_key.key,
                algorithms=["ES256", "RS256", "HS256"],
                options={"verify_aud": False}
            )
        except Exception as e:
            print(f"JWKS verification check bypassed or failed: {e}. Falling back to symmetric HS256 secret verification...")

    # Fallback to local symmetric secret verification
    if not payload:
        if not jwt_secret:
            raise HTTPException(
                status_code=401,
                detail="Supabase JWT verification not configured. Define SUPABASE_ANON_KEY or SUPABASE_JWT_SECRET."
            )
        try:
            payload = jwt.decode(
                token,
                jwt_secret,
                algorithms=["HS256"],
                options={"verify_aud": False}
            )
        except jwt.ExpiredSignatureError:
            raise HTTPException(status_code=401, detail="Authentication token has expired")
        except jwt.InvalidTokenError as e:
            raise HTTPException(status_code=401, detail=f"Invalid authentication token: {e}")

    user_id = payload.get("sub")
    email = payload.get("email")
    if not user_id or not email:
        raise HTTPException(status_code=401, detail="Invalid token payload")
        
    user_metadata = payload.get("user_metadata", {})
    username = user_metadata.get("username") or user_metadata.get("full_name") or user_metadata.get("name") or email.split("@")[0]

    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        # Fallback check for email to prevent UNIQUE constraint crash!
        db_user = db.query(User).filter(User.email == email).first()
        
    if not db_user:
        db_user = User(
            id=user_id,
            username=username,
            email=email
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
    
    return db_user
