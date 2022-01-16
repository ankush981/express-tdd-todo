const TodoController = require("../../controllers/todo.controller");
const TodoModel = require("../../models/todo.model");
const httpMocks = require("node-mocks-http");
const newTodoData = require("../mock-data/new-todo.json");
const allTodosData = require("../mock-data/all-todos.json");

// Let's mock out the (mongoose) methods we don't want to actually
// call as part of unit testing (but these get called during)
// integration testing.
TodoModel.create = jest.fn();
TodoModel.find = jest.fn();
TodoModel.findById = jest.fn();
TodoModel.findByIdAndUpdate = jest.fn();
TodoModel.findByIdAndDelete = jest.fn();

const todoId = "61d8a2336f554f35bed65344";

let req, res, next;
beforeEach(() => {
    req = httpMocks.createRequest();
    res = httpMocks.createResponse();
    next = jest.fn();
});

describe("TodoController.deleteTodo", () => {
    it("should have a deleteTodo function", () => {
        expect(typeof TodoController.deleteTodo).toEqual("function");
    });

    it("should call findByIdAndDelete function", async () => {
        req.params.todoId = todoId;
        await TodoController.deleteTodo(req, res, next);
        expect(TodoModel.findByIdAndDelete).toHaveBeenCalledWith(todoId);
    })

    it("should return 200 and deleted todo", async () => {
        TodoModel.findByIdAndDelete.mockReturnValue(newTodoData);
        await TodoController.deleteTodo(req, res, next);
        expect(res.statusCode).toEqual(200);
        expect(res._getJSONData()).toStrictEqual(newTodoData);
        expect(res._isEndCalled()).toBeTruthy();
    });

    it("should handle errors", async () => {
        const errorMessage = { message: "Error deleting" };
        const rejectedPromise = Promise.reject(errorMessage);
        TodoModel.findByIdAndDelete.mockReturnValue(rejectedPromise);
        await TodoController.deleteTodo(req, res, next);
        expect(next).toHaveBeenCalledWith(errorMessage);
    });

    it("should return 404 when todo doesn't exist", async () => {
        TodoModel.findByIdAndDelete.mockReturnValue(null);
        await TodoController.deleteTodo(req, res, next);
        expect(res.statusCode).toEqual(404);
        expect(res._isEndCalled()).toBeTruthy();
    });
});

describe("TodoController.updateTodo", () => {
    it("should have an updateTodo function", () => {
        expect(typeof TodoController.updateTodo).toEqual("function");
    });

    it("should update with TodoModel.findByIdAndUpdate", async () => {
        req.params.todoId = todoId;
        req.body = newTodoData;
        await TodoController.updateTodo(req, res, next);
        expect(TodoModel.findByIdAndUpdate).toHaveBeenCalledWith(todoId, newTodoData, {
            new: true,
            useFindAndModify: false,
        });
    });

    it("should retuen JSON data and 200 status code", async () => {
        req.params.todoId = todoId;
        req.body = newTodoData;
        TodoModel.findByIdAndUpdate.mockReturnValue(newTodoData);
        await TodoController.updateTodo(req, res, next);
        expect(res._isEndCalled()).toBeTruthy();
        expect(res.statusCode).toEqual(200);
        expect(res._getJSONData()).toStrictEqual(newTodoData);
    });

    it("should handle errors in updateTodo", async () => {
        req.params.todoId = todoId;
        req.body = newTodoData;
        const errorMessage = { message: "something went wrong" };
        const rejectedPromise = Promise.reject(errorMessage);
        TodoModel.findByIdAndUpdate.mockReturnValue(rejectedPromise);
        await TodoController.updateTodo(req, res, next);
        expect(next).toBeCalledWith(errorMessage);
    });

    it("should return 404 when todo doesn't exist", async () => {
        TodoModel.findByIdAndUpdate.mockReturnValue(null);
        await TodoController.updateTodo(req, res, next);
        expect(res.statusCode).toEqual(404);
        expect(res._isEndCalled()).toBeTruthy();
    });
});

