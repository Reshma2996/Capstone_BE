const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const config = require('./utils/config');
const Equipment = require('./models/equipment');
const User = require('./models/user');
const { validateEquipment, validateUser } = require('./utils/validation');
const cors = require('cors')
const morgan = require('morgan')

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(cors({
  origin: 'https://heroic-sprinkles-d14b6a.netlify.app/',
  credentials:true
}));

// MongoDB Connection
mongoose.connect(config.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Error connecting to MongoDB:', err));

// User registration
app.post('/api/Rental_Equipment/register', async (req, res) => {
    try {
      // Validate user data
      const validationResult = validateUser(req.body);
      if (validationResult.error) {
        return res.status(400).send(validationResult.error);
      }
  
      // Check if user already exists
      const existingUser = await User.findOne({ email: req.body.email });
      if (existingUser) return res.status(400).json('User already registered.');
  
      // Create new user
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(req.body.password, salt);
      const newUser = new User({
        username: req.body.username,
        email: req.body.email,
        password: hashedPassword
      });
      await newUser.save();
  
      res.status(201).json('User registered successfully.');
    } catch (err) {
      console.error('Error registering user:', err);
      res.status(500).send('Internal Server Error');
    }
  });


//   //
//   if (error && error.details && error.details[0] && error.details[0].message) {
//     return res.status(400).json(error.details[0].message);
//   }
  
//   ///
// User login
app.post('/api/Rental_Equipment/login', async (req, res) => {
  try {
    // Validate login data
    const { error } = validateUser(req.body);
    if (error && error.details && error.details[0] && error.details[0].message) 
    {return res.status(400).json(error.details[0].message);
    }

    // Check if user exists
    const user = await User.findOne({ username: req.body.username });
    if (!user) return res.status(400).json('User not found');

    // Validate password
    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if (!validPassword) return res.json(400).send('Invalid password.');

    // If the password is correct - Generate JWT token and return it 
    const token = jwt.sign({ username: user.username,id: user._id ,name: user.name}, config.JWT_SECRET);
    //set the cookie with the token in the response header
    res.cookie('token', token,{ 
        httpOnly : true,
        SameSite : 'none',
        expires : new Date(Date.now() + 24 * 60 * 60 * 1000), //24 hours from now 
        secure: true
    });
    //Returning the token 
  res.json ({message: "Login successful" , token });
  } catch (err) {
    console.error('Error logging in user:', err);
    res.status(500).send('Internal Server Error');
  }
});



// Create new equipment listing
app.post('/api/Rental_Equipment/create_equipment', async (req, res) => {
  try {
    // Validate equipment data
    const { error } = validateEquipment(req.body);
    if (error) return res.status(400).json(error.details[0].message);

    // Create new equipment listing
    const newEquipment = new Equipment({
      name: req.body.name,
      description: req.body.description,
      specifications: req.body.specifications,
      rentalRate: req.body.rentalRate,
      availabilityDates: req.body.availabilityDates
    });
    await newEquipment.save();

    res.send('Equipment listing created successfully.');
  } catch (err) {
    console.error('Error creating equipment listing:', err);
    res.status(500).send('Internal Server Error');
  }
});

// Get all equipment listings
app.get('/api/Rental_Equipment/get_equipment', async (req, res) => {
    try {
      const equipment = await Equipment.find();
      res.send(equipment);
    } catch (err) {
      console.error('Error getting equipment listings:', err);
      res.status(500).send('Internal Server Error');
    }
  });

// Middleware for JWT verification - this to check if the user is authorized
const verifyToken = (req, res, next) => {
  const token = req.cookies('token');
  if (!token) return res.status(401).send('Access denied. No token provided.');

  try {
    const decoded = jwt.verify(token, config.JWT_SECRET);
    req.userId = decoded;
    next();
  } catch (err) {
    res.status(400).json('Invalid token.');
  }
};

// using middleware for protected route
app.get('/api/Rental_Equipment/protected', verifyToken, (req, res) => {
  // Only accessible with valid JWT token
  res.send('Protected route accessed.');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
