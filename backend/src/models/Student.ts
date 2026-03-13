import db from "../config/database.js";

export interface StudentProfile {
  user_id: number;
  department?: string;
  branch?: string;
  college?: string;
  year?: number;
  cgpa?: number;
  skills?: string;
  certifications?: string;
  projects?: string;
  resume_url?: string;
  linkedin_url?: string;
  github_url?: string;
  is_public?: number;
}

export const StudentModel = {
  findByUserId: (userId: number): StudentProfile | undefined => {
    return db.prepare("SELECT * FROM student_profiles WHERE user_id = ?").get(userId) as StudentProfile | undefined;
  },
  createEmptyProfile: (userId: number): void => {
    db.prepare("INSERT INTO student_profiles (user_id) VALUES (?)").run(userId);
  },
  updateProfile: (userId: number, profile: Partial<StudentProfile>): void => {
    const fields = [];
    const values = [];
    for (const [key, value] of Object.entries(profile)) {
      if (key !== 'user_id') {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    }
    
    if (fields.length > 0) {
      values.push(userId);
      const query = `UPDATE student_profiles SET ${fields.join(", ")} WHERE user_id = ?`;
      db.prepare(query).run(...values);
    }
  }
};
