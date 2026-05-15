---
# Feature-YoloIntegration.00

**Date:** 15 May 2026 (15 พฤษภาคม 2569)

## Overview
Integrated Ultralytics YOLO11 as the highest-priority Stage 1 inference provider in the ScanPage AI pipeline.

## Reason
User requested YOLO (Ultralytics Python framework) be used in ScanPage. YOLO runs in Python so a FastAPI backend bridge was needed.

## Architecture

```
ScanPage → twoStageAI.js
              │
              ├─ 1st: YOLO FastAPI (backend/yolo_server.py)  ← NEW
              ├─ 2nd: TF.js / Teachable Machine
              ├─ 3rd: ONNX
              ├─ 4th: Vertex AI
              └─ 5th: Mock (demo)
```

## New Files

### `backend/yolo_server.py`
- FastAPI server wrapping `ultralytics.YOLO`
- `POST /infer` — accepts `{ image: base64 }`, returns material_type, confidence, size_kg, bbox
- `GET /health` — liveness check
- `CLASS_MAP` maps YOLO/COCO class names → GreenPlus waste material keys
- `YOLO_MODEL_PATH` env var (default `yolo11n.pt`, swap to custom fine-tuned model)
- `CONF_THRESHOLD` env var (default 0.30)
- Bounding-box area → kg heuristic (replace with trained regression when available)

### `backend/requirements.txt`
- ultralytics, fastapi, uvicorn, pillow, numpy, python-multipart

### `backend/.env.example`
- Documents `YOLO_MODEL_PATH` and `CONF_THRESHOLD`

### `src/services/yoloAPI.js`
- `yoloStage1(imageSource, endpoint)` — POSTs base64 image, returns Stage 1 shape
- Falls through to null on network error (pipeline continues to next provider)

## Modified Files

### `src/store/aiConfigSlice.js`
- Added `yoloEndpoint` field (saved to localStorage)

### `src/services/twoStageAI.js`
- Imported `yoloStage1` from `./yoloAPI`
- Added `yoloEndpoint` config param
- YOLO runs first before TM/ONNX/Vertex/Mock

### `src/pages/ScanPage.jsx`
- `isMockMode` now also checks `!aiConfig.yoloEndpoint`
- Added `activeSource` derived value ('yolo'|'tfjs'|'onnx'|'vertex'|'demo')
- Badge in camera controls now shows `activeSource` instead of hardcoded 'onnx'
- Passes `yoloEndpoint` to `twoStageInfer`

### `src/pages/AdminPage.jsx`
- Added "YOLO Backend" config card in AI Studio tab
- Input field to set/clear `yoloEndpoint`
- Active/off badge shows current state

## Validation
- When `yoloEndpoint` is empty → pipeline falls through to existing providers (no regression)
- When `yoloEndpoint` is set → YOLO result used if `pass_: true`; falls through on network error
- Badge in ScanPage correctly reflects active provider

## Setup Instructions
```bash
cd backend
pip install -r requirements.txt
uvicorn yolo_server:app --host 0.0.0.0 --port 8000 --reload
```
Then in Admin → AI Studio → YOLO Backend, enter `http://localhost:8000`
