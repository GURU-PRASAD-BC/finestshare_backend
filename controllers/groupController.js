const prisma = require('../config/prismaClient');
const sendInvitationMail = require('../utils/mailer');

// Create a new group
exports.createGroup = async (req, res) => {
    const { groupName, groupType, groupImage, members } = req.body;
  
    if (!groupName || !groupType || !members || members.length === 0) {
      return res.status(400).json({ message: 'Group name, type, and members are required' });
    }
  
    try {
      const defaultGroupImage = "https://s3.amazonaws.com/splitwise/uploads/group/default_avatars/v2021/avatar-blue4-trip-50px.png";

      const newGroup = await prisma.group.create({
        data: {
          groupName,
          groupType,
          groupImage: groupImage || defaultGroupImage,
        },
      });
  
      // Add members to the group
      const groupMembers = members.map((userID) => ({
        userID,
        groupID: newGroup.groupID,
      }));
  
      await prisma.groupMember.createMany({ data: groupMembers });
  
      res.status(201).json({ message: 'Group created successfully', group: newGroup });
    } catch (error) {
      console.error('Error creating group:', error);
      res.status(500).json({ message: 'Failed to create group' });
    }
  };
  
  // Add members to a group
  exports.addMembersToGroup = async (req, res) => {
    const { groupID } = req.params;
    const { members } = req.body;
  
    if (!groupID || !members || members.length === 0) {
      return res.status(400).json({ message: 'Group ID and members are required' });
    }
  
    try {
      const group = await prisma.group.findUnique({ where: { groupID: parseInt(groupID) } });
  
      if (!group) {
        return res.status(404).json({ message: 'Group not found' });
      }
  
      for (const email of members) {
        const user = await prisma.user.findUnique({ where: { email } });
  
        if (user) {
          // Add the user to the group
          await prisma.groupMember.create({
            data: {
              groupID: parseInt(groupID),
              userID: user.userID,
            },
          });
        } else {
          // Send an invitation email to the user
          console.log(`Sending mail to : ${email}`)
          // await sendInvitationMail(email, group.groupName);
        }
      }
  
      res.status(200).json({ message: 'Members added successfully' });
    } catch (error) {
      console.error('Error adding members to group:', error);
      res.status(500).json({ message: 'Failed to add members to group' });
    }
  };

  
// Edit group settings
exports.editGroupSettings = async (req, res) => {
  const { groupID } = req.params;
  const { groupName, groupType, groupImage } = req.body;

  try {
    const group = await prisma.group.findUnique({ where: { groupID: parseInt(groupID) } });
    const defaultGroupImage = "https://s3.amazonaws.com/splitwise/uploads/group/default_avatars/v2021/avatar-blue4-trip-50px.png";

    if (!group || group.createdBy !== req.userID) {
      return res.status(403).json({ message: 'You are not authorized to edit this group' });
    }

    const updatedGroup = await prisma.group.update({
      where: { groupID: parseInt(groupID) },
      data: {
        groupName,
        groupType,
        groupImage: groupImage || group.groupImage || defaultGroupImage, 
      },
    });

    res.status(200).json({ message: 'Group settings updated successfully', group: updatedGroup });
  } catch (error) {
    console.error('Error updating group settings:', error);
    res.status(500).json({ message: 'Failed to update group settings' });
  }
};

// Delete a user from the group
exports.deleteUserFromGroup = async (req, res) => {
  const { groupID, userID } = req.params;

  try {
    const group = await prisma.group.findUnique({ where: { groupID: parseInt(groupID) } });

    if (!group || group.createdBy !== req.userID) {
      return res.status(403).json({ message: 'You are not authorized to remove members from this group' });
    }

    await prisma.groupMember.deleteMany({
      where: { groupID: parseInt(groupID), userID: parseInt(userID) },
    });

    res.status(200).json({ message: 'User removed from the group successfully' });
  } catch (error) {
    console.error('Error removing user from group:', error);
    res.status(500).json({ message: 'Failed to remove user from group' });
  }
};

// Delete the group
exports.deleteGroup = async (req, res) => {
  const { groupID } = req.params;

  try {
    const group = await prisma.group.findUnique({ where: { groupID: parseInt(groupID) } });

    if (!group || group.createdBy !== req.userID) {
      return res.status(403).json({ message: 'You are not authorized to delete this group' });
    }

    const pendingExpenses = await prisma.expenses.findMany({
      where: { groupID: parseInt(groupID) },
    });

    if (pendingExpenses.length > 0) {
      return res.status(400).json({ message: 'Cannot delete the group with pending expenses' });
    }

    await prisma.group.delete({ where: { groupID: parseInt(groupID) } });

    res.status(200).json({ message: 'Group deleted successfully' });
  } catch (error) {
    console.error('Error deleting group:', error);
    res.status(500).json({ message: 'Failed to delete group' });
  }
};
