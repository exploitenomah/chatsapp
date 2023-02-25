let chai = require('chai')
let chaiHttp = require('chai-http')

chai.use(chaiHttp)

describe('server started', () => {
  it('Server should be alive', (done) => {
    chai
      .request('http://localhost:3000')
      .get('/')
      .end((err, res) => {
        chai.assert(
          res.status === 200,
          `Server status should be 200 value was ${res.status}`,
        )
        chai.assert(
          res.body.alive === true,
          `Server should return alive value of true as response to index route value was ${res.body.alive}`,
        )
      })
    done()
  })
})
