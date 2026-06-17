from fastapi import FastAPI
from app.routers import restaurant
from app.core.database import Base, engine
from app.models.restaurant import Restaurant

app = FastAPI(title="Restaurant API")

app.include_router(restaurant.router)

@app.on_event("startup")
def on_startup():
    # Dev bootstrap: ensure the restaurants table exists.
    Base.metadata.create_all(bind=engine)

@app.get("/")
async def root():
    return {"message": "Restaurant API Running"}
