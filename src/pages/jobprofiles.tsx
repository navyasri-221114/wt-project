import { useState } from "react";

export default function JobProfiles() {

  const [jobs, setJobs] = useState([
    { id: 1, title: "Frontend Developer", company: "Google", location: "Bangalore" },
    { id: 2, title: "Backend Developer", company: "Amazon", location: "Hyderabad" },
    { id: 3, title: "Full Stack Developer", company: "Microsoft", location: "Remote" }
  ]);

  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");

  const addJob = () => {

    if (!title || !company || !location) return;

    const newJob = {
      id: jobs.length + 1,
      title,
      company,
      location
    };

    setJobs([...jobs, newJob]);

    setTitle("");
    setCompany("");
    setLocation("");
  };

  return (

    <div className="p-8 space-y-8">

      <h1 className="text-3xl font-bold text-slate-800">
        Job Profiles
      </h1>

      {/* Job Input Form */}
      <div className="bg-white p-6 rounded-xl border shadow space-y-4 max-w-xl">

        <input
          className="border p-2 w-full rounded"
          placeholder="Job Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <input
          className="border p-2 w-full rounded"
          placeholder="Company"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
        />

        <input
          className="border p-2 w-full rounded"
          placeholder="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />

        <button
          onClick={addJob}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg"
        >
          Add Job
        </button>

      </div>

      {/* Job Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

        {jobs.map((job) => (

          <div key={job.id} className="bg-white p-6 rounded-xl border shadow">

            <h3 className="font-bold text-lg">
              {job.title}
            </h3>

            <p className="text-sm text-slate-500">
              {job.company}
            </p>

            <p className="text-sm text-slate-500">
              {job.location}
            </p>

            <button className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg">
              Apply
            </button>

          </div>

        ))}

      </div>

    </div>

  );
}