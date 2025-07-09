const mongoose = require("mongoose");
const documentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String },
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  isPublic: { type: Boolean, default: false },
  sharedWith: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      permission: { type: String, enum: ["view", "edit"], default: "view" },
    },
  ],
} , {
    versionKey:false,
    timestamps:true
});

const Document = mongoose.model("Document" , documentSchema)
module.exports = Document
