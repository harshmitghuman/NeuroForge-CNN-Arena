from fastapi import APIRouter, Depends, HTTPException
from app.api.controllers import sandbox_controllers
from app.api.schemas.towerSchema import Tower

router = APIRouter()

@router.get("/check")
def check_route():
    return{
        "status": "success"
    }

@router.post("/train", summary="Train a tower model")
def train_tower(tower: Tower):
    try:
        result = sandbox_controllers.train_tower(tower)
        outputData = {
            "status": "success",
            "data": result
        }
        print(outputData)
        return outputData
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/evaluate", summary="Evaluate a tower model")
def evaluate_model(tower: Tower):
    try:
        # print(tower)
        result = sandbox_controllers.evaluate_tower(tower)
        return {
            "status": "success",
            "data": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/export", summary="Export a tower model")
def export_tower(tower: Tower, format: str = "onnx"):
    try:
        result = sandbox_controllers.export_tower(tower, format)
        return {
            "status": "success",
            "data": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))