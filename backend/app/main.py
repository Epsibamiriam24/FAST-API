from fastapi import FastAPI
from app.routers import auth, books, borrow

app = FastAPI(
    title="Library Management API",
    version="1.0"
)

app.include_router(auth.router)
app.include_router(books.router)
app.include_router(borrow.router)

@app.get("/")
def home():
    return {
        "message": "Library Management API Running"
    }