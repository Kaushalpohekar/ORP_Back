// const mqtt = require('mqtt');

// // Replace these values with your MQTT broker details
// const brokerUrl = 'ws://broker.emqx.io:8083/mqtt';
// const topic = 'EnergyCoilStatus/SenseLive/SL02202347/1'; // Replace 'device_uid' with the actual device UID

// // Function to generate random device data
// function generateRandomData() {
//   const pump1Value = Math.floor(Math.random() * 3); // 0, 1, or 2
//   const pump2Value = Math.floor(Math.random() * 3); // 0, 1, or 2

//   // Ensure that pump1 and pump2 are not both 1 at the same time
//   if (pump1Value === 1) {
//     pump2Value === 0;
//   } else if (pump2Value === 1) {
//     pump1Value === 0;
//   }

//   const deviceData = {
//     device_uid: 'SL02202347',
//     pump1: pump1Value,
//     pump2: pump2Value,
//   };

//   return JSON.stringify(deviceData);
// }

// // Create an MQTT client
// const client = mqtt.connect(brokerUrl);

// // Function to publish data every 1 second
// function sendDataContinuously() {
//   setInterval(() => {
//     const payload = generateRandomData();
//     client.publish(topic, payload);
//     console.log('Data sent:', payload);
//   }, 1000);
// }

// // Connect to the MQTT broker
// client.on('connect', () => {
//   console.log('Connected to MQTT broker');
//   sendDataContinuously(); // Start sending data once connected
// });

// // Handle errors
// client.on('error', (error) => {
//   console.error('MQTT error:', error);
// });

// // Handle closing
// process.on('SIGINT', () => {
//   client.end();
//   process.exit();
// });
const mqtt = require('mqtt');

// Replace these values with your MQTT broker details
const brokerUrl = 'ws://broker.emqx.io:8083/mqtt';
const baseTopic = 'EnergyCoilStatus/SenseLive/';

// Function to generate random device data
function generateRandomData(deviceUid) {
  const pump1Value = Math.floor(Math.random() * 3); // 0, 1, or 2
  const pump2Value = Math.floor(Math.random() * 3); // 0, 1, or 2

  // Ensure that pump1 and pump2 are not both 1 at the same time
  if (pump1Value === 1) {
    pump2Value === 0;
  } else if (pump2Value === 1) {
    pump1Value === 0;
  }

  const deviceData = {
    device_uid: deviceUid,
    pump1: pump1Value,
    pump2: pump2Value,
  };

  return JSON.stringify(deviceData);
}

// Create an MQTT client
const client = mqtt.connect(brokerUrl);

// Function to publish data for a specific device every 1 second
function sendDataContinuously(deviceUid) {
  setInterval(() => {
    const topic = baseTopic + deviceUid + '/1';
    const payload = generateRandomData(deviceUid);
    client.publish(topic, payload);
    console.log('Data sent:', payload);
  }, 10 * 1000);
}

// Connect to the MQTT broker
client.on('connect', () => {
  console.log('Connected to MQTT broker');

  // Generate data for devices SL02202347 to SL02202355
  for (let i = 47; i <= 55; i++) {
    const deviceUid = 'SL022023' + i;
    sendDataContinuously(deviceUid);
  }
});

// Handle errors
client.on('error', (error) => {
  console.error('MQTT error:', error);
});

// Handle closing
process.on('SIGINT', () => {
  client.end();
  process.exit();
});
