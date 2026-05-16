import React, { useState, useEffect } from 'react';
import { FlaskConical, FileText, Download, Eye, Clock, CheckCircle, AlertCircle, Search } from 'lucide-react';

const API_URL = 'http://localhost:5000';

const getAuthHeaders = () => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
  return { 'Authorization': `Bearer ${userInfo.token}` };
};

const TEST_TYPE_MAP = {
  blood: { label: 'Xét nghiệm máu', color: 'text-red-600 bg-red-50 border-red-100' },
  urine: { label: 'Xét nghiệm nước tiểu', color: 'text-yellow-600 bg-yellow-50 border-yellow-100' },
  xray: { label: 'Chụp X-Quang', color: 'text-blue-600 bg-blue-50 border-blue-100' },
  mri: { label: 'Chụp MRI', color: 'text-purple-600 bg-purple-50 border-purple-100' },
  ct: { label: 'Chụp CT Scan', color: 'text-indigo-600 bg-indigo-50 border-indigo-100' },
  ultrasound: { label: 'Siêu âm', color: 'text-teal-600 bg-teal-50 border-teal-100' },
  ecg: { label: 'Điện tâm đồ (ECG)', color: 'text-green-600 bg-green-50 border-green-100' },
  other: { label: 'Xét nghiệm khác', color: 'text-gray-600 bg-gray-50 border-gray-100' }
};

const LabResults = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await fetch(`${API_URL}/api/lab-results/my`, {
          headers: getAuthHeaders()
        });
        const data = await res.json();
        if (data.success) setResults(data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, []);

  const filtered = results.filter(r =>
    r.testName.toLowerCase().includes(search.toLowerCase())
  );

  const handleViewPDF = (fileUrl) => {
    window.open(`${API_URL}${fileUrl}`, '_blank');
  };

  const handleDownload = async (fileUrl, fileName) => {
    const res = await fetch(`${API_URL}${fileUrl}`, { headers: getAuthHeaders() });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-teal-100 to-blue-100 text-teal-600 rounded-2xl flex items-center justify-center shadow-inner">
            <FlaskConical size={32} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Kết Quả Xét Nghiệm</h1>
            <p className="text-gray-500 mt-1">Nhân viên xét nghiệm gửi tới — Dữ liệu thời gian thực</p>
          </div>
        </div>
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm tên xét nghiệm..."
            className="pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 w-64"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3].map(i => <div key={i} className="h-40 bg-gray-100 rounded-3xl"></div>)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-gray-100 shadow-sm text-center">
          <div className="w-24 h-24 bg-teal-50 rounded-full flex items-center justify-center mb-6">
            <FlaskConical size={40} className="text-teal-300" />
          </div>
          <h3 className="text-xl font-bold text-gray-600 mb-2">
            {search ? 'Không tìm thấy kết quả phù hợp' : 'Chưa có kết quả xét nghiệm'}
          </h3>
          <p className="text-gray-400 text-sm max-w-sm">
            {search
              ? 'Thử tìm kiếm với từ khóa khác.'
              : 'Khi nhân viên xét nghiệm gửi kết quả cho bạn, chúng sẽ xuất hiện tại đây.'}
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {filtered.map((result, idx) => {
            const typeInfo = TEST_TYPE_MAP[result.testType] || TEST_TYPE_MAP.other;
            const isNew = idx === 0;
            return (
              <div
                key={result._id}
                className={`bg-white rounded-3xl border shadow-sm transition-all hover:shadow-md group overflow-hidden ${isNew ? 'border-teal-200 ring-1 ring-teal-100' : 'border-gray-100'}`}
              >
                {isNew && (
                  <div className="bg-gradient-to-r from-teal-500 to-blue-500 text-white text-xs font-bold px-4 py-1.5 flex items-center gap-2">
                    <CheckCircle size={12} /> KẾT QUẢ MỚI NHẤT
                  </div>
                )}
                <div className="p-6">
                  <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3 flex-wrap">
                        <span className={`px-3 py-1.5 text-xs font-bold rounded-xl border ${typeInfo.color}`}>
                          {typeInfo.label}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-gray-400 font-medium">
                          <Clock size={12} />
                          {new Date(result.createdAt).toLocaleString('vi-VN')}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-800 group-hover:text-teal-700 transition-colors mb-2">
                        {result.testName}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Thực hiện bởi: <span className="font-semibold text-gray-700">{result.uploadedBy?.fullName || 'Nhân viên xét nghiệm'}</span>
                        {result.appointment && (
                          <span className="ml-3 text-gray-400">
                            • Liên kết ca khám ngày {new Date(result.appointment?.date).toLocaleDateString('vi-VN')}
                          </span>
                        )}
                      </p>
                      {result.notes && (
                        <div className="mt-4 p-4 bg-blue-50/50 rounded-2xl border border-blue-100 text-sm text-gray-700">
                          <strong className="text-gray-800 block mb-1">Ghi chú từ nhân viên xét nghiệm:</strong>
                          <p className="leading-relaxed italic">{result.notes}</p>
                        </div>
                      )}
                    </div>

                    {/* File Actions */}
                    <div className="flex flex-col gap-3 shrink-0 min-w-[160px]">
                      <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 rounded-2xl border border-gray-100">
                        <FileText size={18} className="text-red-500 shrink-0" />
                        <div className="overflow-hidden">
                          <p className="text-xs font-bold text-gray-700 truncate max-w-[120px]">{result.fileName}</p>
                          <p className="text-[10px] text-gray-400 uppercase font-bold">
                            {result.fileName?.split('.').pop()}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleViewPDF(result.fileUrl)}
                        className="px-4 py-2.5 bg-teal-600 text-white text-sm font-bold rounded-xl hover:bg-teal-700 transition-all shadow-md shadow-teal-500/20 flex items-center justify-center gap-2"
                      >
                        <Eye size={16} /> Xem kết quả
                      </button>
                      <button
                        onClick={() => handleDownload(result.fileUrl, result.fileName)}
                        className="px-4 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm font-bold rounded-xl hover:border-teal-400 hover:text-teal-600 transition-all flex items-center justify-center gap-2"
                      >
                        <Download size={16} /> Tải xuống
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default LabResults;
