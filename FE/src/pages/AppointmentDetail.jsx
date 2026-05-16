import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Stethoscope, TestTube2, Pill, FileCheck2, Calendar, Clock, CreditCard, Activity } from 'lucide-react';

const API_URL = 'http://localhost:5000';
const authH = () => ({ Authorization: `Bearer ${JSON.parse(localStorage.getItem('userInfo') || '{}').token}` });

export default function AppointmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [appt, setAppt] = useState(null);
  const [rx, setRx] = useState(null);
  const [labs, setLabs] = useState([]);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const [apptRes, rxRes, labRes] = await Promise.all([
          fetch(`${API_URL}/api/appointments`, { headers: authH() }),
          fetch(`${API_URL}/api/prescriptions/my`, { headers: authH() }),
          fetch(`${API_URL}/api/lab-results/my`, { headers: authH() })
        ]);
        
        const apptData = await apptRes.json();
        const rxData = await rxRes.json();
        const labData = await labRes.json();
        
        if (apptData.success) {
          const currentAppt = apptData.data.find(a => a._id === id);
          setAppt(currentAppt);
          if (currentAppt) {
            if (rxData.success) {
              setRx(rxData.data.find(p => p.appointment === id || p.appointment?._id === id));
            }
            if (labData.success) {
              setLabs(labData.data.filter(l => l.appointment === id || l.appointment?._id === id));
            }
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!appt) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-gray-800">Không tìm thấy ca khám</h2>
        <button onClick={() => navigate(-1)} className="mt-4 text-primary hover:underline">Quay lại</button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-6">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-500 hover:text-primary transition-colors mb-6 font-bold text-sm"
      >
        <ArrowLeft size={16} /> Quay lại Hồ sơ
      </button>

      <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xl shadow-gray-200/20 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-gray-100 pb-8 mb-8">
          <div>
            <h1 className="text-3xl font-black text-gray-900 mb-2">Thông tin ca khám</h1>
            <p className="text-gray-500 font-medium">Chi tiết chẩn đoán và điều trị của bác sĩ</p>
          </div>
          <div className="bg-blue-50 px-5 py-3 rounded-2xl border border-blue-100 flex items-center gap-4">
            <div className="text-blue-900">
              <p className="text-xs font-bold uppercase tracking-wider text-blue-500 mb-1">Bác sĩ phụ trách</p>
              <p className="font-bold">{appt.doctor?.userId?.fullName}</p>
              <p className="text-sm font-medium">{appt.doctor?.department}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
            <Calendar size={20} className="text-gray-400 mb-2" />
            <p className="text-xs font-bold text-gray-500 uppercase">Ngày khám</p>
            <p className="font-black text-gray-900">{new Date(appt.date).toLocaleDateString('vi-VN')}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
            <Clock size={20} className="text-gray-400 mb-2" />
            <p className="text-xs font-bold text-gray-500 uppercase">Giờ khám</p>
            <p className="font-black text-gray-900">{appt.time}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
            <CreditCard size={20} className="text-gray-400 mb-2" />
            <p className="text-xs font-bold text-gray-500 uppercase">Mã phiếu</p>
            <p className="font-black text-primary">{appt.ticketNumber}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
            <Activity size={20} className="text-gray-400 mb-2" />
            <p className="text-xs font-bold text-gray-500 uppercase">Triệu chứng</p>
            <p className="font-bold text-gray-900 truncate" title={appt.symptoms}>{appt.symptoms || 'Không có'}</p>
          </div>
        </div>

        <div className="space-y-8">
          {/* Diagnosis */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                <Stethoscope size={16} />
              </div>
              Chẩn đoán lâm sàng
            </h2>
            <div className="bg-blue-50/50 border border-blue-100 p-6 rounded-2xl">
              <p className="text-blue-900 font-medium leading-relaxed">
                {rx?.diagnosis || 'Sức khỏe bình thường, không phát hiện vấn đề nghiêm trọng.'}
              </p>
            </div>
          </div>

          {/* Lab Results */}
          {labs.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
                  <TestTube2 size={16} />
                </div>
                Kết quả xét nghiệm cận lâm sàng
              </h2>
              <div className="bg-purple-50/50 border border-purple-100 p-6 rounded-2xl space-y-3">
                {labs.map(l => (
                  <div key={l._id} className="bg-white p-4 rounded-xl border border-purple-100 shadow-sm flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                        <FileCheck2 size={18}/>
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{l.testName}</p>
                        <p className="text-xs text-gray-500 mt-1">Cập nhật: {new Date(l.updatedAt || l.createdAt).toLocaleDateString('vi-VN')}</p>
                      </div>
                    </div>
                    <span className={`px-4 py-2 rounded-xl text-sm font-bold ${l.status === 'normal' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {l.status === 'normal' ? 'Kết quả bình thường' : 'Chỉ số bất thường'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Prescriptions */}
          {rx?.medicines && rx.medicines.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <Pill size={16} />
                </div>
                Đơn thuốc được kê
              </h2>
              <div className="bg-emerald-50/50 border border-emerald-100 p-6 rounded-2xl">
                <div className="space-y-3">
                  {rx.medicines.map((m, i) => (
                    <div key={i} className="bg-white p-5 rounded-xl border border-emerald-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <p className="font-bold text-gray-900 text-lg mb-1">{m.name}</p>
                        <div className="flex gap-4 text-sm font-medium text-gray-600">
                          <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Liều: {m.dosage}</span>
                          <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Cách dùng: {m.frequency}</span>
                        </div>
                      </div>
                      <div className="bg-emerald-50 px-4 py-3 rounded-xl border border-emerald-100 text-center md:text-right shrink-0">
                        <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider block mb-1">Số lượng</span>
                        <span className="font-black text-2xl text-emerald-900">{m.quantity}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
