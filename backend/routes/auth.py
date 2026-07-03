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
                    name = parts[3]
                    
                    db_user = db.query(User).filter(User.id == user_id).first()
                    if not db_user:
                        # Fallback check for email to prevent UNIQUE constraint crash!
                        db_user = db.query(User).filter(User.email == email).first()
                        
                    if not db_user:
                        db_user = User(
                            id=user_id,
                            name=name,
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
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing Authorization header")
        
    try:
        scheme, token = str(authorization).split(maxsplit=1)
        if scheme.lower() != "bearer":
            raise HTTPException(status_code=401, detail="Invalid authentication scheme")
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid Authorization header format")

    # 4. Decode and verify Supabase JWT
    jwt_secret = _get_jwt_secret()
    if not jwt_secret:
        raise HTTPException(
            status_code=401,
            detail="Supabase JWT secret not configured. Use mock auth (sign in via the app) for local development."
        )

    try:
        payload = jwt.decode(
            token,
            jwt_secret,
            algorithms=["HS256"],
            options={"verify_aud": False}
        )
        user_id = payload.get("sub")
        email = payload.get("email")
        if not user_id or not email:
            raise HTTPException(status_code=401, detail="Invalid token payload")
            
        user_metadata = payload.get("user_metadata", {})
        name = user_metadata.get("full_name") or user_metadata.get("name") or email.split("@")[0]

        db_user = db.query(User).filter(User.id == user_id).first()
        if not db_user:
            # Fallback check for email to prevent UNIQUE constraint crash!
            db_user = db.query(User).filter(User.email == email).first()
            
        if not db_user:
            db_user = User(
                id=user_id,
                name=name,
                email=email
            )
            db.add(db_user)
            db.commit()
            db.refresh(db_user)
        
        return db_user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Authentication token has expired")
    except jwt.InvalidTokenError as e:
        raise HTTPException(status_code=401, detail=f"Invalid authentication token: {e}")

