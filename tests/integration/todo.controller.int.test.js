const request = require("supertest");
const app = require("../../app");
const newTodoData = require("../mock-data/new-todo.json");

const endpointUrl = "/todos/";
let firstTodo, newTodoId;
let nonExistingTodoId = "61d8a2336f554f11bed65322";

const testData = { title: "Make integration test for PUT", done: true };

describe(endpointUrl, () => {
    // "test" is an alias of "it"
    test("GET " + endpointUrl, async () => {
        const response = await request(app).get(endpointUrl);
        expect(response.statusCode).toEqual(200);
        expect(Array.isArray(response.body)).toBeTruthy();
        expect(response.body[0].title).toBeDefined();
        firstTodo = response.body[0];
    });

    test("GET by Id" + endpointUrl + ":todoId", async () => {
        const response = await request(app).get(endpointUrl + firstTodo._id);
        expect(response.statusCode).toEqual(200);
        expect(response.body.title).toEqual(firstTodo.title);
        expect(response.body.done).toEqual(firstTodo.done);
    });

    test("GET by Id doesn't exist", async () => {
        const response = await request(app).get(endpointUrl + nonExistingTodoId);
        expect(response.statusCode).toEqual(404);
    });

    it("POST" + endpointUrl, async () => {
        const response = await request(app)
            .post(endpointUrl)
            .send(newTodoData);

        expect(response.statusCode).toEqual(201);
        expect(response.body.title).toEqual(newTodoData.title);
        expect(response.body.done).toEqual(newTodoData.done);
        newTodoId = response.body._id; // reference for other tests
    });

    it("should return 500 on malformed data with POST" + endpointUrl, async () => {
        const response = await request(app)
            .post(endpointUrl)
            .send({ title: "Missing done property" });

        expect(response.statusCode).toEqual(500);
        expect(response.body).toStrictEqual({
            message: "Todo validation failed: done: Path `done` is required."
        });
    });

    test("PUT" + endpointUrl, async () => {
        const res = await request(app).put(endpointUrl + newTodoId).send(testData);
        expect(res.statusCode).toEqual(200);
        expect(res.body.title).toEqual(testData.title);
        expect(res.body.done).toEqual(testData.done);
    });

    test("HTTP DELETE", async () => {
        const res = await request(app).delete(endpointUrl + newTodoId).send();
        expect(res.statusCode).toEqual(200);
        expect(res.body.title).toEqual(testData.title); // because in the PUT test, the todo has been overwrriten with testData's data
        expect(res.body.done).toEqual(testData.done);
    });

    test("HTTP DELETE 404", async () => {
        const res = await request(app).delete(endpointUrl + nonExistingTodoId).send();
        expect(res.statusCode).toEqual(404);
    });
});