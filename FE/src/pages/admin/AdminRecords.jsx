import React from 'react';
import { Database, Download, FileStack } from 'lucide-react';

export default function AdminRecords() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-2xl font-black text-slate-800">Quản lý Bệnh án & Dữ liệu y tế</h2>
          <p className="text-slate-500 font-medium mt-1">Lưu trữ hồ sơ, quản lý kho dữ liệu khám chữa bệnh và Backup hệ thống.</p>
        </div>
        <button className="px-5 py-2.5 bg-indigo-600 text-white font-bold rounded-xl flex items-center gap-2 hover:bg-indigo-700 shadow-lg shadow-indigo-600/20">
          <Database size={18} /> Backup Database ngay
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
          <FileStack size={48} className="text-slate-300 mb-4" />
          <h3 className="font-bold text-slate-800 text-xl">Dung lượng Hồ sơ</h3>
          <p className="text-slate-500 mt-2">Hệ thống đang lưu trữ 124,500 hồ sơ điện tử.</p>
          <div className="w-full bg-slate-100 h-2 rounded-full mt-6 mb-2 overflow-hidden">
            <div className="bg-indigo-500 h-full rounded-full" style={{ width: '45%' }}></div>
          </div>
          <p className="text-xs font-bold text-slate-400">Đã dùng 45GB / 100GB</p>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-800 text-lg mb-4">Lịch sử Backup gần đây</h3>
          <div className="space-y-3">
            {[1,2,3].map(i => (
              <div key={i} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center gap-3">
                  <Database size={16} className="text-emerald-500" />
                  <span className="font-bold text-slate-700 text-sm">Backup_{new Date(Date.now() - i*86400000).toLocaleDateString('vi-VN').replace(/\//g,'')}.sql</span>
                </div>
                <button className="text-indigo-600 hover:text-indigo-800"><Download size={16}/></button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
