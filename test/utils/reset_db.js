let chai = require('chai')
let chaiHttp = require('chai-http')

chai.use(chaiHttp)
module.exports = function () {
  return chai
    .request('http://localhost:3000')
    .get('/db/reset')
    .end((err, res) => {
      chai.assert(
        res.status === 200,
        `Server status should be 200 value was ${res.status}`,
      )
      chai.assert(
        res.body.done === true,
        `Server should return alive value of true as response to index route value was ${res.body.done}`,
      )
    })
}
