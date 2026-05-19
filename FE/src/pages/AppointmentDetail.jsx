import { API_URL } from '../config';
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Stethoscope, TestTube2, Pill, FileCheck2, Calendar, Clock, CreditCard, Activity, Printer } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';

// const API_URL = API_URL;
const authH = () => ({ Authorization: `Bearer ${JSON.parse(localStorage.getItem('userInfo') || '{}').token}` });

const trans = {
  vi: {
    backBtn: 'Quay lại Hồ sơ',
    backSimple: 'Quay lại',
    loading: 'Đang tải chi tiết...',
    notFound: 'Không tìm thấy ca khám',
    title: 'Thông tin ca khám',
    subtitle: 'Chi tiết chẩn đoán và điều trị của bác sĩ',
    attendingDoctor: 'Bác sĩ phụ trách',
    notOccurred: 'Ca khám chưa diễn ra!',
    notOccurredSub: 'Lịch khám của bạn được lên lịch vào lúc {time} ngày {date}. Số thứ tự xếp hàng của bạn là #{queue}. Vui lòng đến đúng giờ để bác sĩ tiến hành thăm khám.',
    dateLabel: 'Ngày khám',
    timeLabel: 'Giờ khám',
    ticketLabel: 'Mã phiếu',
    symptomsLabel: 'Triệu chứng',
    noSymptoms: 'Không có',
    clinicalDiag: 'Chẩn đoán lâm sàng',
    defaultDiag: 'Sức khỏe bình thường, không phát hiện vấn đề nghiêm trọng.',
    diagPlaceholder: 'Chẩn đoán lâm sàng chưa được cập nhật. Kết quả chẩn đoán và đơn thuốc sẽ hiển thị tại đây sau khi bác sĩ hoàn tất ca khám.',
    labDiag: 'Kết quả xét nghiệm cận lâm sàng',
    labNormal: 'Kết quả bình thường',
    labAbnormal: 'Chỉ số bất thường',
    labUpdated: 'Cập nhật:',
    prescribedMedicines: 'Đơn thuốc được kê',
    dosageLabel: 'Liều:',
    usageLabel: 'Cách dùng:',
    qtyLabel: 'Số lượng',
    deptLabel: 'Khoa:',
  },
  en: {
    backBtn: 'Back to Profile',
    backSimple: 'Back',
    loading: 'Loading details...',
    notFound: 'Consultation session not found',
    title: 'Consultation Overview',
    subtitle: 'Clinical details and physician diagnostics',
    attendingDoctor: 'Attending Physician',
    notOccurred: 'Consultation Pending!',
    notOccurredSub: 'Your consultation session is scheduled at {time} on {date}. Your queue placement is #{queue}. Please arrive on schedule.',
    dateLabel: 'Schedule Date',
    timeLabel: 'Session Time',
    ticketLabel: 'Ticket ID',
    symptomsLabel: 'Symptoms',
    noSymptoms: 'None reported',
    clinicalDiag: 'Clinical Diagnostics',
    defaultDiag: 'Vitals stable, no significant pathological changes identified.',
    diagPlaceholder: 'Diagnostics and prescriptions will be updated here once the physician completes the consultation.',
    labDiag: 'Laboratory & Diagnostic Reports',
    labNormal: 'Normal Range',
    labAbnormal: 'Abnormal Range',
    labUpdated: 'Updated:',
    prescribedMedicines: 'Prescribed Medicines',
    dosageLabel: 'Dosage:',
    usageLabel: 'Directions:',
    qtyLabel: 'Qty',
    deptLabel: 'Dept:',
  }
};

