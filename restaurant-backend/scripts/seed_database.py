"""
Peuple la base avec 10 restaurants complets (catégories, tables, produits).

Usage:
  cd restaurant-backend
  source env/bin/activate
  python -m scripts.seed_database          # ajoute si < 10 restos seed
  python -m scripts.seed_database --force  # supprime les données seed et recrée
"""

from __future__ import annotations

import argparse
import random
import string
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from sqlalchemy import text
from app.core.database import SessionLocal
from app.models.restaurant import Restaurant
from app.models.category import Category
from app.models.table import Table
from app.models.produit import Produit
from app.models.produit_image import ProduitImage  # noqa: F401
from app.models.commande import Commande  # noqa: F401
from app.models.commande_item import CommandeItem  # noqa: F401
from app.models.table_occupation import TableOccupation  # noqa: F401

RESTAURANTS = [
    {
        "nom": "Le Jardin Gombe",
        "adresse": "12 Avenue du Commerce, Gombe, Kinshasa",
        "telephone": "+243 81 234 5678",
        "style": "gastronomique",
    },
    {
        "nom": "Chez Maman",
        "adresse": "45 Rue Kabambare, Lingwala, Kinshasa",
        "telephone": "+243 99 112 3344",
        "style": "congolais",
    },
    {
        "nom": "La Brasserie du Fleuve",
        "adresse": "8 Boulevard du 30 Juin, Kinshasa",
        "telephone": "+243 81 998 7766",
        "style": "brasserie",
    },
    {
        "nom": "Pizza Napoli",
        "adresse": "23 Avenue Batetela, Kinshasa",
        "telephone": "+243 82 445 6677",
        "style": "italien",
    },
    {
        "nom": "Sushi Zen",
        "adresse": "5 Rue de la Paix, Gombe, Kinshasa",
        "telephone": "+243 99 887 6655",
        "style": "japonais",
    },
    {
        "nom": "Le Petit Bistrot",
        "adresse": "18 Rue de Rivoli, Paris 4e",
        "telephone": "+33 1 42 78 90 12",
        "style": "francais",
    },
    {
        "nom": "Grill & Smoke",
        "adresse": "90 Avenue Kasa-Vubu, Kinshasa",
        "telephone": "+243 81 556 7788",
        "style": "bbq",
    },
    {
        "nom": "Saveurs d'Afrique",
        "adresse": "3 Place de la Gare, Lubumbashi",
        "telephone": "+243 97 223 4455",
        "style": "africain",
    },
    {
        "nom": "Café Lumière",
        "adresse": "7 Rue de la Liberté, Gombe, Kinshasa",
        "telephone": "+243 81 334 9900",
        "style": "cafe",
    },
    {
        "nom": "La Table du Chef",
        "adresse": "2 Avenue de la Paix, Bukavu",
        "telephone": "+243 99 445 1122",
        "style": "chef",
    },
]

SEED_RESTAURANT_NAMES = {r["nom"] for r in RESTAURANTS}

CATEGORIES = [
    ("Entrées", "Pour commencer le repas"),
    ("Plats principaux", "Nos spécialités maison"),
    ("Grillades", "Viandes grillées au charbon"),
    ("Poissons & Mer", "Fraîcheur de la mer et du fleuve"),
    ("Spécialités", "Les incontournables du chef"),
    ("Snacks & Burgers", "Rapide et généreux"),
    ("Accompagnements", "Frites, riz, légumes"),
    ("Desserts", "Douceurs maison"),
    ("Boissons chaudes", "Café, thé, chocolat"),
    ("Boissons fraîches", "Jus, sodas, bières"),
]

