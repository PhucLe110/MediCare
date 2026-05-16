import React, { useState } from 'react';
import { Search, Plus, MoreVertical, Shield, User, ShieldCheck, Ban } from 'lucide-react';

export default function AdminUsers() {
  const [users] = useState([
    { id: '1', name: 'Nguyễn Văn A', email: 'nva@gmail.com', role: 'patient', status: 'active' },
    { id: '2', name: 'Trần Thị B', email: 'ttb@medicare.vn', role: 'doctor', status: 'active' },
    { id: '3', name: 'Lê Văn C', email: 'lvc@medicare.vn', role: 'staff', status: 'active' },
    { id: '4', name: 'Phạm Admin', email: 'admin@medicare.vn', role: 'admin', status: 'active' },
    { id: '5', name: 'Hoàng Nguyệt', email: 'hn@gmail.com', role: 'patient', status: 'blocked' },
  ]);

  const RoleBadge = ({ role }) => {
    const colors = {
      admin: 'bg-red-100 text-red-700',
      doctor: 'bg-blue-100 text-blue-700',
      staff: 'bg-purple-100 text-purple-700',
      patient: 'bg-slate-100 text-slate-700'
    };
    const labels = {
      admin: 'Quản trị viên',
      doctor: 'Bác sĩ',
      staff: 'Nhân viên',
      patient: 'Bệnh nhân'
    };
    return <span className={`px-3 py-1 rounded-full text-xs font-bold ${colors[role]}`}>{labels[role]}</span>;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-2xl font-black text-slate-800">Quản lý Tài khoản</h2>
          <p className="text-slate-500 font-medium mt-1">Phân quyền, thêm, sửa, xóa và khóa tài khoản người dùng.</p>
        </div>
        <button className="px-5 py-2.5 bg-indigo-600 text-white font-bold rounded-xl flex items-center gap-2 hover:bg-indigo-700 shadow-lg shadow-indigo-600/20">
          <Plus size={18} /> Thêm người dùng
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input type="text" placeholder="Tìm kiếm theo tên, email..." className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 w-64" />
          </div>
          <div className="flex gap-2">
            <select className="bg-white border border-slate-200 text-sm font-bold text-slate-700 rounded-xl px-4 py-2 outline-none">
              <option>Tất cả vai trò</option>
              <option>Bệnh nhân</option>
              <option>Bác sĩ</option>
              <option>Nhân viên</option>
              <option>Quản trị viên</option>
            </select>
          </div>
        </div>
        
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-bold">
              <th className="p-4 pl-6">Người dùng</th>
              <th className="p-4">Vai trò</th>
              <th className="p-4">Trạng thái</th>
              <th className="p-4 text-right pr-6">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map(u => (
              <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="p-4 pl-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                      {u.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">{u.name}</p>
                      <p className="text-xs text-slate-500 font-medium">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4"><RoleBadge role={u.role} /></td>
                <td className="p-4">
                  {u.status === 'active' ? (
                    <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Hoạt động</span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-xs font-bold text-red-600"><Ban size={12}/> Đã khóa</span>
                  )}
                </td>
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
