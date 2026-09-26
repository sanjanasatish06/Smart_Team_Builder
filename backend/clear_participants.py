"""
One-time cleanup: delete all existing participant rows.

Does NOT touch the database file or schema — only clears the
participants table, so the app starts every demo from zero.

Usage (from inside backend/, venv activated):
    python clear_participants.py
"""

from app.database import SessionLocal, Base, engine
from app import models

Base.metadata.create_all(bind=engine)


def clear():
    db = SessionLocal()
    try:
        count = db.query(models.Participant).count()
        db.query(models.Participant).delete()
        db.commit()
        print(f"Deleted {count} participant row(s). Schema and database file are untouched.")
    finally:
        db.close()


if __name__ == "__main__":
    clear()