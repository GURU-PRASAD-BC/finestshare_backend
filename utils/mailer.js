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
      <br />
      <img src="https://assets.splitwise.com/assets/pro/logo-337b1a7d372db4b56c075c7893d68bfc6873a65d2f77d61b27cb66b6d62c976c.svg" alt="Splitwise App" style="width:300px;height:auto;"/>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Invitation sent to ${recipientEmail}`);
  } catch (error) {
    console.error(`Failed to send invitation to ${recipientEmail}:`, error);
  }
};

const sendMail = async (options) => {
  try {
    await transporter.sendMail(options);
    console.log(`Email sent to ${options.to}`);
  } catch (error) {
    console.error(`Failed to send email to ${options.to}:`, error);
  }
};


module.exports = {sendInvitationMail,sendMail};
