import { useState } from "react";

export default function InterviewsPage(){

  const [interviews] = useState([
    {id:1,company:"Google",role:"Frontend Developer",date:"20 May 2026"},
    {id:2,company:"Amazon",role:"Backend Developer",date:"25 May 2026"}
  ]);

  return(

    <div className="space-y-6">

      <h1 className="text-2xl font-bold">Interviews</h1>

      {interviews.map(i=>(
        <div key={i.id} className="bg-white p-6 border rounded-xl">

          <h3 className="font-bold">{i.company}</h3>
          <p>{i.role}</p>
          <p className="text-sm text-slate-500">{i.date}</p>

          <button className="mt-3 bg-indigo-600 text-white px-4 py-2 rounded">
            Join Interview
          </button>

        </div>
      ))}

    </div>

  );
}