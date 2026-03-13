import { useState } from "react";

export default function ResumeBuilder() {

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    linkedin: "",
    github: "",
    objective: "",
    education: "",
    technicalSkills: "",
    softSkills: "",
    projects: "",
    internships: "",
    certifications: "",
    achievements: "",
    activities: "",
    languages: "",
    hobbies: "",
    declaration: "",
    references: ""
  });

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    localStorage.setItem("resumeData", JSON.stringify(form));
    alert("Resume saved successfully");
  };

  return (

    <div className="grid md:grid-cols-2 gap-10 p-8">

      {/* Resume Builder Form */}
      <form onSubmit={handleSubmit} className="space-y-6">

        <h1 className="text-3xl font-bold">Resume Builder</h1>

        <input name="name" value={form.name} onChange={handleChange} placeholder="Full Name" className="w-full border p-2 rounded" />
        <input name="phone" value={form.phone} onChange={handleChange} placeholder="Phone Number" className="w-full border p-2 rounded" />
        <input name="email" value={form.email} onChange={handleChange} placeholder="Email" className="w-full border p-2 rounded" />
        <input name="linkedin" value={form.linkedin} onChange={handleChange} placeholder="LinkedIn Profile" className="w-full border p-2 rounded" />
        <input name="github" value={form.github} onChange={handleChange} placeholder="GitHub Profile" className="w-full border p-2 rounded" />

        <textarea name="objective" value={form.objective} onChange={handleChange} placeholder="Career Objective" className="w-full border p-2 rounded" />
        <textarea name="education" value={form.education} onChange={handleChange} placeholder="Educational Qualifications" className="w-full border p-2 rounded" />
        <textarea name="technicalSkills" value={form.technicalSkills} onChange={handleChange} placeholder="Technical Skills" className="w-full border p-2 rounded" />
        <textarea name="softSkills" value={form.softSkills} onChange={handleChange} placeholder="Soft Skills" className="w-full border p-2 rounded" />
        <textarea name="projects" value={form.projects} onChange={handleChange} placeholder="Projects" className="w-full border p-2 rounded" />
        <textarea name="internships" value={form.internships} onChange={handleChange} placeholder="Internships / Work Experience" className="w-full border p-2 rounded" />
        <textarea name="certifications" value={form.certifications} onChange={handleChange} placeholder="Certifications" className="w-full border p-2 rounded" />
        <textarea name="achievements" value={form.achievements} onChange={handleChange} placeholder="Achievements / Awards" className="w-full border p-2 rounded" />
        <textarea name="activities" value={form.activities} onChange={handleChange} placeholder="Extracurricular Activities" className="w-full border p-2 rounded" />
        <textarea name="languages" value={form.languages} onChange={handleChange} placeholder="Languages Known" className="w-full border p-2 rounded" />
        <textarea name="hobbies" value={form.hobbies} onChange={handleChange} placeholder="Hobbies / Interests" className="w-full border p-2 rounded" />
        <textarea name="declaration" value={form.declaration} onChange={handleChange} placeholder="Declaration" className="w-full border p-2 rounded" />
        <textarea name="references" value={form.references} onChange={handleChange} placeholder="References" className="w-full border p-2 rounded" />

        {/* Save Button */}
        <button
          type="submit"
          className="bg-indigo-600 text-white px-5 py-2 rounded hover:bg-indigo-700"
        >
          Save Resume
        </button>

      </form>


      {/* Resume Preview */}
      <div className="bg-white border rounded-xl shadow p-6 space-y-4">

        <h2 className="text-2xl font-bold border-b pb-2">
          Resume Preview
        </h2>

        <p><strong>Name:</strong> {form.name}</p>
        <p><strong>Phone Number:</strong> {form.phone}</p>
        <p><strong>Email:</strong> {form.email}</p>
        <p><strong>LinkedIn:</strong> {form.linkedin}</p>
        <p><strong>GitHub:</strong> {form.github}</p>

        <Section title="Career Objective" value={form.objective} />
        <Section title="Educational Qualifications" value={form.education} />
        <Section title="Technical Skills" value={form.technicalSkills} />
        <Section title="Soft Skills" value={form.softSkills} />
        <Section title="Projects" value={form.projects} />
        <Section title="Internships / Work Experience" value={form.internships} />
        <Section title="Certifications" value={form.certifications} />
        <Section title="Achievements / Awards" value={form.achievements} />
        <Section title="Extracurricular Activities" value={form.activities} />
        <Section title="Languages Known" value={form.languages} />
        <Section title="Hobbies / Interests" value={form.hobbies} />
        <Section title="Declaration" value={form.declaration} />
        <Section title="References" value={form.references} />

      </div>

    </div>
  );
}

function Section({ title, value }: { title: string, value: string }) {

  if (!value) return null;

  return (
    <div>
      <h3 className="font-semibold mt-4">{title}</h3>
      <p className="text-sm text-slate-600 whitespace-pre-line">{value}</p>
    </div>
  );
}