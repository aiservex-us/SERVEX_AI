import { Filter, BarChart3 } from 'lucide-react';

export default function DashboardContent() {
  return (
    <>
      <div className="flex justify-between items-center mb-6">
      
      </div>
    </>
  );
}

function HealthBar({ label, value, color, width }) {
  return (
    <div>
      <div className="flex justify-between text-[11px] mb-1.5">
        <span className="text-[#616161]">{label}</span>
        <span className="font-bold">{value}</span>
      </div>
      <div className="h-1.5 w-full bg-[#F0F0F0] rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-1000" style={{ backgroundColor: color, width }} />
      </div>
    </div>
  );
}