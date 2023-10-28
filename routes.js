const express = require('express');
const router = express.Router();
const auth = require('./Login/authentication');

router.post('/addUser', auth.registerUser);
router.get('/fetchUserById/:userId',auth.getUserById);
router.get('/fetchAllUsers',auth.getUsers);
router.post('/login', auth.login);

module.exports = router;