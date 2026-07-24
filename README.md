# restaurant_backend

<!-- python-multipart est obligatoire pour recevoir des fichiers (UploadFile) dans FastAPI. -->
python-multipart 

Mise en place (une seule fois)
1. Installer Alembic

pip install alembic

Ajouter dans requirements.txt :
alembic


2. Initialiser Alembic

cd restaurant-backend
alembic init alembic

Ça crée :


restaurant-backend/
  alembic/
    versions/          ← tes migrations Python ici
    env.py             ← connexion à la BDD
  alembic.ini          ← config


3. Configurer alembic/env.py
Pointer vers ton engine et importer tous tes modèles pour l’autogenerate :


from app.core.database import Base, engine
from app.models.restaurant import Restaurant
from app.models.table import Table
from app.models.table_occupation import TableOccupation
from app.models.commande import Commande
from app.models.produit import Produit
from app.models.produit_image import ProduitImage
from app.models.category import Category
from app.models.commande_item import CommandeItem
target_metadata = Base.metadata

4. Configurer alembic.ini
sqlalchemy.url = driver://user:pass@localhost/dbname
Ou mieux : lire DATABASE_URL depuis .env dans env.py (comme ton database.py).

5.
<!-- --autogenerate compare modèles Python vs BDD actuelle. Comme tu as déjà create_all() dans main.py, la migration ne devrait contenir que le différentiel : -->

alembic revision --autogenerate -m "add table occupation and places_occupees"


# 1. Modifier le modèle Python (table.py, commande.py, etc.)
# 2. Générer la migration
alembic revision --autogenerate -m "description courte du changement"

# 3. RELIRE le fichier dans alembic/versions/  ← obligatoire
# 4. Appliquer
alembic upgrade head

alembic current   # doit afficher la révision

alembic current      # où tu en es. donc la derniere migration
alembic history      # toutes les migrations (appliquées ou non)
alembic upgrade head # appliquer les migrations en attente
alembic downgrade -1 # annuler la dernière migration
alembic heads # affiche les migrations en retard
alembic upgrade head #  appliqué la migration manquant

Regénère la migration :
alembic revision --autogenerate -m "remove access token"

<!-- HASH PASSWORD -->
pip install "bcrypt==4.0.1"
<!-- pip install "passlib[bcrypt]" Vieille version -->
ou
pip install "pwdlib[argon2]"

<!-- JWT -->
pip install "python-jose[cryptography]"

<!-- veriable d'environnement -->
pip install pydantic-settings python-dotenv

<!-- Voire les dependances installées dans mon app dans requirements -->
pip freeze > requirements.txt

ou 

which python

dans le fichier "site-packages/" dans env/lib/...

<!-- Rating for timing request -->
pip install slowapi