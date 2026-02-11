const todoInput = document.getElementById("todoInput");
const todoButton = document.getElementById("todoButton");
const todoList = document.getElementById("todoList");
const todoCount = document.getElementById("todoCount");

document.addEventListener("DOMContentLoaded", loadTodos);

async function loadTodos() {
  try {
    const response = await fetch("/api/todos");
    const todos = await response.json();

    renderTodos(todos);
  } catch (e) {
    console.error("Error loading todos");
  }
}

function renderTodos(todos) {
  todoList.innerHTML = "";

  todos.forEach((todo) => {
    const li = document.createElement("li");
    li.className = `todo-item ${todo.completed ? "completed" : ""}`;

    li.innerHTML = `
      <input
              type="checkbox"
              class="checkbox"
              ${todo.completed ? "checked" : ""}
              data-id = "${todo.id}"
            >
      <span>${todo.text}</span>
      <button class="delete-btn" data-id = "${todo.id}">Delete</button>
      `;

    todoList.appendChild(li);
  });

  document.querySelectorAll(".checkbox").forEach((checkbox) => {
    checkbox.addEventListener("change", (e) => {
      const id = e.target.dataset.id;
      toggleTodo(id);
    });
  });

  document.querySelectorAll(".delete-btn").forEach((button) => {
    button.addEventListener("click", (e) => {
      const id = e.target.dataset.id;
      deleteTodo(id);
    });
  });

  const activeTodos = todos.filter((t) => !t.completed).length;
  todoCount.textContent = `${activeTodos} active task${activeTodos !== 1 ? "s" : ""}`;
}

addButton.addEventListener("click", addTodo);

todoInput.addEventListener("keypress", (e) => {
  if (e.key == "Enter") {
    addTodo();
  }
});

async function addTodo() {
  const text = todoInput.value.trim();

  if (!text) {
    alert("Please enter a todo");
    return;
  }

  try {
    const response = await fetch("/api/todos", {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify({ text }),
    });

    if (response.ok) {
      todoInput.value = "";
      loadTodos();
    }
  } catch (error) {
    console.error("Error adding todo: ", error);
  }
}

async function toggleTodo(id) {
  try {
    await fetch(`/api/todos/${id}`, {
      method: "PUT",
    });

    loadTodos();
  } catch (error) {
    console.error("Error updating todo: ", error);
  }
}

async function deleteTodo(id) {
  try {
    const response = await fetch(`/api/todos/${id}`, {
      method: "DELETE",
    });

    if (response.ok) {
      alert("Todo deleted successfully");
      loadTodos();
    }
  } catch (error) {
    console.error("Error deleting todo: ", error);
  }
}
