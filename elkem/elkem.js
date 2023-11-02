const db = require('../db');

function graph1(req, res) {
  const currentTime = new Date();
  const twentyFourHoursAgo = new Date(currentTime.getHours() - 24);

  db.query(
    'SELECT * FROM elkem_temp WHERE date_time >= ? AND date_time <= ?',
    [twentyFourHoursAgo, currentTime],
    (err, Results) => {
      if (err) {
        return res.status(401).json({message : 'error in retriving data',
      error : err})
      } 
      res.json({Graph1 : Results});
      console.log(Results);
    }
  );
}

module.exports = {
  graph1,
}