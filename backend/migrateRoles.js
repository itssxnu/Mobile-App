require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./src/models/User");

mongoose.connect(process.env.MONGO_URI).then(async () => {
  try {
    const users = await User.find({});
    let count = 0;
    for (let u of users) {
      if (u.role && u.role !== u.role.toUpperCase()) {
        u.role = u.role.toUpperCase();
        await u.save({ validateBeforeSave: false });
        count++;
      }
    }
    console.log(`Successfully updated ${count} existing users to uppercase roles.`);
  } catch (error) {
    console.error(error);
  } finally {
    process.exit(0);
  }
});
