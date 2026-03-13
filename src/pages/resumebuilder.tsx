import { useState } from "react";

export default function ResumeBuilder(){

  const [form,setForm]=useState({
    name:"",
    email:"",
    skills:"",
    projects:""
  });

  const handleChange=(e:any)=>{
    setForm({...form,[e.target.name]:e.target.value});
  };

  const handleSubmit=(e:any)=>{
    e.preventDefault();
    alert("Resume Data Saved");
  };

  return(

    <div className="max-w-xl space-y-6">

      <h1 className="text-2xl font-bold">Resume Builder</h1>

      <form onSubmit={handleSubmit} className="space-y-4">

        <input
        name="name"
        placeholder="Name"
        className="w-full border p-2 rounded"
        onChange={handleChange}
        />

        <input
        name="email"
        placeholder="Email"
        className="w-full border p-2 rounded"
        onChange={handleChange}
        />

        <textarea
        name="skills"
        placeholder="Skills"
        className="w-full border p-2 rounded"
        onChange={handleChange}
        />

        <textarea
        name="projects"
        placeholder="Projects"
        className="w-full border p-2 rounded"
        onChange={handleChange}
        />

        <button className="bg-indigo-600 text-white px-4 py-2 rounded">
          Save Resume
        </button>

      </form>

    </div>
  );
}