const API_URL = "const API_URL = "https://student-management-2-4scm.onrender.com";

const studentForm = document.getElementById("studentForm");
const studentTable = document.getElementById("studentTable");
const submitBtn = studentForm.querySelector("button[type=submit]");

// Tracks the DB id of the student currently being edited (null = adding new)
let editingId = null;

// ==============================
// LOAD & RENDER STUDENTS
// ==============================
async function loadStudents() {
    try {
        const res = await fetch(`${API_URL}/students`);

        if (!res.ok) {
            throw new Error(`Server responded with ${res.status}`);
        }

        const students = await res.json();
        renderStudents(students);
    } catch (err) {
        console.error("Error fetching students:", err);
        alert("Could not load students. Is the backend running?");
    }
}

function renderStudents(students) {
    studentTable.innerHTML = "";

    students.forEach((student) => {
        const row = document.createElement("tr");

        // Note: "id" here is the auto-generated Supabase primary key,
        // not the "Student ID" the user types in the form.
        row.innerHTML = `
            <td>${student.id}</td>
            <td>${student.name}</td>
            <td>${student.course}</td>
            <td>${student.marks}</td>
            <td>
                <button class="edit-btn" data-id="${student.id}">✏️ Edit</button>
                <button class="delete-btn" data-id="${student.id}">🗑️ Delete</button>
            </td>
        `;

        studentTable.appendChild(row);
    });

    // Attach button listeners after rendering
    studentTable.querySelectorAll(".edit-btn").forEach((btn) => {
        btn.addEventListener("click", () => startEdit(btn.dataset.id, students));
    });

    studentTable.querySelectorAll(".delete-btn").forEach((btn) => {
        btn.addEventListener("click", () => deleteStudent(btn.dataset.id));
    });
}

// ==============================
// ADD / UPDATE STUDENT
// ==============================
studentForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const course = document.getElementById("course").value.trim();
    const marks = document.getElementById("marks").value;

    // The FastAPI endpoints expect name/course/marks as query params
    // (they aren't defined as a Pydantic body model).
    const query = new URLSearchParams({ name, course, marks }).toString();

    try {
        let res;

        if (editingId) {
            res = await fetch(`${API_URL}/students/${editingId}?${query}`, {
                method: "PUT",
            });
        } else {
            res = await fetch(`${API_URL}/students?${query}`, {
                method: "POST",
            });
        }

        if (!res.ok) {
            throw new Error(`Server responded with ${res.status}`);
        }

        resetForm();
        loadStudents();
    } catch (err) {
        console.error("Error saving student:", err);
        alert("Could not save student.");
    }
});

// ==============================
// EDIT STUDENT
// ==============================
function startEdit(id, students) {
    const student = students.find((s) => String(s.id) === String(id));
    if (!student) return;

    document.getElementById("studentId").value = student.id;
    document.getElementById("name").value = student.name;
    document.getElementById("course").value = student.course;
    document.getElementById("marks").value = student.marks;

    editingId = student.id;
    submitBtn.textContent = "Update Student";
}

// ==============================
// DELETE STUDENT
// ==============================
async function deleteStudent(id) {
    if (!confirm("Delete this student?")) return;

    try {
        const res = await fetch(`${API_URL}/students/${id}`, {
            method: "DELETE",
        });

        if (!res.ok) {
            throw new Error(`Server responded with ${res.status}`);
        }

        loadStudents();
    } catch (err) {
        console.error("Error deleting student:", err);
        alert("Could not delete student.");
    }
}

// ==============================
// HELPERS
// ==============================
function resetForm() {
    studentForm.reset();
    editingId = null;
    submitBtn.textContent = "Add Student";
}

// ==============================
// INITIAL LOAD
// ==============================
loadStudents();
