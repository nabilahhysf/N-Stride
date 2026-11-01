
/* Demo login details */
const correctUsername = "admin";
const correctPassword = "12345";

/* Sample task data */
let tasks = [
    {
        id: 1,
        name: "Complete IMS566 Assignment",
        category: "Study",
        date: "2026-11-05",
        status: "In Progress"
    },
    {
        id: 2,
        name: "Revise lecture notes",
        category: "Study",
        date: "2026-11-02",
        status: "Pending"
    },
    {
        id: 3,
        name: "Organise weekly schedule",
        category: "Personal",
        date: "2026-11-01",
        status: "Completed"
    },
    {
        id: 4,
        name: "Prepare project presentation",
        category: "Work",
        date: "2026-11-08",
        status: "Pending"
    }
];

let nextTaskId = 5;
let taskChart;

/* Login function */
document.getElementById("loginForm").addEventListener("submit", function (event) {
    event.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;
    const message = document.getElementById("loginMessage");

    if (username === correctUsername && password === correctPassword) {
        document.getElementById("loginPage").classList.add("d-none");
        document.getElementById("mainPage").classList.remove("d-none");

        message.textContent = "";
        showPage("dashboardPage");
        updateDashboard();
        displayTasks();
    } else {
        message.textContent = "Invalid username or password. Please try again.";
    }
});

/* Logout function */
document.getElementById("logoutButton").addEventListener("click", function () {
    document.getElementById("mainPage").classList.add("d-none");
    document.getElementById("loginPage").classList.remove("d-none");

    document.getElementById("loginForm").reset();
    document.getElementById("loginMessage").textContent = "";
});

/* Navigation function */
document.querySelectorAll("[data-page]").forEach(function (link) {
    link.addEventListener("click", function (event) {
        event.preventDefault();

        const pageId = this.getAttribute("data-page");
        showPage(pageId);
    });
});

