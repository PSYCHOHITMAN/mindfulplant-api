const express = require("express");
const ThoughtRecord = require("../models/ThoughtRecord");
const requireAuth = require("../middleware/auth");

const router = express.Router();

// POST /records  (Bearer token + ThoughtRecordDto) -> SaveRecordResponse
router.post("/records", requireAuth, async (req, res) => {
  try {
    const {
      recordId, userId, situation, automaticThought,
      distortionType, balancedReframe, moodBefore, moodAfter, createdAt,
    } = req.body;

    if (!recordId || !userId || !situation || !automaticThought) {
      return res.status(400).json({ recordId: recordId || "", success: false });
    }

    await ThoughtRecord.findOneAndUpdate(
      { recordId },
      { recordId, userId, situation, automaticThought, distortionType, balancedReframe, moodBefore, moodAfter, createdAt },
      { upsert: true, new: true }
    );

    res.status(200).json({ recordId, success: true });
  } catch (err) {
    console.error("save record error:", err);
    res.status(500).json({ recordId: req.body?.recordId || "", success: false });
  }
});

// GET /records  (Bearer token) -> List<ThoughtRecordDto> for the caller's userId
router.get("/records", requireAuth, async (req, res) => {
  try {
    const records = await ThoughtRecord.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.status(200).json(
      records.map((r) => ({
        recordId: r.recordId,
        userId: r.userId,
        situation: r.situation,
        automaticThought: r.automaticThought,
        distortionType: r.distortionType,
        balancedReframe: r.balancedReframe,
        moodBefore: r.moodBefore,
        moodAfter: r.moodAfter,
        createdAt: r.createdAt,
      }))
    );
  } catch (err) {
    console.error("get records error:", err);
    res.status(500).json([]);
  }
});

module.exports = router;
