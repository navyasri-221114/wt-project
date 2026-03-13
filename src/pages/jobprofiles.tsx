import { useState } from "react";

export default function JobProfiles() {

  const jobsData = [
    {
      id: 1,
      title: "Frontend Developer",
      company: "Google",
      location: "Bangalore",
      type: "Full Time",
      skills: ["React", "TypeScript"]
    },
    {
      id: 2,
      title: "Backend Developer",
      company: "Amazon",
      location: "Hyderabad",
      type: "Full Time",
      skills: ["Node.js", "AWS"]
    },
    {
      id: 3,
      title: "Full Stack Developer",
      company: "Microsoft",
      location: "Remote",
      type: "Remote",
      skills: ["React", "Node.js"]
    },
    {
      id: 4,
      title: "UI/UX Designer",
      company: "Adobe",
      location: "Bangalore",
      type: "Hybrid",
      skills: ["Figma", "Design Systems"]
    }
  ];

  const [search, setSearch] = useState("");
  const [locationFilter, setLocationFilter] = useState("");

  const filteredJobs = jobsData.filter((job) =>
    job.title.toLowerCase().includes(search.toLowerCase()) &&
    job.location.toLowerCase().includes(locationFilter.toLowerCase())
  );

  return (
    <div className="p-8 space-y-8">

      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Job Profiles</h1>
        <p className="text-slate-500">
          Explore opportunities from top companies
        </p>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col md:flex-row gap-4">

        <input
          type="text"
          placeholder="Search job title..."
          className="border rounded-lg p-3 w-full"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <input
          type="text"
          placeholder="Filter by location..."
          className="border rounded-lg p-3 w-full"
          value={locationFilter}
          onChange={(e) => setLocationFilter(e.target.value)}
        />

      </div>

      {/* Job Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

        {filteredJobs.map((job) => (

          <div
            key={job.id}
            className="bg-white p-6 rounded-xl border shadow-sm hover:shadow-md transition"
          >

            <h3 className="text-lg font-semibold text-slate-800">
              {job.title}
            </h3>

            <p className="text-slate-600">{job.company}</p>

            <p className="text-sm text-slate-500">{job.location}</p>

            <div className="flex flex-wrap gap-2 mt-3">
              {job.skills.map((skill, index) => (
                <span
                  key={index}
                  className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded"
                >
                  {skill}
                </span>
              ))}
            </div>

            <div className="flex gap-3 mt-5">

              <button className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                Apply
              </button>

              <button className="px-4 py-2 border rounded-lg hover:bg-gray-100">
                Save
              </button>

            </div>

          </div>

        ))}

      </div>

    </div>
  );
}