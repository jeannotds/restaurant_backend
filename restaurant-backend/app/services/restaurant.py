from sqlalchemy.orm import Session
from app.models.restaurant import Restaurant
from app.schemas.restaurant import RestaurantCreate
from app.models.commande import Commande
from app.models.produit import Produit
from app.models.table import Table
from uuid import UUID
from sqlalchemy import func
from app.enums.table_status import TablesStatus

STATUTS_ACTIFS = ["EN_ATTENTE", "EN_PREPARATION", "PRETE", "SERVIE"]

def create_restaurant(db: Session, data: RestaurantCreate):
    restaurant = Restaurant(
        nom=data.nom,
        adresse=data.adresse,
        telephone=data.telephone
    )
    db.add(restaurant)
    db.commit()
    db.refresh(restaurant)
    return restaurant

def get_restaurants(db: Session):
    return db.query(Restaurant).all()

def get_restaurant_by_id(db: Session, restaurant_id):
    return db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()

def get_restaurant_stats(db: Session, restaurant_id: UUID):
    # verify if the restaurant exists
    restaurant = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
    if(restaurant is None):
        return None
        # raise HTTPException(status_code=404, detail="Restaurant non trouvé")

    # get the number of tables
    tables_total = db.query(Table).filter(Table.restaurant_id == restaurant_id).count()

    # 3. Tables occupées — count
    tables_occupees = db.query(Table).filter(Table.status == "OCCUPEE", Table.restaurant_id == restaurant_id).count()

    # 4. Places — somme des capacity
    # Places totales (toutes les tables)
    places_total = db.query(
        func.coalesce(func.sum(Table.capacity), 0)
    ).filter(
        Table.restaurant_id == restaurant_id
    ).scalar()

    # Places réellement occupées (toutes tables : LIBRE, PARTIELLE, OCCUPEE)
    # u additionnes la capacité des tables OCCUPEE, pas les places réellement occupées.
    places_occupees = db.query(
        func.coalesce(func.sum(Table.places_occupees), 0)
    ).filter(
        Table.restaurant_id == restaurant_id
    ).scalar()

    # Places libres = capacity - places_occupees par table
    # 4. 1 places_libres
    places_libres = db.query(
        func.coalesce(
            func.sum(Table.capacity - func.coalesce(Table.places_occupees, 0)),
            0
        )
    ).filter(
        Table.restaurant_id == restaurant_id,
        Table.status != "RESERVEE",  # table réservée = 0 place dispo
    ).scalar()

    # Tables réservées : toute la capacité est bloquée
    places_reservées = db.query(
        func.coalesce(func.sum(Table.capacity), 0)
    ).filter(
        Table.restaurant_id == restaurant_id,
        Table.status == "RESERVEE"
    ).scalar()

    # 5. Commandes actives — JOIN obligatoire
    commandes_actives = db.query(Commande).join(Table).filter(
        Table.restaurant_id == restaurant_id,
        Commande.statut.in_(STATUTS_ACTIFS)
    ).count()

    # # 6. Produits
    produits_total = db.query(Produit).filter(
        Produit.restaurant_id == restaurant_id
    ).count()


    # 6. Produits disponibles
    produits_disponibles = db.query(Produit).filter(
        Produit.restaurant_id == restaurant_id,
        Produit.disponible == True
    ).count()

    # 7. Produits non disponibles
    produits_non_disponibles = db.query(Produit).filter(
        Produit.restaurant_id == restaurant_id,
        Produit.disponible == False
    ).count()
    
    return {
        "tables_total": tables_total,
        "tables_occupees": tables_occupees,
        "places_total": places_total,
        "places_occupees": places_occupees,
        "places_libres": places_libres,
        "commandes_actives": commandes_actives,
        "produits_total": produits_total,
        "produits_disponibles": produits_disponibles,
        "places_reservées": places_reservées,
        "produits_non_disponibles": produits_non_disponibles,
    }
    

