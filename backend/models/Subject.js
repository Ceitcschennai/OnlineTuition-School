const mongoose = require("mongoose");

const subjectSchema = new mongoose.Schema(
  {
    
    name: { type: String, required: true },
    category: { type: String, default: "Regular" },
    price: { type: String, default: "Free" },
    classes: [{ type: String }],
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Subject", subjectSchema);
