import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UserModel } from "../models/User.js";
import { StudentModel } from "../models/Student.js";
import { CompanyModel } from "../models/Company.js";
import { ActivationKeyModel } from "../models/ActivationKey.js";
import { OTPModel } from "../models/OTP.js";
import { sendEmail } from "../utils/sendEmail.js";
const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key";

export const authController = {
  sendOtp: async (req: Request, res: Response) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    // Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    try {
      // Store in DB (replaces any old OTPs for the same email)
      await OTPModel.deleteMany({ email });
      await OTPModel.create({ email, otp });

      const emailHtml = `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;">
          <h2 style="color:#0ea5e9;">PlaceOn Verification</h2>
          <p>Your one-time verification code is:</p>
          <h1 style="letter-spacing:0.5em;font-size:2.5rem;color:#0f172a;">${otp}</h1>
          <p style="color:#64748b;">This code expires in 5 minutes. Do not share it with anyone.</p>
        </div>`;
      await sendEmail(email, "Your PlaceOn OTP", emailHtml, `Your OTP is: ${otp}`);
      console.log(`[DEV] OTP for ${email}: ${otp}`);

      res.status(200).json({ message: "OTP sent successfully" });
    } catch (err: any) {
      console.error("Failed to send OTP:", err);
      res.status(500).json({ error: "Failed to send OTP", details: err.message });
    }
  },

  signup: async (req: Request, res: Response) => {
    const { name, email, password, role, activationKey, otp } = req.body;

    // OTP check for BOTH student and company signups
    if (role === 'student' || role === 'company') {
      if (!otp) {
        return res.status(400).json({ error: "OTP verification is required." });
      }
      const otpRecord = await OTPModel.findOne({ email }).sort({ createdAt: -1 });
      if (!otpRecord || otpRecord.otp !== otp) {
        return res.status(400).json({ error: "Invalid or expired OTP." });
      }
    }

    if (role === 'company') {
      if (!activationKey) {
        return res.status(400).json({ error: "Activation key is required for companies" });
      }
      const keyData = await ActivationKeyModel.findOne({ key: activationKey, status: 'active' });
      if (!keyData) {
        return res.status(400).json({ error: "Invalid or inactive activation key" });
      }
      // Mark key as used
      keyData.status = 'used';
      keyData.assigned_to = email;
      await keyData.save();
    }

    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const existingUser = await UserModel.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: "Email already exists" });
      }

      const newUser = await UserModel.create({
        name,
        email,
        password: hashedPassword,
        role
      });

      if (role === 'student') {
        await StudentModel.create({ user_id: newUser._id });
      } else if (role === 'company') {
        await CompanyModel.create({ user_id: newUser._id });
        await OTPModel.deleteMany({ email }); // Clear used OTPs
      }

      const token = jwt.sign(
        { id: newUser._id.toString(), role, name, email }, 
        JWT_SECRET
      );
      
      res.json({ 
        token, 
        user: { id: newUser._id.toString(), name, email, role } 
      });
    } catch (err: any) {
      res.status(400).json({ error: "Signup failed", details: err.message });
    }
  },

  login: async (req: Request, res: Response) => {
    const email = req.body.email || req.body.adminId;
    const password = req.body.password;

    // Hardcoded Admin Login (as per server.ts)
    const ADMIN_EMAIL = "admin@college.com";
    const ADMIN_PASS = "admin123";

    if (email === ADMIN_EMAIL && password === ADMIN_PASS) {
      const validAdminId = "000000000000000000000000"; // Valid ObjectId hex
      const token = jwt.sign(
        { id: validAdminId, role: 'admin', name: 'System Admin', email: ADMIN_EMAIL }, 
        JWT_SECRET
      );
      return res.json({ 
        token, 
        user: { id: validAdminId, name: 'System Admin', email: ADMIN_EMAIL, role: 'admin' } 
      });
    }



    try {
      const user = await UserModel.findOne({ email });
      if (!user || !(await bcrypt.compare(password, user.password || ""))) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      const token = jwt.sign(
        { id: user._id.toString(), role: user.role, name: user.name, email: user.email }, 
        JWT_SECRET
      );
      
      res.json({ 
        token, 
        user: { 
          id: user._id.toString(), 
          name: user.name, 
          email: user.email, 
          role: user.role, 
          avatar_url: user.avatar_url 
        } 
      });
    } catch (err: any) {
      res.status(500).json({ error: "Login failed", details: err.message });
    }
  }
};
