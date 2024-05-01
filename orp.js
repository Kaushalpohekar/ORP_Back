const mqtt = require('mqtt');
const mysql = require('mysql2');
const broker = 'ws://dashboard.senselive.in:9001';

const mysqlConfig = {
  host: '13.127.102.12',
  user: 'mysql',
  password: 'sense!123',
  database: 'orp',
  port: 3306,
};

const mysqlPool = mysql.createPool(mysqlConfig);

const options = {
  username: 'Sense2023',
  password: 'sense123',
};

const mqttClient = mqtt.connect(broker, options);

mqttClient.on('connect', () => {
  mqttClient.subscribe('Sense/#', (error) => {
    if (error) {
      console.error('Error subscribing to all topics:', error);
    } else {
    }
  });
});

mqttClient.on('message', (topic, message) => {
  try {
    const data = JSON.parse(message);

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

    if(data.Temperature || data.TemperatureR || data.TemperatureY || data.TemperatureB || data.flowRate){
    } else {
      mysqlPool.query(insertQuery, insertValues, (error) => {
        if (error) {
          console.error('Error inserting data into MySQL:', error);
        } else {
        }
      });
    }

    
  } catch (error) {
    console.error('Error processing message:', error);
  }
});

mqttClient.on('error', (error) => {
  console.error('MQTT error:', error);
});

process.on('exit', () => {
  mysqlPool.end();
});
