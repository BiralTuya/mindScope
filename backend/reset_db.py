# reset_db.py
from database import engine
from models import Base

# Drop all tables (⚠️ this deletes everything!)
Base.metadata.drop_all(bind=engine)

# Recreate all tables
Base.metadata.create_all(bind=engine)

print("✅ Database reset complete!")
