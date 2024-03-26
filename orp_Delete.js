const mysql = require('mysql2/promise');
const cron = require('node-cron');

const mysqlConfig = {
  host: '13.232.174.80',
  user: 'mysql',
  password: 'sense!123',
  database: 'orp',
  port: 3306,
};

const mysqlPool = mysql.createPool(mysqlConfig);

async function DeleteDataORP() {
  try {
    const query = 'DELETE FROM ORP_Meter WHERE orp IS NULL AND pump_1 IS NULL AND pump_2 IS NULL  AND date_time >= NOW() - INTERVAL 24 HOUR;';
    const [result] = await mysqlPool.query(query);
  } catch (err) {
    console.error('Error deleting data from ORP_Meter:', err);
    throw err;
  }
}

// Schedule the task to run every 5 seconds
cron.schedule('*/5 * * * * *', async () => {
  try {
    await DeleteDataORP();
  } catch (error) {
    console.error('Error running DeleteDataORP:', error);
  }
});

process.on('exit', () => {
  mysqlPool.end();
});
