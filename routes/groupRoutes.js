const express = require('express');
const {
  createGroup,
  addMembersToGroup,
  editGroupSettings,
  deleteUserFromGroup,
  deleteGroup,
} = require('../controllers/groupController');
const validateUser = require('../middlewares/validateUser'); // Middleware for user validation

const router = express.Router();

// Create a new group
router.post('/create', validateUser, createGroup);

// Add members to a group
router.post('/:groupID/members', validateUser, addMembersToGroup);

// Edit group settings
router.put('/:groupID/settings', validateUser, editGroupSettings);

// Delete a user from the group
router.delete('/:groupID/members/:userID', validateUser, deleteUserFromGroup);

// Delete the group
router.delete('/:groupID', validateUser, deleteGroup);

module.exports = router;
