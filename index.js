import express from "express";
import fs from "fs";
import { fileURLToPath } from "url";
import path from "path";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import Todo from "./models/Todo.js";

dotenv.config();

const app = express();

const PORT = 3000;

//middlewares, run before routes
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

//connecting to db
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("successfully connected to database"))
  .catch((err) => console.error("Mongodb error: ", err));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, "todos.json");

if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify([]));
}

//routes
// /api/..  --> use file storage
// /app/.. --> use database storage
app.get("/api/todos", (req, res) => {
  const todos = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
  res.json(todos);

  console.log("----->Get");
});

app.post("/api/todos", (req, res) => {
  const text = req.body.text;
  const newTodo = { completed: false };
  newTodo.text = text;

  try {
    let todos = [];

    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, "utf8");
      todos = content.trim() ? JSON.parse(content) : [];
      newTodo.id = Date.now();
    }

    todos.push(newTodo);

    fs.writeFileSync(DATA_FILE, JSON.stringify(todos), "utf8");

    res.json(newTodo);
  } catch (e) {
    res.status(500).json({ error: "Failed to save todo" });
  }

  console.log("----->Post");
});

app.put("/api/todos/:id", (req, res) => {
  const id = req.params.id;

  try {
    let todos = [];
    const content = fs.readFileSync(DATA_FILE, "utf8");

    content.trim()
      ? (todos = JSON.parse(content))
      : res.status(500).json({ error: "Task not found" });

    const todo = todos.find((t) => t.id == parseInt(id));

    if (!todo) {
      return res.status(500).json({ error: "todo not found" });
    }

    todo.completed = !todo.completed;
    fs.writeFileSync(DATA_FILE, JSON.stringify(todos, null, 2));
    res.json(todo);
  } catch (error) {
    res.status(500).json({ error: "Can't update tasks" });
  }

  console.log("----->Put");
});

app.delete("/api/todos/:id", (req, res) => {
  const id = req.params.id;

  try {
    const todos = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
    const updatedTodos = todos.filter((t) => t.id !== parseInt(id));

    if (todos.length === updatedTodos.length) {
      return res.status(404).json({ error: "Todo not found" });
    }

    fs.writeFileSync(DATA_FILE, JSON.stringify(updatedTodos, null, 2));
    res.json({ message: "Todo deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Can't delete task" });
  }

  console.log("----->Delete");
});

app.listen(PORT, () => {
  console.log("Server running at port: 3000");
});

//endpoints , use mongodb for storage and fetching
app.get("/app/todos", async (req, res) => {
  try {
    const todos = await Todo.find();
    res.json(todos);
  } catch (error) {
    res.status(500).json({ error: `Error fetching todos: ${error}` });
  }
});

app.post("/app/todos", async (req, res) => {
  try {
    const newTodo = new Todo({
      text: req.body.text,
    });
    await newTodo.save();
    res.status(201).json(newTodo);
  } catch (error) {
    res.status(500).json({ error: `Error adding todo: ${error}` });
  }
});

app.put("/app/todos/:id", async (req, res) => {
  try {
    const todo = await Todo.findByIdAndUpdate(
      req.params.id,
      { completed: req.body.completed },
      { returnDocument: "after" },
    );
    if (!todo) return res.status(404).json({ error: "Todo not found" });
    res.json(todo);
  } catch (error) {
    res.status(500).json({ error: `Error updating todo ${error}` });
  }
});

app.delete("/app/todos/:id", async (req, res) => {
  try {
    const todo = await Todo.findByIdAndDelete(req.params.id);
    if (!todo) return res.status(404).json({ error: "Todo not found" });
    res.json(todo);
  } catch (error) {
    res.status(500).json({ error: `Error deleting todo ${error}` });
  }
});
