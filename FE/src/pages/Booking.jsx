import { API_URL } from '../config';
import React, { useState, useEffect } from 'react';
import { Calendar, Clock, ChevronDown, CreditCard, CheckCircle, ShieldCheck, Printer, ArrowRight } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';

// const API_URL = API_URL;

const getAuthHeaders = () => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
  return { 'Authorization': `Bearer ${userInfo.token}`, 'Content-Type': 'application/json' };
};

const trans = {
  vi: {
    bookingTitle: 'Đặt lịch khám bệnh',
    step1: 'Chọn Chuyên khoa & Bác sĩ',
    selectDeptLabel: 'Chọn Khoa',
    selectDeptPlaceholder: '-- Chọn Khoa --',
    selectSpecLabel: 'Chọn Chuyên khoa',
    selectSpecPlaceholder: '-- Chọn Chuyên khoa --',
    experienceYears: 'Năm KN',
    step2: 'Thời gian khám',
    dateLabel: 'Ngày khám',
    timeLabel: 'Giờ khám',
    detailTitle: 'Chi tiết đặt hẹn',
    detailPlaceholder: 'Vui lòng chọn bác sĩ và thời gian khám',
    attendingDoctor: 'Bác sĩ phụ trách',
    dateText: 'Ngày',
    timeText: 'Giờ',
    feeText: 'Phí khám',
    symptomsLabel: 'Triệu chứng',
    symptomsPlaceholder: 'Mô tả triệu chứng...',
    btnConfirm: 'Xác nhận & Thanh toán',
    validationAlert: 'Vui lòng chọn đầy đủ thông tin!',
    errorAlert: 'Đã xảy ra lỗi khi đặt lịch',
    currencyUnit: 'đ',
    
    // Slip
    slipHospitalName: 'Bệnh viện Đa khoa MediCare',
    slipTitle: 'PHIẾU HẸN KHÁM BỆNH',
    slipTicketNo: 'Mã phiếu:',
    slipRoom: 'Phòng 102 - Tầng 1 Khu A',
    slipQueueNoLabel: 'STT',
    slipPatient: 'Bệnh nhân:',
    slipPatientId: 'Mã BN:',
    slipTime: 'Thời gian:',
    slipDoctor: 'Bác sĩ:',
    slipStatus: 'Trạng thái:',
    slipPaidStatus: 'Đã thanh toán',
    slipNote: 'Vui lòng đến trực tiếp phòng khám trước hẹn 15 phút.',
    btnPrint: 'In phiếu',
    btnHome: 'Về trang chủ',

    // Payment Screen
    payTitle: 'Thanh toán tiền khám',
    paySubtitle: 'Vui lòng thanh toán để nhận phiếu hẹn và số thứ tự',
    payPending: 'Đang chờ thanh toán...',
    payService: 'Dịch vụ:',
    payServiceVal: 'Phí khám bệnh chuyên khoa',
    payAmount: 'Số tiền:',
    payContent: 'Nội dung:',
    payDisclaimer: 'Hệ thống sẽ tự động cập nhật và hiển thị phiếu hẹn ngay sau khi nhận được thanh toán từ ngân hàng.',
  },
  en: {
    bookingTitle: 'Book Clinical Appointment',
    step1: 'Select Specialty & Practitioner',
    selectDeptLabel: 'Select Clinical Department',
    selectDeptPlaceholder: '-- Select Department --',
    selectSpecLabel: 'Select Clinical Specialty',
    selectSpecPlaceholder: '-- Select Specialty --',
    experienceYears: 'Years Exp',
    step2: 'Appointment Timing',
    dateLabel: 'Consultation Date',
    timeLabel: 'Consultation Time',
    detailTitle: 'Booking Manifest',
    detailPlaceholder: 'Kindly select a practitioner and scheduling slots to proceed.',
    attendingDoctor: 'Attending Practitioner',
    dateText: 'Date',
    timeText: 'Time Slot',
    feeText: 'Consultation Fee',
    symptomsLabel: 'Pathological Symptoms',
    symptomsPlaceholder: 'Describe your symptoms, discomforts or relevant medical histories...',
    btnConfirm: 'Confirm & Settle Fee',
    validationAlert: 'Please provide all required parameters!',
    errorAlert: 'An error occurred during appointment reservation.',
    currencyUnit: 'USD',

    // Slip
    slipHospitalName: 'MediCare General Hospital',
    slipTitle: 'CLINICAL APPOINTMENT TICKET',
    slipTicketNo: 'Ticket ID:',
    slipRoom: 'Room 102 - Level 1 Clinic A',
    slipQueueNoLabel: 'Queue No.',
    slipPatient: 'Patient:',
    slipPatientId: 'Patient ID:',
    slipTime: 'Date & Time:',
    slipDoctor: 'Practitioner:',
    slipStatus: 'Status:',
    slipPaidStatus: 'Settled',
    slipNote: 'Kindly present this clinical ticket at the designated reception desk 15 minutes prior to your time slot.',
    btnPrint: 'Print Ticket',
    btnHome: 'Return Dashboard',

    // Payment Screen
    payTitle: 'Settle Consultation Fee',
    paySubtitle: 'Complete your financial transaction to retrieve clinical queue number and confirmation ticket',
    payPending: 'Awaiting transaction confirmation...',
    payService: 'Clinical Service:',
    payServiceVal: 'Specialist Consultation Fee',
    payAmount: 'Amount Due:',
    payContent: 'Transaction Reference:',
    payDisclaimer: 'Our banking ledger automatically validates real-time transactions. The appointment ticket will be instantly generated once payment clears.',
  }
};

