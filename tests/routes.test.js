const request = require('supertest')
const app = require('../server')
describe('Test Endpoints', () => {
  it('should create a new user', async () => {
    const res = await request(app)
      .post('/register')
      .send({
        "username": "testy.mc@testersson.com",
        "password": "testymctestersson"
    })
    expect(res.status).toEqual(201)
    expect(res.body.success).toEqual(true)
    
  })
/*
  it('should delete the test user', async () => {
    const res = await request(app)
      .delete('/user')
      .send({
        "id": userId
    })
    console.log(res.body)
    expect(res.status).toEqual(200)
    expect(true).toEqual(true)
  })
 */
})