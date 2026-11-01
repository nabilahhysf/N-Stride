
// ==========================================
// N-STRIDE - PERSONAL TASK MANAGEMENT SYSTEM
// ==========================================

// 1. GLOBAL VARIABLES
let users = JSON.parse(localStorage.getItem("nStrideUsers")) || [];
let tasks = [];
let nextTaskId = 1;
let taskChart = null;
let currentUser = null;


// ==========================================
// 2. SAVE AND LOAD TASKS
// ==========================================

// Save tasks according to the logged-in username
function saveTasks() {
    if (!currentUser) return;

    localStorage.setItem(
        "nStrideTasks_" + currentUser.username,
        JSON.stringify(tasks)
    );
}

// Load tasks belonging to the logged-in user
function loadUserTasks() {
    if (!currentUser) return;

    tasks = JSON.parse(
        localStorage.getItem(
            "nStrideTasks_" + currentUser.username
        )
    ) || [];

    nextTaskId = tasks.length > 0
        ? Math.max(...tasks.map(task => task.id)) + 1
        : 1;
}


// ==========================================
// 3. LOGIN AND REGISTER
// ==========================================

// Show Register Section
document.getElementById("showRegister")?.addEventListener("click", function () {
    document.getElementById("loginSection").classList.add("d-none");
    document.getElementById("registerSection").classList.remove("d-none");
});

// Show Login Section
document.getElementById("showLogin")?.addEventListener("click", function () {
    document.getElementById("registerSection").classList.add("d-none");
    document.getElementById("loginSection").classList.remove("d-none");
});


// REGISTER
document.getElementById("registerForm")?.addEventListener("submit", function (e) {
    e.preventDefault();

    const name = document.getElementById("registerName").value.trim();
    const username = document.getElementById("registerUsername").value.trim();
    const password = document.getElementById("registerPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const message = document.getElementById("registerMessage");

    message.textContent = "";
    message.className = "mt-2";

    // Check password
    if (password !== confirmPassword) {
        message.textContent = "Passwords do not match!";
        message.classList.add("text-danger");
        return;
    }

    // Check existing username
    const existingUser = users.find(
        user => user.username.toLowerCase() === username.toLowerCase()
    );

    if (existingUser) {
        message.textContent = "Username already exists!";
        message.classList.add("text-danger");
        return;
    }

    // Create new account
    const newUser = {
        name: name,
        username: username,
        password: password
    };

    users.push(newUser);

    localStorage.setItem("nStrideUsers", JSON.stringify(users));

    // Create an empty task list for the new account
    localStorage.setItem(
        "nStrideTasks_" + username,
        JSON.stringify([])
    );

    message.textContent = "Registration successful! You can now login.";
    message.classList.add("text-success");

    document.getElementById("registerForm").reset();
});


// LOGIN
document.getElementById("loginForm")?.addEventListener("submit", function (e) {
    e.preventDefault();

    const username = document.getElementById("loginUsername").value.trim();
    const password = document.getElementById("loginPassword").value;
    const message = document.getElementById("loginMessage");

    message.textContent = "";
    message.className = "mt-2";

    // Check account details
    const user = users.find(
        user =>
            user.username.toLowerCase() === username.toLowerCase() &&
            user.password === password
    );

    if (!user) {
        message.textContent = "Invalid username or password!";
        message.classList.add("text-danger");
        return;
    }

    // Set current user
    currentUser = user;

    // Load this user's saved tasks
    loadUserTasks();

    // Show main application
    document.getElementById("authPage").classList.add("d-none");
    document.getElementById("mainPage").classList.remove("d-none");

    document.getElementById("welcomeUser").textContent =
        "Welcome, " + currentUser.name + "!";

    // Update dashboard information
    updateDashboard();
    displayTasks();
    updateCategories();

    showPage("dashboardPage");

    document.getElementById("loginForm").reset();
});


// LOGOUT
document.getElementById("logoutButton")?.addEventListener("click", function () {

    // Save before logout
    saveTasks();

    currentUser = null;
    tasks = [];
    nextTaskId = 1;

    document.getElementById("mainPage").classList.add("d-none");
    document.getElementById("authPage").classList.remove("d-none");

    document.getElementById("loginSection").classList.remove("d-none");
    document.getElementById("registerSection").classList.add("d-none");

    document.getElementById("loginForm").reset();
});


// ==========================================
// 4. PAGE NAVIGATION
// ==========================================

function showPage(pageId) {

    const pages = [
        "dashboardPage",
        "tasksPage",
        "categoriesPage"
    ];

    pages.forEach(page => {
        document.getElementById(page)?.classList.add("d-none");
    });

    document.getElementById(pageId)?.classList.remove("d-none");

    // Refresh information when opening a page
    if (pageId === "dashboardPage") {
        updateDashboard();
    }

    if (pageId === "tasksPage") {
        displayTasks();
    }

    if (pageId === "categoriesPage") {
        updateCategories();
    }
}


// Navigation buttons
document.querySelectorAll("[data-page]").forEach(button => {
    button.addEventListener("click", function () {
        const pageId = this.getAttribute("data-page");
        showPage(pageId);
    });
});


// ==========================================
// 5. DISPLAY TASKS
// ==========================================

function displayTasks() {

    const tableBody = document.getElementById("taskTableBody");
    const emptyMessage = document.getElementById("emptyMessage");

    if (!tableBody) return;

    tableBody.innerHTML = "";

    const searchValue =
        document.getElementById("searchTask")?.value.toLowerCase() || "";

    const selectedStatus =
        document.getElementById("statusFilter")?.value || "All";

    // Search and filter tasks
    const filteredTasks = tasks.filter(task => {

        const matchesSearch =
            task.name.toLowerCase().includes(searchValue);

        const matchesStatus =
            selectedStatus === "All" ||
            task.status === selectedStatus;

        return matchesSearch && matchesStatus;
    });

    if (filteredTasks.length === 0) {
        emptyMessage?.classList.remove("d-none");
        return;
    }

    emptyMessage?.classList.add("d-none");

    filteredTasks.forEach(task => {

        const row = document.createElement("tr");

        const statusClass = {
            "Pending": "bg-warning text-dark",
            "In Progress": "bg-primary",
            "Completed": "bg-success"
        };

        row.innerHTML = `
            <td>${escapeHTML(task.name)}</td>
            <td>${escapeHTML(task.category)}</td>
            <td>${escapeHTML(task.date)}</td>
            <td>
                <span class="badge ${statusClass[task.status] || "bg-secondary"}">
                    ${escapeHTML(task.status)}
                </span>
            </td>
            <td>
                <button class="btn btn-sm btn-outline-primary me-1"
                    onclick="changeTaskStatus(${task.id})">
                    Update
                </button>

                <button class="btn btn-sm btn-outline-danger"
                    onclick="deleteTask(${task.id})">
                    Delete
                </button>
            </td>
        `;

        tableBody.appendChild(row);
    });
}


// Escape user-entered text before displaying it in HTML
function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, character => {
        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };

        return entities[character];
    });
}


