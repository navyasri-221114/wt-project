import { Response } from "express";
import { AuthRequest } from "../middleware/auth.js";
import { CompetitionModel } from "../models/Competition.js";

export const competitionController = {
  create: async (req: AuthRequest, res: Response) => {
    if (req.user?.role !== 'admin' && req.user?.role !== 'company') {
      return res.status(403).json({ error: "Only admins or TPOs can create competitions" });
    }
    try {
      const competition = await CompetitionModel.create(req.body);
      res.json({ message: "Competition created", competition });
    } catch (err: any) {
      res.status(500).json({ error: "Failed to create competition", details: err.message });
    }
  },

  getAll: async (req: AuthRequest, res: Response) => {
    try {
      const competitions = await CompetitionModel.find().sort({ created_at: -1 });
      res.json(competitions);
    } catch (err: any) {
      res.status(500).json({ error: "Failed to fetch competitions", details: err.message });
    }
  },

  delete: async (req: AuthRequest, res: Response) => {
    if (req.user?.role !== 'admin' && req.user?.role !== 'company') {
      return res.status(403).json({ error: "Forbidden" });
    }
    const { id } = req.params;
    try {
      await CompetitionModel.findByIdAndDelete(id);
      res.json({ message: "Competition deleted" });
    } catch (err: any) {
      res.status(500).json({ error: "Failed to delete competition", details: err.message });
    }
  }
};