/* Show selected page */
function showPage(pageId) {
    document.querySelectorAll(".contentPage").forEach(function (page) {
        page.classList.add("d-none");
    });

    document.getElementById(pageId).classList.remove("d-none");

    document.querySelectorAll("[data-page]").forEach(function (link) {
        link.classList.remove("active");

        if (link.getAttribute("data-page") === pageId) {
            link.classList.add("active");
        }
    });

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

/* Display tasks in the table */
function displayTasks() {
    const tableBody = document.getElementById("taskTableBody");
    const searchText = document.getElementById("searchTask").value.toLowerCase();
    const selectedStatus = document.getElementById("statusFilter").value;

    tableBody.innerHTML = "";

    const filteredTasks = tasks.filter(function (task) {
        const matchesSearch = task.name.toLowerCase().includes(searchText);
        const matchesStatus = selectedStatus === "All" || task.status === selectedStatus;

        return matchesSearch && matchesStatus;
    });

    filteredTasks.forEach(function (task) {
        const row = document.createElement("tr");

        const nameCell = document.createElement("td");
        nameCell.textContent = task.name;

        const categoryCell = document.createElement("td");
        categoryCell.textContent = task.category;

        const dateCell = document.createElement("td");
        dateCell.textContent = task.date;

        const statusCell = document.createElement("td");
        const statusBadge = document.createElement("span");

        statusBadge.classList.add("badge");

        if (task.status === "Completed") {
            statusBadge.classList.add("text-bg-success");
        } else if (task.status === "In Progress") {
            statusBadge.classList.add("text-bg-primary");
        } else {
            statusBadge.classList.add("text-bg-warning");
        }

        statusBadge.textContent = task.status;
        statusCell.appendChild(statusBadge);

        const actionCell = document.createElement("td");
        const actionGroup = document.createElement("div");
        actionGroup.classList.add("d-flex", "flex-wrap", "gap-1");

        const statusButton = document.createElement("button");
        statusButton.classList.add("btn", "btn-sm", "btn-outline-primary");
        statusButton.textContent = "Next Status";
        statusButton.addEventListener("click", function () {
            changeStatus(task.id);
        });

        const deleteButton = document.createElement("button");
        deleteButton.classList.add("btn", "btn-sm", "btn-outline-danger");
        deleteButton.textContent = "Delete";
        deleteButton.addEventListener("click", function () {
            deleteTask(task.id);
        });

        actionGroup.appendChild(statusButton);
        actionGroup.appendChild(deleteButton);
        actionCell.appendChild(actionGroup);

        row.appendChild(nameCell);
        row.appendChild(categoryCell);
        row.appendChild(dateCell);
        row.appendChild(statusCell);
        row.appendChild(actionCell);

        tableBody.appendChild(row);
    });

    document.getElementById("emptyMessage").classList.toggle(
        "d-none",
        filteredTasks.length > 0
    );
}

/* Search and filter */
document.getElementById("searchTask").addEventListener("input", displayTasks);
document.getElementById("statusFilter").addEventListener("change", displayTasks);

/* Add a new task */
document.getElementById("taskForm").addEventListener("submit", function (event) {
    event.preventDefault();

    const newTask = {
        id: nextTaskId,
        name: document.getElementById("taskName").value.trim(),
        category: document.getElementById("taskCategory").value,
        date: document.getElementById("taskDate").value,
        status: document.getElementById("taskStatus").value
    };

    if (!newTask.name || !newTask.date) {
        return;
    }

    tasks.push(newTask);
    nextTaskId++;

    this.reset();

    const modalElement = document.getElementById("taskModal");
    const modal = bootstrap.Modal.getOrCreateInstance(modalElement);
    modal.hide();

    displayTasks();
    updateDashboard();
    updateCategories();
});

/* Change task status */
function changeStatus(taskId) {
    const task = tasks.find(function (item) {
        return item.id === taskId;
    });

    if (task.status === "Pending") {
        task.status = "In Progress";
    } else if (task.status === "In Progress") {
        task.status = "Completed";
    } else {
        task.status = "Pending";
    }

    displayTasks();
    updateDashboard();
    updateCategories();
}

/* Delete a task */
function deleteTask(taskId) {
    const confirmDelete = confirm("Are you sure you want to delete this task?");

    if (confirmDelete) {
        tasks = tasks.filter(function (task) {
            return task.id !== taskId;
        });

        displayTasks();
        updateDashboard();
        updateCategories();
    }
}

/* Update dashboard numbers and chart */
function updateDashboard() {
    const total = tasks.length;

    const pending = tasks.filter(function (task) {
        return task.status === "Pending";
    }).length;

    const inProgress = tasks.filter(function (task) {
        return task.status === "In Progress";
    }).length;

    const completed = tasks.filter(function (task) {
        return task.status === "Completed";
    }).length;

    document.getElementById("totalTasks").textContent = total;
    document.getElementById("pendingTasks").textContent = pending;
    document.getElementById("completedTasks").textContent = completed;

    const chartCanvas = document.getElementById("taskChart");

    if (taskChart) {
        taskChart.data.datasets[0].data = [pending, inProgress, completed];
        taskChart.update();
    } else {
        taskChart = new Chart(chartCanvas, {
            type: "doughnut",
            data: {
                labels: ["Pending", "In Progress", "Completed"],
                datasets: [{
                    data: [pending, inProgress, completed],
                    backgroundColor: ["#ffc107", "#0d6efd", "#198754"]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }
}

/* Update category totals */
function updateCategories() {
    const study = tasks.filter(function (task) {
        return task.category === "Study";
    }).length;

    const personal = tasks.filter(function (task) {
        return task.category === "Personal";
    }).length;

    const work = tasks.filter(function (task) {
        return task.category === "Work";
    }).length;

    document.getElementById("studyCount").textContent = study + " tasks";
    document.getElementById("personalCount").textContent = personal + " tasks";
    document.getElementById("workCount").textContent = work + " tasks";
}
