Library Management System API
Project Overview

This project is a beginner-friendly backend application developed to understand the complete workflow of REST API development using FastAPI. The application simulates a Library Management System where users can perform basic CRUD (Create, Read, Update, Delete) operations on books and understand how a backend communicates with clients through HTTP APIs.

The primary objective of this project is to gain practical experience in backend development before building a production-scale business application.

Technologies Used
Technology	Purpose
Python	Backend programming language
FastAPI	REST API framework
Uvicorn	ASGI server to run FastAPI
Swagger UI	Interactive API documentation and testing
Pydantic	Request validation and data serialization
APIRouter	Modular API route organization
JSON	Data exchange format
HTTP Methods	GET, POST, PUT, DELETE
Virtual Environment (venv)	Dependency isolation
MySQL (Next Phase)	Persistent database storage
SQLAlchemy (Next Phase)	ORM for database operations
Project Architecture
Client (Browser / Swagger)
            │
            ▼
      HTTP Request
            │
            ▼
     Uvicorn Server
            │
            ▼
      FastAPI Application
            │
     ┌──────┴─────────┐
     ▼                ▼
 Authentication     Books
     │                │
     ▼                ▼
 Python Functions (Business Logic)
            │
            ▼
      JSON Response
            │
            ▼
     Swagger / Browser
Features Implemented
Authentication Module
User Registration API
User Login API
Authentication route organization using APIRouter
Books Module
Retrieve all books
Retrieve a book by ID
Add new books
Update existing books
Delete books
Borrow Module
Borrow book endpoint
Return book endpoint
Borrow history endpoint
REST APIs Developed
Method	Endpoint	Description
GET	/	Home API
POST	/auth/register	Register user
POST	/auth/login	Login user
GET	/books	Get all books
GET	/books/{id}	Get book by ID
POST	/books	Add a new book
PUT	/books/{id}	Update a book
DELETE	/books/{id}	Delete a book
POST	/borrow	Borrow a book
POST	/return	Return a book
GET	/borrow-history	View borrowing history
Technical Concepts Learned
FastAPI
Creating REST APIs
Route decorators
Request handling
Response generation
Automatic Swagger documentation
Uvicorn
Running ASGI applications
Local development server
Hot reload using --reload
API Routing
Modular project structure using APIRouter
Separation of Authentication, Books, and Borrow modules
HTTP Methods

Implemented and understood:

GET
POST
PUT
DELETE
Swagger UI
Automatic API documentation
Interactive API testing
Request and response visualization
JSON

Understanding of:

Request Body
JSON Responses
Data serialization
Request–Response Lifecycle

The project demonstrates the complete lifecycle of an API request:

Client
    │
    ▼
HTTP Request
    │
    ▼
Uvicorn Server
    │
    ▼
FastAPI Router
    │
    ▼
Business Logic
    │
    ▼
JSON Response
    │
    ▼
Client
Folder Structure
backend/
│
├── app/
│   ├── main.py
│   ├── routers/
│   │   ├── auth.py
│   │   ├── books.py
│   │   └── borrow.py
│   │
│   ├── models/
│   ├── schemas/
│   ├── database.py
│   └── __init__.py
│
├── .venv/
├── requirements.txt
└── README.md
Software Engineering Practices
Modular backend architecture
Separation of concerns
Organized project structure
API-first development approach
Version-controlled dependency management using virtual environments
Testing

The APIs were tested using:

Swagger UI (/docs)
Browser
HTTP status code verification
Current Status
Completed
FastAPI setup
Uvicorn configuration
Project architecture
API routing
CRUD endpoints
Swagger integration
Modular backend structure
In Progress
MySQL database integration
SQLAlchemy ORM
Data persistence
Planned
JWT Authentication
Password hashing
React frontend integration
Admin dashboard
Order management
Payment gateway
WhatsApp notifications
Skills Gained

Through this project, the following backend development skills were developed:

REST API Design
FastAPI Framework
API Routing
HTTP Protocol
JSON Data Handling
Swagger Documentation
Backend Project Structure
Modular Programming
Client–Server Architecture
Request–Response Lifecycle
Virtual Environment Management
API Testing and Debugging
