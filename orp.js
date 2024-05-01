const mqtt = require('mqtt');
const mysql = require('mysql2');

const broker = 'ws://dashboard.senselive.in:9001';

const mysqlConfig = {
  host: '13.127.102.12',
  user: 'mysql',
  password: 'sense!123',
  database: 'ORP',
  port: 3306,
};

const mysqlPool = mysql.createPool(mysqlConfig);

const mqttOptions = {
  username: 'Sense2023',
  password: 'sense123',
};

const mqttClient = mqtt.connect(broker, mqttOptions);

mqttClient.on('connect', () => {
  mqttClient.subscribe('Sense/#', (error) => {
    if (error) {
      console.error('Error subscribing to all topics:', error);
    } else {
      console.log('Subscribed to all topics');
    }
  });
});

mqttClient.on('message', (topic, message) => {
  try {
    const data = JSON.parse(message);

    // Check if at least one of the required fields is present
    if (data.orp || data.pump1 || data.pump2) {
      const insertQuery = `
        INSERT INTO ORP_Meter (device_uid, date_time, orp, pump_1, pump_2)
        VALUES (?, NOW(), ?, ?, ?)
      `;
      
      const insertValues = [
        data.DeviceUID || data.device_uid || data.deviceuid,
        data.orp,
        data.pump1,
        data.pump2,
      ];

      mysqlPool.query(insertQuery, insertValues, (error) => {
        if (error) {
          console.error('Error inserting data into MySQL:', error);
        } else {
          console.log('Data inserted into MySQL');
        }
      });
    } else {
      console.log('No relevant data fields found. Skipping MySQL insertion.');
    }
  } catch (error) {
    console.error('Error processing message:', error);
  }
});

mqttClient.on('error', (error) => {
  console.error('MQTT error:', error);
});

// Gracefully close MySQL connection pool on process exit
process.on('exit', () => {
  mysqlPool.end();
});
