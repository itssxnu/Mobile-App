require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./src/models/User");
const Event = require("./src/models/Event");

mongoose.connect(process.env.MONGO_URI).then(async () => {
  try {
    let admin = await User.findOne({ email: "admin@hdresorts.com" });
    if (!admin) {
      console.log("Admin not found. Please run createFirstAdmin.js first.");
      process.exit(1);
    }

    const events = [
      {
        host: admin._id,
        eventName: "Kandy Esala Perahera Festival",
        eventDate: new Date("2026-08-15"),
        location: "Sri Dalada Maligawa, Kandy",
        description: "Experience the grand festival of the sacred tooth relic with traditional dancers, fire-breathers, and beautifully adorned elephants in the historic city of Kandy.",
        eventPoster: "https://images.unsplash.com/photo-1625736855118-2e5fbd2ce33a?q=80&w=800&auto=format&fit=crop"
      },
      {
        host: admin._id,
        eventName: "Galle Literary Festival",
        eventDate: new Date("2026-01-25"),
        location: "Galle Fort, Galle",
        description: "Join internationally acclaimed authors and poets at the historic Galle Fort for five days of readings, panels, and cultural celebrations.",
        eventPoster: "https://images.unsplash.com/photo-1546484396-fb3fc6f95f98?q=80&w=800&auto=format&fit=crop"
      },
      {
        host: admin._id,
        eventName: "Arugam Bay Surf Championship",
        eventDate: new Date("2026-07-10"),
        location: "Arugam Bay, Eastern Province",
        description: "Watch the world's best surfers tackle the famous waves of Arugam Bay. Includes evening beach parties and live music.",
        eventPoster: "https://images.unsplash.com/photo-1502680390469-be75c86b636f?q=80&w=800&auto=format&fit=crop"
      },
      {
        host: admin._id,
        eventName: "Nuwara Eliya Tea Tasting & Tour",
        eventDate: new Date("2026-05-20"),
        location: "Pedro Tea Estate, Nuwara Eliya",
        description: "A guided walking tour through lush tea plantations followed by an exclusive tasting session of Ceylon's finest teas.",
        eventPoster: "https://images.unsplash.com/photo-1587595431973-160d0d94add1?q=80&w=800&auto=format&fit=crop"
      }
    ];

    // Optional: Clear existing events if you want a clean slate
    // await Event.deleteMany({}); 
    
    await Event.insertMany(events);
    console.log("Successfully seeded 4 demo events into the database!");

  } catch (error) {
    console.error(error);
  } finally {
    process.exit(0);
  }
});
