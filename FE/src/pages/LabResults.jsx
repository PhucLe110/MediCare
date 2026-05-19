import { API_URL } from '../config';
import React, { useState, useEffect } from 'react';
import { FlaskConical, FileText, Download, Eye, Clock, CheckCircle, Search } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';

// const API_URL = API_URL;

const getAuthHeaders = () => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
  return { 'Authorization': `Bearer ${userInfo.token}` };
};

const trans = {
  vi: {
    title: 'Kết Quả Xét Nghiệm',
    sub: 'Nhân viên xét nghiệm gửi tới — Dữ liệu thời gian thực',
    searchPlaceholder: 'Tìm kiếm tên xét nghiệm...',
    loading: 'Đang tải kết quả...',
    noMatch: 'Không tìm thấy kết quả phù hợp',
    noResult: 'Chưa có kết quả xét nghiệm',
    tryAnotherSearch: 'Thử tìm kiếm với từ khóa khác.',
    resultWillShow: 'Khi nhân viên xét nghiệm gửi kết quả cho bạn, chúng sẽ xuất hiện tại đây.',
    latestResult: 'KẾT QUẢ MỚI NHẤT',
    performedBy: 'Thực hiện bởi',
    labStaff: 'Nhân viên xét nghiệm',
    linkedAppt: 'Liên kết ca khám ngày',
    staffNote: 'Ghi chú từ nhân viên xét nghiệm:',
    viewResult: 'Xem kết quả',
    download: 'Tải xuống',
    
    typeBlood: 'Xét nghiệm máu',
    typeUrine: 'Xét nghiệm nước tiểu',
    typeXray: 'Chụp X-Quang',
    typeMri: 'Chụp MRI',
    typeCt: 'Chụp CT Scan',
    typeUltrasound: 'Siêu âm',
    typeEcg: 'Điện tâm đồ (ECG)',
    typeOther: 'Xét nghiệm khác',
  },
  en: {
    title: 'Laboratory Results',
    sub: 'Sent by lab technician — Real-time synchronization',
    searchPlaceholder: 'Search lab tests...',
    loading: 'Loading results...',
    noMatch: 'No matching results found',
    noResult: 'No laboratory results available',
    tryAnotherSearch: 'Try searching with different keywords.',
    resultWillShow: 'Once the laboratory staff uploads your results, they will appear here.',
    latestResult: 'LATEST RESULT',
    performedBy: 'Performed by',
    labStaff: 'Lab Technician',
    linkedAppt: 'Linked with consultation on',
    staffNote: 'Notes from lab technician:',
    viewResult: 'View PDF',
    download: 'Download',

    typeBlood: 'Blood Test',
    typeUrine: 'Urinalysis',
    typeXray: 'X-Ray Imaging',
    typeMri: 'MRI Scan',
    typeCt: 'CT Scan',
    typeUltrasound: 'Ultrasound',
    typeEcg: 'Electrocardiogram (ECG)',
    typeOther: 'Other Test',
  }
};

const LabResults = () => {
  const { lang, t } = useTranslation(trans);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const TEST_TYPE_MAP = {
    blood: { label: t.typeBlood, color: 'text-red-600 bg-red-50 border-red-100' },
    urine: { label: t.typeUrine, color: 'text-yellow-600 bg-yellow-50 border-yellow-100' },
    xray: { label: t.typeXray, color: 'text-blue-600 bg-blue-50 border-blue-100' },
    mri: { label: t.typeMri, color: 'text-purple-600 bg-purple-50 border-purple-100' },
    ct: { label: t.typeCt, color: 'text-indigo-600 bg-indigo-50 border-indigo-100' },
    ultrasound: { label: t.typeUltrasound, color: 'text-teal-600 bg-teal-50 border-teal-100' },
    ecg: { label: t.typeEcg, color: 'text-green-600 bg-green-50 border-green-100' },
    other: { label: t.typeOther, color: 'text-gray-600 bg-gray-50 border-gray-100' }
  };

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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-teal-100 to-blue-100 text-teal-600 rounded-2xl flex items-center justify-center shadow-inner shrink-0">
            <FlaskConical size={32} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{t.title}</h1>
            <p className="text-gray-500 text-sm mt-1">{t.sub}</p>
          </div>
        </div>
        <div className="relative w-full sm:w-auto">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            className="pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 w-full sm:w-64"
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
            {search ? t.noMatch : t.noResult}
          </h3>
          <p className="text-gray-400 text-sm max-w-sm">
            {search ? t.tryAnotherSearch : t.resultWillShow}
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {filtered.map((result, idx) => {
            const typeInfo = TEST_TYPE_MAP[result.testType] || TEST_TYPE_MAP.other;
            const isNew = idx === 0;
            const createdDateStr = lang === 'vi'
              ? new Date(result.createdAt).toLocaleString('vi-VN')
              : new Date(result.createdAt).toLocaleString('en-US');
            const apptDateStr = result.appointment
              ? (lang === 'vi'
                  ? new Date(result.appointment?.date).toLocaleDateString('vi-VN')
                  : new Date(result.appointment?.date).toLocaleDateString('en-US'))
              : '';

            return (
              <div
                key={result._id}
                className={`bg-white rounded-3xl border shadow-sm transition-all hover:shadow-md group overflow-hidden ${isNew ? 'border-teal-200 ring-1 ring-teal-100' : 'border-gray-100'}`}
              >
                {isNew && (
                  <div className="bg-gradient-to-r from-teal-500 to-blue-500 text-white text-xs font-bold px-4 py-1.5 flex items-center gap-2">
                    <CheckCircle size={12} /> {t.latestResult}
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
                          {createdDateStr}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-800 group-hover:text-teal-700 transition-colors mb-2">
                        {result.testName}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {t.performedBy}: <span className="font-semibold text-gray-700">
                          {result.uploadedBy?.fullName === 'Nguyễn Thị Lan Anh' && lang === 'en' 
                            ? 'Nguyen Thi Lan Anh' 
                            : (result.uploadedBy?.fullName || t.labStaff)}
                        </span>
                        {result.appointment && (
                          <span className="ml-3 text-gray-400">
                            • {t.linkedAppt} {apptDateStr}
                          </span>
                        )}
                      </p>
                      {result.notes && (
                        <div className="mt-4 p-4 bg-blue-50/50 rounded-2xl border border-blue-100 text-sm text-gray-700">
                          <strong className="text-gray-800 block mb-1">{t.staffNote}</strong>
                          <p className="leading-relaxed italic">{result.notes}</p>
                        </div>
                      )}
                    </div>

                    {/* File Actions */}
                    <div className="flex flex-col gap-3 shrink-0 w-full md:w-auto md:min-w-[160px]">
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
                        className="px-4 py-2.5 bg-teal-600 text-white text-sm font-bold rounded-xl hover:bg-teal-700 transition-all shadow-md shadow-teal-500/20 flex items-center justify-center gap-2 w-full"
                      >
                        <Eye size={16} /> {t.viewResult}
                      </button>
                      <button
                        onClick={() => handleDownload(result.fileUrl, result.fileName)}
                        className="px-4 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm font-bold rounded-xl hover:border-teal-400 hover:text-teal-600 transition-all flex items-center justify-center gap-2 w-full"
                      >
                        <Download size={16} /> {t.download}
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
