const express = require('express');
const cors = require('cors');
const router = require('./routes');

const app = express();



app.use(cors());
app.use(express.json());

// Use the router for handling routes
app.use(router);

// Start the server
app.listen(process.env.APP_PORT, () => {
  console.log(`Server running on port `, process.env.APP_PORT);
});
