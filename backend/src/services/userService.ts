import { UserModel } from "../models/User.js";
import { StudentModel } from "../models/Student.js";
import { CompanyModel } from "../models/Company.js";

export const UserService = {
  getUserProfile: async (userId: string, role: string) => {
    try {
      const user = await UserModel.findById(userId).lean();
      if (!user) return null;

      let profile = null;
      if (role === 'student') {
        profile = await StudentModel.findOne({ user_id: userId }).lean();
      } else if (role === 'company') {
        profile = await CompanyModel.findOne({ user_id: userId }).lean();
      }

      return { ...user, profile };
    } catch (error) {
       console.error("Error in getUserProfile:", error);
       return null;
    }
  },

  updateUserProfile: async (userId: string, role: string, data: any) => {
    try {
      const { name, avatar_url, ...profileData } = data;
      
      const updateData: any = {};
      if (name) updateData.name = name;
      if (avatar_url !== undefined) updateData.avatar_url = avatar_url;

      if (Object.keys(updateData).length > 0) {
        await UserModel.findByIdAndUpdate(userId, updateData);
      }

      if (role === 'student' && Object.keys(profileData).length > 0) {
        await StudentModel.findOneAndUpdate(
            { user_id: userId }, 
            profileData, 
            { new: true, upsert: true }
        );
      } else if (role === 'company' && Object.keys(profileData).length > 0) {
        await CompanyModel.findOneAndUpdate(
            { user_id: userId }, 
            profileData, 
            { new: true, upsert: true }
        );
      }
      return true;
    } catch (error) {
      console.error("Error in updateUserProfile:", error);
      return false;
    }
  }
};
