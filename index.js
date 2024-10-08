
const express = require('express');
const cors = require('cors');

const dbconnect = require('./Config/dbconnect');
const requestLogger = require('./Middlewares/requestLogger');


const app = express();
app.use(cors());

const dotenv = require('dotenv').config();

const PORT = process.env.PORT || 4000;
dbconnect();

app.use(express.json());
app.use(requestLogger)










app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});