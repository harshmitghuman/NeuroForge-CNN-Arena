import torch
import os

from app.core.config import MODEL_SAVE_DIR

SAVE_DIR = os.path.join(MODEL_SAVE_DIR, "exports")
os.makedirs(SAVE_DIR, exist_ok=True)


def export_model_to_format(model, name, format="onnx"):
    """
    Exports a trained PyTorch model to ONNX or PTH format.
    Falls back to .pth if ONNX export fails.
    """
    dummy_input = torch.randn(1, 3, 224, 224)
    path = os.path.join(SAVE_DIR, f"{name}.{format}")

    try:
        if format == "onnx":
            try:
                torch.onnx.export(
                    model,
                    dummy_input,
                    path,
                    export_params=True,
                    opset_version=17,
                    do_constant_folding=True,
                    input_names=["input"],
                    output_names=["output"]
                )
            except ModuleNotFoundError as e:
                print(f"⚠️ ONNX export failed ({e}). Falling back to saving as .pth instead.")
                path = os.path.join(SAVE_DIR, f"{name}.pth")
                torch.save(model.state_dict(), path)

        elif format == "pth":
            torch.save(model.state_dict(), path)
        else:
            raise ValueError(f"❌ Unsupported export format: {format}")

        print(f"✅ Model exported successfully: {path}")
        return path

    except Exception as e:
        print(f"❌ Error exporting model: {e}")
        raise
