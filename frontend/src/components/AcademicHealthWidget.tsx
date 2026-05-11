'use client';
export default function AcademicHealthWidget({ data }: { data: any }) {
  if (!data) return null;
  const colors = {
    "Excellent": "bg-green-100 text-green-800 border-green-200",
    "Stable": "bg-blue-100 text-blue-800 border-blue-200",
    "Needs Attention": "bg-orange-100 text-orange-800 border-orange-200",
    "Critical": "bg-red-100 text-red-800 border-red-200"
  };
  const colorClass = colors[data.status as keyof typeof colors] || "bg-gray-100 border-gray-200";
  return (
    <div className={`p-6 rounded-2xl border shadow-sm ${colorClass}`}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-2xl">❤️‍🩹</span>
        <h3 className="font-bold opacity-90">Academic Health</h3>
      </div>
      <p className="text-2xl font-black mb-1">{data.status}</p>
      <p className="text-sm opacity-80">{data.description}</p>
    </div>
  );
}
