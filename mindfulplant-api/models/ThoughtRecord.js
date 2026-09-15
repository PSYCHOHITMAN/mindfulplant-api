const mongoose = require("mongoose");

// recordId is generated client-side (Room's primary key) and sent to us as-is,
// so we store it as a plain indexed field rather than relying on Mongo's _id.
const thoughtRecordSchema = new mongoose.Schema({
  recordId: { type: String, required: true, unique: true },
  userId: { type: String, required: true, index: true },
  situation: { type: String, required: true },
  automaticThought: { type: String, required: true },
  distortionType: { type: String, required: true },
  balancedReframe: { type: String, required: true },
  moodBefore: { type: Number, required: true },
  moodAfter: { type: Number, required: true },
  createdAt: { type: Number, required: true }, // epoch millis, matches the Android entity
});

module.exports = mongoose.model("ThoughtRecord", thoughtRecordSchema);
