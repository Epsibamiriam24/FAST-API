from fastapi import APIRouter

router = APIRouter(
    prefix="/books",
    tags=["Books"]
)

@router.get("/")
def get_books():

    return [
        {
            "id":1,
            "title":"Python"
        },
        {
            "id":2,
            "title":"Java"
        }
    ]


@router.get("/{book_id}")
def get_book(book_id:int):

    return {
        "id":book_id,
        "title":"Python"
    }


@router.post("/")
def add_book():

    return {
        "message":"Book Added"
    }


@router.put("/{book_id}")
def update_book(book_id:int):

    return {
        "message":"Book Updated",
        "book":book_id
    }


@router.delete("/{book_id}")
def delete_book(book_id:int):

    return {
        "message":"Book Deleted",
        "book":book_id
    }