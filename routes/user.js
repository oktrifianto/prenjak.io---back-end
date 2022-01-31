const express = require('express');
const router  = express.Router();
const db      = require('../db/database');
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
require('dotenv').config();
router.use(express.json()); // enable request body

/**
 * Method: GET
 * /user
 * 
 */
router.get('/', (req, res) => {
  res.json({
    "data": "From user is success"
  })
});

/**
 * Method: GET, POST
 * /user/halo
 * 
 */
router.get('/halo', (req, res) => {
  if (CheckDataExist()) {
    res.json({
      "data": "Halo from user! True bos"
    });
  } else {
    res.json({
      "data": "Halo from user! False"
    });
  }
}).post('/halo', (req, res) => {
  res.json({
    "data" : "Post method!!"
  })
});

/**
 * Sign Up
 * Method: POST
 * @url : /user/signup
 */
router.post('/signup', async (req, res) => {
  try {
    const { username, email, password } = req.body;
  
    // Validate input
    if (!(username && email && password)) {
      res.status(400).json({"message": "All input is required."});
    }
  
    // Check if user exist 
    const UserExist = await checkUserExist(email);
    if (UserExist){
      res.status(400).json({"message": "Email exist"});
    } else {
      // Encrypt password
      const newPassword = await bcrypt.hash(password, 10);
      
      // Create token
      const privateKey  = process.env.TOKEN_KEY;
      const token       = jwt.sign({email}, privateKey, {expiresIn: "2h",});
      
      // Save to database
      const sql = `INSERT INTO user (username, email, password, token) VALUES ('${username}', '${email}', '${newPassword}', '${token}')`;
      db.query(sql, (err, result) => {
        if (err) throw err;
        res.status(200).json({
          "message": "You have successfully register",
          "status" : 200,
          "data" : {
            "token"   : token,
            "username": username,
            "email"   : email,
            "password": newPassword
          }
        });
      });
    }
  } catch (err) {
    console.log(err);
  }
});

/**
 * Login
 * Method: POST
 * @url /user/login
 */
router.post('/login', async (req, res) => {
  try {
    const {email, password} = req.body;
    
    // Validate input
    if (!(email && password)){
      res.status(400).json({
        "status": 400,
        "message": "All input is required"
      });
    }

    // Get password from database
    const ps = await getPasswordUser(email);

    // Compare password
    if (await bcrypt.compare(password, ps)){
      const privateKey  = process.env.TOKEN_KEY;
      const token       = jwt.sign({email}, privateKey, {expiresIn: "2h",});

      // Save token to database
      const sql = `UPDATE user SET token='${token}' WHERE email='${email}'`;
      db.query(sql, (err, result) => {
        if (err) throw err;
        res.status(200).json({
          "status"  : 200,
          "message" : "Login Success",
          "token"   : token
        });
      });
      return; // for next
    }

    res.status(400).json({
      "message": "Invalid Credentials"
    });

  } catch (err) {
    console.log(err);
  }
});

/**
 * Check If user has been created
 * @param {*} email 
 * @returns boolean
 */
const checkUserExist = email => {
  const sql = `SELECT email FROM user WHERE email="${email}"`;
  return new Promise((resolve, reject) => {
    db.query(sql, (err, result) => {
      if (err) throw reject(err);
      if (result.length !== 0) { // exist
        resolve(true);
      } else {
        resolve(false);
      }
    });
  });
}

// Get password from database
const getPasswordUser = email => {
  const sql = `SELECT password FROM user WHERE email="${email}"`;
  return new Promise((resolve, reject) => {
    db.query(sql, (err, result) => {
      if (err) throw reject(err);
      resolve(result[0].password);
    });
  });
}

module.exports = router;