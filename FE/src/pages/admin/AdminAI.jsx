import React from 'react';
import { Bot, Terminal, RefreshCw, CheckCircle2 } from 'lucide-react';

export default function AdminAI() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-2xl font-black text-slate-800">Quản trị Hệ thống AI</h2>
          <p className="text-slate-500 font-medium mt-1">Quản lý mô hình gợi ý chẩn đoán, lịch sử phân tích và cập nhật tập dữ liệu huấn luyện.</p>
        </div>
        <button className="px-5 py-2.5 bg-indigo-600 text-white font-bold rounded-xl flex items-center gap-2 hover:bg-indigo-700 shadow-lg shadow-indigo-600/20">
          <RefreshCw size={18} /> Retrain Model
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white p-8 rounded-3xl shadow-lg relative overflow-hidden md:col-span-2">
          <div className="absolute right-0 top-0 opacity-10">
            <Bot size={200} />
          </div>
          <div className="relative z-10">
            <h3 className="text-xl font-black mb-6">Trạng thái Model Hiện tại</h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-indigo-200 text-xs font-bold uppercase tracking-wider mb-1">Phiên bản</p>
                <p className="font-mono text-xl font-bold">v2.4.1 (Stable)</p>
              </div>
              <div>
                <p className="text-indigo-200 text-xs font-bold uppercase tracking-wider mb-1">Độ chính xác (F1 Score)</p>
                <p className="font-mono text-xl font-bold text-emerald-400">0.968</p>
              </div>
              <div>
                <p className="text-indigo-200 text-xs font-bold uppercase tracking-wider mb-1">Cập nhật lần cuối</p>
                <p className="font-mono text-lg font-bold">Hôm qua, 23:45</p>
              </div>
              <div>
                <p className="text-indigo-200 text-xs font-bold uppercase tracking-wider mb-1">Tập dữ liệu huấn luyện</p>
                <p className="font-mono text-lg font-bold">145,200 mẫu bệnh án</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 rounded-3xl p-6 font-mono text-xs text-green-400 overflow-hidden shadow-lg border border-slate-800">
          <div className="flex items-center gap-2 mb-4 text-slate-400 border-b border-slate-800 pb-2">
            <Terminal size={14}/> System Logs
          </div>
          <div className="space-y-2 opacity-80">
            <p>[INFO] Model v2.4.1 initialized.</p>
            <p>[SUCCESS] Connected to Vector DB.</p>
            <p>[INFO] Inference request #4092 received.</p>
            <p>[INFO] Confidence score: 0.94</p>
            <p>[SUCCESS] Response sent in 1.2s</p>
            <p className="animate-pulse">_</p>
          </div>
        </div>
      </div>
    </div>
  );
}
