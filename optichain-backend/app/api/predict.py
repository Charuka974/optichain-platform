import json
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.schemas.payload import SupplyChainInput, PredictionResponse
from app.ml.inference import ml_service
from app.db.session import get_db
from app.db.models import PredictionRecord
from app.api.dependencies import authenticate

router = APIRouter()

@router.post("/predict", response_model=PredictionResponse)
async def predict_delay(payload: SupplyChainInput, db: Session = Depends(get_db), user: dict = Depends(authenticate)):
    # 1. Extract raw dictionary with the exact aliases (keys with spaces)
    input_dict = payload.model_dump(by_alias=True)
    
    # 2. Run Inference
    result = ml_service.predict(input_dict)
    
    # 3. Save Prediction to SQLite
    record = PredictionRecord(
        user_id=user.get("user_id"),
        input_data=json.dumps(input_dict),
        delayed=result["delayed"],
        delay_probability=result["delay_probability"]
    )
    db.add(record)
    db.commit()
    
    return result

@router.get("/predictions/history")
def get_prediction_history(db: Session = Depends(get_db)):
    records = db.query(PredictionRecord).order_by(PredictionRecord.created_at.desc()).limit(20).all()
    return records