const Booking = () => {
  const { lang, t } = useTranslation(trans);
  const navigate = useNavigate();
  const location = useLocation();
  const prefill = location.state || {};

  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedDepartment, setSelectedDepartment] = useState(prefill.prefilledDepartment || '');
  const [selectedSpecialty, setSelectedSpecialty] = useState(prefill.prefilledSpecialty || '');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState(null);
  const [availableTimes, setAvailableTimes] = useState([]);
  const [loadingTimes, setLoadingTimes] = useState(false);
  const [symptoms, setSymptoms] = useState(prefill.symptomsText || '');
  const [appointmentResult, setAppointmentResult] = useState(null);
  const [billResult, setBillResult] = useState(null);
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [isPaid, setIsPaid] = useState(false);

  const getDayOfWeek = (dateString) => {
    if (!dateString) return -1;
    const [y, m, d] = dateString.split('-');
    return new Date(y, m - 1, d).getDay();
  };

  // Fetch times when doctor or date changes
  useEffect(() => {
    const fetchAvailableTimes = async () => {
      if (!selectedDoctor || !selectedDate) {
        setAvailableTimes([]);
        setSelectedTime(null);
        return;
      }
      setLoadingTimes(true);
      try {
        const res = await fetch(`${API_URL}/api/appointments/doctors/${selectedDoctor._id}/availability?date=${selectedDate}`, {
          headers: getAuthHeaders()
        });
        const data = await res.json();
        if (data.success) {
          setAvailableTimes(data.data);
          setSelectedTime(null);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingTimes(false);
      }
    };
    fetchAvailableTimes();
  }, [selectedDoctor, selectedDate]);

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

  const getLocalizedGender = (gender) => {
    if (!gender) return lang === 'vi' ? 'Nam' : 'Male';
    if (lang === 'vi') return gender;
    return gender === 'Nam' ? 'Male' : 'Female';
  };

  const fmtFee = (n) => {
    return lang === 'vi'
      ? `${n.toLocaleString('vi-VN')} đ`
      : `$${Math.round(n / 25000).toLocaleString('en-US')}`;
  };

  useEffect(() => {
    fetchDoctors();
    fetchPaymentInfo();
  }, []);

  const fetchDoctors = async () => {
    try {
      const res = await fetch(`${API_URL}/api/appointments/doctors`, {
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (data.success) setDoctors(data.data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const fetchPaymentInfo = async () => {
    try {
      const res = await fetch(`${API_URL}/api/payment-info`);
      const data = await res.json();
      if (data.success) setPaymentInfo(data.data);
    } catch (err) { console.error(err); }
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!selectedDoctor || !selectedDate || !selectedTime) return alert(t.validationAlert);

    try {
      const res = await fetch(`${API_URL}/api/appointments`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          doctorId: selectedDoctor._id,
          date: selectedDate,
          time: selectedTime,
          symptoms
        })
      });
      const data = await res.json();
      
      if (data.success) {
        setAppointmentResult(data.data);
        const billsRes = await fetch(`${API_URL}/api/bills/my`, { headers: getAuthHeaders() });
        const billsData = await billsRes.json();
        if (billsData.success) {
          const matchingBill = billsData.data.find(b => b.appointment?._id === data.data._id);
          setBillResult(matchingBill);
        }
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
      alert(t.errorAlert);
    }
  };

  // Polling for payment status
  useEffect(() => {
    let interval;
    if (billResult && !isPaid) {
      interval = setInterval(async () => {
        try {
          const res = await fetch(`${API_URL}/api/bills/my`, { headers: getAuthHeaders() });
          const data = await res.json();
          if (data.success) {
            const updatedBill = data.data.find(b => b._id === billResult._id);
            if (updatedBill && updatedBill.status === 'paid') {
              setIsPaid(true);
              clearInterval(interval);
            }
          }
        } catch (err) { console.error(err); }
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [billResult?._id, isPaid]);

  const generateQrUrl = (bill) => {
    if (!paymentInfo || !bill) return '';
    const { bankId, accountNo, accountName } = paymentInfo;
    const description = `MediCare HD ${bill._id.substring(bill._id.length - 6).toUpperCase()}`;
    return `https://img.vietqr.io/image/${bankId}-${accountNo}-compact.png?amount=${bill.totalAmount}&addInfo=${encodeURIComponent(description)}&accountName=${encodeURIComponent(accountName)}`;
  };

  const departments = [...new Set(doctors.map(d => d.department))].sort();
  const specialties = selectedDepartment ? [...new Set(doctors.filter(d => d.department === selectedDepartment).map(d => d.specialty))].sort() : [];
  const filteredDoctors = selectedSpecialty ? doctors.filter(d => d.department === selectedDepartment && d.specialty === selectedSpecialty) : [];
  const fixedFee = 150000;

  // Render Appointment Slip (ONLY AFTER PAID)
  if (appointmentResult && isPaid) {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    const dateFormatted = lang === 'vi'
      ? new Date(selectedDate).toLocaleDateString('vi-VN')
      : new Date(selectedDate).toLocaleDateString('en-US');
    return (
      <div className="max-w-2xl mx-auto mt-6 animate-in fade-in duration-700">
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden relative">
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none flex items-center justify-center">
            <img src="/LOGO.png" alt="watermark" className="w-96 h-auto" />
          </div>
          <div className="p-8 relative z-10 text-center border-b border-gray-100 bg-emerald-50/30">
            <CheckCircle className="text-emerald-500 mx-auto mb-4" size={48} />
            <h2 className="font-bold text-gray-800 text-lg">{t.slipHospitalName}</h2>
            <h1 className="text-2xl font-bold text-emerald-600 mb-1">{t.slipTitle}</h1>
            <p className="text-sm text-gray-500">{t.slipTicketNo} {appointmentResult.ticketNumber}</p>
          </div>
          <div className="p-8 relative z-10 text-center">
            <h2 className="text-2xl font-bold text-gray-800 uppercase mb-2">{getLocalizedDept(selectedDoctor?.department)}</h2>
            <p className="text-emerald-600 font-bold mb-8">{t.slipRoom}</p>
            <div className="w-24 h-24 rounded-full border-2 border-emerald-300 mx-auto mb-8 flex flex-col items-center justify-center bg-emerald-50">
              <span className="text-4xl font-bold text-emerald-500 leading-none">{appointmentResult.queueNumber}</span>
              <span className="text-xs text-emerald-400 font-medium mt-1">{t.slipQueueNoLabel}</span>
            </div>
            <div className="text-left space-y-4 max-w-sm mx-auto text-gray-800">
              <div className="flex justify-between border-b border-gray-100 pb-2"><span className="text-gray-500">{t.slipPatient}</span><span className="font-bold uppercase">{userInfo.fullName}</span></div>
              <div className="flex justify-between border-b border-gray-100 pb-2"><span className="text-gray-500">{t.slipPatientId}</span><span className="font-bold">{userInfo.patientId}</span></div>
              <div className="flex justify-between border-b border-gray-100 pb-2"><span className="text-gray-500">{t.slipTime}</span><span className="font-bold">{dateFormatted} - {selectedTime}</span></div>
              <div className="flex justify-between border-b border-gray-100 pb-2"><span className="text-gray-500">{t.slipDoctor}</span><span className="font-bold">{getDoctorDisplayName(selectedDoctor?.userId?.fullName)}</span></div>
              <div className="flex justify-between pb-2"><span className="text-gray-500">{t.slipStatus}</span><span className="font-bold text-emerald-600 uppercase">{t.slipPaidStatus}</span></div>
            </div>
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-700 italic font-medium">{t.slipNote}</p>
            </div>
          </div>
        </div>
        <div className="flex justify-center gap-4 mt-8">
          <button onClick={() => window.print()} className="px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-xl font-bold hover:bg-gray-50 flex items-center gap-2"><Printer size={18}/> {t.btnPrint}</button>
          <button onClick={() => navigate('/dashboard')} className="px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 flex items-center gap-2 shadow-lg shadow-primary/20">{t.btnHome} <ArrowRight size={18}/></button>
        </div>
      </div>
    );
  }

  // Render Payment Screen (BEFORE PAID)
  if (appointmentResult && !isPaid) {
    return (
      <div className="max-w-2xl mx-auto mt-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="bg-white rounded-[40px] shadow-2xl border border-gray-100 overflow-hidden">
          <div className="p-8 bg-primary text-white text-center">
            <CreditCard className="mx-auto mb-4" size={48} />
            <h2 className="text-2xl font-black uppercase tracking-tight">{t.payTitle}</h2>
            <p className="text-primary-light text-sm mt-2 font-medium">{t.paySubtitle}</p>
          </div>
          <div className="p-10 flex flex-col items-center">
            <div className="bg-white p-4 rounded-3xl shadow-2xl border border-gray-100 mb-8">
              {billResult && (
                <img src={generateQrUrl(billResult)} alt="VietQR" className="w-64 h-64 object-contain" />
              )}
            </div>
            <div className="w-full max-w-sm space-y-6">
              <div className="flex items-center justify-center gap-3 py-2 px-4 bg-blue-50 text-blue-600 rounded-full animate-pulse mb-6">
                <Clock size={16} className="animate-spin" />
                <span className="text-xs font-black uppercase tracking-widest">{t.payPending}</span>
              </div>
              <div className="space-y-4 text-sm font-medium text-gray-600 border-t border-gray-100 pt-6">
                <div className="flex justify-between"><span>{t.payService}</span><span className="font-bold text-gray-800">{t.payServiceVal}</span></div>
                <div className="flex justify-between"><span>{t.payAmount}</span><span className="font-black text-primary text-xl tracking-tighter">{fmtFee(150000)}</span></div>
                <div className="flex justify-between"><span>{t.payContent}</span><span className="font-bold text-gray-800 uppercase">MediCare HD {billResult?._id.substring(billResult._id.length - 6).toUpperCase()}</span></div>
              </div>
              <div className="p-4 bg-gray-50 rounded-2xl flex items-center gap-3 text-[10px] text-gray-500 font-medium">
                <ShieldCheck size={20} className="text-primary" />
                <p>{t.payDisclaimer}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8">
      <h1 className="text-3xl font-black text-gray-800 mb-8 tracking-tight">{t.bookingTitle}</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
          {/* Step 1: Selection */}
          <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
            <h2 className="text-lg font-black text-gray-800 mb-8 flex items-center gap-3">
              <span className="w-10 h-10 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20">1</span>
              {t.step1}
            </h2>
            {loading ? <div className="text-center py-10"><div className="animate-spin h-8 w-8 border-b-2 border-primary rounded-full mx-auto"></div></div> : (
              <div className="space-y-8">
                <div>
                  <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3">{t.selectDeptLabel}</label>
                  <div className="relative">
                    <select className="w-full pl-6 pr-12 py-4 bg-gray-50 border border-gray-100 rounded-2xl appearance-none focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all text-gray-800 font-bold"
                      value={selectedDepartment}
                      onChange={(e) => { setSelectedDepartment(e.target.value); setSelectedSpecialty(''); setSelectedDoctor(null); setSelectedDate(null); setSelectedTime(null); }}
                    >
                      <option value="">{t.selectDeptPlaceholder}</option>
                      {departments.map(dept => <option key={dept} value={dept}>{getLocalizedDept(dept)}</option>)}
                    </select>
                    <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                {selectedDepartment && (
                  <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                    <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3">{t.selectSpecLabel}</label>
                    <div className="relative">
                      <select className="w-full pl-6 pr-12 py-4 bg-gray-50 border border-gray-100 rounded-2xl appearance-none focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all text-gray-800 font-bold"
                        value={selectedSpecialty}
                        onChange={(e) => { setSelectedSpecialty(e.target.value); setSelectedDoctor(null); setSelectedDate(null); setSelectedTime(null); }}
                      >
                        <option value="">{t.selectSpecPlaceholder}</option>
                        {specialties.map(spec => <option key={spec} value={spec}>{getLocalizedDept(spec)}</option>)}
                      </select>
                      <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                )}
                {selectedSpecialty && (
                  <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {filteredDoctors.map(doctor => (
                      <div key={doctor._id} onClick={() => { setSelectedDoctor(doctor); setSelectedDate(null); setSelectedTime(null); }}
                        className={`flex items-start gap-5 p-5 rounded-3xl border-2 cursor-pointer transition-all ${selectedDoctor?._id === doctor._id ? 'border-primary bg-primary/[0.02] shadow-xl shadow-primary/5' : 'border-gray-50 hover:border-primary/20 bg-white'}`}
                      >
                        <img 
                          src={doctor.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.userId.fullName)}&background=102A63&color=fff`} 
                          alt="Dr" 
                          onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.userId.fullName)}&background=102A63&color=fff`; }}
                          className="w-16 h-16 rounded-2xl object-cover shrink-0" 
                        />
                        <div className="flex-1">
                          <h3 className="font-black text-gray-800 text-lg tracking-tight flex items-center gap-2">
                            {getDoctorDisplayName(doctor.userId.fullName)}
                            <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide ${doctor.userId.gender === 'Nam' ? 'bg-blue-50 text-blue-600' : 'bg-pink-50 text-pink-600'}`}>
                              {getLocalizedGender(doctor.userId.gender)}
                            </span>
                          </h3>
                          <p className="text-xs text-primary font-bold uppercase tracking-tighter mt-1">{getLocalizedDept(doctor.specialty)} • {doctor.experience} {t.experienceYears}</p>
                        </div>
                        <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${selectedDoctor?._id === doctor._id ? 'border-primary bg-primary text-white' : 'border-gray-200'}`}>
                          {selectedDoctor?._id === doctor._id && <CheckCircle size={16} />}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          {/* Step 2: Date/Time */}
          {selectedDoctor && (
            <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 animate-in fade-in slide-in-from-bottom-6 duration-700">
              <h2 className="text-lg font-black text-gray-800 mb-8 flex items-center gap-3">
                <span className="w-10 h-10 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20">2</span>
                {t.step2}
              </h2>
              <div className="mb-8">
                <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-4">{t.dateLabel}</p>
                <input 
                  type="date" 
                  min={new Date().toISOString().split('T')[0]}
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all text-gray-800 font-bold"
                />
              </div>
              {selectedDate && (
                <div>
                  <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-4">{t.timeLabel}</p>
                  {loadingTimes ? (
                    <div className="text-center py-4"><div className="animate-spin h-6 w-6 border-b-2 border-primary rounded-full mx-auto"></div></div>
                  ) : getDayOfWeek(selectedDate) === 0 ? (
                    <div className="text-center py-4 text-red-500 text-sm font-medium bg-red-50 rounded-2xl border border-red-100 shadow-sm animate-in fade-in">
                      Bệnh viện không làm việc Chủ Nhật. Vui lòng chọn ngày khác!
                    </div>
                  ) : availableTimes.length > 0 ? (
                    <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
                      {availableTimes.map((t, idx) => (
                        <button key={idx} onClick={() => setSelectedTime(t)}
                          className={`py-3 rounded-xl text-xs font-black border-2 transition-all ${selectedTime === t ? 'border-primary bg-primary/10 text-primary' : 'border-gray-50 hover:border-primary/20 text-gray-600'}`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-orange-600 text-sm font-medium bg-orange-50 rounded-2xl border border-orange-100 shadow-sm animate-in fade-in">
                      Bác sĩ không có lịch trực vào ngày này hoặc đã kín lịch. Vui lòng chọn ngày khác!
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
        <div className="lg:col-span-1">
          <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 sticky top-8">
            <h3 className="text-lg font-black text-gray-800 mb-8 tracking-tight">{t.detailTitle}</h3>
            {!selectedDoctor ? (
              <div className="text-center py-12 text-gray-300">
                <Calendar size={64} className="mx-auto mb-6 opacity-10" />
                <p className="text-xs font-bold uppercase tracking-widest leading-loose">{t.detailPlaceholder}</p>
              </div>
            ) : (
              <div className="space-y-8 animate-in fade-in duration-500">
                <div className="flex items-center gap-4 pb-8 border-b border-gray-50">
                  <img 
                    src={selectedDoctor.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedDoctor.userId.fullName)}&background=102A63&color=fff`} 
                    alt="Dr" 
                    onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedDoctor.userId.fullName)}&background=102A63&color=fff`; }}
                    className="w-14 h-14 rounded-2xl object-cover shrink-0" 
                  />
                  <div>
                    <h4 className="font-black text-gray-800 tracking-tight flex items-center gap-1.5">
                      {getDoctorDisplayName(selectedDoctor.userId.fullName)}
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase ${selectedDoctor.userId.gender === 'Nam' ? 'bg-blue-50 text-blue-600' : 'bg-pink-50 text-pink-600'}`}>
                        {getLocalizedGender(selectedDoctor.userId.gender)}
                      </span>
                    </h4>
                    <p className="text-[10px] text-primary font-bold uppercase mt-1">{getLocalizedDept(selectedDoctor.department)}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-xs font-bold uppercase tracking-tighter">
                    <span className="text-gray-400 flex items-center gap-2"><Calendar size={14} /> {t.dateText}</span>
                    <span className="text-gray-800">{selectedDate ? new Date(selectedDate).toLocaleDateString(lang === 'vi' ? 'vi-VN' : 'en-US') : '---'}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs font-bold uppercase tracking-tighter">
                    <span className="text-gray-400 flex items-center gap-2"><Clock size={14} /> {t.timeText}</span>
                    <span className="text-gray-800">{selectedTime || '---'}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs font-bold uppercase tracking-tighter pt-4 border-t border-gray-50">
                    <span className="text-gray-400">{t.feeText}</span>
                    <span className="text-lg font-black text-emerald-500 tracking-tighter">{fmtFee(fixedFee)}</span>
                  </div>
                </div>
                <div className="pt-4">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">{t.symptomsLabel}</p>
                  <textarea rows="3" className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-xs font-medium focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all resize-none"
                    placeholder={t.symptomsPlaceholder} value={symptoms} onChange={(e) => setSymptoms(e.target.value)} />
                </div>
                <button onClick={handleBooking} disabled={!selectedDate || !selectedTime}
                  className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl ${!selectedDate || !selectedTime ? 'bg-gray-100 text-gray-300 cursor-not-allowed' : 'bg-primary text-white hover:scale-[1.02] shadow-primary/30 active:scale-95'}`}
                >
                  {t.btnConfirm}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Booking;
