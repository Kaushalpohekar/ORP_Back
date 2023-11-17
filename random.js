const db = require('./db');

function generateRandomData() {
  const utcTime = new Date();
  const indianTime = new Date(utcTime.getTime() + (5.5 * 60 * 60 * 1000)).toISOString().slice(0, 19).replace('T', ' ');

  return {
    device_uid: "SL02202347",
    date_time: indianTime,
    orp: Math.floor(Math.random() * (600 - 500 + 1)) + 500,
    pump_1: Math.floor(Math.random() * 3),
    pump_2: Math.floor(Math.random() * 3),
  };
}

function insertRandomData() {
  const entry = generateRandomData();

  if (entry.pump_2 === 1) {
    entry.pump_1 = 0;
  }
  if (entry.pump_1 === 1) {
    entry.pump_2 = 0;
  }

  entry.pump_1 = Math.min(2, Math.max(0, entry.pump_1));
  entry.pump_2 = Math.min(2, Math.max(0, entry.pump_2));
  entry.orp = Math.min(600, Math.max(500, entry.orp));

  db.query(
    `INSERT INTO ORP_Meter (device_uid, date_time, orp, pump_1, pump_2) VALUES (?, ?, ?, ?, ?)`,
    [entry.device_uid, entry.date_time, entry.orp, entry.pump_1, entry.pump_2],
    (err, results) => {
      if (err) {
        console.error(err);
      } else {
        console.log(`Inserted row with ID: ${results.insertId}`);
      }
    }
  );
}

const interval = setInterval(insertRandomData, 1000);
