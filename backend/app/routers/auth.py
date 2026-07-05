from fastapi import APIRouter

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)

@router.post("/register")
def register():

    return {
        "message": "Register API"
    }


@router.post("/login")
def login():

    return {
        "message": "Login API"
    }