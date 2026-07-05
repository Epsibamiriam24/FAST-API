from fastapi import APIRouter

router = APIRouter(
    prefix="/borrow",
    tags=["Borrow"]
)

@router.post("/")
def borrow_book():

    return {
        "message":"Book Borrowed"
    }


@router.post("/return")
def return_book():

    return {
        "message":"Book Returned"
    }


@router.get("/history")
def history():

    return [
        {
            "book":"Python",
            "status":"Returned"
        },
        {
            "book":"Java",
            "status":"Borrowed"
        }
    ]