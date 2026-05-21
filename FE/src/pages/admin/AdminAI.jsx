import React from 'react';
import { Bot, Terminal, RefreshCw } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';

const trans = {
  vi: {
    title: 'Quản trị Hệ thống AI',
    subtitle: 'Quản lý mô hình gợi ý chẩn đoán, lịch sử phân tích và cập nhật tập dữ liệu huấn luyện.',
    retrain: 'Huấn luyện lại',
    modelStatus: 'Trạng thái Model Hiện tại',
    version: 'Phiên bản',
    accuracy: 'Độ chính xác (F1 Score)',
    lastUpdate: 'Cập nhật lần cuối',
    dataset: 'Tập dữ liệu huấn luyện',
    lastUpdateVal: 'Hôm qua, 23:45',
    datasetVal: '145,200 mẫu bệnh án',
    logsTitle: 'System Logs',
    log1: '[INFO] Model v2.4.1 initialized.',
    log2: '[SUCCESS] Connected to Vector DB.',
    log3: '[INFO] Inference request #4092 received.',
    log4: '[INFO] Confidence score: 0.94',
    log5: '[SUCCESS] Response sent in 1.2s',
  },
  en: {
    title: 'AI System Administration',
    subtitle: 'Manage diagnostic suggestion models, analysis history, and training dataset updates.',
    retrain: 'Retrain Model',
    modelStatus: 'Current Model Status',
    version: 'Version',
    accuracy: 'Accuracy (F1 Score)',
    lastUpdate: 'Last Updated',
    dataset: 'Training Dataset',
    lastUpdateVal: 'Yesterday, 23:45',
    datasetVal: '145,200 medical records',
    logsTitle: 'System Logs',
    log1: '[INFO] Model v2.4.1 initialized.',
    log2: '[SUCCESS] Connected to Vector DB.',
    log3: '[INFO] Inference request #4092 received.',
    log4: '[INFO] Confidence score: 0.94',
    log5: '[SUCCESS] Response sent in 1.2s',
  },
};

export default function AdminAI() {
  const { t } = useTranslation(trans);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-2xl font-black text-slate-800">{t.title}</h2>
          <p className="text-slate-500 font-medium mt-1">{t.subtitle}</p>
        </div>
        <button type="button" className="px-5 py-2.5 bg-indigo-600 text-white font-bold rounded-xl flex items-center gap-2 hover:bg-indigo-700 shadow-lg shadow-indigo-600/20">
          <RefreshCw size={18} /> {t.retrain}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white p-8 rounded-3xl shadow-lg relative overflow-hidden md:col-span-2">
          <div className="absolute right-0 top-0 opacity-10">
            <Bot size={200} />
          </div>
          <div className="relative z-10">
            <h3 className="text-xl font-black mb-6">{t.modelStatus}</h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-indigo-200 text-xs font-bold uppercase tracking-wider mb-1">{t.version}</p>
                <p className="font-mono text-xl font-bold">v2.4.1 (Stable)</p>
              </div>
              <div>
                <p className="text-indigo-200 text-xs font-bold uppercase tracking-wider mb-1">{t.accuracy}</p>
                <p className="font-mono text-xl font-bold text-emerald-400">0.968</p>
              </div>
              <div>
                <p className="text-indigo-200 text-xs font-bold uppercase tracking-wider mb-1">{t.lastUpdate}</p>
                <p className="font-mono text-lg font-bold">{t.lastUpdateVal}</p>
              </div>
              <div>
                <p className="text-indigo-200 text-xs font-bold uppercase tracking-wider mb-1">{t.dataset}</p>
                <p className="font-mono text-lg font-bold">{t.datasetVal}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 rounded-3xl p-6 font-mono text-xs text-green-400 overflow-hidden shadow-lg border border-slate-800">
          <div className="flex items-center gap-2 mb-4 text-slate-400 border-b border-slate-800 pb-2">
            <Terminal size={14}/> {t.logsTitle}
          </div>
          <div className="space-y-2 opacity-80">
            <p>{t.log1}</p>
            <p>{t.log2}</p>
            <p>{t.log3}</p>
            <p>{t.log4}</p>
            <p>{t.log5}</p>
            <p className="animate-pulse">_</p>
          </div>
        </div>
      </div>
    </div>
  );
}
