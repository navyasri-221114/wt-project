import { UserModel, User } from "../models/User.js";
import { StudentModel } from "../models/Student.js";
import { CompanyModel } from "../models/Company.js";

export const UserService = {
  getUserProfile: (userId: number, role: string) => {
    const user = UserModel.findById(userId);
    if (!user) return null;

    let profile = null;
    if (role === 'student') {
      profile = StudentModel.findByUserId(userId);
    } else if (role === 'company') {
      profile = CompanyModel.findByUserId(userId);
    }

    return { ...user, profile };
  },

  updateUserProfile: (userId: number, role: string, data: any) => {
    const { name, avatar_url, ...profileData } = data;
    UserModel.updateProfile(userId, name, avatar_url);

    if (role === 'student') {
      StudentModel.updateProfile(userId, profileData);
    } else if (role === 'company') {
      CompanyModel.updateProfile(userId, profileData);
    }
  }
};
