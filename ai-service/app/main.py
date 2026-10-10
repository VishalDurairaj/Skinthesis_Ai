from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.vision.pipeline import SkinVisionPipeline

app = FastAPI(
    title="SKINTHESIS AI Vision Service",
    description="Spatial facial geometry and optical surface analysis.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

pipeline = SkinVisionPipeline()

@app.get("/")
def root():
    return {
        "message": "SKINTHESIS AI Vision Service is running.",
        "docs_url": "/docs",
        "health_url": "/health"
    }

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "ai-vision-pipeline",
        "endpoints": ["/analyze/face", "/health", "/docs"]
    }

@app.post("/analyze/face")
async def analyze_face(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Uploaded file must be an image.")

    img_bytes = await file.read()
    result = pipeline.process(img_bytes)

    if result.get("status") == "error":
        raise HTTPException(status_code=422, detail=result.get("message"))

    return result
