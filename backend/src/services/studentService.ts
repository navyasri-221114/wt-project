import db from "../config/database.js";

export const StudentService = {
  searchStudents: (filters: { q?: string, branch?: string, college?: string, year?: number, skills?: string, min_cgpa?: number, is_public_only?: boolean }) => {
    let query = `
      SELECT users.id, users.name, users.email, users.avatar_url, student_profiles.*
      FROM users
      JOIN student_profiles ON users.id = student_profiles.user_id
      WHERE users.role = 'student'
    `;
    
    const params: any[] = [];
    
    if (filters.is_public_only) {
      query += " AND student_profiles.is_public = 1";
    }

    if (filters.q) {
      query += " AND (users.name LIKE ? OR student_profiles.skills LIKE ? OR student_profiles.department LIKE ?)";
      params.push(`%${filters.q}%`, `%${filters.q}%`, `%${filters.q}%`);
    }
    if (filters.branch) {
      query += " AND student_profiles.branch LIKE ?";
      params.push(`%${filters.branch}%`);
    }
    if (filters.college) {
      query += " AND student_profiles.college LIKE ?";
      params.push(`%${filters.college}%`);
    }
    if (filters.year) {
      query += " AND student_profiles.year = ?";
      params.push(filters.year);
    }
    if (filters.skills) {
      query += " AND student_profiles.skills LIKE ?";
      params.push(`%${filters.skills}%`);
    }
    if (filters.min_cgpa) {
      query += " AND student_profiles.cgpa >= ?";
      params.push(filters.min_cgpa);
    }

    return db.prepare(query).all(...params);
  },

  getStudentById: (id: number, is_public_only: boolean = false) => {
    const student: any = db.prepare(`
      SELECT users.id, users.name, users.email, users.avatar_url, student_profiles.*
      FROM users
      JOIN student_profiles ON users.id = student_profiles.user_id
      WHERE users.id = ? AND users.role = 'student'
    `).get(id);

    if (!student) return null;
    if (is_public_only && student.is_public === 0) return { error: "This profile is private" };

    return student;
  }
};
