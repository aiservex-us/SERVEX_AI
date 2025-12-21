import { MapPin, SlidersHorizontal, Search } from 'lucide-react';

export const SearchFilters = () => (
  <div className="bg-white p-4 rounded-2xl shadow-sm space-y-4 lg:space-y-0 lg:flex items-center gap-4 mb-8 w-full">
    <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 rounded-xl border flex-1">
      <MapPin size={18} className="text-indigo-600" />
      <select className="bg-transparent text-sm font-semibold border-none focus:ring-0">
        <option>Around You</option>
      </select>
    </div>
    <div className="flex-[2] relative">
      <input type="text" placeholder="Search by Title..." className="w-full pl-4 pr-4 py-3 bg-gray-50 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-200" />
    </div>
    <div className="flex items-center gap-3">
      <button className="flex items-center gap-2 px-6 py-3 border border-indigo-100 rounded-xl text-sm font-bold text-[#3D2C8D] hover:bg-indigo-50"><SlidersHorizontal size={18} /> FILTER</button>
      <button className="flex items-center justify-center px-10 py-3 bg-[#3D2C8D] text-white rounded-xl text-sm font-bold shadow-lg hover:bg-indigo-800 transition-all"><Search size={18} className="mr-2" /> FIND</button>
    </div>
  </div>
);