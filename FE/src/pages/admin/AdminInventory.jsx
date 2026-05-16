import React from 'react';
import { Pill, AlertCircle, Plus, Search } from 'lucide-react';

export default function AdminInventory() {
  const inventory = [
    { id: 1, name: 'Paracetamol 500mg', stock: 1200, unit: 'Viên', expiry: '2025-12-01', status: 'normal' },
    { id: 2, name: 'Amoxicillin 250mg', stock: 50, unit: 'Viên', expiry: '2026-06-15', status: 'low' },
    { id: 3, name: 'Vitamin C 1000mg', stock: 300, unit: 'Lọ', expiry: '2024-08-10', status: 'expiring' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-2xl font-black text-slate-800">Quản lý Thuốc & Kho Y tế</h2>
          <p className="text-slate-500 font-medium mt-1">Kiểm soát danh mục thuốc, cảnh báo hết hạn và tồn kho.</p>
        </div>
        <button className="px-5 py-2.5 bg-indigo-600 text-white font-bold rounded-xl flex items-center gap-2 hover:bg-indigo-700 shadow-lg shadow-indigo-600/20">
          <Plus size={18} /> Nhập kho
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input type="text" placeholder="Tìm kiếm thuốc..." className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium w-64 outline-none focus:border-indigo-500" />
          </div>
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-bold">
              <th className="p-4 pl-6">Tên thuốc</th>
              <th className="p-4">Tồn kho</th>
              <th className="p-4">Hạn sử dụng</th>
              <th className="p-4">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {inventory.map(item => (
              <tr key={item.id} className="hover:bg-slate-50/50">
                <td className="p-4 pl-6 font-bold text-slate-800 flex items-center gap-2"><Pill size={16} className="text-slate-400"/> {item.name}</td>
                <td className="p-4 font-bold text-slate-600">{item.stock} {item.unit}</td>
                <td className="p-4 font-medium text-slate-600">{new Date(item.expiry).toLocaleDateString('vi-VN')}</td>
                <td className="p-4">
                  {item.status === 'normal' && <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold">Bình thường</span>}
                  {item.status === 'low' && <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold flex items-center w-max gap-1"><AlertCircle size={12}/> Sắp hết thuốc</span>}
                  {item.status === 'expiring' && <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold flex items-center w-max gap-1"><AlertCircle size={12}/> Sắp hết hạn</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
