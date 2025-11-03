const mongoose = require("mongoose");

const photoSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true,
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event",
    required: true,
  },
  photographer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  takenAt: {
    type: Date,
    default: Date.now,
  },
  faces: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      boundingBox: {
        x: Number,
        y: Number,
        width: Number,
        height: Number,
      },
      confidence: Number,
    },
  ],
  metadata: {
    size: Number,
    format: String,
    resolution: {
      width: Number,
      height: Number,
    },
  },
  isPublic: {
    type: Boolean,
    default: true,
  },
});

const Photo = mongoose.model("Photo", photoSchema);
module.exports = Photo;
