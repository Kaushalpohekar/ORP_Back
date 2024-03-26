const db = require('../db');

function addDevice(req, res) {
	const { device_uid, device_longitute, device_latitude, device_name, company_email, location } = req.body;
	try {
		const checkDeviceQuery = 'SELECT * FROM ORP_devices WHERE device_uid = ?';
		const insertDeviceQuery = 'INSERT INTO ORP_devices (device_uid, device_longitute, device_latitude, device_name, company_email, location) VALUES (?,?,?,?,?,?)';

		db.query(checkDeviceQuery, [device_uid], (error, checkResult) => {
		  if (error) {
		    console.error('Error while checking device:', error);
		    return res.status(500).json({ message: 'Internal server error' });
		  }

		  if (checkResult.length > 0) {
		    return res.status(400).json({ message: 'Device already added' });
		  }

		  db.query(insertDeviceQuery, [device_uid, device_longitute, device_latitude, device_name, company_email, location], (insertError, insertResult) => {
		    if (insertError) {
		      console.error('Error while inserting device:', insertError);
		      return res.status(500).json({ message: 'Internal server error' });
		    }

		    return res.json({ message: 'Device added successfully!' });
		  });
	});
	} catch (error) {
		console.error('Error in device check:', error);
		res.status(500).json({ message: 'Internal server error' });
	}	
}

