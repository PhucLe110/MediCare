import React from 'react';
import { CreditCard, Download, Search, CheckCircle2, Clock } from 'lucide-react';

export default function AdminBilling() {
  const bills = [
    { id: 'HD1029', patient: 'Nguyễn Văn A', amount: 450000, date: '2026-05-16', status: 'paid' },
    { id: 'HD1030', patient: 'Trần Thị B', amount: 120000, date: '2026-05-16', status: 'unpaid' },
  ];

  const fmt = (n) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-2xl font-black text-slate-800">Quản lý Viện phí & Hóa đơn</h2>
          <p className="text-slate-500 font-medium mt-1">Theo dõi thanh toán, xuất hóa đơn và đối soát doanh thu.</p>
        </div>
        <button className="px-5 py-2.5 bg-indigo-600 text-white font-bold rounded-xl flex items-center gap-2 hover:bg-indigo-700 shadow-lg shadow-indigo-600/20">
          <Download size={18} /> Xuất báo cáo (Excel)
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input type="text" placeholder="Tìm kiếm mã HĐ..." className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium w-64 outline-none focus:border-indigo-500" />
          </div>
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-bold">
              <th className="p-4 pl-6">Mã Hóa Đơn</th>
              <th className="p-4">Bệnh nhân</th>
              <th className="p-4">Số tiền</th>
              <th className="p-4">Ngày tạo</th>
              <th className="p-4">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {bills.map(b => (
              <tr key={b.id} className="hover:bg-slate-50/50">
                <td className="p-4 pl-6 font-bold text-indigo-600">{b.id}</td>
                <td className="p-4 font-bold text-slate-800">{b.patient}</td>
                <td className="p-4 font-black text-slate-700">{fmt(b.amount)}</td>
                <td className="p-4 font-medium text-slate-600">{new Date(b.date).toLocaleDateString('vi-VN')}</td>
                <td className="p-4">
                  {b.status === 'paid' ? (
                    <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600"><CheckCircle2 size={14}/> Đã thanh toán</span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-xs font-bold text-orange-500"><Clock size={14}/> Chờ thanh toán</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
