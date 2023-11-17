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
router.delete('/delete-Device/:device_uid', dashboard.deleteDevice);
router.get('/getDeviceForUsers/:company_email',  dashboard.getDevicesByCompanyEmail);
router.get('/getUsersForUsers/:company_email',  dashboard.getUsersByCompanyEmail);
router.post('/getReportData', dashboard.getReportData);
router.post('/get-Analytics-Data-OnTime-Total-customs', dashboard.getAnalyticsDataOnTimeTotalPieCharts);
router.get('/get-Analytics-Data-OnTime-Total-interval/:deviceId', dashboard.getDataByTimeIntervalAnalyticsPieChart);
router.put('/updateCompanyDetails',user.updateCompanyDetails);
router.put('/updatePassword',user.updatepassword);
router.put('/updateContactDetails',user.updateContactDetails);
router.post('/get-Analytics-Data-Line-Total-customs', dashboard.getAnalyticsDataOnTimeTotalLineCharts);
router.get('/get-Analytics-Data-Line-Total-interval/:deviceId', dashboard.getDataByTimeIntervalAnalyticsLineChart);
router.get('/get-Analytics-Data-Bar-Total-interval/:deviceId', dashboard.TotalONOFFIntervalByDays);
router.get('/get-Analytics-Data-Bar-Total-Custom', dashboard.TotalONOFFCustomByDays)

//Elkem data
router.get('/Graph1', elkem.graph1);

module.exports = router;