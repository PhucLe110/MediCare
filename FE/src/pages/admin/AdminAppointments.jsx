import React from 'react';
import { CalendarDays, AlertTriangle, PlayCircle } from 'lucide-react';

export default function AdminAppointments() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-2xl font-black text-slate-800">Điều phối Lịch khám</h2>
          <p className="text-slate-500 font-medium mt-1">Theo dõi, điều phối và xử lý các khung giờ quá tải bệnh nhân.</p>
        </div>
      </div>
      
      <div className="bg-amber-50 border border-amber-200 p-6 rounded-2xl flex items-start gap-4">
        <AlertTriangle className="text-amber-500 shrink-0 mt-1" />
        <div>
          <h3 className="font-bold text-amber-900 text-lg">Cảnh báo: Quá tải cục bộ</h3>
          <p className="text-amber-800 mt-1">Khoa Nhi và Khoa Da liễu đang có số lượng đặt lịch vượt mức 120% công suất vào buổi sáng ngày mai. Hệ thống đề xuất mở thêm ca khám.</p>
          <button className="mt-4 px-4 py-2 bg-amber-500 text-white font-bold rounded-xl shadow-md hover:bg-amber-600 transition-colors">
            Xem phương án điều phối AI
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 p-20 text-center flex flex-col items-center justify-center">
        <CalendarDays size={48} className="text-slate-300 mb-4" />
        <h3 className="text-lg font-bold text-slate-700">Lịch trình hệ thống đang hoạt động ổn định</h3>
        <p className="text-slate-500">Chưa có tính năng xem chi tiết ở chế độ MVP.</p>
      </div>
    </div>
  );
}
