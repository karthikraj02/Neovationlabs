const mongoose = require("mongoose");

const insightSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    excerpt: { type: String, required: true, trim: true, maxlength: 400 },
    content: { type: String, required: true },
    category: { type: String, required: true, trim: true },
    author: { type: String, required: true, trim: true },
    coverImage: { type: String, trim: true, default: "" },
    publishedAt: { type: Date, default: Date.now },
    readingTime: { type: String, trim: true, default: "5 min read" },
    tags: [{ type: String, trim: true }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Insight", insightSchema);
