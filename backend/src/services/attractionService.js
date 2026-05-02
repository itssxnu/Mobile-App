const Attraction = require("../models/Attraction");

// Create a new attraction
exports.createAttraction = async (attractionData) => {
  return await Attraction.create(attractionData);
};

// Get all attractions with optional filtering
exports.getAllAttractions = async (query) => {
  const filter = {};
  if (query.district) {
    // Case-insensitive regex match for district
    filter.district = { $regex: query.district, $options: "i" };
  }
  
  return await Attraction.find(filter).populate("provider", "name email");
};

// Get a single attraction by ID
exports.getAttractionById = async (id) => {
  return await Attraction.findById(id).populate("provider", "name email");
};

// Update an attraction
exports.updateAttraction = async (id, updateData) => {
  return await Attraction.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });
};

// Delete an attraction
exports.deleteAttraction = async (id) => {
  const attraction = await Attraction.findById(id);
  if (attraction) {
    await attraction.deleteOne();
    return true;
  }
  return false;
};
