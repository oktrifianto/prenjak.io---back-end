const mysql = require('mysql');
require('dotenv').config();

const con = mysql.createConnection({
  host      : process.env.DB_HOST,
  user      : process.env.DB_USER,
  password  : process.env.DB_PASSWORD,
  database  : process.env.DB_NAME
});

con.connect((err) => {
  if (err) throw err;
  console.log("MySQL Connected");
});

module.exports = con;