import { useState, useEffect } from "react";
import "./App.css";

const initialTasks = [
  { id: 1, title: "Design homepage", status: "To Do" },
  { id: 2, title: "Develop login page", status: "In Progress" },
  { id: 3, title: "Test registration form", status: "Testing" },
  { id: 4, title: "Setup project", status: "Done" },
];

const columns = ["To Do", "In Progress", "Testing", "Done"];

function App() {
  const [tasks, setTasks] = useState(() => {
    try {
      const savedTasks = localStorage.getItem("kanbanTasks");
      return savedTasks ? JSON.parse(savedTasks) : initialTasks;
    } catch {
      return initialTasks;
    }
  });

  const [newTask, setNewTask] = useState("");

  useEffect(() => {
    localStorage.setItem("kanbanTasks", JSON.stringify(tasks));
  }, [tasks]);

  function addTask(e) {
    e.preventDefault();

    const title = newTask.trim();
    if (!title) return;

    setTasks((previousTasks) => [
      ...previousTasks,
      {
        id: Date.now(),
        title,
        status: "To Do",
      },
    ]);

    setNewTask("");
  }

  function moveTask(id, status) {
    setTasks((previousTasks) =>
      previousTasks.map((task) =>
        task.id === id ? { ...task, status } : task
      )
    );
  }

  const completed = tasks.filter(
    (task) => task.status === "Done"
  ).length;

  const inProgressCount = tasks.filter(
    (task) => task.status === "In Progress"
  ).length;

  const testingCount = tasks.filter(
    (task) => task.status === "Testing"
  ).length;

  const progress = tasks.length
    ? Math.round((completed / tasks.length) * 100)
    : 0;

  const bottlenecks = [
    {
      status: "In Progress",
      count: inProgressCount,
      message:
        "Work may be accumulating at this stage. Check task assignments and workload.",
    },
    {
      status: "Testing",
      count: testingCount,
      message:
        "Testing may be delaying the workflow. Review testing capacity and pending tasks.",
    },
  ].filter((item) => item.count >= 3);

  return (
    <main className="app">
      <header>
        <p className="eyebrow">PROJECT WORKFLOW</p>
        <h1>Kanban Dashboard</h1>
        <p className="subtitle">
          Track project progress and identify bottlenecks.
        </p>
      </header>

      <section className="stats">
        <div className="stat">
          <span>Total Tasks</span>
          <strong>{tasks.length}</strong>
        </div>

        <div className="stat">
          <span>In Progress</span>
          <strong>{inProgressCount}</strong>
        </div>

        <div className="stat">
          <span>Completed</span>
          <strong>{completed}</strong>
        </div>

        <div className="stat">
          <span>Completion</span>
          <strong>{progress}%</strong>
        </div>
      </section>

      <section className="progress-section">
        <div className="progress-label">
          <span>Overall Project Progress</span>
          <strong>{progress}%</strong>
        </div>

        <div className="progress-track">
          <div
            className="progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
      </section>

      <form className="task-form" onSubmit={addTask}>
        <input
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Enter a new task..."
          aria-label="New task title"
        />

        <button type="submit">+ Add Task</button>
      </form>

      {bottlenecks.length > 0 && (
        <div className="alert" role="alert">
          <strong>⚠ Possible Bottleneck Detected!</strong>

          {bottlenecks.map((item) => (
            <p key={item.status}>
              <strong>{item.status}: {item.count} tasks.</strong>{" "}
              {item.message}
            </p>
          ))}
        </div>
      )}

      <section className="board">
        {columns.map((column) => {
          const columnTasks = tasks.filter(
            (task) => task.status === column
          );

          return (
            <div
              className={`column ${column
                .toLowerCase()
                .replace(" ", "-")}`}
              key={column}
            >
              <div className="column-heading">
                <h2>{column}</h2>
                <span>{columnTasks.length}</span>
              </div>

              {columnTasks.map((task) => (
                <article className="task-card" key={task.id}>
                  <p>{task.title}</p>

                  <label>Move task</label>

                  <select
                    value={task.status}
                    onChange={(e) =>
                      moveTask(task.id, e.target.value)
                    }
                    aria-label={`Move ${task.title}`}
                  >
                    {columns.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </article>
              ))}

              {columnTasks.length === 0 && (
                <p className="empty">No tasks here</p>
              )}
            </div>
          );
        })}
      </section>

      <footer>
        Kanban workflow · Progress tracking · Bottleneck monitoring
      </footer>
    </main>
  );
}

export default App;