PRODUCTS_BY_STYLE: dict[str, list[tuple[str, str, float, int]]] = {
    "gastronomique": [
        ("Carpaccio de bœuf", "Huile de truffe, roquette, parmesan", 18.5, 0),
        ("Velouté de champignons", "Crème fraîche et ciboulette", 12.0, 0),
        ("Salade César", "Poulet grillé, croûtons, sauce maison", 14.0, 0),
        ("Tartare de saumon", "Avocat, citron vert, sésame", 16.0, 0),
        ("Filet de bœuf Angus", "Sauce au poivre, purée maison", 32.0, 1),
        ("Magret de canard", "Miel et épices, légumes rôtis", 28.0, 1),
        ("Risotto aux cèpes", "Parmesan 24 mois", 22.0, 1),
        ("Lotte rôtie", "Beurre blanc, épinards", 26.0, 3),
        ("Côte de bœuf 400g", "Frites maison, sauce béarnaise", 38.0, 2),
        ("Brochettes de gambas", "Marinade citron-ail", 24.0, 3),
        ("Assiette du chef", "Sélection du jour", 35.0, 4),
        ("Burger wagyu", "Cheddar affiné, oignons confits", 19.0, 5),
        ("Frites truffe", "Parmesan râpé", 8.0, 6),
        ("Légumes de saison", "Beurre noisette", 7.0, 6),
        ("Riz pilaf", "Herbes fraîches", 6.0, 6),
        ("Fondant chocolat", "Cœur coulant, glace vanille", 10.0, 7),
        ("Tarte Tatin", "Caramel beurre salé", 9.0, 7),
        ("Crème brûlée", "Vanille de Madagascar", 8.5, 7),
        ("Expresso", "Arabica torréfié", 3.5, 8),
        ("Cappuccino", "Lait mousseux", 4.5, 8),
        ("Thé menthe", "Feuilles fraîches", 3.0, 8),
        ("Jus d'orange pressé", "Fruits frais", 5.0, 9),
        ("Coca-Cola", "33cl", 3.0, 9),
        ("Eau minérale", "50cl", 2.5, 9),
    ],
    "congolais": [
        ("Salade d'avocat", "Tomates, oignons, vinaigrette", 8.0, 0),
        ("Beignets de crevettes", "Sauce pili-pili", 10.0, 0),
        ("Sauce feuilles", "Viande fumée, fufu", 15.0, 1),
        ("Poulet moambe", "Sauce arachide, banane plantain", 14.0, 1),
        ("Liboke de poisson", "Poisson capitaine, épices", 16.0, 3),
        ("Chikwangue sauce graine", "Portion généreuse", 12.0, 1),
        ("Brochettes de capitaine", "Marinade locale", 13.0, 3),
        ("Maboke de viande", "Feuilles de bananier", 17.0, 2),
        ("Pondu saka saka", "Feuilles de manioc", 11.0, 1),
        ("Poisson salé frit", "Chikwangue, piment", 14.0, 3),
        ("Makayabu", "Poisson séché, légumes", 13.0, 4),
        ("Brochettes de bœuf", "Sauce tomate épicée", 12.0, 2),
        ("Fufu", "Manioc pilé", 4.0, 6),
        ("Chikwangue", "Portion", 3.5, 6),
        ("Riz blanc", "Portion", 3.0, 6),
        ("Banane plantain", "Frite ou bouillie", 4.0, 6),
        ("Beignets sucrés", "Miel local", 5.0, 7),
        ("Fruit de la passion", "Frais", 4.0, 7),
        ("Café congolais", "Torréfaction locale", 2.5, 8),
        ("Thé Lipton", "Chaud ou glacé", 2.0, 8),
        ("Primus", "Bière locale 65cl", 4.0, 9),
        ("Jus de bissap", "Maison", 3.5, 9),
        ("Vitalo", "Soda 33cl", 2.5, 9),
        ("Eau Kivu", "1L", 2.0, 9),
    ],
}

# Fallback products for styles not fully defined — copy and tweak from congolais
for style in ("brasserie", "italien", "japonais", "francais", "bbq", "africain", "cafe", "chef"):
    if style not in PRODUCTS_BY_STYLE:
        base = PRODUCTS_BY_STYLE["congolais"]
        PRODUCTS_BY_STYLE[style] = [
            (f"{name} ({style})", desc, price + random.uniform(-1, 2), cat_idx)
            for name, desc, price, cat_idx in base
        ]