function editDevice(req, res) {
  const entryId = req.params.entryId
  const { device_uid ,device_longitute, device_latitude, device_name, company_email } = req.body;
  try {
    const updateDeviceQuery = 'UPDATE ORP_devices SET device_longitute = ?, device_latitude = ?, device_name = ?, device_uid = ? WHERE entry_id = ?';

    db.query(updateDeviceQuery, [device_longitute, device_latitude, device_name, device_uid, entryId], (updateError, updateResult) => {
      if (updateError) {
        console.error('Error while updating device:', updateError);
        return res.status(500).json({ message: 'Internal server error' });
      }

      if (updateResult.affectedRows === 0) {
        return res.status(404).json({ message: 'Device not found' });
      }

      return res.json({ message: 'Device updated successfully!' });
    });
  } catch (error) {
    console.error('Error in device update:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

function deleteDevice(req, res) {
  const device_uid = req.params.device_uid;

  const deleteDeviceQuery = 'DELETE FROM ORP_devices WHERE device_uid = ?';

  db.query(deleteDeviceQuery, [device_uid], (deleteError, deleteResult) => {
    if (deleteError) {
      console.error('Error while deleting device:', deleteError);
      return res.status(500).json({ message: 'Internal server error' });
    }
    return res.status(200).json({ message: 'Device deleted successfully!' });
  });
}


function getDevicesByCompanyEmail(req, res) {
  const { company_email } = req.params;
  try {
    const fetchDevicesQuery = 'SELECT * FROM ORP_devices WHERE company_email = ?';

    db.query(fetchDevicesQuery, [company_email], (fetchError, fetchResult) => {
      if (fetchError) {
        console.error('Error while fetching devices:', fetchError);
        return res.status(500).json({ message: 'Internal server error' });
      }

      return res.json({ devices: fetchResult });
    });
  } catch (error) {
    console.error('Error in device retrieval:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

function getReportData(req, res) {
  const { device_uid, start_time, end_time } = req.body;
  try {
    const checkDeviceListQuery = 'SELECT * FROM ORP_devices WHERE device_uid = ? LIMIT 1;';
    //const fetchDevicesQuery = 'SELECT * FROM ORP_Meter WHERE device_uid = ? AND date_time >= ? AND date_time <= ? order by date_time DESC;';
    const fetchDevicesQuery = 'SELECT * FROM ORP_Meter WHERE device_uid = ? AND date_time >= ? AND date_time <= ? AND (Pump_1 = 1 OR Pump_2 = 1 )  ORDER BY date_time DESC;';

    // First, check if the device exists in the ORP_devices table
    db.query(checkDeviceListQuery, [device_uid], (checkError, checkResult) => {
      if (checkError) {
        console.error('Error while checking device:', checkError);
        return res.status(500).json({ message: 'Internal server error' });
      }

      if (checkResult.length === 0) {
        return res.status(404).json({ message: 'Device not found in device_list' });
      }

      // If the device exists in the device_list, proceed to fetch devices from ORP_Meter
      db.query(fetchDevicesQuery, [device_uid, start_time, end_time], (fetchError, fetchResult) => {
        if (fetchError) {
          console.error('Error while fetching devices:', fetchError);
          return res.status(500).json({ message: 'Internal server error' });
        }

        return res.json({ data: fetchResult });
      });
    });
  } catch (error) {
    console.error('Error in device retrieval:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

function getAnalyticsDataOnTimeTotalPieCharts(req, res) {
  try {
    const deviceId = req.params.deviceId;
    const startDate = req.body.start;
    const endDate = req.body.end;

    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Invalid parameters' });
    }

    const sql = `SELECT status, COUNT(*) as count FROM ORP_Meter_Logs WHERE device_uid = ? AND date_time >= ? AND date_time <= ? GROUP BY status`;
    db.query(sql, [deviceId, startDate + 'T00:00:00.000Z', endDate + 'T23:59:59.999Z'], (error, results) => {
      if (error) {
        console.error('Error fetching data:', error);
        return res.status(500).json({ message: 'Internal server error' });
      }

      // Calculate total count
      const totalCount = results.reduce((total, entry) => total + entry.count, 0);

      // Calculate percentage for each status
      const dataWithPercentage = results.map((entry) => ({
        status: entry.status,
        count: entry.count,
        percentage: (entry.count / totalCount) * 100
      }));

      res.json({ dataStatus: dataWithPercentage });
    });
  } catch (error) {
    console.error('An error occurred:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

function getAnalyticsDataOnTimeTotalLineCharts(req, res) {
  const { device_uid, start_time, end_time } = req.body;
  try {
    const checkDeviceListQuery = 'SELECT * FROM ORP_devices WHERE device_uid = ? LIMIT 1;';
    const fetchDevicesQuery = 'SELECT * FROM ORP_Meter WHERE device_uid = ? AND date_time >= ? AND date_time <= ?;';

    // First, check if the device exists in the ORP_devices table
    db.query(checkDeviceListQuery, [device_uid], (checkError, checkResult) => {
      if (checkError) {
        console.error('Error while checking device:', checkError);
        return res.status(500).json({ message: 'Internal server error' });
      }

      if (checkResult.length === 0) {
        return res.status(404).json({ message: 'Device not found in device_list' });
      }

      // If the device exists in the device_list, proceed to fetch devices from ORP_Meter
      db.query(fetchDevicesQuery, [device_uid, start_time + 'T00:00:00.000Z', end_time + 'T23:59:59.999Z'], (fetchError, fetchResult) => {
        if (fetchError) {
          console.error('Error while fetching devices:', fetchError);
          return res.status(500).json({ message: 'Internal server error' });
        }

        res.json({data:fetchResult});
      });
    });
  } catch (error) {
    console.error('Error in device retrieval:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

function getUsersByCompanyEmail(req, res) {
  const { company_email } = req.params;
  try {
    const fetchUsersQuery = 'SELECT * FROM ORP_users WHERE CompanyEmail = ?';

    db.query(fetchUsersQuery, [company_email], (fetchError, fetchResult) => {
      if (fetchError) {
        console.error('Error while fetching devices:', fetchError);
        return res.status(500).json({ message: 'Internal server error' });
      }

      return res.json({ users: fetchResult });
    });
  } catch (error) {
    console.error('Error in device retrieval:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

function getDataByTimeIntervalAnalyticsPieChart(req, res) {
  try {
    const deviceId = req.params.deviceId;
    const timeInterval = req.query.interval;
    if (!timeInterval) {
      return res.status(400).json({ message: 'Invalid time interval' });
    }

    let duration;
    switch (timeInterval) {
      case 'Live':
        duration = 'INTERVAL 30 SECOND'; // 30 seconds
        break;
      case 'min':
        duration = 'INTERVAL 1 MINUTE'; // 1 minute
        break;
      case 'hour':
        duration = 'INTERVAL 1 HOUR' // 1 hour
        break;
      case 'day':
        duration = 'INTERVAL 1 DAY'; // 24 hours
        break;
      case 'week':
        duration = 'INTERVAL 7 DAY'; // 7 days
        break;
      case 'month':
        duration = 'INTERVAL 30 DAY'; // 30 days
        break;
      default:
        return res.status(400).json({ message: 'Invalid time interval' });
    }

    const sql = `SELECT status, COUNT(*) as count FROM ORP_Meter_Logs WHERE device_uid = ? AND date_time >= DATE_SUB(NOW(), ${duration}) GROUP BY status`;
    db.query(sql, [deviceId], (error, results) => {
      if (error) {
        console.error('Error fetching data:', error);
        return res.status(500).json({ message: 'Internal server error' });
      }

      try {
        // Calculate total count
        const totalCount = results.reduce((total, entry) => total + entry.count, 0);

        // Calculate percentage for each status
        const dataWithPercentage = results.map((entry) => ({
          status: entry.status,
          count: entry.count,
          percentage: (entry.count / totalCount) * 100
        }));

        res.json({ dataStatus: dataWithPercentage });
      } catch (error) {
        console.error('An error occurred:', error);
        res.status(500).json({ message: 'Internal server error' });
      }
    });

  } catch (error) {
    console.error('An error occurred:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

function getDataByTimeIntervalAnalyticsLineChart(req, res) {
  try {
    const deviceId = req.params.deviceId;
    const timeInterval = req.query.interval;
    if (!timeInterval) {
      return res.status(400).json({ message: 'Invalid time interval' });
    }

    let duration;
    switch (timeInterval) {
      case 'Live':
        duration = 'INTERVAL 30 SECOND';
        break;
      case 'min':
        duration = 'INTERVAL 1 MINUTE';
        break;
      case 'hour':
        duration = 'INTERVAL 1 HOUR';
        break;
      case 'day':
        duration = 'INTERVAL 24 HOUR';
        break;
      case 'week':
        duration = 'INTERVAL 7 DAY';
        break;
      case 'month':
        duration = 'INTERVAL 30 DAY';
        break;
      default:
        return res.status(400).json({ message: 'Invalid time interval' });
    }

    const sql = `
      SELECT * FROM ORP_Meter 
      WHERE device_uid = ? 
      AND date_time >= DATE_SUB(NOW(), ${duration});
    `;
    db.query(sql, [deviceId], (error, results) => {
      if (error) {
        console.error('Error fetching data:', error);
        return res.status(500).json({ message: 'Internal server error' });
      }

      res.json({data: results});
    });
  } catch (error) {
    console.error('An error occurred:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}


function TotalONOFFCustomByDays(req, res) {
  try {
    const deviceId = req.params.deviceId;
    const startDate = req.query.start;
    const endDate = req.query.end;

    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Invalid parameters' });
    }

    const sql = `SELECT DATE(date_time) as date, status, COUNT(*) as count FROM ORP_Meter_Logs WHERE device_uid = ? AND date_time >= ? AND date_time <= ? GROUP BY date, status`;
    db.query(sql, [deviceId, startDate + 'T00:00:00.000Z', endDate + 'T23:59:59.999Z'], (error, results) => {
      if (error) {
        console.error('Error fetching data:', error);
        return res.status(500).json({ message: 'Internal server error' });
      }

      console.log(results);

      // Organize data into a nested structure (date -> status -> count)
      const dataByDate = results.reduce((accumulator, entry) => {
        const date = entry.date.toISOString(); // Extract YYYY-MM-DD from the timestamp
        accumulator[date] = accumulator[date] || [];
        accumulator[date].push({ status: entry.status, count: entry.count });
        return accumulator;
      }, {});

      // Calculate total count and percentage for each date
      const dataWithPercentage = Object.keys(dataByDate).map(date => {
        const totalCount = dataByDate[date].reduce((total, entry) => total + entry.count, 0);
        const statusPercentage = dataByDate[date].map(entry => ({
          status: entry.status,
          count: entry.count,
          percentage: (entry.count / totalCount) * 100
        }));
        return { date, dataStatus: statusPercentage };
      });

      res.json({ dataByDate: dataWithPercentage });
    });
  } catch (error) {
    console.error('An error occurred:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

function TotalONOFFIntervalByDays(req, res) {
  try {
    const deviceId = req.params.deviceId;
    const timeInterval = req.query.interval;
    if (!timeInterval) {
      return res.status(400).json({ message: 'Invalid time interval' });
    }

    let duration;
    switch (timeInterval) {
      case 'Live':
        duration = 'INTERVAL 1 DAY'; // 30 seconds
        break;
      case 'min':
        duration = 'INTERVAL 1 DAY'; // 1 minute
        break;
      case 'hour':
        duration = 'INTERVAL 1 DAY' // 1 hour
        break;
      case 'day':
        duration = 'INTERVAL 1 DAY'; // 24 hours
        break;
      case 'week':
        duration = 'INTERVAL 7 DAY'; // 7 days
        break;
      case 'month':
        duration = 'INTERVAL 30 DAY'; // 30 days
        break;
      default:
        return res.status(400).json({ message: 'Invalid time interval' });
    }

    const sql = `SELECT DATE(date_time) as date, status, COUNT(*) as count FROM ORP_Meter_Logs WHERE device_uid = ? AND date_time >= DATE_SUB(NOW(), ${duration}) GROUP BY date, status`;
    db.query(sql, [deviceId], (error, results) => {
      if (error) {
        console.error('Error fetching data:', error);
        return res.status(500).json({ message: 'Internal server error' });
      }

      try {
        // Organize data into a nested structure (date -> status -> count)
        const dataByDate = results.reduce((accumulator, entry) => {
          const date = entry.date.toISOString(); // Extract YYYY-MM-DD from the timestamp
          accumulator[date] = accumulator[date] || [];
          accumulator[date].push({ status: entry.status, count: entry.count });
          return accumulator;
        }, {});

        // Calculate total count and percentage for each date
        const dataWithPercentage = Object.keys(dataByDate).map(date => {
          const totalCount = dataByDate[date].reduce((total, entry) => total + entry.count, 0);
          const statusPercentage = dataByDate[date].map(entry => ({
            status: entry.status,
            count: entry.count,
            percentage: (entry.count / totalCount) * 100
          }));
          return { date, dataStatus: statusPercentage };
        });

        res.json({ dataByDate: dataWithPercentage });
      } catch (error) {
        console.error('An error occurred:', error);
        res.status(500).json({ message: 'Internal server error' });
      }
    });

  } catch (error) {
    console.error('An error occurred:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

function fetchLatestEntry(req, res) {
  const { companyEmail } = req.params;
  const fetchUserDevicesQuery = `SELECT * FROM ORP_devices WHERE company_email = ?`;
  const fetchLatestEntryQuery = `SELECT * FROM ORP_Meter WHERE device_uid = ? ORDER BY date_time DESC LIMIT 1`;
  const defaultEntry = {
    id: 0,
    device_uid: null,
    date_time: new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    orp: null,
    pump_1: 0,
    pump_2: 0
  };

  db.query(fetchUserDevicesQuery, [companyEmail], (fetchUserDevicesError, devices) => {
    if (fetchUserDevicesError) {
      return res.status(401).json({ message: 'Error while fetching devices' });
    }

    if (devices.length === 0) {
      return res.status(404).json({ message: 'No devices found for the user' });
    }

    const promises = devices.map(device => {
      return new Promise((resolve, reject) => {
        const deviceId = device.device_uid;
        db.query(fetchLatestEntryQuery, [deviceId], (fetchLatestEntryError, fetchLatestEntryResult) => {
          if (fetchLatestEntryError) {
            reject({ [deviceId]: { entry: [defaultEntry] } });
          } else {
            const deviceEntry = fetchLatestEntryResult.length === 0 ? [defaultEntry] : fetchLatestEntryResult;
            resolve({ [deviceId]: { entry: deviceEntry } });
          }
        });
      });
    });

    Promise.all(promises)
      .then(results => {
        res.json({ latestEntry: results });
      })
      .catch(error => {
        res.status(500).json({ message: 'Error while fetching data for some devices', error });
      });
  });
}

module.exports = {
	addDevice,
	editDevice,
	deleteDevice,
	getDevicesByCompanyEmail,
	getReportData,
  getAnalyticsDataOnTimeTotalPieCharts,
  getAnalyticsDataOnTimeTotalLineCharts,
  getUsersByCompanyEmail,
  getDataByTimeIntervalAnalyticsPieChart,
  getDataByTimeIntervalAnalyticsLineChart,
  TotalONOFFIntervalByDays,
  TotalONOFFCustomByDays,
  fetchLatestEntry
}
