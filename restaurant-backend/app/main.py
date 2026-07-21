from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from app.routers import restaurant, table, category
from app.core.database import Base, engine
from app.models.restaurant import Restaurant
from app.models.user import User
from app.models.produit_image import ProduitImage  # noqa: F401
from app.routers import produit
from app.routers import commande
from app.routers import auth

app = FastAPI(title="Restaurant API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://192.168.1.121:3000",
    ],
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1|192\.168\.\d{1,3}\.\d{1,3}|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3})(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(restaurant.router)
app.include_router(table.router)
app.include_router(category.router)
app.include_router(produit.router)
app.include_router(commande.router)
app.include_router(auth.router)

# Créer les tables de base de données au démarrage¶
@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)
    with engine.begin() as conn:
        conn.execute(
            text(
                "ALTER TABLE produit_images "
                "ADD COLUMN IF NOT EXISTS public_id VARCHAR(255)"
            )
        )

@app.get("/")
async def root():
    return {"message": "Restaurant API Running"}