# Better custom menus for key styles
PRODUCTS_BY_STYLE["italien"] = [
    ("Bruschetta", "Tomates, basilic, huile d'olive", 9.0, 0),
    ("Caprese", "Mozzarella, tomates, pesto", 10.0, 0),
    ("Antipasti", "Assortiment italien", 14.0, 0),
    ("Minestrone", "Soupe de légumes", 8.0, 0),
    ("Spaghetti carbonara", "Lardons, œuf, pecorino", 16.0, 1),
    ("Lasagnes bolognaise", "Fromage gratiné", 17.0, 1),
    ("Penne arrabiata", "Piment, ail, tomate", 14.0, 1),
    ("Pizza Margherita", "Tomate, mozzarella, basilic", 13.0, 4),
    ("Pizza 4 fromages", "Mozzarella, gorgonzola, parmesan", 15.0, 4),
    ("Pizza Regina", "Jambon, champignons", 16.0, 4),
    ("Pizza Diavola", "Salami piquant", 16.5, 4),
    ("Calzone", "Jambon, ricotta", 15.0, 4),
    ("Tiramisu", "Classique maison", 8.0, 7),
    ("Panna cotta", "Coulis de fruits rouges", 7.5, 7),
    ("Gelato vanille", "2 boules", 6.0, 7),
    ("Risotto aux fruits de mer", "Crevettes, calamars", 22.0, 3),
    ("Tagliatelles saumon", "Crème aneth", 18.0, 3),
    ("Burrata", "Salade roquette", 12.0, 0),
    ("Focaccia", "Romarin, huile d'olive", 6.0, 6),
    ("Salade verte", "Vinaigrette balsamique", 5.0, 6),
    ("Expresso", "Court", 3.0, 8),
    ("Cappuccino", "Classique", 4.0, 8),
    ("Limoncello", "Digestif", 6.0, 9),
    ("Spritz", "Aperol, prosecco", 8.0, 9),
]

PRODUCTS_BY_STYLE["japonais"] = [
    ("Edamame", "Sel de mer", 6.0, 0),
    ("Miso soup", "Tofu, algues", 5.0, 0),
    ("Gyoza poulet", "6 pièces", 9.0, 0),
    ("Salade wakame", "Sésame", 7.0, 0),
    ("Sashimi mix", "12 pièces du jour", 24.0, 3),
    ("Sushi mix", "10 pièces", 18.0, 4),
    ("California roll", "8 pièces", 12.0, 4),
    ("Maki saumon", "6 pièces", 10.0, 4),
    ("Tempura crevettes", "5 pièces", 14.0, 3),
    ("Yakitori poulet", "3 brochettes", 11.0, 2),
    ("Bento poulet teriyaki", "Riz, salade, miso", 16.0, 1),
    ("Ramen poulet", "Bouillon riche, œuf", 15.0, 1),
    ("Udon légumes", "Bouillon dashi", 13.0, 1),
    ("Chirashi bowl", "Riz, poisson assorti", 20.0, 4),
    ("Dragon roll", "Crevette tempura", 14.0, 4),
    ("Riz vinaigré", "Portion", 3.0, 6),
    ("Soupe miso", "Portion", 4.0, 6),
    ("Mochi glacé", "3 pièces", 7.0, 7),
    ("Dorayaki", "Pâte haricot rouge", 6.0, 7),
    ("Thé vert", "Sencha", 3.5, 8),
    ("Saké chaud", "180ml", 8.0, 9),
    ("Asahi", "Bière japonaise", 5.0, 9),
    ("Jus yuzu", "Maison", 4.5, 9),
    ("Eau pétillante", "33cl", 3.0, 9),
]

PRODUCTS_BY_STYLE["francais"] = [
    ("Soupe à l'oignon", "Gratinée, croûton", 9.0, 0),
    ("Terrine de campagne", "Cornichons, pain grillé", 11.0, 0),
    ("Œufs mayo", "2 œufs fermiers", 7.0, 0),
    ("Salade de chèvre chaud", "Miel, noix", 12.0, 0),
    ("Steak frites", "Sauce béarnaise", 22.0, 1),
    ("Blanquette de veau", "Carottes, champignons", 19.0, 1),
    ("Bœuf bourguignon", "Pommes vapeur", 21.0, 1),
    ("Confit de canard", "Pommes sarladaises", 23.0, 2),
    ("Entrecôte grillée", "300g, frites", 26.0, 2),
    ("Saumon grillé", "Beurre citron", 20.0, 3),
    ("Moules marinières", "Frites", 18.0, 3),
    ("Croque-monsieur", "Salade verte", 12.0, 5),
    ("Quiche lorraine", "Salade", 11.0, 5),
    ("Pommes frites", "Maison", 5.0, 6),
    ("Purée maison", "Beurre frais", 5.0, 6),
    ("Haricots verts", "Beurre", 5.0, 6),
    ("Crêpe sucre", "Citron ou Nutella", 6.0, 7),
    ("Profiteroles", "Chocolat chaud", 9.0, 7),
    ("Île flottante", "Caramel", 8.0, 7),
    ("Café allongé", "Arabica", 2.5, 8),
    ("Chocolat chaud", "Maison", 4.0, 8),
    ("Vin rouge", "Verre Bordeaux", 6.0, 9),
    ("Vin blanc", "Verre Sancerre", 6.0, 9),
    ("Kronenbourg", "25cl", 4.0, 9),
]

