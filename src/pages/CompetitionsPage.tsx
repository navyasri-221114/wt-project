import { useState } from "react";

export default function CompetitionsPage(){

  const [competitions] = useState([
    {id:1,name:"Google Hackathon",date:"June 2026"},
    {id:2,name:"Amazon Coding Challenge",date:"July 2026"}
  ]);

  return(

    <div className="space-y-6">

      <h1 className="text-2xl font-bold">Competitions</h1>

      {competitions.map(c=>(
        <div key={c.id} className="bg-white p-6 border rounded-xl">

          <h3 className="font-bold">{c.name}</h3>
          <p className="text-sm text-slate-500">{c.date}</p>

          <button className="mt-3 bg-indigo-600 text-white px-4 py-2 rounded">
            Register
          </button>

        </div>
      ))}

    </div>

  );
}