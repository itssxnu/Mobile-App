require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./src/models/User");

mongoose.connect(process.env.MONGO_URI).then(async () => {
  try {
    const adminEmail = "admin@hdresorts.com";
    let admin = await User.findOne({ email: adminEmail });

    if (!admin) {
      admin = await User.create({
        name: "System Admin",
        email: adminEmail,
        password: "adminpassword123", // Pre-save hook hashes it
        phone: "0000000000",
        role: "ADMIN",
        isVerified: true
      });
      console.log("Successfully created first Admin account!");
      console.log(`Email: ${adminEmail}\nPassword: adminpassword123`);
    } else {
      admin.role = "ADMIN";
      await admin.save({ validateBeforeSave: false });
      console.log("Admin account already exists, ensured role is ADMIN.");
    }
  } catch (error) {
    console.error(error);
  } finally {
    process.exit(0);
  }
});
