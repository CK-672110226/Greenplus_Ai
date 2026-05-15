"""
GreenPlus.Ai — YOLO Inference Server
Accepts a base64-encoded image, runs YOLO11 detection,
maps detected classes to GreenPlus waste material keys,
and returns Stage 1 result consumed by twoStageAI.js.

Usage:
  pip install -r requirements.txt
  uvicorn yolo_server:app --host 0.0.0.0 --port 8000 --reload

Frontend config:
  Set yoloEndpoint = "http://localhost:8000" in Admin → AI Config
"""

import base64
import io
import os
from pathlib import Path

import numpy as np
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
from pydantic import BaseModel
from ultralytics import YOLO

# ── App ──────────────────────────────────────────────────────────────
app = FastAPI(title="GreenPlus YOLO Server", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],          # tighten in production
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

# ── Model ────────────────────────────────────────────────────────────
# Swap to a custom fine-tuned path via env:  YOLO_MODEL_PATH=./custom.pt
MODEL_PATH = os.getenv("YOLO_MODEL_PATH", "yolo11n.pt")
model = YOLO(MODEL_PATH)

# ── Class mapping ────────────────────────────────────────────────────
# Maps YOLO class names → GreenPlus materialType keys.
# Covers COCO defaults + common waste-dataset labels.
# Add custom trained class names here when you fine-tune.
CLASS_MAP: dict[str, str] = {
    # COCO classes (approximate matches)
    "bottle":       "pet_bottle_clear",
    "cup":          "mixed_plastic",
    "wine glass":   "glass",
    "vase":         "glass",
    "book":         "newspaper",
    "suitcase":     "cardboard",
    "backpack":     "mixed_plastic",
    "handbag":      "mixed_plastic",
    "cell phone":   "mixed_plastic",
    "scissors":     "copper",
    "knife":        "copper",
    "fork":         "copper",
    "spoon":        "copper",
    # Common waste-dataset labels (TACO / TrashNet style)
    "plastic_bottle":   "pet_bottle_clear",
    "clear_bottle":     "pet_bottle_clear",
    "pet_bottle":       "pet_bottle_clear",
    "aluminum_can":     "aluminum_can",
    "metal_can":        "aluminum_can",
    "tin_can":          "aluminum_can",
    "cardboard":        "cardboard",
    "cardboard_box":    "cardboard",
    "newspaper":        "newspaper",
    "paper":            "newspaper",
    "plastic":          "mixed_plastic",
    "mixed_plastic":    "mixed_plastic",
    "copper":           "copper",
    "metal_wire":       "copper",
    "glass":            "glass",
    "glass_bottle":     "glass",
    "cooking_oil":      "cooking_oil",
    "oil_bottle":       "cooking_oil",
}

# Fallback: if no class matches, cycle through materials deterministically
MATERIAL_KEYS = [
    "pet_bottle_clear", "aluminum_can", "cardboard",
    "newspaper", "mixed_plastic", "copper", "glass", "cooking_oil",
]

# Approximate bounding-box-area → weight (kg) heuristic.
# Replace with a real regression model when available.
def bbox_to_kg(bbox, img_w: int, img_h: int) -> float:
    x1, y1, x2, y2 = bbox
    area_ratio = ((x2 - x1) * (y2 - y1)) / (img_w * img_h)
    # clamp to 0.05 – 3.0 kg
    kg = max(0.05, min(3.0, area_ratio * 12.0))
    return round(float(kg), 2)


# ── Request / Response models ────────────────────────────────────────
class InferRequest(BaseModel):
    image: str   # base64-encoded JPEG / PNG (with or without data-URI prefix)

class DetectionBox(BaseModel):
    x1: float
    y1: float
    x2: float
    y2: float

class InferResponse(BaseModel):
    pass_: bool                 # alias 'pass' — reserved in Python
    material_type: str
    confidence: float
    size_kg: float
    bbox: DetectionBox | None
    label: str                  # raw YOLO class name
    source: str = "yolo"


# ── Helpers ──────────────────────────────────────────────────────────
def decode_image(b64_str: str) -> Image.Image:
    # Strip optional data-URI header
    if "," in b64_str:
        b64_str = b64_str.split(",", 1)[1]
    data = base64.b64decode(b64_str)
    return Image.open(io.BytesIO(data)).convert("RGB")


def map_class(label: str) -> str:
    """Return a GreenPlus material key for a YOLO class label."""
    lower = label.lower().replace(" ", "_")
    if lower in CLASS_MAP:
        return CLASS_MAP[lower]
    # try space-separated key too
    spaced = label.lower()
    if spaced in CLASS_MAP:
        return CLASS_MAP[spaced]
    return "mixed_plastic"   # safe default


# ── Endpoints ────────────────────────────────────────────────────────
@app.get("/health")
def health():
    return {"status": "ok", "model": MODEL_PATH}


@app.post("/infer", response_model=InferResponse)
def infer(req: InferRequest):
    image = decode_image(req.image)
    img_w, img_h = image.size

    # Run YOLO — returns list[Results]
    results = model(image, verbose=False)

    best_conf = 0.0
    best_box  = None
    best_label = ""

    for result in results:
        if result.boxes is None:
            continue
        for box in result.boxes:
            conf = float(box.conf[0])
            cls_id = int(box.cls[0])
            label = model.names[cls_id]
            if conf > best_conf:
                best_conf  = conf
                best_label = label
                xyxy = box.xyxy[0].tolist()   # [x1, y1, x2, y2]
                best_box = xyxy

    # Nothing detected with reasonable confidence → troll / unknown
    CONF_THRESHOLD = float(os.getenv("CONF_THRESHOLD", "0.30"))
    if best_conf < CONF_THRESHOLD or not best_label:
        return InferResponse(
            pass_=False,
            material_type="",
            confidence=best_conf,
            size_kg=0.0,
            bbox=None,
            label="",
        )

    material_type = map_class(best_label)
    size_kg = bbox_to_kg(best_box, img_w, img_h) if best_box else 0.1

    bbox_out = None
    if best_box:
        x1, y1, x2, y2 = best_box
        bbox_out = DetectionBox(x1=x1, y1=y1, x2=x2, y2=y2)

    return InferResponse(
        pass_=True,
        material_type=material_type,
        confidence=round(best_conf, 3),
        size_kg=size_kg,
        bbox=bbox_out,
        label=best_label,
    )
