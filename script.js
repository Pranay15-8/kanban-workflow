
const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const board = document.getElementById("board");
const progressText = document.getElementById("progressText");
const progressBar = document.getElementById("progressBar");
const bottleneckArea = document.getElementById("bottleneckArea");

// Initial tasks displayed when the board is used for the first time
const initialTasks = [
    { id: 1, title: "Design homepage", status: "To Do" },
    { id: 2, title: "Develop login page", status: "In Progress" },
    { id: 3, title: "Test registration form", status: "Testing" },
    { id: 4, title: "Setup project", status: "Done" }
];

const statuses = ["To Do", "In Progress", "Testing", "Done"];

let tasks = loadTasks();

// Load saved tasks from localStorage
function loadTasks() {
    try {
        const savedTasks = localStorage.getItem("kanbanTasks");

        if (savedTasks !== null) {
            const parsedTasks = JSON.parse(savedTasks);

            if (
                Array.isArray(parsedTasks) &&
                parsedTasks.every(task =>
                    task &&
                    Number.isInteger(task.id) &&
                    typeof task.title === "string" &&
                    statuses.includes(task.status)
                )
            ) {
                return parsedTasks;
            }
        }
    } catch (error) {
        console.error("Could not load saved tasks:", error);
    }

    return initialTasks.map(task => ({ ...task }));
}

// Save tasks in the browser
function saveTasks() {
    try {
        localStorage.setItem("kanbanTasks", JSON.stringify(tasks));
    } catch (error) {
        console.error("Could not save tasks:", error);
        alert("Tasks could not be saved in this browser.");
    }
}

// Display tasks in their respective columns
function renderTasks() {
    document.querySelectorAll(".column").forEach(column => {
        const status = column.dataset.status;
        const taskContainer = column.querySelector(".tasks");

        taskContainer.replaceChildren();

        const columnTasks = tasks.filter(task => task.status === status);

        column.querySelector(".count").textContent = columnTasks.length;

        columnTasks.forEach(task => {
            const card = document.createElement("div");
            card.className = "task-card";

            const title = document.createElement("p");
            title.textContent = task.title;

            const select = document.createElement("select");
            select.setAttribute("aria-label", `Move ${task.title}`);

            statuses.forEach(optionStatus => {
                const option = document.createElement("option");
                option.value = optionStatus;
                option.textContent = optionStatus;
                option.selected = task.status === optionStatus;
                select.appendChild(option);
            });

            // Move the task when its status changes
            select.addEventListener("change", () => {
                task.status = select.value;
                saveTasks();
                renderTasks();
            });

            card.append(title, select);
            taskContainer.appendChild(card);
        });
    });

    updateProgress();
    checkBottlenecks();
}

// Add a new task
taskForm.addEventListener("submit", event => {
    event.preventDefault();

    const title = taskInput.value.trim();

    if (title === "") {
        alert("Please enter a task name.");
        return;
    }

    const newTask = {
        id: Date.now(),
        title: title,
        status: "To Do"
    };

    tasks.push(newTask);

    saveTasks();
    renderTasks();

    taskInput.value = "";
    taskInput.focus();
});

// Update completion percentage and progress bar
function updateProgress() {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(
        task => task.status === "Done"
    ).length;

    const percentage = totalTasks === 0
        ? 0
        : Math.round((completedTasks / totalTasks) * 100);

    progressText.textContent =
        `${percentage}% completed (${completedTasks}/${totalTasks} tasks)`;

    progressBar.value = percentage;
}

// Detect bottlenecks in the workflow
function checkBottlenecks() {
    bottleneckArea.replaceChildren();

    const busyStatuses = ["In Progress", "Testing"];
    let hasBottleneck = false;

    busyStatuses.forEach(status => {
        const count = tasks.filter(
            task => task.status === status
        ).length;

        // Three or more tasks in a stage triggers a warning
        if (count >= 3) {
            hasBottleneck = true;

            const warning = document.createElement("div");
            warning.className = "bottleneck-warning";

            const heading = document.createElement("strong");
            heading.textContent = "Bottleneck detected! ";

            const message = document.createElement("span");
            message.textContent =
                `${status} has ${count} tasks. ` +
                "The team should review this stage to prevent delays.";

            warning.append(heading, message);
            bottleneckArea.appendChild(warning);
        }
    });

    if (!hasBottleneck) {
        const message = document.createElement("div");
        message.className = "no-bottleneck";
        message.textContent =
            "Workflow looks good. No bottlenecks detected.";
        bottleneckArea.appendChild(message);
    }
}

// Display the board when the page loads
renderTasks();
