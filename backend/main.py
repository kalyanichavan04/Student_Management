from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client
from dotenv import load_dotenv
import os

# Get the folder where main.py is located
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Find .env in the same folder
env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env")

# Load .env
load_dotenv(env_path)

# Read Supabase details
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

print("ENV FILE:", env_path)
print("ENV EXISTS:", os.path.exists(env_path))
print("URL loaded:", SUPABASE_URL)
print("KEY loaded:", bool(SUPABASE_KEY))

app = FastAPI()

# ==============================
# CORS CONFIGURATION
# ==============================
# Without this, browsers block requests coming from a different
# domain (e.g. your Vercel frontend calling this Render backend).
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://student-management-git-main-astro-6253.vercel.app/",  # your deployed frontend
        "http://localhost:3000",  # optional: local frontend testing
        "http://127.0.0.1:5500",  # optional: VSCode Live Server, etc.
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

supabase = create_client(
    SUPABASE_URL,
    SUPABASE_KEY
)

print("Supabase connected successfully!")


# CREATE student
@app.post("/students")
def create_student(name: str, course: str, marks: int):

    # Data to be inserted into Supabase
    student = {
        "name": name,
        "course": course,
        "marks": marks
    }

    # Insert student into Supabase
    response = (
        supabase
        .table("students")
        .insert(student)
        .execute()
    )

    # Return database response
    return {
        "message": "Student created successfully",
        "data": response.data
    }


# GET all students
@app.get("/students")
def get_students():

    # Get all students from Supabase
    response = (
        supabase
        .table("students")
        .select("*")
        .execute()
    )

    return response.data


# UPDATE student
@app.put("/students/{student_id}")
def update_student(student_id: int, name: str, course: str, marks: int):

    # Updated student data
    student = {
        "name": name,
        "course": course,
        "marks": marks
    }

    # Update student in Supabase
    response = (
        supabase
        .table("students")
        .update(student)
        .eq("id", student_id)
        .execute()
    )

    return response.data


# DELETE student
@app.delete("/students/{student_id}")
def delete_student(student_id: int):

    # Delete student from Supabase
    response = (
        supabase
        .table("students")
        .delete()
        .eq("id", student_id)
        .execute()
    )

    return response.data