describe("TodoController.getTodoById", () => {
    it("should have a getTodoById", () => {
        expect(typeof TodoController.getTodoById).toEqual("function");
    });

    it("should call TodoModel.findById with route parameters", async () => {
        req.params.todoId = todoId;
        await TodoController.getTodoById(req, res, next);
        expect(TodoModel.findById).toBeCalledWith(todoId);
    });

    it("should return json body and response code 200", async () => {
        TodoModel.findById.mockReturnValue(newTodoData);
        await TodoController.getTodoById(req, res, next);
        expect(res.statusCode).toEqual(200);
        expect(res._isEndCalled()).toBeTruthy();
        expect(res._getJSONData()).toStrictEqual(newTodoData);
    });

    it("should handle errors in getTodoById", async () => {
        const errorMessage = { message: "something went wrong" };
        const rejectedPromise = Promise.reject(errorMessage);
        TodoModel.findById.mockReturnValue(rejectedPromise);
        await TodoController.getTodoById(req, res, next);
        expect(next).toBeCalledWith(errorMessage);
    });

    it("should return 404 when todo doesn't exist", async () => {
        TodoModel.findById.mockReturnValue(null);
        await TodoController.getTodoById(req, res, next);
        expect(res.statusCode).toEqual(404);
        expect(res._isEndCalled()).toBeTruthy();
    });
});

describe("TodoController.getTodos", () => {
    it("should have a getTodos function", () => {
        expect(typeof TodoController.getTodos).toEqual("function");
    });

    it("should call TodoModel.find({})", async () => {
        await TodoController.getTodos(req, res, next);
        expect(TodoModel.find).toHaveBeenCalledWith({});
    });

    it("should return response with status 200 and all todos", async () => {
        TodoModel.find.mockReturnValue(allTodosData);
        await TodoController.getTodos(req, res, next);
        expect(res.statusCode).toEqual(200);
        expect(res._isEndCalled()).toBeTruthy();
        expect(res._getJSONData()).toStrictEqual(allTodosData);
    });

    it("should handle errors in getTodos()", async () => {
        // simulate an error throw by making the find() method throw an error
        // since find() returns a Promise, we can set a rejected promise to create error
        const errorMessage = { message: "something went wrong" };
        const rejectedPromise = Promise.reject(errorMessage);
        TodoModel.find.mockReturnValue(rejectedPromise);
        await TodoController.getTodos(req, res, next);
        expect(next).toBeCalledWith(errorMessage);
    });
});

describe("TodoController.createTodo", () => {
    beforeEach(() => {
        req.body = newTodoData;
    });

    it("should have a createToDo function", () => {
        expect(typeof TodoController.createTodo).toEqual("function");
    });

    it("should call TodoModel.create()", () => {
        TodoController.createTodo(req, res, next);
        expect(TodoModel.create).toBeCalledWith(newTodoData);
    });

    it("should return 201 response code", async () => {
        await TodoController.createTodo(req, res, next);
        expect(res.statusCode).toBe(201);
        expect(res._isEndCalled()).toBeTruthy();
    });

    it("should return JSON body in response", async () => {
        TodoModel.create.mockReturnValue(newTodoData);
        await TodoController.createTodo(req, res, next);
        expect(res._getJSONData()).toStrictEqual(newTodoData);
    });

    it("should handle errors", async () => {
        // simulate an error throw by making the create() method throw an error
        // since create() returns a Promise, we can set a rejected promise to create error
        const errorMessage = { message: "done property missing" };
        const rejectedPromise = Promise.reject(errorMessage);
        TodoModel.create.mockReturnValue(rejectedPromise);
        await TodoController.createTodo(req, res, next);
        expect(next).toBeCalledWith(errorMessage);
    });
});