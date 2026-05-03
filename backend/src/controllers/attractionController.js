const attractionService = require("../services/attractionService");

// @desc    Create new attraction
// @route   POST /api/attractions
// @access  Protected
exports.createAttraction = async (req, res) => {
  try {
    const attractionData = {
      ...req.body,
      provider: req.user.id, // from auth middleware
    };

    if (req.files) {
      if (req.files.coverPhoto && req.files.coverPhoto.length > 0) {
        attractionData.coverPhoto = req.files.coverPhoto[0].path;
      }
      
      if (req.files.additionalPhotos && req.files.additionalPhotos.length > 0) {
        attractionData.additionalPhotos = req.files.additionalPhotos.map(
          (file) => file.path
        );
      }
    }

    const attraction = await attractionService.createAttraction(attractionData);
    res.status(201).json({ success: true, data: attraction });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Get all attractions
// @route   GET /api/attractions
// @access  Public
exports.getAttractions = async (req, res) => {
  try {
    const attractions = await attractionService.getAllAttractions(req.query);
    res.status(200).json({ success: true, count: attractions.length, data: attractions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single attraction
// @route   GET /api/attractions/:id
// @access  Public
exports.getAttraction = async (req, res) => {
  try {
    const attraction = await attractionService.getAttractionById(req.params.id);
    
    if (!attraction) {
      return res.status(404).json({ success: false, message: "Attraction not found" });
    }
    
    res.status(200).json({ success: true, data: attraction });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update attraction
// @route   PUT /api/attractions/:id
// @access  Protected
exports.updateAttraction = async (req, res) => {
  try {
    const attractionId = req.params.id;
    let attraction = await attractionService.getAttractionById(attractionId);

    if (!attraction) {
      return res.status(404).json({ success: false, message: "Attraction not found" });
    }

    // Ensure the user owns the attraction or is an admin
    if (attraction.provider._id.toString() !== req.user.id && req.user.role !== "ADMIN") {
      return res.status(403).json({ success: false, message: "Not authorized to update this attraction" });
    }

    // Only allow updating description and difficultyLevel as per requirements
    const updateData = {};
    if (req.body.description) updateData.description = req.body.description;
    if (req.body.difficultyLevel) updateData.difficultyLevel = req.body.difficultyLevel;

    attraction = await attractionService.updateAttraction(attractionId, updateData);

    res.status(200).json({ success: true, data: attraction });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete attraction
// @route   DELETE /api/attractions/:id
// @access  Protected
exports.deleteAttraction = async (req, res) => {
  try {
    const attractionId = req.params.id;
    const attraction = await attractionService.getAttractionById(attractionId);

    if (!attraction) {
      return res.status(404).json({ success: false, message: "Attraction not found" });
    }

    // Ensure the user owns the attraction or is an admin
    if (attraction.provider._id.toString() !== req.user.id && req.user.role !== "ADMIN") {
      return res.status(403).json({ success: false, message: "Not authorized to delete this attraction" });
    }

    await attractionService.deleteAttraction(attractionId);

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
