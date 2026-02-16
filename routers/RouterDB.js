import express from "express";
import * as todoController from "../controllers/TodoController.js";

const routerDB = express.Router();

routerDB
  .route("/app/todos")
  .get(todoController.getTodos)
  .post(todoController.addTodo);

routerDB
  .route("/app/todos/:id")
  .put(todoController.updateTodo)
  .delete(todoController.deleteTodo);

export default routerDB;
