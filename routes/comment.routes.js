const Comment = require("../models/Comment.model");
const isAuthenticated = require("../middleware/route-guard.middleware");
const express = require("express");
const router = express.Router();

//Just for testing purpose
router.get("/", (req, res) => {
  res.json("All good in here in auth");
});

router.post("/", isAuthenticated, async (req, res) => {
  const payload = req.body;
  const { userId } = req.tokenPayload;
  payload.createdBy = userId;

  const newComment = await Comment.create(payload);
  try {
    res.status(201).json("created the comment sucessfully");
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

router.put("/:commentId", isAuthenticated, async (req, res) => {
  const { userId } = req.tokenPayload;
  const payload = req.body;
  const { commentId, eventId } = req.params;

  try {
    const originalComment = Comment.findOne({
      _id: commentId,
      eventId: eventId,
    });
    if (userId != originalComment.createdBy) {
      const updateComment = await Comment.findByIdAndUpdate(
        commentId,
        payload,
        {
          new: true,
        }
      );
      res.status(202).json(updateComment);
    } else {
      res.status(403).json();
    }
  } catch (error) {
    console.log(error);
  }
});

// DELETE one
router.delete("/:commentId", isAuthenticated, async (req, res) => {
  const { userId } = req.tokenPayload;
  const { commentId } = req.params;
  try {
    const commentToDelete = await Comment.findById(commentId);
    console.log(commentToDelete, userId);
    if (commentToDelete.createdBy == userId) {
      console.log("Deleting");
      await Comment.findByIdAndDelete(commentId);
      res.status(204).json();
    } else {
      res.status(403).json({ message: "you are not the right user" });
    }
  } catch (error) {
    res.status(500).json({ message: "error while deleting the Event" });
  }
});

module.exports = router;