PRODUCTS_BY_STYLE["bbq"] = [
        ("Nachos BBQ", "Fromage, jalapeños", 10.0, 0),
        ("Ailes de poulet", "Sauce buffalo", 11.0, 0),
        ("Onion rings", "Sauce barbecue", 8.0, 0),
        ("Salade coleslaw", "Maison", 6.0, 0),
        ("Pulled pork burger", "Coleslaw, sauce smoke", 16.0, 5),
        ("BBQ ribs demi-portion", "Sauce maison 6h", 22.0, 2),
        ("BBQ ribs pleine", "Sauce maison 6h", 32.0, 2),
        ("Brisket fumé", "Pain brioché", 24.0, 2),
        ("Poulet fumé entier", "Accompagnements au choix", 20.0, 2),
        ("Saucisse artisanale", "Moutarde, oignons", 14.0, 2),
        ("Mix grillades", "2 personnes", 45.0, 2),
        ("Burger smoke", "Double steak, cheddar", 17.0, 5),
        ("Mac & cheese", "Cheddar fondant", 9.0, 6),
        ("Corn bread", "Beurre miel", 5.0, 6),
        ("Frites croustillantes", "Généreuses", 5.0, 6),
        ("Beans épicés", "Portion", 4.0, 6),
        ("Brownie", "Glace vanille", 8.0, 7),
        ("Cheesecake", "Coulis fruits", 8.5, 7),
        ("Café américain", "Long", 3.0, 8),
        ("Thé glacé", "Pêche", 4.0, 9),
        ("Coca-Cola", "33cl", 3.0, 9),
        ("Bière artisanale IPA", "33cl", 5.5, 9),
        ("Limonade maison", "Citron vert", 4.0, 9),
        ("Eau gazeuse", "50cl", 2.5, 9),
]

PRODUCTS_BY_STYLE["cafe"] = [
    ("Croissant", "Pur beurre", 2.5, 0),
    ("Pain au chocolat", "Maison", 2.8, 0),
    ("Tartine avocat", "Graines, citron", 8.0, 0),
    ("Granola bowl", "Yaourt, fruits", 9.0, 0),
    ("Omelette nature", "3 œufs, salade", 10.0, 1),
    ("Omelette fromage", "Comté", 11.0, 1),
    ("Club sandwich", "Poulet, bacon", 12.0, 5),
    ("Quiche du jour", "Salade", 10.0, 5),
    ("Croque-monsieur", "Béchamel", 9.0, 5),
    ("Salade César", "Poulet grillé", 11.0, 0),
    ("Wrap poulet", "Crudités, sauce", 10.0, 5),
    ("Soupe du jour", "Pain", 7.0, 0),
    ("Tarte salée", "Légumes de saison", 9.0, 4),
    ("Cookies chocolat", "2 pièces", 4.0, 7),
    ("Muffin myrtille", "Maison", 3.5, 7),
    ("Tarte citron", "Meringuée", 6.0, 7),
    ("Expresso", "Simple", 2.5, 8),
    ("Double expresso", "Intense", 3.5, 8),
    ("Latte", "Lait velouté", 4.5, 8),
    ("Flat white", "Micro-mousse", 4.5, 8),
    ("Chocolat chaud", "Grand", 4.5, 8),
    ("Thé Earl Grey", "Théière", 4.0, 8),
    ("Smoothie fruits", "Banane, mangue", 6.0, 9),
    ("Jus pomme", "Pressé", 4.5, 9),
]

PRODUCTS_BY_STYLE["brasserie"] = PRODUCTS_BY_STYLE["francais"]
PRODUCTS_BY_STYLE["africain"] = PRODUCTS_BY_STYLE["congolais"]
PRODUCTS_BY_STYLE["chef"] = PRODUCTS_BY_STYLE["gastronomique"]


def _access_code(rest_idx: int, table_num: int) -> str:
    suffix = "".join(random.choices(string.ascii_uppercase + string.digits, k=6))
    return f"R{rest_idx:02d}T{table_num:02d}-{suffix}"


