
from app.api.schemas.towerSchema import Tower
from app.models import (
    build_model_from_json,
    train_model,
    evaluate,
    export_model_to_format,
)


def train_tower(tower: Tower):
    tower_data = tower.dict()
    model = build_model_from_json(tower_data)

    # Pass the UI's selected augmentations to the training pipeline.
    augmentations = [
        augmentation.dict()
        for augmentation in tower.augmentations
    ]

    print("Model architecture:")
    print(model)
    print("Selected augmentations:", augmentations)

    training_results = train_model(
        model,
        augmentations=augmentations,
    )

    return {"training_results": training_results}


def evaluate_tower(tower: Tower):
    model = build_model_from_json(tower.dict())
    print(model)
    evaluation_results = evaluate(model)
    print(evaluation_results)
    return evaluation_results


def export_tower(tower: Tower, format: str = "onnx"):
    model = build_model_from_json(tower.dict())
    export_path = export_model_to_format(
        model,
        tower.name,
        format=format,
    )
    return {"export_path": export_path}
