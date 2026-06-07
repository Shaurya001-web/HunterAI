import os
import jwt
from fastapi import Header, HTTPException, Depends
from sqlalchemy.orm import Session
from config.database import get_db
from config.models import User

# Load Supabase JWT Secret
JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET")

# Mock user fallback
MOCK_USER = {
    "id": "mock_user_shaurya",
    "email": "mishrashaurya2008@gmail.com",
    "name": "Shaurya Mishra"
}

def get_current_user(
    authorization: str = Header(None),
    db: Session = Depends(get_db)
) -> User:
    # 1. Parse custom mock token if present (local development isolation)
    if authorization:
        try:
            scheme, token = authorization.split()
            if scheme.lower() == "bearer" and token.startswith("mock_token:"):
                parts = token.split(":")
                if len(parts) >= 4:
                    user_id = parts[1]
                    email = parts[2]
                    name = parts[3]
                    
                    db_user = db.query(User).filter(User.id == user_id).first()
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

    # 2. Fallback to mock user if JWT Secret or header is missing
    if not JWT_SECRET or not authorization:
        db_user = db.query(User).filter(User.id == MOCK_USER["id"]).first()
        if not db_user:
            db_user = User(
                id=MOCK_USER["id"],
                name=MOCK_USER["name"],
                email=MOCK_USER["email"]
            )
            db.add(db_user)
            db.commit()
            db.refresh(db_user)
        return db_user

    # 3. Extract Bearer token for production Supabase auth
    try:
        scheme, token = authorization.split()
        if scheme.lower() != "bearer":
            raise HTTPException(status_code=401, detail="Invalid authentication scheme")
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid Authorization header format")

    # 4. Decode and verify Supabase JWT
    try:
        payload = jwt.decode(
            token,
            JWT_SECRET,
            algorithms=["HS256"],
            options={"verify_aud": False}
        )
        user_id = payload.get("sub")
        email = payload.get("email")
        user_metadata = payload.get("user_metadata", {})
        name = user_metadata.get("full_name") or user_metadata.get("name") or email.split("@")[0]

        if not user_id or not email:
            raise HTTPException(status_code=401, detail="Invalid token payload")

        db_user = db.query(User).filter(User.id == user_id).first()
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
