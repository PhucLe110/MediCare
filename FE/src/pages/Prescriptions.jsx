import React, { useState, useEffect } from 'react';
import { Pill, User, Clock, FileText, ChevronRight, Download, Activity } from 'lucide-react';

const API_URL = 'http://localhost:5000';

const getAuthHeaders = () => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
  return { 'Authorization': `Bearer ${userInfo.token}` };
};

const Prescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPrescription, setSelectedPrescription] = useState(null);

  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        const res = await fetch(`${API_URL}/api/prescriptions/my`, {
          headers: getAuthHeaders()
        });
        const data = await res.json();
        if (data.success) {
          setPrescriptions(data.data);
          if (data.data.length > 0) setSelectedPrescription(data.data[0]);
        }
      } catch (err) {
        console.error('Error fetching prescriptions:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPrescriptions();
  }, []);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <Pill className="text-primary" size={32} />
            Đơn thuốc điện tử
          </h1>
          <p className="text-gray-500 mt-2">Quản lý và xem lại tất cả đơn thuốc từ các ca khám của bạn</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : prescriptions.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Pill size={40} className="text-gray-300" />
          </div>
          <h3 className="text-xl font-bold text-gray-700">Chưa có đơn thuốc nào</h3>
          <p className="text-gray-400 mt-2">Đơn thuốc của bạn sẽ xuất hiện ở đây sau khi bác sĩ hoàn tất khám bệnh.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* List Section */}
          <div className="lg:col-span-4 space-y-4">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider px-2">Danh sách đơn thuốc</h3>
            <div className="max-h-[calc(100vh-250px)] overflow-y-auto pr-2 custom-scrollbar">
              {prescriptions.map((prescription) => (
                <div
                  key={prescription._id}
                  onClick={() => setSelectedPrescription(prescription)}
                  className={`p-4 rounded-2xl cursor-pointer transition-all border-2 mb-3 ${
                    selectedPrescription?._id === prescription._id
                      ? 'border-primary bg-primary/5 shadow-md'
                      : 'border-transparent bg-white hover:border-gray-200'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-lg">
                      {new Date(prescription.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                    <ChevronRight size={16} className={selectedPrescription?._id === prescription._id ? 'text-primary' : 'text-gray-300'} />
                  </div>
                  <h4 className="font-bold text-gray-800 truncate">BS. {prescription.doctor?.fullName}</h4>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-1 italic">{prescription.diagnosis || 'Chưa cập nhật chẩn đoán'}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Detail Section */}
          <div className="lg:col-span-8">
            {selectedPrescription && (
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-right-4 duration-300">
                {/* Detail Header */}
                <div className="p-8 bg-gradient-to-r from-primary to-blue-600 text-white relative">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                  <div className="flex flex-col md:flex-row justify-between items-start gap-4 relative z-10">
                    <div>
                      <div className="flex items-center gap-2 text-white/80 text-sm mb-2">
                        <Clock size={14} />
                        Ngày kê: {new Date(selectedPrescription.createdAt).toLocaleString('vi-VN')}
                      </div>
                      <h2 className="text-2xl font-bold">ĐƠN THUỐC ĐIỆN TỬ</h2>
                      <p className="text-white/90 mt-1">Mã đơn: {selectedPrescription._id.substring(18).toUpperCase()}</p>
                    </div>
                    <button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm p-3 rounded-xl transition-all flex items-center gap-2 text-sm font-bold border border-white/20">
                      <Download size={18} /> Tải PDF
                    </button>
                  </div>
                </div>

                <div className="p-8">
                  {/* Doctor & Diagnosis */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10 pb-10 border-b border-gray-100">
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                        <User size={14} /> Bác sĩ điều trị
                      </h4>
                      <p className="text-lg font-bold text-gray-800">BS. {selectedPrescription.doctor?.fullName}</p>
                      <p className="text-sm text-gray-500">Chuyên khoa: {selectedPrescription.appointment?.doctor?.specialty || 'Đa khoa'}</p>
                    </div>
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                        <Activity size={14} /> Chẩn đoán
                      </h4>
                      <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                        <p className="text-gray-800 font-semibold">{selectedPrescription.diagnosis || 'Cần theo dõi thêm'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Medicines Table */}
                  <div className="mb-10">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Pill size={14} /> Danh mục thuốc ({selectedPrescription.medicines?.length || 0})
                    </h4>
                    <div className="overflow-x-auto rounded-2xl border border-gray-100">
                      <table className="w-full text-left">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Tên thuốc</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Số lượng</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Cách dùng</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {selectedPrescription.medicines?.map((med, idx) => (
                            <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                              <td className="px-6 py-4">
                                <p className="font-bold text-gray-800">{med.name}</p>
                                <p className="text-xs text-gray-500">{med.dosage}</p>
                              </td>
                              <td className="px-6 py-4 font-bold text-gray-700">{med.quantity} viên</td>
                              <td className="px-6 py-4 text-sm text-gray-600">
                                <span className="block">{med.frequency}</span>
                                <span className="text-xs text-primary font-medium italic">Sử dụng trong {med.duration}</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Doctor Notes */}
                  {selectedPrescription.doctorNotes && (
                    <div className="bg-yellow-50/50 rounded-2xl p-6 border border-yellow-100 mb-8">
                      <h4 className="text-sm font-bold text-yellow-700 mb-2 flex items-center gap-2">
                        <FileText size={16} /> Lời dặn từ Bác sĩ
                      </h4>
                      <p className="text-gray-700 leading-relaxed italic">{selectedPrescription.doctorNotes}</p>
                    </div>
                  )}

                  {/* Footer Stats */}
                  <div className="flex justify-end p-6 bg-gray-50 rounded-2xl border border-gray-100">
                    <div className="text-right">
                      <p className="text-gray-500 text-sm mb-1">Tổng cộng tiền thuốc dự kiến</p>
                      <p className="text-2xl font-black text-primary">{formatPrice(selectedPrescription.totalMedicineCost)}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Prescriptions;
