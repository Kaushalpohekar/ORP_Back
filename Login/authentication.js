const bcrypt = require('bcrypt');
const db = require('../db');
//const jwtUtils = require('../token/jwtUtils');
const jwt = require("jsonwebtoken");

function registerUser(req,res){
  const{userName, password, firstName, lastName, contactNo, userType, companyEmail}=req.body
  const userId = generateUserID();
  const fetchUserName = `SELECT * FROM  ORP_users WHERE UserName = ?`
  const insertUserQuery = `INSERT INTO ORP_users(UserId, UserName, Password, FirstName, LastName, Contact, UserType, CompanyEmail) VALUES(?, ?, ?, ?, ?, ?, ?, ?)`;

  db.query(fetchUserName, [userName], (fetchUsernameError, fetchUsernameResult) =>{ 

    if(fetchUsernameError){
      return res.status(401).json({mwssage: 'Error Checking User Name'})
    }
    if(fetchUsernameResult >0){
      return res.status(401).json({message : 'User Already Exists'});
    }
    bcrypt.hash(password, 10, (error, hashedPassword) =>{
      if(error){
        return res.status(401).json({message : 'Error During Hashing Password'});
      }
      db.query(insertUserQuery,[userId, userName, hashedPassword, firstName, lastName, contactNo, userType, companyEmail],(insertUserError, insertUserResult) =>{
        if(insertUserError){
          console.log(insertUserError);
          return res.status(401).json({message : 'Error during Inserting User'});
        }
        return res.status(200).json({message : 'User Added Successfully'});
      });
    });
  });
}

function getUserById(req, res){
  const userId = req.params.userId;
  const getUserByUserIdQuery = `SELECT * FROM ORP_users WHERE UserId = ?`;

  db.query(getUserByUserIdQuery, [userId], (fetchUserIdError, fetchUserIdResult) =>{
    if(fetchUserIdError){
      return res.status(401).json({message :'Error while fetchig user'});
    }
    res.json({getUserById : fetchUserIdResult});
  })
}

function getUsers(req, res){
  
  const fetchUserId =`SELECT * FROM ORP_users WHERE UserName = ?`;
  const getUserByUserQuery = `SELECT * FROM ORP_users`;

  db.query(getUserByUserQuery, (fetchUserIdError, fetchUserIdResult) =>{
    if(fetchUserIdError){
      return res.status(401).json({message :'Error while fetchig user'});
    }
    res.json({getUserById : fetchUserIdResult});
  })
}


function login(req, res){
  const {userName, password} = req.body;
  const checkUserNameQuery = `SELECT * FROM ORP_users where UserName = ?`;

  db.query(checkUserNameQuery, [userName], (checkUserNameError, checkUserNameResult) =>{
    if(checkUserNameError){
      return res.status(401).json({message : 'Error While Checking UserName'});
    }
    if(checkUserNameResult.length === 0){
      return res.status(401).json({message : 'Username Not Found'});
    }

    user = checkUserNameResult[0];
    bcrypt.compare(password, user.Password, (passowrodCheckError, passwordCheckResult) =>{
      if(passowrodCheckError){
        console.log(passowrodCheckError);
        return res.status(401).json({message : 'Error During Password Comparision'});
      }
      if(!passwordCheckResult){
        return res.status(401).json({message : 'Invalid Credentials'});
      }
      const jwToken = jwt.sign({userName : user.UserName}, process.env.JWT_SECRET_KEY);
      return res.status(200).json({
        message : 'Login Successful',
        token : jwToken,
      });
    });
  });
}

function user(req, res){
  const token = req.headers.authorization.split(' ')[1];
  
  const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);

  if (!decodedToken){
    return res.status(401).json({message : 'Invalid token'});
  }

  const getUserDetailsQuery = `SELECT * FROM ORP_users WHERE UserName = ?`
  db.query(getUserDetailsQuery, [decodedToken.userName], (fetchUserError, fetchUsernameResult) =>{
    if(fetchUserError){
      return res.status(401).json({message : 'error while fetcing userdetails'});
    }
    if(fetchUsernameResult.length === 0){
      return res.status(404).json({message : 'No user Found'});
    }
    res.json({user : fetchUsernameResult});
  });

}

function editUser(req , res){
  const userId = req.params.userId
  const {
    userName,
    contact,
    firstName,
    lastName,
    companyEmail,
    userType,
  } = req.body

  const editUserQuery = `UPDATE ORP_users SET UserName = ?, FirstName = ?, LastName = ?, CompanyEmail = ?, Contact = ? , UserType = ? WHERE UserId = ?`;

    if(hashError){
      return res.status(401).json({message : 'error while hasshing password',
      error : hashError});
    }
    db.query(editUserQuery, [
      userName,
      firstName,
      lastName,
      companyEmail,
      contact,
      userType,
      userId
  ] ,(updateError, updateResult)=> {
        if(updateError){
          return res.status(401).json({message : 'Error While Updating User'});
        }
        return res.status(200).json({message : 'User Updated Successfully'});
      });
}

function deleteUser(req, res){
  const userId = req.params.userId;
  const deleteUserQuery = `DELETE FROM ORP_users WHERE UserId = ?`;

  db.query(deleteUserQuery, [userId], (deleteError, deleteResult) => {
    if(deleteError){
      return res.status(401).json({message : 'Error While Deleting User'});
    }
    if(deleteResult.affectedR === 0){
      return res.status(404).json({message : 'User Not Found'});
    }
    return res.status(200).json({message : 'User Deleted Successfully'});
  });

  
}

function generateUserID() {
  const userIdLength = 10;
  let userId = '';

  const characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

  for (let i = 0; i < userIdLength; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    userId += characters.charAt(randomIndex);
  }

  return userId;
}
module.exports = { 
  registerUser,
  getUserById,
  getUsers,
  login,
  user,
  editUser,
  deleteUser,
}