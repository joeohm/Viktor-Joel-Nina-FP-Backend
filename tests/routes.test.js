const request = require("supertest");
const app = require("../server");

describe("Test Endpoints", () => {
  let accessToken, id, birthdayId;
  it("should create a new user", async () => {
    const res = await request(app).post("/register").send({
      username: "testy@mctestersson.com",
      password: "testymctestersson",
    });

    ({ accessToken, id } = res.body.response);
    expect(res.status).toEqual(201);
    expect(res.body.success).toEqual(true);
  });

  it("should login the test user", async () => {
    const res = await request(app).post("/login").send({
      username: "testy@mctestersson.com",
      password: "testymctestersson",
    });

    expect(res.status).toEqual(200);
    expect(res.body.success).toEqual(true);
  });

  it("should change the test user's password", async () => {
    const res = await request(app)
      .patch("/change-password")
      .send({
        id,
        password: "testysnewpassword",
      })
      .set("Authorization", accessToken);

    expect(res.status).toEqual(200);
    expect(res.body.success).toEqual(true);
  });

  it("should post a new birthday reminder for the test user", async () => {
    const res = await request(app)
      .post("/birthday")
      .send({
        firstName: "Mrs. Testy",
        lastName: "McTestersson",
        birthDate: "1995-01-04",
        userId: id,
        birthdayReminderSettings: [0, 2, 7, 30],
        otherInfo: "Chocolate",
      })
      .set("Authorization", accessToken);

    birthdayId = res.body.response._id;

    expect(res.status).toEqual(201);
    expect(res.body.success).toEqual(true);
    expect(res.body.response.userId).toEqual(id);
  });

  it("should change a birthday reminder for the test user", async () => {
    const res = await request(app)
      .patch("/birthday")
      .send({
        firstName: "Mrs. Testy",
        lastName: "McTestersson",
        birthDate: "1995-01-04",
        id: birthdayId,
        birthdayReminderSettings: [0, 7],
        otherInfo: "Chocolate mousse with dark chocolate shavings",
      })
      .set("Authorization", accessToken);

    expect(res.status).toEqual(200);
    expect(res.body._id).toEqual(birthdayId);
  });

  it("should get info about a particular birthday reminder for the test user", async () => {
    const res = await request(app)
      .get("/birthday")
      .send({ id: birthdayId })
      .set("Authorization", accessToken);

    expect(res.status).toEqual(200);
    expect(res.body._id).toEqual(birthdayId);
  });

  it("should get info about all birthday reminders for the test user", async () => {
    const res = await request(app)
      .get("/all-birthdays")
      .send({ userId: id })
      .set("Authorization", accessToken);

    expect(res.status).toEqual(200);
    expect(Array.isArray(res.body)).toEqual(true);
  });

  it("should delete a specific birthday reminder for the test user", async () => {
    const res = await request(app)
      .delete("/birthday")
      .send({ id: birthdayId })
      .set("Authorization", accessToken);

    expect(res.status).toEqual(200);
    expect(res.body._id).toEqual(birthdayId);
  });

  it("should delete the test user", async () => {
    const res = await request(app)
      .delete("/user")
      .send({ id })
      .set("Authorization", accessToken);

    expect(res.status).toEqual(200);
    expect(res.body._id.toString()).toEqual(id);
  });
});
