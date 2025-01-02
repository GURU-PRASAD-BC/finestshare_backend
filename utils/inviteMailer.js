const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'Gmail', 
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS, 
  },
});

const sendInvitationMail = async (recipientEmail, groupName) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: recipientEmail,
    subject: `You're invited to join the group "${groupName}" on Splitwise!`,
    html: `
      <h1>Join the Group: ${groupName}</h1>
      <p>You have been invited to join the group <strong>${groupName}</strong> on Splitwise.</p>
      <p>Click <a href="http://localhost:3000/signup">here</a> to sign up and join the group.</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Invitation sent to ${recipientEmail}`);
  } catch (error) {
    console.error(`Failed to send invitation to ${recipientEmail}:`, error);
  }
};

module.exports = sendInvitationMail;
