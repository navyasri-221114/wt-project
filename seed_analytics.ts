import mongoose from 'mongoose';
import { ApplicationModel } from './backend/src/models/Application.js';
import { JobModel } from './backend/src/models/Job.js';
import { UserModel } from './backend/src/models/User.js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/campus-placement';

async function seedTestData() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('🌱 Seed: Connected to database');

    // 1. Get some existing jobs and users to link to
    const someJob = await JobModel.findOne();
    const someUser = await UserModel.findOne({ role: 'student' });

    if (!someJob || !someUser) {
      console.log('⚠️ Seed: No job or student found to link data. Please create a job and a student first!');
      process.exit(0);
    }

    const testData = [
      {
        job_id: someJob._id,
        student_id: someUser._id,
        status: 'selected',
        placement_year: 2024,
        offered_package: '12 LPA'
      },
      {
        job_id: someJob._id,
        student_id: someUser._id,
        status: 'selected',
        placement_year: 2024,
        offered_package: '15 LPA'
      },
      {
        job_id: someJob._id,
        student_id: someUser._id,
        status: 'selected',
        placement_year: 2025,
        offered_package: '18 LPA'
      }
    ];

    console.log('🌱 Seed: Adding successful placement records...');
    await ApplicationModel.insertMany(testData);

    console.log('✅ Seed Complete! Now refresh your website.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed Failed:', error);
    process.exit(1);
  }
}

seedTestData();
