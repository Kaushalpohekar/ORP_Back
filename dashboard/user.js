const db = require('../db');
const bcrypt = require('bcrypt');

function updateCompanyDetails(req, res){
  const userId = req.params.userId;
  const {firstName, lastName} = req.body;
  const fetchUserIdQuery = `SELECT * FROM ORP_users WHERE UserId = ?`;
  const updateCompanyDetailsQuery = `UPDATE ORP_users SET FirstName = ?, LastName = ? WHERE UserId = ?`;

  db.query(fetchUserIdQuery, [userId], (fetchUserIdError, fetchUserIdResult) => {
    if(fetchUserIdError){
      return res.status(401).json({message : 'error while fetcing userId'})
    }
    if(fetchUserIdResult.length === 0){
      return res.status(404).json({message : 'user not found'});
    }
    db.query(updateCompanyDetailsQuery, [firstName, lastName, userId], (updateError, updateResult) =>{
      if(updateError){
        return res.status(401).json({message : 'Error While updating '});
      }
      return res.status(200).json({message : 'first name and last name updated successfully'})
    });
  });
}

function updatepassword(req, res){
  const userId = req.params.userId;
  const {password} = req.body;
  const fetchUserIdQuery = `SELECT * FROM ORP_users WHERE UserId = ?`;
  const updateCompanyDetailsQuery = `UPDATE ORP_users SET Password = ? WHERE UserId = ?`;

  db.query(fetchUserIdQuery, [userId], (fetchUserIdError, fetchUserIdResult) => {
    if(fetchUserIdError){
      return res.status(401).json({message : 'error while fetcing userId'})
    }
    if(fetchUserIdResult.length === 0){
      return res.status(404).json({message : 'user not found'});
    }
    bcrypt.hash(password, 10, (hashError, hashedPassword) => {
      if(hashError){
        return res.status(401).json({message : 'error during password hashing'});
      }
      db.query(updateCompanyDetailsQuery, [hashedPassword, userId], (updateError, updateResult) =>{
        if(updateError){
          return res.status(401).json({message : 'Error While updating '});
        }
        return res.status(200).json({message : 'password updated successfully'})
      });
    });
  });
}

function updateContactDetails(req, res){
  const userId = req.params.userId;
  const {contact, location} = req.body;
  const fetchUserIdQuery = `SELECT * FROM ORP_users WHERE UserId = ?`;
  const updateCompanyDetailsQuery = `UPDATE ORP_users SET Contact = ?, Location = ? WHERE UserId = ?`;

  db.query(fetchUserIdQuery, [userId], (fetchUserIdError, fetchUserIdResult) => {
    if(fetchUserIdError){
      return res.status(401).json({message : 'error while fetcing userId'})
    }
    if(fetchUserIdResult.length === 0){
      return res.status(404).json({message : 'user not found'});
    }
    db.query(updateCompanyDetailsQuery, [contact, location, userId], (updateError, updateResult) =>{
      if(updateError){
        return res.status(401).json({message : 'Error While updating '});
      }
      return res.status(200).json({message : 'first name and last name updated successfully'})
    });
  });
}

module.exports = {
  updateCompanyDetails,
  updatepassword,
  updateContactDetails
}