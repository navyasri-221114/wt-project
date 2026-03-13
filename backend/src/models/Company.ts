import db from "../config/database.js";

export interface CompanyProfile {
  user_id: number;
  description?: string;
  website?: string;
  location?: string;
}

export const CompanyModel = {
  findByUserId: (userId: number): CompanyProfile | undefined => {
    return db.prepare("SELECT * FROM companies WHERE user_id = ?").get(userId) as CompanyProfile | undefined;
  },
  createEmptyProfile: (userId: number): void => {
    db.prepare("INSERT INTO companies (user_id) VALUES (?)").run(userId);
  },
  updateProfile: (userId: number, profile: Partial<CompanyProfile>): void => {
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
      const query = `UPDATE companies SET ${fields.join(", ")} WHERE user_id = ?`;
      db.prepare(query).run(...values);
    }
  }
};
