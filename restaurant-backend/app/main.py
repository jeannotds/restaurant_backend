from fastapi import FastAPI
from app.routers import restaurant, table, category
from app.core.database import Base, engine
from app.models.restaurant import Restaurant
from app.routers import produit

app = FastAPI(title="Restaurant API")

app.include_router(restaurant.router)
app.include_router(table.router)
app.include_router(category.router)
app.include_router(produit.router)

# Créer les tables de base de données au démarrage¶
@app.on_event("startup")
def on_startup():
    # Dev bootstrap: ensure the restaurants table exists.
    Base.metadata.create_all(bind=engine)

@app.get("/")
async def root():
    return {"message": "Restaurant API Running"}
