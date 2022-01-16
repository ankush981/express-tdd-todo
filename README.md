Sample TDD project in Node, Express and MongoDB, the goal being to create a very simple ToDo API!

As opposed to an actual production project, there are several shortcomings in this code base:

- Integration tests are tighly coupled. Often the suite depends on some of the tests running in a particular order.
- Using MongoDB is a cop out, as setting up a relational database and migrations, etc., could've become cumbersome. Same goes for transactions, indexes, etc.
- Other services such as Redis, etc., are not integrated in the code base. In a production-level code base, these would exist and would be accounted for.
