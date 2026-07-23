
from datetime import datetime, timedelta, timezone
from jose import jwt
from dotenv import load_dotenv
import os

load_dotenv()

def create_access_token(data: dict) -> str:

  print('data : ', data)

  # copy the data
  to_encode = data.copy()

  # expiration time of the token
  expire = datetime.now(timezone.utc) + timedelta(
    minutes=int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES"))
  )

  # encode the token
  to_encode.update({"exp": expire})

  # encode the token
  encoded_jwt = jwt.encode(
    to_encode,
    os.getenv("SECRET_KEY"),
    algorithm=os.getenv("ALGORITHM")
  )

  return encoded_jwt