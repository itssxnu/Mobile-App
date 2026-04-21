require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./src/models/User");

mongoose.connect(process.env.MONGO_URI).then(async () => {
  try {
    await User.updateMany({}, { $set: { isVerified: true } });
    console.log("Successfully marked all existing users as verified.");
  } catch (error) {
    console.error(error);
  } finally {
    process.exit(0);
  }
});
