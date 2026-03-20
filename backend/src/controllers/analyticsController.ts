import { Request, Response } from 'express';
import { ApplicationModel } from '../models/Application.js';
import { JobModel } from '../models/Job.js';

export const getPlacementAnalytics = async (req: Request, res: Response) => {
  try {
    const { year } = req.query;
    
    // 1. Build query for selected students
    const query: any = { status: 'selected' };
    if (year) {
      query.placement_year = Number(year);
    }

    // 2. Fetch placements with populated Job and Company info
    const placements = await ApplicationModel.find(query)
      .populate({
        path: 'job_id',
        populate: { path: 'company_id', select: 'name' }
      })
      .populate('student_id', 'name email');

    // 3. Process data for the year-wise report
    const statsByYear: any = {};

    placements.forEach((p: any) => {
      const pYear = p.placement_year || new Date(p.created_at).getFullYear();
      const company = p.job_id?.company_id;
      const companyName = company?.name || 'Unknown Company';
      const companyId = company?._id?.toString() || 'unknown';

      if (!statsByYear[pYear]) {
        statsByYear[pYear] = {
          year: pYear,
          totalStudents: 0,
          totalCompanies: new Set(),
          companies: {}
        };
      }

      statsByYear[pYear].totalStudents += 1;
      statsByYear[pYear].totalCompanies.add(companyId);

      if (!statsByYear[pYear].companies[companyId]) {
        statsByYear[pYear].companies[companyId] = {
          name: companyName,
          count: 0,
          package: p.offered_package || p.job_id?.salary || 'N/A'
        };
      }
      statsByYear[pYear].companies[companyId].count += 1;
    });

    // 4. Transform into a clean array for the frontend
    const result = Object.values(statsByYear).map((item: any) => ({
      year: item.year,
      totalStudents: item.totalStudents,
      totalCompanies: item.totalCompanies.size,
      companyBreakdown: Object.values(item.companies)
    })).sort((a, b) => b.year - a.year);

    res.json(result);
  } catch (error: any) {
    console.error('Analytics Error:', error);
    res.status(500).json({ message: 'Error fetching analytics', error: error.message });
  }
};
