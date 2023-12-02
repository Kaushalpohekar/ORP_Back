const db = require('./db');

function monitorDevice() {
  const selectTriggerQuery = 'SELECT * from ORP_devices';

  db.query(selectTriggerQuery, (error, deviceResults) => {
    if (error) {
      console.error('Error executing the select query: ', error);
      return;
    }

    const deviceData = deviceResults.map((device) => ({
      device_uid: device.device_uid,
    }));

    const deviceUIDs = deviceData.map((device) => device.device_uid);

    const selectLatestDataQuery = `
      SELECT *
      FROM ORP_Meter
      WHERE (device_uid, date_time) IN (
        SELECT device_uid, MAX(date_time) AS MaxDateTime
        FROM ORP_Meter
        WHERE device_uid IN (${deviceUIDs.map(() => '?').join(', ')})
        GROUP BY device_uid
      )`;

    db.query(selectLatestDataQuery, deviceUIDs, (error, latestDataResults) => {
      if (error) {
        console.error('Error executing the latest data select query: ', error);
        return;
      }

      const insertLogQuery = 'INSERT INTO ORP_Meter_Logs (device_uid, date_time, orp,  pump_1, pump_2, status) VALUES ?';
      const insertLogValues = [];
      const currentTimestamp = new Date().toISOString();

      deviceData.forEach((device) => {
        const latestData = latestDataResults.find((data) => data.device_uid === device.device_uid);

        if (latestData) {
          const { device_uid, date_time, orp,  pump_1, pump_2 } = latestData;
          const latestDateTime = new Date(date_time);
          
          const timeDifference = new Date() - latestDateTime;
          
          const isDeviceOnline = timeDifference <= 5 * 60 * 1000;
          let status = ''; // Define the status variable within the loop

          if (isDeviceOnline) {
            if (pump_1 === 0) {
              insertLogValues.push([device_uid, currentTimestamp, orp, pump_1, pump_2, 'pump1ON']);
              status = 'pump1ON';
            } else if( pump_2 === 0){
              insertLogValues.push([device_uid, currentTimestamp, orp, pump_1, pump_2, 'pump2ON']);
              status = 'pump2ON';
            } else {
              insertLogValues.push([device_uid, currentTimestamp, orp, pump_1, pump_2, 'bothOFF']);
              status = 'bothOFF';
            }
          } else {
            insertLogValues.push([device_uid, currentTimestamp, orp, pump_1, pump_2, 'powerCUT']);
            status = 'powerCUT';
          }

          // Update status in 'tms_devices' table
          // const updateStatusQueryTMS = 'UPDATE ORP SET Status = ? WHERE DeviceUID = ?';
          // db.query(updateStatusQueryTMS, [status, DeviceUID], (error) => {
          //   if (error) {
          //     console.error('Error updating status in tms_devices table: ', error);
          //   }
          // });
        }
      });

      if (insertLogValues.length > 0) {
        db.query(insertLogQuery, [insertLogValues], (error) => {
          if (error) {
            console.error('Error inserting the device data into tms_log: ', error);
            return;
          }
        });
      }
    });
  });
}

setInterval(monitorDevice, 20000);
