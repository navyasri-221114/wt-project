import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UserModel } from "../models/User.js";
import { StudentModel } from "../models/Student.js";
import { CompanyModel } from "../models/Company.js";
import { ActivationKeyModel } from "../models/ActivationKey.js";

const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key";

export const authController = {
  signup: async (req: Request, res: Response) => {
    const { name, email, password, role, activationKey } = req.body;

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
      const token = jwt.sign(
        { id: "0", role: 'admin', name: 'System Admin', email: ADMIN_EMAIL }, 
        JWT_SECRET
      );
      return res.json({ 
        token, 
        user: { id: "0", name: 'System Admin', email: ADMIN_EMAIL, role: 'admin' } 
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
