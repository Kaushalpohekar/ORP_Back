const db = require('../db');

function addDevice(req, res) {
	const { device_uid, device_longitute, device_latitude, device_name, company_email } = req.body;
	try {
		const checkDeviceQuery = 'SELECT * FROM ORP_devices WHERE device_uid = ?';
		const insertDeviceQuery = 'INSERT INTO ORP_devices (device_uid, device_longitute, device_latitude, device_name, company_email) VALUES (?,?,?,?,?)';

		db.query(checkDeviceQuery, [device_uid], (error, checkResult) => {
		  if (error) {
		    console.error('Error while checking device:', error);
		    return res.status(500).json({ message: 'Internal server error' });
		  }

		  if (checkResult.length > 0) {
		    return res.status(400).json({ message: 'Device already added' });
		  }

		  db.query(insertDeviceQuery, [device_uid, device_longitute, device_latitude, device_name, company_email], (insertError, insertResult) => {
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
    const updateDeviceQuery = 'UPDATE ORP_devices SET device_longitute = ?, device_latitude = ?, device_name = ?, device_uid = ?, WHERE entry_id = ?';

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
  const { entryId } = req.params.entryId;
  try {
    const deleteDeviceQuery = 'DELETE FROM ORP_devices WHERE entry_id = ?';

    db.query(deleteDeviceQuery, [entryId], (deleteError, deleteResult) => {
      if (deleteError) {
        console.error('Error while deleting device:', deleteError);
        return res.status(500).json({message: 'Internal server error'});
      }
      if (deleteResult === 0) {
        return res.status(404).json({message: 'Device not found'});
      }
      return res.status(200).json({message: 'Device deleted successfully!'});
    });
  } catch (error) {
    console.error('Error in device deletion:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
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
    const fetchDevicesQuery = 'SELECT * FROM ORP_Meter WHERE device_uid = ? AND date_time >= ? AND date_time <= ? order by date_time ASC;';

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
      db.query(fetchDevicesQuery, [device_uid, start_time, end_time], (fetchError, fetchResult) => {
        if (fetchError) {
          console.error('Error while fetching devices:', fetchError);
          return res.status(500).json({ message: 'Internal server error' });
        }

        // Calculate the on-time for pump_1, on-time for pump_2, and combined offline time
        let pump1OnTime = 0;
        let pump2OnTime = 0;
        let combinedOfflineTime = 0;

        let prevPump1State = 0;
        let prevPump2State = 0;
        let prevDateTime = null;

        for (const row of fetchResult) {
          const pump1State = parseInt(row.pump_1);
          const pump2State = parseInt(row.pump_2);
          const dateTime = new Date(row.date_time);

          if (prevDateTime) {
            const timeDifferenceMinutes = (dateTime - prevDateTime) / 60000; // Convert milliseconds to minutes

            if (pump1State === 1) {
              pump1OnTime += timeDifferenceMinutes;
            }

            if (pump2State === 1) {
              pump2OnTime += timeDifferenceMinutes;
            }

            if (pump1State !== 1 && pump2State !== 1) {
              combinedOfflineTime += timeDifferenceMinutes;
            }
          }

          prevPump1State = pump1State;
          prevPump2State = pump2State;
          prevDateTime = dateTime;
        }

        // Calculate the total hours in the given start and end times
        const totalHours = (new Date(end_time) - new Date(start_time)) / 3600000; // Convert milliseconds to hours

        // Calculate the power cut time by subtracting the on-time from total hours
        const powerCutTime = totalHours - (pump1OnTime + pump2OnTime + combinedOfflineTime);

        return res.json({
          pump1OnTime,
          pump2OnTime,
          combinedOfflineTime,
          powerCutTime,
        });
      });
    });
  } catch (error) {
    console.error('Error in device retrieval:', error);
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
      db.query(fetchDevicesQuery, [device_uid, start_time, end_time], (fetchError, fetchResult) => {
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
        duration = 30; // 30 seconds
        break;
      case 'min':
        duration = 60; // 1 minute
        break;
      case 'hour':
        duration = 3600; // 1 hour
        break;
      case 'day':
        duration = 86400; // 24 hours
        break;
      case 'week':
        duration = 604800; // 7 days
        break;
      case 'month':
        duration = 2592000; // 30 days
        break;
      default:
        return res.status(400).json({ message: 'Invalid time interval' });
    }

    const currentTime = new Date();
    const startTime = new Date(currentTime - duration * 1000); // Calculate the start time

    const sql = `SELECT * FROM ORP_Meter WHERE device_uid = ? AND date_time >= ?`;
    db.query(sql, [deviceId, startTime], (error, results) => {
      if (error) {
        console.error('Error fetching data:', error);
        return res.status(500).json({ message: 'Internal server error' });
      }

      let pump1OnTime = 0;
      let pump2OnTime = 0;
      let combinedOfflineTime = 0;

      let prevPump1State = 0;
      let prevPump2State = 0;
      let prevDateTime = null;

      for (const row of results) {
        const pump1State = parseInt(row.pump_1);
        const pump2State = parseInt(row.pump_2);
        const dateTime = new Date(row.date_time);

        if (prevDateTime) {
          const timeDifferenceMinutes = (dateTime - prevDateTime) / 60000; // Convert milliseconds to minutes

          if (prevPump1State === 1) {
            pump1OnTime += timeDifferenceMinutes;
          }

          if (prevPump2State === 1) {
            pump2OnTime += timeDifferenceMinutes;
          }

          if (prevPump1State !== 1 && prevPump2State !== 1) {
            combinedOfflineTime += timeDifferenceMinutes;
          }
        }

        prevPump1State = pump1State;
        prevPump2State = pump2State;
        prevDateTime = dateTime;
      }

      // Calculate the total hours in the given start and end times
      const totalHours = duration / 3600; // Convert seconds to hours

      // Calculate the power cut time by subtracting the on-time from total hours
      const powerCutTime = totalHours - (pump1OnTime + pump2OnTime + combinedOfflineTime);

      return res.json({
        pump1OnTime,
        pump2OnTime,
        combinedOfflineTime,
        powerCutTime,
      });
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

    const sql = `SELECT * FROM ORP_Meter WHERE device_uid = ? AND date_time >= DATE_SUB(NOW(), ${duration})`;
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


function TotalONOFFIntervalByDays(req, res) {
  try {
    const deviceId = req.params.deviceId;
    const timeInterval = req.query.interval;
    if (!timeInterval) {
      return res.status(400).json({ message: 'Invalid time interval' });
    }

    const intervals = {
      'live': '30 SECOND',
      'min': '1 MINUTE',
      'hour': '1 HOUR',
      'day': '24 HOUR',
      'week': '7 DAY',
      'month': '30 DAY',
    };

    if (!intervals[timeInterval]) {
      return res.status(400).json({ message: 'Invalid time interval' });
    }

    const duration = intervals[timeInterval];

    const sql = `
      SELECT *
      FROM ORP_Meter
      WHERE device_uid = ? AND date_time >= NOW() - INTERVAL ${duration} order by date_time ASC
    `;

    db.query(sql, [deviceId], (error, results) => {
      if (error) {
        console.error('Error fetching data:', error);
        return res.status(500).json({ message: 'Internal server error' });
      }

      const dayData = {};

      for (const row of results) {
        const dateTime = new Date(row.date_time);
        const dateKey = dateTime.toISOString().split('T')[0];

        if (!dayData[dateKey]) {
          dayData[dateKey] = {
            pump1OnTime: 0,
            pump2OnTime: 0,
            combinedOfflineTime: 0,
          };
        }

        const pump1State = parseInt(row.pump_1);
        const pump2State = parseInt(row.pump_2);

        const prevRow = results.find(
          (r) => new Date(r.date_time).toISOString().split('T')[0] === dateKey
        );

        if (prevRow) {
          const timeDifferenceMinutes = (dateTime - new Date(prevRow.date_time)) / 60000;

          if (pump1State === 1) {
            dayData[dateKey].pump1OnTime += timeDifferenceMinutes;
          }

          if (pump2State === 1) {
            dayData[dateKey].pump2OnTime += timeDifferenceMinutes;
          }

          if (pump1State !== 1 && pump2State !== 1) {
            dayData[dateKey].combinedOfflineTime += timeDifferenceMinutes;
          }
        }
      }

      const resultData = Object.entries(dayData).map(([date, data]) => ({
        date,
        pump1OnTime: data.pump1OnTime / 60,  // Convert minutes to hours
        pump2OnTime: data.pump2OnTime / 60,  // Convert minutes to hours
        combinedOfflineTime: data.combinedOfflineTime / 60,  // Convert minutes to hours
        powerCutTime: (1440 - (data.pump1OnTime + data.pump2OnTime + data.combinedOfflineTime)) / 60,  // Convert minutes to hours
      }));


      return res.json(resultData);
    });
  } catch (error) {
    console.error('An error occurred:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

function TotalONOFFCustomByDays(req, res) {
  try {
    const {device_uid, start_time, end_time}= req.body;
    const sql = 'SELECT * FROM ORP_Meter WHERE device_uid = ? AND date_time >= ? AND date_time <= ?';

    db.query(sql, [device_uid, start_time, end_time], (error, results) => {
      if (error) {
        console.error('Error fetching data:', error);
        return res.status(500).json({ message: 'Internal server error' });
      }

      const dayData = {};

      for (const row of results) {
        const dateTime = new Date(row.date_time);
        const dateKey = dateTime.toISOString().split('T')[0];

        if (!dayData[dateKey]) {
          dayData[dateKey] = {
            pump1OnTime: 0,
            pump2OnTime: 0,
            combinedOfflineTime: 0,
          };
        }

        const pump1State = parseInt(row.pump_1);
        const pump2State = parseInt(row.pump_2);

        const prevRow = results.find(
          (r) => new Date(r.date_time).toISOString().split('T')[0] === dateKey
        );

        if (prevRow) {
          const timeDifferenceMinutes = (dateTime - new Date(prevRow.date_time)) / 60000;

          if (pump1State === 1) {
            dayData[dateKey].pump1OnTime += timeDifferenceMinutes;
          }

          if (pump2State === 1) {
            dayData[dateKey].pump2OnTime += timeDifferenceMinutes;
          }

          if (pump1State !== 1 && pump2State !== 1) {
            dayData[dateKey].combinedOfflineTime += timeDifferenceMinutes;
          }
        }
      }

      const resultData = Object.entries(dayData).map(([date, data]) => ({
        date,
        pump1OnTime: data.pump1OnTime / 60,
        pump2OnTime: data.pump2OnTime / 60,
        combinedOfflineTime: data.combinedOfflineTime / 60,
        powerCutTime: 1440 - (data.pump1OnTime + data.pump2OnTime + data.combinedOfflineTime) / 60, // Total minutes in a day
      }));

      return res.json(resultData);
    });
  } catch (error) {
    console.error('An error occurred:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
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
  TotalONOFFCustomByDays
}
