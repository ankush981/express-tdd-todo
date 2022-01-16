const express = require("express");
const router = express.Router();
const TodoController = require("../controllers/todo.controller");

router.post("/", TodoController.createTodo);
router.get("/", TodoController.getTodos);
router.get("/:todoId", TodoController.getTodoById);
router.put("/:todoId", TodoController.updateTodo);
router.delete("/:todoId", TodoController.deleteTodo);

module.exports = router;