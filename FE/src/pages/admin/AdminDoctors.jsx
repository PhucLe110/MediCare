import React, { useState } from 'react';
import { Search, Plus, MoreVertical, Stethoscope } from 'lucide-react';

export default function AdminDoctors() {
  const [doctors] = useState([
    { id: '1', name: 'BS. Hoàng Minh Hương', spec: 'Da liễu', patients: 1450, rating: 4.9 },
    { id: '2', name: 'BS. Nguyễn Văn A', spec: 'Tim mạch', patients: 850, rating: 4.8 },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-2xl font-black text-slate-800">Quản lý Bác sĩ & Chuyên khoa</h2>
          <p className="text-slate-500 font-medium mt-1">Quản lý danh sách bác sĩ, thêm chuyên khoa và phân công công việc.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 shadow-sm">
            Quản lý chuyên khoa
          </button>
          <button className="px-5 py-2.5 bg-indigo-600 text-white font-bold rounded-xl flex items-center gap-2 hover:bg-indigo-700 shadow-lg shadow-indigo-600/20">
            <Plus size={18} /> Thêm Bác sĩ
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-bold">
              <th className="p-4 pl-6">Bác sĩ</th>
              <th className="p-4">Chuyên khoa</th>
              <th className="p-4">Số ca khám</th>
              <th className="p-4">Đánh giá</th>
              <th className="p-4 text-right pr-6">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {doctors.map(d => (
              <tr key={d.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="p-4 pl-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                      <Stethoscope size={18} />
                    </div>
                    <span className="font-bold text-slate-800">{d.name}</span>
                  </div>
                </td>
                <td className="p-4"><span className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-full">{d.spec}</span></td>
                <td className="p-4 font-bold text-slate-600">{d.patients}</td>
                <td className="p-4 font-bold text-emerald-600">{d.rating}/5.0</td>
                <td className="p-4 pr-6 text-right">
                  <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors rounded-lg hover:bg-indigo-50"><MoreVertical size={18}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
