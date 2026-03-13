export default function HelpPage(){

  return(

    <div className="space-y-6">

      <h1 className="text-2xl font-bold">Help Center</h1>

      <div className="bg-white p-6 border rounded-xl">
        <h3 className="font-bold">How to apply for jobs?</h3>
        <p className="text-sm text-slate-500">
          Go to Job Profiles section and click Apply.
        </p>
      </div>

      <div className="bg-white p-6 border rounded-xl">
        <h3 className="font-bold">How to schedule interviews?</h3>
        <p className="text-sm text-slate-500">
          Companies schedule interviews from their dashboard.
        </p>
      </div>

    </div>

  );
}