// Search tasks
document.getElementById("searchTask")?.addEventListener("input", displayTasks);


// Filter tasks
document.getElementById("statusFilter")?.addEventListener("change", displayTasks);


// ==========================================
// 6. ADD NEW TASK
// ==========================================

document.getElementById("taskForm")?.addEventListener("submit", function (e) {
    e.preventDefault();

    if (!currentUser) return;

    const taskName = document.getElementById("taskName").value.trim();
    const taskCategory = document.getElementById("taskCategory").value;
    const taskDate = document.getElementById("taskDate").value;
    const taskStatus = document.getElementById("taskStatus").value;

    if (!taskName || !taskCategory || !taskDate || !taskStatus) {
        alert("Please complete all task details.");
        return;
    }

    // Create new task
    const newTask = {
        id: nextTaskId++,
        name: taskName,
        category: taskCategory,
        date: taskDate,
        status: taskStatus
    };

    tasks.push(newTask);

    // Save tasks immediately
    saveTasks();

    // Refresh information
    displayTasks();
    updateDashboard();
    updateCategories();

    // Reset form
    document.getElementById("taskForm").reset();

    // Close Bootstrap modal
    const modalElement = document.getElementById("taskModal");
    const modalInstance = bootstrap.Modal.getInstance(modalElement);

    if (modalInstance) {
        modalInstance.hide();
    }
});


// ==========================================
// 7. CHANGE TASK STATUS
// ==========================================

function changeTaskStatus(id) {

    const task = tasks.find(task => task.id === id);

    if (!task) return;

    // Change status
    if (task.status === "Pending") {
        task.status = "In Progress";
    } else if (task.status === "In Progress") {
        task.status = "Completed";
    } else {
        task.status = "Pending";
    }

    // Save updated status
    saveTasks();

    displayTasks();
    updateDashboard();
    updateCategories();
}


// ==========================================
// 8. DELETE TASK
// ==========================================

function deleteTask(id) {

    const confirmation = confirm("Are you sure you want to delete this task?");

    if (!confirmation) return;

    tasks = tasks.filter(task => task.id !== id);

    // Save after deleting
    saveTasks();

    displayTasks();
    updateDashboard();
    updateCategories();
}


// ==========================================
// 9. DASHBOARD SUMMARY AND CHART
// ==========================================

function updateDashboard() {

    const total = tasks.length;

    const pending = tasks.filter(
        task => task.status === "Pending"
    ).length;

    const completed = tasks.filter(
        task => task.status === "Completed"
    ).length;

    document.getElementById("totalTasks").textContent = total;
    document.getElementById("pendingTasks").textContent = pending;
    document.getElementById("completedTasks").textContent = completed;

    updateChart();
}


// ==========================================
// 10. CHART.JS
// ==========================================

function updateChart() {

    const chartCanvas = document.getElementById("taskChart");

    if (!chartCanvas) return;

    const pending = tasks.filter(
        task => task.status === "Pending"
    ).length;

    const inProgress = tasks.filter(
        task => task.status === "In Progress"
    ).length;

    const completed = tasks.filter(
        task => task.status === "Completed"
    ).length;

    // Destroy previous chart before creating a new one
    if (taskChart) {
        taskChart.destroy();
    }

    taskChart = new Chart(chartCanvas, {
        type: "doughnut",

        data: {
            labels: ["Pending", "In Progress", "Completed"],

            datasets: [{
                label: "Tasks",
                data: [pending, inProgress, completed],
                backgroundColor: [
                    "#ffc107",
                    "#0d6efd",
                    "#198754"
                ],
                borderWidth: 1
            }]
        },

        options: {
            responsive: true,
            maintainAspectRatio: false,

            plugins: {
                legend: {
                    position: "bottom"
                },

                title: {
                    display: true,
                    text: "Task Status Overview"
                }
            }
        }
    });
}


// ==========================================
// 11. CATEGORIES
// ==========================================

function updateCategories() {

    const studyCount = tasks.filter(
        task => task.category === "Study"
    ).length;

    const personalCount = tasks.filter(
        task => task.category === "Personal"
    ).length;

    const workCount = tasks.filter(
        task => task.category === "Work"
    ).length;

    document.getElementById("studyCount").textContent = studyCount;
    document.getElementById("personalCount").textContent = personalCount;
    document.getElementById("workCount").textContent = workCount;
}
