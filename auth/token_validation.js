const jwt = require('jsonwebtoken');

function checkToken(req, res, next){
  const {token} = req.get("")
}
module.exports = {
  checkToken,
}