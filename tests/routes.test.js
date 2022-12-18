const request = require('supertest')
const app = require('../server')
describe('Post Endpoints', () => {
  it('should create a new post', async () => {
    const res = await request(app)
      .post('/register')
      .send({
        "firstName": "Jan",
        "lastName": "Berg",
        "birthDate": "1982-12-15",
        "userId": "639b67b2163deea1d0e13e63",
        "birthdayReminderSettings": [0, 2, 30],
        "otherInfo": "Önskar sig choklad"
    })
    expect(res.statusCode).toEqual(201)
    expect(res.body).toHaveProperty('post')
  })
})