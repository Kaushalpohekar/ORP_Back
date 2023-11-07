const db = require('../db');
const bcrypt = require('bcrypt');

function updateCompanyDetails(req, res){
  const userId = req.params.userId;
  const {firstName, lastName} = req.body;
  const fetchUserIdQuery = `SELECT * FROM ORP_users WHERE UserId = ?`;
  const updateCompanyDetailsQuery = `INSERT INTO ORP_users(FirstName, LastName) VALUES (?, ?)`;

  db.query(fetchUserIdQuery, [userId], (fetchUserIdError, fetchUserIdResult) => {
    if(fetchUserIdError){
      return res.status(401).json({message : 'error while fetcing userId'})
    }
    db.query(updateCompanyDetailsQuery, [firstName, lastName], (updateError, updateResult) =>{
      if(updateError){
        return res.status(401).json({message : 'Error While updating '});
      }
    });
  });
}

module.exports = {
  updateCompanyDetails,

}