export default function AppointmentDetail() {
  const { lang, t } = useTranslation(trans);
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [appt, setAppt] = useState(null);
  const [rx, setRx] = useState(null);
  const [labs, setLabs] = useState([]);
  const [showTicket, setShowTicket] = useState(false);

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

  const getDoctorDisplayName = (name) => {
    if (!name) return '';
    const trimmed = name.trim();
    const bareName = trimmed.replace(/^(bs\.|bs\s|bác sĩ\s)/i, '').trim();
    return lang === 'vi' ? `BS. ${bareName}` : `Dr. ${bareName}`;
  };

  const getLocalizedDept = (dept) => {
    if (!dept) return '';
    if (lang === 'vi') return dept;
    const deptsMap = {
      'Khoa Nội': 'Internal Medicine',
      'Khoa Ngoại': 'Surgery',
      'Khoa Nhi': 'Pediatrics',
      'Khoa Sản': 'Obstetrics & Gynecology',
      'Khoa Da liễu': 'Dermatology',
      'Khoa Tai Mũi Họng': 'Otorhinolaryngology (ENT)',
      'Khoa Mắt': 'Ophthalmology',
      'Khoa Răng Hàm Mặt': 'Odonto-Stomatology',
      'Khoa Tim mạch': 'Cardiology',
      'Khoa Thần kinh': 'Neurology',
      'Khoa Cơ xương khớp': 'Orthopedics & Rheumatology',
      'Khoa Cấp cứu': 'Emergency Department',
      'Khoa Xét nghiệm': 'Laboratory Medicine',
      'Khoa Chẩn đoán hình ảnh': 'Diagnostic Imaging',
      'Ngoại tổng quát': 'General Surgery',
      'Nội tổng quát': 'General Internal Medicine',
    };
    return deptsMap[dept] || dept;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!appt) {
    return (
      <div className="text-center py-20 animate-in fade-in">
        <h2 className="text-2xl font-bold text-gray-800">{t.notFound}</h2>
        <button onClick={() => navigate(-1)} className="mt-4 text-primary hover:underline font-bold">{t.backSimple}</button>
      </div>
    );
  }

  const getNotOccurredSub = () => {
    return t.notOccurredSub
      .replace('{time}', appt.time)
      .replace('{date}', new Date(appt.date).toLocaleDateString(lang === 'vi' ? 'vi-VN' : 'en-US'))
      .replace('{queue}', appt.queueNumber || '--');
  };

  return (
    <div className="max-w-4xl mx-auto py-6">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-500 hover:text-primary transition-colors mb-6 font-bold text-sm"
      >
        <ArrowLeft size={16} /> {t.backBtn}
      </button>

      <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xl shadow-gray-200/20 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-gray-100 pb-8 mb-8">
          <div>
            <h1 className="text-3xl font-black text-gray-900 mb-2">{t.title}</h1>
            <p className="text-gray-500 font-medium">{t.subtitle}</p>
          </div>
          <div className="bg-blue-50 px-5 py-3 rounded-2xl border border-blue-100 flex items-center gap-4">
            <div className="text-blue-900">
              <p className="text-xs font-bold uppercase tracking-wider text-blue-500 mb-1">{t.attendingDoctor}</p>
              <p className="font-bold">{getDoctorDisplayName(appt.doctor?.userId?.fullName)}</p>
              <p className="text-sm font-medium">{getLocalizedDept(appt.doctor?.department)}</p>
            </div>
          </div>
        </div>

        {appt.status !== 'completed' && (
          <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 border border-orange-200 p-6 rounded-3xl mb-8 flex items-start gap-4 shadow-sm relative overflow-hidden">
            <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center shrink-0 shadow-inner">
              <Calendar size={24} />
            </div>
            <div>
              <h3 className="text-orange-950 font-black text-lg mb-1">{t.notOccurred}</h3>
              <p className="text-orange-900 text-sm leading-relaxed font-medium" dangerouslySetInnerHTML={{ __html: getNotOccurredSub() }} />
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
            <Calendar size={20} className="text-gray-400 mb-2" />
            <p className="text-xs font-bold text-gray-500 uppercase">{t.dateLabel}</p>
            <p className="font-black text-gray-900">{new Date(appt.date).toLocaleDateString(lang === 'vi' ? 'vi-VN' : 'en-US')}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
            <Clock size={20} className="text-gray-400 mb-2" />
            <p className="text-xs font-bold text-gray-500 uppercase">{t.timeLabel}</p>
            <p className="font-black text-gray-900">{appt.time}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
            <CreditCard size={20} className="text-gray-400 mb-2" />
            <p className="text-xs font-bold text-gray-500 uppercase">{t.ticketLabel}</p>
            <p className="font-black text-primary">{appt.ticketNumber}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
            <Activity size={20} className="text-gray-400 mb-2" />
            <p className="text-xs font-bold text-gray-500 uppercase">{t.symptomsLabel}</p>
            <p className="font-bold text-gray-900 truncate" title={appt.symptoms}>{appt.symptoms || t.noSymptoms}</p>
          </div>
        </div>

        <div className="space-y-8">
          {/* Diagnosis */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                <Stethoscope size={16} />
              </div>
              {t.clinicalDiag}
            </h2>
            <div className="bg-blue-50/50 border border-blue-100 p-6 rounded-2xl">
              <p className={`font-medium leading-relaxed ${appt.status === 'completed' ? 'text-blue-900' : 'text-gray-500 italic'}`}>
                {appt.status === 'completed' 
                  ? (rx?.diagnosis || t.defaultDiag)
                  : t.diagPlaceholder
                }
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
                {t.labDiag}
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
                        <p className="text-xs text-gray-500 mt-1">{t.labUpdated} {new Date(l.updatedAt || l.createdAt).toLocaleDateString(lang === 'vi' ? 'vi-VN' : 'en-US')}</p>
                      </div>
                    </div>
                    <span className={`px-4 py-2 rounded-xl text-sm font-bold ${l.status === 'normal' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {l.status === 'normal' ? t.labNormal : t.labAbnormal}
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
                {t.prescribedMedicines}
              </h2>
              <div className="bg-emerald-50/50 border border-emerald-100 p-6 rounded-2xl">
                <div className="space-y-3">
                  {rx.medicines.map((m, i) => (
                    <div key={i} className="bg-white p-5 rounded-xl border border-emerald-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <p className="font-bold text-gray-900 text-lg mb-1">{m.name}</p>
                        <div className="flex gap-4 text-sm font-medium text-gray-600">
                          <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> {t.dosageLabel} {m.dosage}</span>
                          <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> {t.usageLabel} {m.frequency}</span>
                        </div>
                      </div>
                      <div className="bg-emerald-50 px-4 py-3 rounded-xl border border-emerald-100 text-center md:text-right shrink-0">
                        <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider block mb-1">{t.qtyLabel}</span>
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

      {/* Premium Queue Ticket Check-in Modal */}
      {showTicket && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-250">
          <div className="bg-white rounded-[32px] w-full max-w-md overflow-hidden shadow-2xl border border-gray-100 transform scale-100 transition-all duration-300 animate-in zoom-in-95">
            {/* Ticket Header */}
            <div className="bg-primary text-white p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10" />
              <div className="flex justify-between items-center mb-4">
                <img src="/LOGO.png" alt="MediCare" className="h-8 w-auto object-contain no-invert" />
                <span className="text-[10px] font-black tracking-widest bg-white/20 px-2.5 py-1 rounded-full uppercase">
                  {lang === 'vi' ? 'Phiếu Khám Bệnh' : 'Medical Ticket'}
                </span>
              </div>
              <h3 className="text-xl font-black tracking-tight">{lang === 'vi' ? 'PHIẾU HẸN & SỐ THỨ TỰ' : 'QUEUE TICKET'}</h3>
              <p className="text-xs text-blue-200 mt-1 font-medium">{lang === 'vi' ? 'Hệ thống Y tế thông minh MediCare' : 'MediCare Smart Hospital System'}</p>
            </div>

            {/* Ticket Body */}
            <div className="p-6 space-y-6 relative">
              {/* Big Queue Number */}
              <div className="text-center py-4 bg-blue-50/50 rounded-2xl border border-blue-100/50 relative">
                <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1">{lang === 'vi' ? 'Số Thứ Tự Của Bạn' : 'Your Queue Number'}</p>
                <div className="inline-flex w-24 h-24 rounded-full bg-gradient-to-br from-primary to-blue-600 text-white items-center justify-center font-black text-4xl shadow-lg shadow-blue-500/20 my-2">
                  #{appt.queueNumber || '01'}
                </div>
                <p className="text-[10px] text-gray-500 font-bold px-4">{lang === 'vi' ? 'Vui lòng theo dõi bảng điện tử tại sảnh chờ' : 'Please watch the monitor in the waiting hall'}</p>
              </div>

              {/* Ticket Details */}
              <div className="space-y-3 text-sm">
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <span className="text-gray-400 font-bold">{lang === 'vi' ? 'Mã ca khám:' : 'Ticket ID:'}</span>
                  <span className="font-mono font-black text-gray-800">{appt.ticketNumber}</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <span className="text-gray-400 font-bold">{lang === 'vi' ? 'Bệnh nhân:' : 'Patient:'}</span>
                  <span className="font-black text-gray-800">{JSON.parse(localStorage.getItem('userInfo') || '{}').fullName}</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <span className="text-gray-400 font-bold">{lang === 'vi' ? 'Bác sĩ khám:' : 'Physician:'}</span>
                  <span className="font-bold text-primary">{getDoctorDisplayName(appt.doctor?.userId?.fullName)}</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <span className="text-gray-400 font-bold">{lang === 'vi' ? 'Chuyên khoa:' : 'Department:'}</span>
                  <span className="font-bold text-gray-800">{getLocalizedDept(appt.doctor?.department)}</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <span className="text-gray-400 font-bold">{lang === 'vi' ? 'Thời gian:' : 'Schedule:'}</span>
                  <span className="font-bold text-gray-800">{appt.time} • {new Date(appt.date).toLocaleDateString(lang === 'vi' ? 'vi-VN' : 'en-US')}</span>
                </div>
              </div>

              {/* Dummy Barcode using high-tech SVGs */}
              <div className="flex flex-col items-center justify-center pt-2">
                <svg className="w-64 h-12" overflow="visible">
                  {[...Array(32)].map((_, i) => (
                    <rect 
                      key={i} 
                      x={i * 8} 
                      y={0} 
                      width={i % 3 === 0 ? 4 : i % 5 === 0 ? 1 : 2} 
                      height={48} 
                      fill="#1e293b" 
                    />
                  ))}
                </svg>
                <p className="text-[9px] text-gray-400 font-mono tracking-widest mt-2">{appt._id}</p>
              </div>
            </div>

            {/* Ticket Footer Buttons */}
            <div className="bg-gray-50 px-6 py-4 flex gap-3 border-t border-gray-100">
              <button 
                onClick={() => window.print()}
                className="flex-1 py-2.5 bg-primary text-white text-xs font-bold rounded-xl hover:bg-blue-900 transition-all flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/10"
              >
                <Printer size={14} />
                {lang === 'vi' ? 'In phiếu' : 'Print Ticket'}
              </button>
              <button 
                onClick={() => setShowTicket(false)}
                className="px-4 py-2.5 bg-gray-200 text-gray-700 text-xs font-bold rounded-xl hover:bg-gray-300 transition-all font-bold"
              >
                {lang === 'vi' ? 'Đóng' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
