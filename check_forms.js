import mongoose from "mongoose";
import { CompanyModel } from "./backend/src/models/Company.js";
import dotenv from "dotenv";
dotenv.config({ path: "./backend/.env" });

mongoose.connect(process.env.MONGODB_URI).then(async () => {
    const companies = await CompanyModel.find({});
    console.log(JSON.stringify(companies.map(c => c.custom_form), null, 2));
    process.exit(0);
});
