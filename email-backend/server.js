const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const PORT = 5000;

// Initialize Gmail SMTP transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD
  }
});

// Verify SMTP connection
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Gmail SMTP connection failed:', error);
  } else {
    console.log('✅ Gmail SMTP ready to send emails');
  }
});

// Initialize Firebase Admin SDK
try {
  const serviceAccount = require('./serviceAccountKey.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  console.log('✅ Firebase Admin initialized');
} catch (error) {
  console.warn('⚠️ Firebase Admin not initialized - delete user from Auth will not work');
  console.warn('Download service account key from Firebase Console to enable this feature');
}

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ message: 'Email backend is running with Gmail SMTP!' });
});

// Send credentials email endpoint
app.post('/api/send-credentials', async (req, res) => {
  try {
    const { email, studentId, password, studentName } = req.body;

    // Validate input
    if (!email || !studentId || !password || !studentName) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    // HTML email content
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #ffffff;
          }
          .header {
            background-color: #105E06;
            color: white;
            padding: 20px;
            text-align: center;
            margin-bottom: 20px;
          }
          .content {
            padding: 20px;
            background-color: #ffffff;
          }
          .credentials {
            background-color: #f5f5f5;
            border-left: 3px solid #105E06;
            padding: 15px;
            margin: 20px 0;
            font-family: monospace;
          }
          .notice {
            background-color: #fffbf0;
            border-left: 3px solid #ff9800;
            padding: 15px;
            margin: 20px 0;
            font-size: 14px;
          }
          .footer {
            text-align: center;
            color: #777;
            font-size: 12px;
            margin-top: 30px;
            padding-top: 15px;
            border-top: 1px solid #ddd;
          }
          a {
            color: #105E06;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>Academia De San Jose</h2>
        </div>
        
        <div class="content">
          <p>Dear ${studentName},</p>
          
          <p>Your student account has been successfully created. You can now access the Student Portal using the credentials below:</p>
          
          <div class="credentials">
            <strong>Student ID:</strong> ${studentId}<br>
            <strong>Temporary Password:</strong> ${password}
          </div>
          
          <p>Login at: <a href="http://localhost:3000">http://localhost:3000</a></p>
          
          <div class="notice">
            <strong>Important Security Notice:</strong><br>
            • Please change your password after your first login<br>
            • Do not share your credentials with anyone<br>
            • Keep this email in a secure location
          </div>
          
          <p>If you have any questions, please contact the admissions office.</p>
          
          <p>Best regards,<br>
          Academia De San Jose Administration Team</p>
        </div>
        
        <div class="footer">
          <p>This is an automated email. Please do not reply to this message.</p>
          <p>© 2025 Academia De San Jose. All rights reserved.</p>
        </div>
      </body>
      </html>
    `;

    // Plain text version
    const textContent = `
Academia De San Jose - Student Account Created

Dear ${studentName},

Your student account has been successfully created. You can now access the Academia De San Jose Student Portal using the credentials below:

STUDENT CREDENTIALS
Student ID: ${studentId}
Temporary Password: ${password}

Login at: http://localhost:3000

IMPORTANT SECURITY NOTICE
- Please change your password after your first login
- Do not share your credentials with anyone
- Keep this email in a secure location

If you have any questions or need assistance, please contact the admissions office.

Best regards,
Academia De San Jose Administration Team

This is an automated email. Please do not reply to this message.
© 2025 Academia De San Jose. All rights reserved.
    `.trim();

    // Send email via Gmail SMTP
    const info = await transporter.sendMail({
      from: '"Academia De San Jose" <' + process.env.GMAIL_USER + '>',
      to: email,
      subject: 'Your Academia De San Jose Student Account',
      text: textContent,
      html: htmlContent
    });

    console.log('✅ Email sent successfully via Gmail:', info.messageId);
    res.json({
      success: true,
      messageId: info.messageId
    });

  } catch (error) {
    console.error('❌ Error sending email:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to send email'
    });
  }
});

// Send staff credentials email endpoint
app.post('/api/send-staff-credentials', async (req, res) => {
  try {
    const { email, staffName, username, password, office } = req.body;

    // Validate input
    if (!email || !staffName || !username || !password || !office) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    // HTML email content
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #ffffff;
          }
          .header {
            background-color: #105E06;
            color: white;
            padding: 20px;
            text-align: center;
            margin-bottom: 20px;
          }
          .content {
            padding: 20px;
            background-color: #ffffff;
          }
          .credentials {
            background-color: #f5f5f5;
            border-left: 3px solid #105E06;
            padding: 15px;
            margin: 20px 0;
            font-family: monospace;
          }
          .notice {
            background-color: #fffbf0;
            border-left: 3px solid #ff9800;
            padding: 15px;
            margin: 20px 0;
            font-size: 14px;
          }
          .footer {
            text-align: center;
            color: #777;
            font-size: 12px;
            margin-top: 30px;
            padding-top: 15px;
            border-top: 1px solid #ddd;
          }
          a {
            color: #105E06;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>Academia De San Jose</h2>
        </div>
        
        <div class="content">
          <p>Dear ${staffName},</p>
          
          <p>Your staff account has been successfully created for the ${office} Office. You can now access the Admin Portal using the credentials below:</p>
          
          <div class="credentials">
            <strong>Username:</strong> ${username}<br>
            <strong>Temporary Password:</strong> ${password}<br>
            <strong>Department:</strong> ${office}
          </div>
          
          <p>Login at: <a href="http://localhost:3001">http://localhost:3001</a></p>
          
          <div class="notice">
            <strong>Important Security Notice:</strong><br>
            • Please change your password after your first login<br>
            • Do not share your credentials with anyone<br>
            • Keep this email in a secure location
          </div>
          
          <p>If you have any questions, please contact the IT support team.</p>
          
          <p>Best regards,<br>
          Academia De San Jose Administration Team</p>
        </div>
        
        <div class="footer">
          <p>This is an automated email. Please do not reply to this message.</p>
          <p>© 2025 Academia De San Jose. All rights reserved.</p>
        </div>
      </body>
      </html>
    `;

    // Plain text version
    const textContent = `
Academia De San Jose - Admin Account Created

Dear ${staffName},

Your staff account has been successfully created for the ${office} Office. You can now access the Academia De San Jose Admin Portal using the credentials below:

STAFF CREDENTIALS
Username: ${username}
Temporary Password: ${password}
Department: ${office}

Login at: http://localhost:3001

IMPORTANT SECURITY NOTICE
- Please change your password after your first login
- Do not share your credentials with anyone
- Keep this email in a secure location

If you have any questions or need assistance, please contact the IT support team.

Best regards,
Academia De San Jose Administration Team

This is an automated email. Please do not reply to this message.
© 2025 Academia De San Jose. All rights reserved.
    `.trim();

    // Send email via Gmail SMTP
    const info = await transporter.sendMail({
      from: '"Academia De San Jose" <' + process.env.GMAIL_USER + '>',
      to: email,
      subject: `Your ${office} Office Admin Account`,
      text: textContent,
      html: htmlContent
    });

    console.log('✅ Staff email sent successfully via Gmail:', info.messageId);
    res.json({
      success: true,
      messageId: info.messageId
    });

  } catch (error) {
    console.error('❌ Error sending staff email:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to send email'
    });
  }
});

// Delete user from Firebase Authentication
app.post('/api/delete-user', async (req, res) => {
  try {
    const { uid } = req.body;

    if (!uid) {
      return res.status(400).json({
        success: false,
        error: 'Missing user UID'
      });
    }

    // Check if Firebase Admin is initialized
    if (!admin.apps || admin.apps.length === 0) {
      return res.status(500).json({
        success: false,
        error: 'Firebase Admin not initialized. Service account key required.'
      });
    }

    // Delete user from Firebase Authentication
    await admin.auth().deleteUser(uid);
    
    console.log('✅ User deleted from Firebase Auth:', uid);

    res.json({
      success: true,
      message: 'User deleted from Firebase Authentication'
    });

  } catch (error) {
    console.error('❌ Error deleting user:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to delete user'
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Email backend running on http://localhost:${PORT}`);
  console.log(`📧 Ready to send emails via Gmail SMTP`);
});
