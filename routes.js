const express = require('express');
const router = express.Router();
const auth = require('./Login/authentication');
const elkem = require('./elkem/elkem');
const dashboard = require('./dashboard/dashboard');


router.post('/addUser', auth.registerUser);
router.get('/fetchUserById/:userId',auth.getUserById);
router.get('/fetchAllUsers',auth.getUsers);
router.post('/login', auth.login);
router.get('/user', auth.user);

/*----------------------------Dashbooard---------------------**/
router.post('/add-Device', dashboard.addDevice);
router.put('/edit-Device', dashboard.editDevice);
router.post('/delete-Device', dashboard.deleteDevice);
router.get('/getDeviceForUsers',  dashboard.getDevicesByCompanyEmail);

//Elkem data
router.get('/Graph1', elkem.graph1);

module.exports = router;