require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const authRoutes = require("./routes/auth");
const recordRoutes = require("./routes/records");

const app = express();
app.use(cors());
app.use(express.json());

// Simple health check so you can confirm the service is live in a browser.
app.get("/", (req, res) => res.send("MindfulPlantCBT API is running."));

app.use("/", authRoutes);   // -> /register, /login
app.use("/", recordRoutes); // -> /records (GET + POST)

const PORT = process.env.PORT || 3000;

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB Atlas");
    app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB:", err.message);
    process.exit(1);
  });