def clear_seed_data(db) -> None:
    names = list(SEED_RESTAURANT_NAMES)
    db.execute(text("DELETE FROM commande_items"))
    db.execute(text("DELETE FROM commandes"))
    db.execute(text("DELETE FROM table_occupations"))
    db.execute(text("DELETE FROM produit_images"))
    db.execute(text("DELETE FROM produits"))
    db.execute(text("DELETE FROM categories"))
    db.execute(text("DELETE FROM tables"))
    db.execute(
        text("DELETE FROM restaurants WHERE nom = ANY(:names)"),
        {"names": names},
    )
    db.commit()


def is_already_seeded(db) -> bool:
    count = (
        db.query(Restaurant)
        .filter(Restaurant.nom.in_(SEED_RESTAURANT_NAMES))
        .count()
    )
    return count >= 10


def seed(db) -> None:
    random.seed(42)
    for rest_idx, data in enumerate(RESTAURANTS, start=1):
        restaurant = Restaurant(
            nom=data["nom"],
            adresse=data["adresse"],
            telephone=data["telephone"],
        )
        db.add(restaurant)
        db.flush()

        categories: list[Category] = []
        for cat_nom, cat_desc in CATEGORIES:
            cat = Category(
                nom=cat_nom,
                description=cat_desc,
                restaurant_id=restaurant.id,
            )
            db.add(cat)
            categories.append(cat)
        db.flush()

        for table_num in range(1, 13):
            capacity = random.choice([2, 2, 4, 4, 4, 6, 6, 8])
            status = random.choices(
                ["LIBRE", "LIBRE", "LIBRE", "PARTIELLE", "OCCUPEE", "RESERVEE"],
                weights=[50, 50, 30, 10, 5, 5],
            )[0]
            places = 0
            if status == "PARTIELLE":
                places = random.randint(1, max(1, capacity - 1))
            elif status == "OCCUPEE":
                places = capacity

            table = Table(
                numero=table_num,
                capacity=capacity,
                places_occupees=places,
                status=status,
                code_acces=_access_code(rest_idx, table_num),
                restaurant_id=restaurant.id,
            )
            db.add(table)

        products = PRODUCTS_BY_STYLE.get(data["style"], PRODUCTS_BY_STYLE["congolais"])
        for nom, description, price, cat_idx in products[:24]:
            cat_idx = min(cat_idx, len(categories) - 1)
            produit = Produit(
                nom=nom,
                description=description,
                price=round(price, 2),
                disponible=random.random() > 0.08,
                restaurant_id=restaurant.id,
                categorie_id=categories[cat_idx].id,
            )
            db.add(produit)

        print(f"  ✓ {data['nom']} — 10 catégories, 12 tables, {min(24, len(products))} produits")

    db.commit()


def main() -> None:
    parser = argparse.ArgumentParser(description="Seed restaurant database")
    parser.add_argument(
        "--force",
        action="store_true",
        help="Supprime les données seed existantes et recrée",
    )
    args = parser.parse_args()

    db = SessionLocal()
    try:
        if is_already_seeded(db) and not args.force:
            print("Données seed déjà présentes. Utilisez --force pour recréer.")
            return

        if args.force:
            print("Suppression des anciennes données seed...")
            clear_seed_data(db)

        print("Insertion de 10 restaurants...")
        seed(db)

        names = list(SEED_RESTAURANT_NAMES)
        rows = db.execute(
            text(
                """
                SELECT r.nom, t.numero, t.code_acces, t.capacity, t.status
                FROM tables t
                JOIN restaurants r ON r.id = t.restaurant_id
                WHERE r.nom = ANY(:names)
                ORDER BY r.nom, t.numero
                """
            ),
            {"names": names},
        ).fetchall()

        codes_path = Path(__file__).parent / "seed_table_codes.txt"
        with codes_path.open("w", encoding="utf-8") as f:
            f.write("Codes d'accès des tables (seed)\n")
            f.write("=" * 50 + "\n\n")
            current = None
            for nom, numero, code, capacity, status in rows:
                if nom != current:
                    current = nom
                    f.write(f"\n## {nom}\n")
                f.write(f"  Table {numero} ({capacity} pl., {status}) → {code}\n")

        print(f"\nCodes exportés : {codes_path}")
        print("Terminé ! 10 restaurants × 10 catégories × 12 tables × 24 produits")
    finally:
        db.close()


if __name__ == "__main__":
    main()
