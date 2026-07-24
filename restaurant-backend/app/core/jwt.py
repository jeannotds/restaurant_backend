
from datetime import datetime, timedelta, timezone
from jose import jwt, JWTError
from dotenv import load_dotenv
import os
from fastapi import HTTPException

load_dotenv()


def create_access_token(data: dict) -> str:
    # copy the data
    to_encode = data.copy()

    # expiration time of the token
    expire = datetime.now(timezone.utc) + timedelta(
        minutes=int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES"))
    )

    # encode the token
    to_encode.update({"exp": expire, "type": "access"})

    # encode the token
    encoded_jwt = jwt.encode(
        to_encode,
        os.getenv("SECRET_KEY"),
        algorithm=os.getenv("ALGORITHM")
    )

    return encoded_jwt


def create_refresh_token(data: dict) -> str:

    to_encode = data.copy()
    expire = datetime.now(
        timezone.utc) + timedelta(days=int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS")))
    to_encode.update({"exp": expire, "type": "refresh"})

    encoded_jwt = jwt.encode(
        to_encode,
        os.getenv("SECRET_KEY"),
        algorithm=os.getenv("ALGORITHM")
    )

    return encoded_jwt


def decode_access_token(token: str):
    try:
        payload = jwt.decode(token, os.getenv("SECRET_KEY"),
                             algorithms=[os.getenv("ALGORITHM")])

        if payload["type"] != "access":
            raise HTTPException(status_code=401, detail="Invalid access token")
        return payload
    except JWTError:
        return None


def decode_refresh_token(token: str):
    try:
        payload = jwt.decode(token, os.getenv("SECRET_KEY"),
                             algorithms=[os.getenv("ALGORITHM")])

        if payload["type"] != "refresh":
            raise HTTPException(
                status_code=401, detail="Invalid refresh token")
        return payload
    except JWTError:
        return None


def decode_token(token: str):

    try:
        payload = jwt.decode(
            token,
            os.getenv("SECRET_KEY"),
            algorithms=[os.getenv("ALGORITHM")]
        )

        return payload

    except JWTError:
        return None
