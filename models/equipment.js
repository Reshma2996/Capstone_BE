const mongoose = require('mongoose');

// Define equipment schema
const equipmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  specifications: {
    type: String,
    required: true
  },
  rentalRate: {
    type: String,
    required: true
  },
  availabilityDates: {
    type: String,
    default: true
  }
});

// Create Equipment model
module.exports = mongoose.model('Equipment',equipmentSchema ,'RentalEquipment') ;
