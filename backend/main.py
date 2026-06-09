from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import upload, applications, predict, fraud, report, simulate, news
from database import engine
from models import Base

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Critiks API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For dev purposes, allows all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload.router, prefix="/api")
app.include_router(applications.router, prefix="/api")
app.include_router(predict.router, prefix="/api")
app.include_router(fraud.router, prefix="/api")
app.include_router(report.router, prefix="/api")
app.include_router(simulate.router, prefix="/api")
app.include_router(news.router, prefix="/api")

@app.get("/")
def read_root():
    return {"message": "Welcome to Critiks Financial Risk Intelligence API"}
