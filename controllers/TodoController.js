import Todo from "../models/Todo.js";

export const getTodos = async (req, res) => {
  try {
    const todos = await Todo.find();
    res.json(todos);
  } catch (error) {
    res.status(500).json({ error: `Error fetching todos: ${error}` });
  }
};

export const addTodo = async (req, res) => {
  try {
    const todo = new Todo({
      text: req.body.text,
    });
    await todo.save();
    res.json(todo);
  } catch (error) {
    res.status(500).json({ error: `Error adding todo: ${error}` });
  }
};

export const updateTodo = async (req, res) => {
  try {
    const todo = await Todo.findByIdAndUpdate(
      req.params.id,
      { completed: req.body.completed },
      { returnDocument: "after" },
    );
    if (!todo) return req.status(404).json({ error: "Todo not found" });
    res.json(todo);
  } catch (error) {
    res.status(500).json({ error: `Error updating todo: ${error}` });
  }
};

export const deleteTodo = async (req, res) => {
  try {
    const todo = await Todo.findByIdAndDelete(req.params.id);
    if (!todo) return res.status(404).json({ error: "Todo not found" });
    res.json(todo);
  } catch {
    res.status(500).json({ error: `Error deleting todo: ${error}` });
  }
};
