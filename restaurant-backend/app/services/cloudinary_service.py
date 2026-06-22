import io
from typing import BinaryIO

import cloudinary.uploader
from fastapi import HTTPException, UploadFile

from app.core import cloudinary_config  # noqa: F401 — initialise la config au chargement

ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
MAX_SIZE_MB = 5


def upload_image(
    file: UploadFile | BinaryIO,
    folder: str = "restaurant/produits",
) -> dict:
    """
    Envoie une image vers Cloudinary.
    Retourne { "url": secure_url, "public_id": public_id }.
    """
    content_type = getattr(file, "content_type", None)
    if content_type and content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Type non autorisé ({content_type}). Utilisez JPEG, PNG, WebP ou GIF.",
        )

    raw = file.file.read() if hasattr(file, "file") else file.read()
    size_mb = len(raw) / (1024 * 1024)
    if size_mb > MAX_SIZE_MB:
        raise HTTPException(
            status_code=400,
            detail=f"Image trop lourde ({size_mb:.1f} Mo). Maximum : {MAX_SIZE_MB} Mo.",
        )

    try:
        result = cloudinary.uploader.upload(
            io.BytesIO(raw),
            folder=folder,
            resource_type="image",
        )
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Échec upload Cloudinary : {exc}",
        ) from exc

    return {
        "url": result["secure_url"],
        "public_id": result["public_id"],
    }


def delete_image(public_id: str) -> None:
    """Supprime une image de Cloudinary via son public_id."""
    if not public_id:
        return
    try:
        cloudinary.uploader.destroy(public_id, resource_type="image")
    except Exception:
        pass  # on ne bloque pas la suppression du produit si Cloudinary échoue
