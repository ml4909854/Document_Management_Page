const express = require("express");
const auth = require("../middleware/auth.middleware");
const Document = require("../model/document.model");
const router = express.Router();

// 🔍 GET all accessible documents (public or user's private)
router.get("/", auth, async (req, res) => {
  try {
    const documents = await Document.find({
      $or: [
        { isPublic: true },
        { author: req.user._id }
      ]
    }).populate("author", "name email");

    res.status(200).json({ message: "All accessible documents", documents });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching documents",
      error: error.message
    });
  }
});

// 📄 GET a single document by ID (check permission)
router.get("/:id", auth, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id).populate("author", "name");

    if (!document) {
      return res.status(404).json({ message: "Document not found!" });
    }

    const isAuthor = document.author._id.toString() === req.user._id.toString();
    const isShared = document.sharedWith.some(
      (entry) => entry.user.toString() === req.user._id.toString()
    );

    if (!document.isPublic && !isAuthor && !isShared) {
      return res.status(403).json({ message: "Access denied to this private document" });
    }

    res.status(200).json({ message: "Single document fetched", document });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching document",
      error: error.message
    });
  }
});

// 📝 POST - Create a new document
router.post("/create", auth, async (req, res) => {
  try {
    const { title, content } = req.body;

    const existing = await Document.findOne({ title, author: req.user._id });
    if (existing) {
      return res.status(400).json({
        message: "You already have a document with this title."
      });
    }

    const newDocument = new Document({
      title,
      content,
      author: req.user._id,
      isPublic: false
    });

    const saved = await newDocument.save();
    res.status(201).json({
      message: "Document created!",
      document: saved
    });
  } catch (error) {
    res.status(500).json({ message: "Error creating document", error: error.message });
  }
});

// ✏️ PATCH - Update a document
router.patch("/update/:id", auth, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) return res.status(404).json({ message: "Document not found!" });

    if (document.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only update your own documents." });
    }

    const updated = await Document.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ message: "Document updated", document: updated });
  } catch (error) {
    res.status(500).json({ message: "Error updating document", error: error.message });
  }
});

// ❌ DELETE - Delete a document
router.delete("/delete/:id", auth, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) return res.status(404).json({ message: "Document not found!" });

    if (document.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only delete your own documents." });
    }

    const deleted = await Document.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Document deleted!", document: deleted });
  } catch (error) {
    res.status(500).json({ message: "Error deleting document", error: error.message });
  }
});

// Toggle public/private status
router.patch("/toggle-visibility/:id", auth, async (req, res) => {
  try {
    const documentId = req.params.id;
    const document = await Document.findById(documentId);

    if (!document) {
      return res.status(404).json({ message: "Document not found!" });
    }

    // Only author can toggle visibility
    if (document.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Toggle the isPublic field
    document.isPublic = !document.isPublic;
    await document.save();

    res.status(200).json({
      message: `Document is now ${document.isPublic ? "Public" : "Private"}`,
      document,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to toggle visibility",
      error: error.message,
    });
  }
});


module.exports = router;
