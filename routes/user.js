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
  
    // validate input
    if (!(username && email && password)) {
      res.status(400).json({"message": "All input is required."});
    }
  
    // check if email exist *** pending ***
    // if (CheckUserExist(email) === true){
    //   res.status(409).json({"message": "Email exist"});
    // }
    // CheckUserExist(email); 

    // encrypt password
    const newPassword = await bcrypt.hash(password, 10);
    // create token
    const privateKey  = process.env.TOKEN_KEY;
    const token       = jwt.sign({email}, privateKey, {expiresIn: "2h",});

    // save to database
    // ... todo here 

    res.json({
      username,
      email,
      newPassword,
      token
    });
  } catch (err) {
    console.log(err);
  }
});

/**
 * Login
 * Method: POST
 * @url /user/login
 */
router.post('/login', (req, res) => {
  res.json({
    "data" : "Hello Login"
  });
});


/**
 * FUNCTIONS
 */
const CheckDataExist = () => true;
const CheckUserExist = (user_email) => {
  const queryEmail = `SELECT email FROM user WHERE email="${user_email}"`;
  // console.log(queryEmail);
  db.query(queryEmail, (err, result) => {
    console.log(result[0].email);
    // if (err) throw err;
    // console.log(err);
    // console.log(result[0].email.length);
    // if (result[0].email.length > 0) {
    // //   // return true;
    //   console.log(true);
    // } else {
    //   console.log(false);
    // }
  });
}

module.exports = router;