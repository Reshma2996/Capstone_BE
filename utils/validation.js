// Validation functions for equipment and user data

  // Validate user data
const validateUser = (userData) => {
    if (!userData.username || !userData.password) {
      return { error: 'Username and password are required' };
    }
    
    // Additional validation logic...
    
    return { error: null }; // Return null if there are no errors
  };
  
   // utils/validation.js

// Validate equipment data
const validateEquipment = (equipment) => {
    // Implement validation logic for equipment data
    if (!equipment.name || !equipment.description || !equipment.specifications || !equipment.rentalRate || !equipment.availabilityDates) {
      return { error: 'All fields are required' };
    }
    
    // Additional validation logic...
  
    return { error: null }; // Return null if there are no errors
  };
  

  
  module.exports = {
    validateEquipment,
    validateUser
  };

  