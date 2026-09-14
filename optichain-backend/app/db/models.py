from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.sql import func
from app.db.session import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="analyst")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class PredictionRecord(Base):
    __tablename__ = "prediction_records"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    input_data = Column(Text, nullable=False) 
    delayed = Column(Integer, nullable=False)
    delay_probability = Column(Float, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())