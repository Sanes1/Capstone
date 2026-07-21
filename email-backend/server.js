const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
require('dotenv').config();

const app = express();
const PORT = 5000;

// Initialize Firebase Admin SDK
// You need to download the service account key from Firebase Console
// Go to: Project Settings > Service Accounts > Generate New Private Key
// Save it as 'serviceAccountKey.json' in this directory
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
  res.json({ message: 'Email backend is running!' });
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

    // Email HTML content
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: 'Inter', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #1a6b0f 0%, #105E06 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 8px 8px 0 0;
          }
          .content {
            background-color: #f9f9f9;
            padding: 30px;
            border-radius: 0 0 8px 8px;
          }
          .credentials-box {
            background-color: white;
            border: 2px solid #105E06;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
          }
          .credential-row {
            margin: 15px 0;
          }
          .credential-label {
            font-weight: 600;
            color: #666;
            font-size: 14px;
          }
          .credential-value {
            font-size: 18px;
            color: #105E06;
            font-weight: bold;
            font-family: 'Courier New', monospace;
          }
          .warning-box {
            background-color: #fff3e0;
            border-left: 4px solid #ff9800;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .login-button {
            display: inline-block;
            background-color: #105E06;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            margin: 20px 0;
          }
          .footer {
            text-align: center;
            color: #999;
            font-size: 12px;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Welcome to Academia De San Jose!</h1>
        </div>
        
        <div class="content">
          <p>Dear <strong>${studentName}</strong>,</p>
          
          <p>Your student account has been successfully created. You can now access the Academia De San Jose Student Portal using the credentials below:</p>
          
          <div class="credentials-box">
            <div class="credential-row">
              <div class="credential-label">Student ID</div>
              <div class="credential-value">${studentId}</div>
            </div>
            
            <div class="credential-row">
              <div class="credential-label">Temporary Password</div>
              <div class="credential-value">${password}</div>
            </div>
          </div>
          
          <div style="text-align: center;">
            <a href="http://localhost:3000" class="login-button">Login to Student Portal</a>
          </div>
          
          <div class="warning-box">
            <strong>⚠️ Important Security Notice:</strong>
            <ul style="margin: 10px 0;">
              <li>Please change your password immediately after your first login</li>
              <li>Do not share your credentials with anyone</li>
              <li>Keep this email in a secure location</li>
            </ul>
          </div>
          
          <p>If you have any questions or need assistance, please contact the admissions office.</p>
          
          <p>Best regards,<br>
          <strong>Academia De San Jose Administration Team</strong></p>
        </div>
        
        <div class="footer">
          <p>This is an automated email. Please do not reply to this message.</p>
          <p>&copy; 2025 Academia De San Jose. All rights reserved.</p>
        </div>
      </body>
      </html>
    `;

    // Prepare email data for Brevo API
    const emailData = {
      sender: {
        name: "Academia De San Jose",
        email: "theangsanes@gmail.com"  // Using your verified sender
      },
      to: [
        {
          email: email,
          name: studentName
        }
      ],
      subject: "Your Academia De San Jose Account Credentials",
      htmlContent: htmlContent
    };

    // Send email via Brevo API
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': process.env.BREVO_API_KEY,
        'content-type': 'application/json'
      },
      body: JSON.stringify(emailData)
    });

    const result = await response.json();

    if (response.ok) {
      console.log('✅ Email sent successfully:', result);
      res.json({
        success: true,
        messageId: result.messageId
      });
    } else {
      console.error('❌ Brevo API error:');
      console.error('Status:', response.status);
      console.error('Response:', result);
      throw new Error(result.message || result.code || 'Failed to send email');
    }

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

    // Email HTML content for staff
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: 'Inter', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #1a6b0f 0%, #105E06 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 8px 8px 0 0;
          }
          .content {
            background-color: #f9f9f9;
            padding: 30px;
            border-radius: 0 0 8px 8px;
          }
          .credentials-box {
            background-color: white;
            border: 2px solid #105E06;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
          }
          .credential-row {
            margin: 15px 0;
          }
          .credential-label {
            font-weight: 600;
            color: #666;
            font-size: 14px;
          }
          .credential-value {
            font-size: 18px;
            color: #105E06;
            font-weight: bold;
            font-family: 'Courier New', monospace;
          }
          .warning-box {
            background-color: #fff3e0;
            border-left: 4px solid #ff9800;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .login-button {
            display: inline-block;
            background-color: #105E06;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            margin: 20px 0;
          }
          .footer {
            text-align: center;
            color: #999;
            font-size: 12px;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Welcome to the Admin Team!</h1>
        </div>
        
        <div class="content">
          <p>Dear <strong>${staffName}</strong>,</p>
          
          <p>Your staff account has been successfully created for the <strong>${office} Office</strong>. You can now access the Academia De San Jose Admin Portal using the credentials below:</p>
          
          <div class="credentials-box">
            <div class="credential-row">
              <div class="credential-label">Username</div>
              <div class="credential-value">${username}</div>
            </div>
            
            <div class="credential-row">
              <div class="credential-label">Temporary Password</div>
              <div class="credential-value">${password}</div>
            </div>
            
            <div class="credential-row">
              <div class="credential-label">Department</div>
              <div class="credential-value">${office}</div>
            </div>
          </div>
          
          <div style="text-align: center;">
            <a href="http://localhost:3001" class="login-button">Login to Admin Portal</a>
          </div>
          
          <div class="warning-box">
            <strong>⚠️ Important Security Notice:</strong>
            <ul style="margin: 10px 0;">
              <li>Please change your password immediately after your first login</li>
              <li>Do not share your credentials with anyone</li>
              <li>Keep this email in a secure location</li>
            </ul>
          </div>
          
          <p>If you have any questions or need assistance, please contact the IT support team.</p>
          
          <p>Best regards,<br>
          <strong>Academia De San Jose Administration Team</strong></p>
        </div>
        
        <div class="footer">
          <p>This is an automated email. Please do not reply to this message.</p>
          <p>&copy; 2025 Academia De San Jose. All rights reserved.</p>
        </div>
      </body>
      </html>
    `;

    // Prepare email data for Brevo API
    const emailData = {
      sender: {
        name: "Academia De San Jose",
        email: "theangsanes@gmail.com"
      },
      to: [
        {
          email: email,
          name: staffName
        }
      ],
      subject: `Your ${office} Office Admin Account Credentials`,
      htmlContent: htmlContent
    };

    // Send email via Brevo API
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': process.env.BREVO_API_KEY,
        'content-type': 'application/json'
      },
      body: JSON.stringify(emailData)
    });

    const result = await response.json();

    if (response.ok) {
      console.log('✅ Staff email sent successfully:', result);
      res.json({
        success: true,
        messageId: result.messageId
      });
    } else {
      console.error('❌ Brevo API error:', result);
      throw new Error(result.message || result.code || 'Failed to send email');
    }

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
    if (!admin.apps.length) {
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
  console.log(`📧 Ready to send emails via Brevo`);
});
