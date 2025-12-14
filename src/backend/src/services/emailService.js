import transporter from "../config/nodemailer.js";
import OTP from "../models/OTP.js";
import crypto from "crypto";

// Generate 6-digit OTP
const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

export const sendOTPEmail = async (email, username) => {
  try {
    await OTP.cleanupOldOTPs(email);

    // Check if there's a recent valid OTP (prevent spam)
    const recentOTP = await OTP.findOne({
      email,
      createdAt: { $gt: new Date(Date.now() - 60 * 1000) }, // Within last 1 minute
    });

    if (recentOTP) {
      return {
        success: false,
        message: "Please wait 1 minute before requesting a new OTP",
        retryAfter: 60,
      };
    }

    const otp = generateOTP();

    await OTP.create({
      email,
      otp_code: otp,
      attempts: 0,
      verified: false,
    });

    const mailOptions = {
      from: `"PLANORA" <${process.env.SENDER_EMAIL}>`,
      to: email,
      subject: "Password Reset OTP - PLANORA",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2563eb; margin: 0;">PLANORA</h1>
          </div>
          
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; color: white; margin-bottom: 20px;">
            <h2 style="margin: 0 0 10px 0;">Password Reset Request</h2>
            <p style="margin: 0; opacity: 0.9;">Hello ${username},</p>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <p style="color: #333; margin: 0 0 15px 0;">You have requested to reset your password. Use the OTP code below:</p>
            <div style="background-color: white; padding: 20px; border-radius: 8px; text-align: center; border: 2px dashed #2563eb;">
              <h1 style="color: #2563eb; font-size: 36px; letter-spacing: 10px; margin: 0; font-weight: bold;">${otp}</h1>
            </div>
          </div>
          
          <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin-bottom: 20px; border-radius: 4px;">
            <p style="margin: 0; color: #856404; font-size: 14px;"><strong>⚠️ Important:</strong></p>
            <ul style="margin: 10px 0 0 0; padding-left: 20px; color: #856404; font-size: 14px;">
              <li>This OTP is valid for <strong>10 minutes</strong></li>
              <li>You have <strong>3 attempts</strong> to enter the correct OTP</li>
              <li>Do not share this code with anyone</li>
            </ul>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <p style="margin: 0; color: #6c757d; font-size: 13px;">
              If you didn't request this password reset, please ignore this email or contact support if you have concerns.
            </p>
          </div>
          
          <hr style="border: none; border-top: 1px solid #e9ecef; margin: 20px 0;"/>
          
          <p style="color: #6c757d; font-size: 12px; text-align: center; margin: 0;">
            This is an automated email from PLANORA. Please do not reply.<br/>
            © 2024 PLANORA. All rights reserved.
          </p>
        </div>
      `,
      text: `PLANORA - Password Reset\n\nHello ${username},\n\nYour OTP for password reset is: ${otp}\n\nThis OTP is valid for 10 minutes and you have 5 attempts.\n\nIf you didn't request this, please ignore this email.\n\n- PLANORA Team`,
    };

    await transporter.sendMail(mailOptions);
    return {
      success: true,
      message: "OTP has been sent to your email",
      expiresIn: 600,
    };
  } catch (error) {
    console.error("Error sending OTP email:", error);
    throw new Error("Failed to send OTP email");
  }
};

export const verifyOTP = async (email, otp_code) => {
  try {
    // Find the most recent valid OTP for this email
    const otpRecord = await OTP.findOne({
      email,
      verified: false,
    }).sort({ createdAt: -1 });

    if (!otpRecord) {
      return {
        success: false,
        message: "No OTP found or OTP has expired. Please request a new one.",
      };
    }

    // Check if OTP is still valid
    if (!otpRecord.isValid()) {
      if (otpRecord.attempts >= 3) {
        return {
          success: false,
          message: "Maximum attempts exceeded. Please request a new OTP",
        };
      }
      if (otpRecord.expiresAt < new Date()) {
        return {
          success: false,
          message: "OTP has expired. Please request a new one",
        };
      }
    }

    await otpRecord.incrementAttempts();

    if (otpRecord.otp_code !== otp_code.trim()) {
      const remainingAttempts = 3 - otpRecord.attempts;
      return {
        success: false,
        message: `Incorrect OTP. ${remainingAttempts} attempt(s) remaining`,
        remainingAttempts,
      };
    }

    await otpRecord.markAsVerified();
    return {
      success: true,
      message: "OTP verified successfully",
    };
  } catch (error) {
    console.error("Error verifying OTP:", error);
    throw new Error("Failed to verify OTP");
  }
};

export const sendCommentNotificationEmail = async (recipients, commentData) => {
  try {
    const { commenterName, issueKey, issueTitle, commentMessage, projectName } = commentData;
    
    const mailOptions = {
      from: `"PLANORA" <${process.env.SENDER_EMAIL}>`,
      bcc: recipients, 
      subject: `New Comment on ${issueKey}: ${issueTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2563eb; margin: 0;">PLANORA</h1>
          </div>
          
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; color: white; margin-bottom: 20px;">
            <h2 style="margin: 0 0 10px 0;">New Comment</h2>
            <p style="margin: 0; opacity: 0.9;">${commenterName} commented on the issue</p>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <p style="color: #666; margin: 0 0 10px 0; font-size: 14px;">
              <strong>Project:</strong> ${projectName}
            </p>
            <p style="color: #666; margin: 0 0 10px 0; font-size: 14px;">
              <strong>Issue:</strong> ${issueKey} - ${issueTitle}
            </p>
            <hr style="border: none; border-top: 1px solid #e9ecef; margin: 15px 0;"/>
            <div style="background-color: white; padding: 15px; border-radius: 8px; border-left: 4px solid #2563eb;">
              <p style="margin: 0; color: #333; white-space: pre-wrap;">${commentMessage}</p>
            </div>
          </div>
          
          <div style="text-align: center; margin: 20px 0;">
            <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}" 
               style="display: inline-block; padding: 12px 30px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">
              View Issue
            </a>
          </div>
          
          <hr style="border: none; border-top: 1px solid #e9ecef; margin: 20px 0;"/>
          
          <p style="color: #6c757d; font-size: 12px; text-align: center; margin: 0;">
            You received this email because you are involved in this issue.<br/>
            © 2024 PLANORA. All rights reserved.
          </p>
        </div>
      `,
      text: `PLANORA - New Comment\n\n${commenterName} commented on ${issueKey}: ${issueTitle}\n\nProject: ${projectName}\n\nComment:\n${commentMessage}\n\n- PLANORA Team`,
    };

    await transporter.sendMail(mailOptions);
    return {
      success: true,
      message: "Comment notification sent successfully",
    };
  } catch (error) {
    console.error("Error sending comment notification:", error);
    throw new Error("Failed to send comment notification email");
  }
};
