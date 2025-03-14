const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    });

    console.log("MongoDB Connection Successful");
  } catch (error) {
    console.error("MongoDB Connection Failed:", error.message);
    process.exit(1);
  }
};

// Call the connect function
connectDB();

const connection = mongoose.connection;

connection.on("error", (err) => {
  console.error("MongoDB Connection Error:", err);
});

connection.on("disconnected", () => {
  console.log("MongoDB Disconnected. Attempting to reconnect...");
  setTimeout(connectDB, 5000);
});

module.exports = connection;
