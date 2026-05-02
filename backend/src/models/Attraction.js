const mongoose = require("mongoose");

const attractionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add an attraction name"],
      trim: true,
      maxlength: [100, "Name cannot be more than 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Please add a description"],
      maxlength: [1000, "Description cannot be more than 1000 characters"],
    },
    district: {
      type: String,
      required: [true, "Please specify the district"],
      trim: true,
    },
    difficultyLevel: {
      type: String,
      enum: ["Easy", "Moderate", "Hard"],
      default: "Easy",
    },
    entryFee: {
      type: Number,
      default: 0,
    },
    coverPhoto: {
      type: String,
      default: "no-photo.jpg",
    },
    additionalPhotos: {
      type: [String],
      default: [],
    },
    provider: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Attraction", attractionSchema);
