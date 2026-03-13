import db from "../config/database.js";

export interface User {
  id?: number;
  name: string;
  email: string;
  password?: string;
  role: "student" | "company" | "admin";
  avatar_url?: string;
  created_at?: string;
}

export const UserModel = {
  findById: (id: number): User | undefined => {
    return db.prepare("SELECT id, name, email, role, avatar_url, created_at FROM users WHERE id = ?").get(id) as User | undefined;
  },
  findByEmail: (email: string): User | undefined => {
    return db.prepare("SELECT * FROM users WHERE email = ?").get(email) as User | undefined;
  },
  create: (user: User): number | bigint => {
    const info = db.prepare(
      "INSERT INTO users (name, email, password, role, avatar_url) VALUES (?, ?, ?, ?, ?)"
    ).run(user.name, user.email, user.password, user.role, user.avatar_url || null);
    return info.lastInsertRowid;
  },
  updateProfile: (id: number, name: string, avatar_url: string | null): void => {
    db.prepare("UPDATE users SET name = ?, avatar_url = ? WHERE id = ?").run(name, avatar_url, id);
  }
};
