const express = require('express');
const router = express.Router();
const auth = require('./Login/authentication');
const elkem = require('./elkem/elkem');
const dashboard = require('./dashboard/dashboard');
const user = require('./dashboard/user');

router.post('/addUser', auth.registerUser);
router.get('/fetchUserById/:userId',auth.getUserById);
router.get('/fetchAllUsers',auth.getUsers);
router.post('/login', auth.login);
router.get('/user', auth.user);
router.put('/editUser/:userId', auth.editUser);
router.delete('/deleteUser/:userId', auth.deleteUser);

/*----------------------------Dashbooard---------------------**/
router.post('/add-Device', dashboard.addDevice);
router.put('/edit-Device/:entryId', dashboard.editDevice);
router.delete('/delete-Device/:entryId', dashboard.deleteDevice);
router.get('/getDeviceForUsers/:company_email',  dashboard.getDevicesByCompanyEmail);
router.get('/getUsersForUsers/:company_email',  dashboard.getUsersByCompanyEmail);
router.post('/getReportData', dashboard.getReportData);
router.get('/get-Analytics-Data-OnTime-Total', dashboard.getAnalyticsDataOnTimeTotal);
//router.get('/get-Analytics-Data-OnTime-byDay', dashboard.getAnalyticsDataOnTimeTotalByDay);
router.get('/getAnalyicsData/:deviceId', dashboard.getDataByTimeIntervalAnalytics);

//router.get('/data/:deviceId/interval',dashboard.getDataByTimeInterval);

router.put('/updateCompanyDetails',user.updateCompanyDetails);
router.put('/updatePassword',user.updatepassword);
router.put('/updateContactDetails',user.updateContactDetails);


//Elkem data
router.get('/Graph1', elkem.graph1);

module.exports = router;