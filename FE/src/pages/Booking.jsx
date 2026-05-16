import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Search, ChevronRight, CheckCircle, ChevronDown, CreditCard, QrCode, AlertCircle, ShieldCheck, Download, Printer, ArrowRight } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const API_URL = 'http://localhost:5000';

const getAuthHeaders = () => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
  return { 'Authorization': `Bearer ${userInfo.token}`, 'Content-Type': 'application/json' };
};

const Booking = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const prefill = location.state || {};

  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedDepartment, setSelectedDepartment] = useState(prefill.prefilledDepartment || '');
  const [selectedSpecialty, setSelectedSpecialty] = useState(prefill.prefilledSpecialty || '');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [symptoms, setSymptoms] = useState(prefill.symptomsText || '');
  const [appointmentResult, setAppointmentResult] = useState(null);
  const [billResult, setBillResult] = useState(null);
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [isPaid, setIsPaid] = useState(false);

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
    if (!selectedDoctor || !selectedDate || !selectedTime) return alert('Vui lòng chọn đầy đủ thông tin!');

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
        // After booking, fetch the bill for this appointment
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
      alert('Đã xảy ra lỗi khi đặt lịch');
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
    return (
      <div className="max-w-2xl mx-auto mt-6 animate-in fade-in duration-700">
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden relative">
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none flex items-center justify-center">
            <img src="/LOGO.png" alt="watermark" className="w-96 h-auto" />
          </div>
          <div className="p-8 relative z-10 text-center border-b border-gray-100 bg-emerald-50/30">
            <CheckCircle className="text-emerald-500 mx-auto mb-4" size={48} />
            <h2 className="font-bold text-gray-800 text-lg">Bệnh viện Đa khoa MediCare</h2>
            <h1 className="text-2xl font-bold text-emerald-600 mb-1">PHIẾU HẸN KHÁM BỆNH</h1>
            <p className="text-sm text-gray-500">Mã phiếu: {appointmentResult.ticketNumber}</p>
          </div>
          <div className="p-8 relative z-10 text-center">
            <h2 className="text-2xl font-bold text-gray-800 uppercase mb-2">{selectedDoctor?.department}</h2>
            <p className="text-emerald-600 font-bold mb-8">Phòng 102 - Tầng 1 Khu A</p>
            <div className="w-24 h-24 rounded-full border-2 border-emerald-300 mx-auto mb-8 flex flex-col items-center justify-center bg-emerald-50">
              <span className="text-4xl font-bold text-emerald-500 leading-none">{appointmentResult.queueNumber}</span>
              <span className="text-xs text-emerald-400 font-medium mt-1">STT</span>
            </div>
            <div className="text-left space-y-4 max-w-sm mx-auto text-gray-800">
              <div className="flex justify-between border-b border-gray-100 pb-2"><span className="text-gray-500">Bệnh nhân:</span><span className="font-bold uppercase">{userInfo.fullName}</span></div>
              <div className="flex justify-between border-b border-gray-100 pb-2"><span className="text-gray-500">Mã BN:</span><span className="font-bold">{userInfo.patientId}</span></div>
              <div className="flex justify-between border-b border-gray-100 pb-2"><span className="text-gray-500">Thời gian:</span><span className="font-bold">{new Date(selectedDate).toLocaleDateString('vi-VN')} - {selectedTime}</span></div>
              <div className="flex justify-between border-b border-gray-100 pb-2"><span className="text-gray-500">Bác sĩ:</span><span className="font-bold">{selectedDoctor?.userId?.fullName}</span></div>
              <div className="flex justify-between pb-2"><span className="text-gray-500">Trạng thái:</span><span className="font-bold text-emerald-600 uppercase">Đã thanh toán</span></div>
            </div>
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-700 italic font-medium">Vui lòng đến trực tiếp phòng khám trước hẹn 15 phút.</p>
            </div>
          </div>
        </div>
        <div className="flex justify-center gap-4 mt-8">
          <button onClick={() => window.print()} className="px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-xl font-bold hover:bg-gray-50 flex items-center gap-2"><Printer size={18}/> In phiếu</button>
          <button onClick={() => navigate('/dashboard')} className="px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 flex items-center gap-2 shadow-lg shadow-primary/20">Về trang chủ <ArrowRight size={18}/></button>
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
            <h2 className="text-2xl font-black uppercase tracking-tight">Thanh toán tiền khám</h2>
            <p className="text-primary-light text-sm mt-2 font-medium">Vui lòng thanh toán để nhận phiếu hẹn và số thứ tự</p>
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
                <span className="text-xs font-black uppercase tracking-widest">Đang chờ thanh toán...</span>
              </div>
              <div className="space-y-4 text-sm font-medium text-gray-600 border-t border-gray-100 pt-6">
                <div className="flex justify-between"><span>Dịch vụ:</span><span className="font-bold text-gray-800">Phí khám bệnh chuyên khoa</span></div>
                <div className="flex justify-between"><span>Số tiền:</span><span className="font-black text-primary text-xl tracking-tighter">150.000 đ</span></div>
                <div className="flex justify-between"><span>Nội dung:</span><span className="font-bold text-gray-800 uppercase">MediCare HD {billResult?._id.substring(billResult._id.length - 6).toUpperCase()}</span></div>
              </div>
              <div className="p-4 bg-gray-50 rounded-2xl flex items-center gap-3 text-[10px] text-gray-500 font-medium">
                <ShieldCheck size={20} className="text-primary" />
                <p>Hệ thống sẽ tự động cập nhật và hiển thị phiếu hẹn ngay sau khi nhận được thanh toán từ ngân hàng.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8">
      <h1 className="text-3xl font-black text-gray-800 mb-8 tracking-tight">Đặt lịch khám bệnh</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
          {/* Step 1: Selection */}
          <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
            <h2 className="text-lg font-black text-gray-800 mb-8 flex items-center gap-3">
              <span className="w-10 h-10 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20">1</span>
              Chọn Chuyên khoa & Bác sĩ
            </h2>
            {loading ? <div className="text-center py-10"><div className="animate-spin h-8 w-8 border-b-2 border-primary rounded-full mx-auto"></div></div> : (
              <div className="space-y-8">
                <div>
                  <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3">Chọn Khoa</label>
                  <div className="relative">
                    <select className="w-full pl-6 pr-12 py-4 bg-gray-50 border border-gray-100 rounded-2xl appearance-none focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all text-gray-800 font-bold"
                      value={selectedDepartment}
                      onChange={(e) => { setSelectedDepartment(e.target.value); setSelectedSpecialty(''); setSelectedDoctor(null); setSelectedDate(null); setSelectedTime(null); }}
                    >
                      <option value="">-- Chọn Khoa --</option>
                      {departments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                    </select>
                    <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                {selectedDepartment && (
                  <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                    <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3">Chọn Chuyên khoa</label>
                    <div className="relative">
                      <select className="w-full pl-6 pr-12 py-4 bg-gray-50 border border-gray-100 rounded-2xl appearance-none focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all text-gray-800 font-bold"
                        value={selectedSpecialty}
                        onChange={(e) => { setSelectedSpecialty(e.target.value); setSelectedDoctor(null); setSelectedDate(null); setSelectedTime(null); }}
                      >
                        <option value="">-- Chọn Chuyên khoa --</option>
                        {specialties.map(spec => <option key={spec} value={spec}>{spec}</option>)}
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
                        <img src={`https://ui-avatars.com/api/?name=${doctor.userId.fullName}&background=random`} alt="Dr" className="w-16 h-16 rounded-2xl object-cover" />
                        <div className="flex-1">
                          <h3 className="font-black text-gray-800 text-lg tracking-tight">{doctor.userId.fullName}</h3>
                          <p className="text-xs text-primary font-bold uppercase tracking-tighter mt-1">{doctor.specialty} • {doctor.experience} Năm KN</p>
                          <div className="flex items-center gap-4 mt-3 text-[10px] text-gray-400 font-bold uppercase">
                            <span className="flex items-center gap-1">⭐ {doctor.rating}</span>
                            <span className="flex items-center gap-1 text-emerald-500">💰 {fixedFee.toLocaleString('vi-VN')} đ</span>
                          </div>
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
                Thời gian khám
              </h2>
              <div className="mb-8">
                <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-4">Ngày khám</p>
                <div className="flex gap-3 overflow-x-auto pb-4 custom-scrollbar">
                  {selectedDoctor.availableSlots.map((slot, idx) => (
                    <button key={idx} onClick={() => { setSelectedDate(slot.date); setSelectedTime(null); }}
                      className={`flex flex-col items-center min-w-[90px] p-4 rounded-2xl border-2 transition-all ${selectedDate === slot.date ? 'border-primary bg-primary text-white shadow-lg shadow-primary/20' : 'border-gray-50 hover:border-primary/20 text-gray-600'}`}
                    >
                      <span className="text-[10px] uppercase font-black mb-1">{new Date(slot.date).toLocaleDateString('vi-VN', { weekday: 'short' })}</span>
                      <span className="text-xl font-black">{new Date(slot.date).getDate()}</span>
                      <span className="text-[10px] font-bold">Tháng {new Date(slot.date).getMonth() + 1}</span>
                    </button>
                  ))}
                </div>
              </div>
              {selectedDate && (
                <div>
                  <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-4">Giờ khám</p>
                  <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
                    {selectedDoctor.availableSlots.find(s => s.date === selectedDate)?.times.map((t, idx) => (
                      <button key={idx} onClick={() => setSelectedTime(t)}
                        className={`py-3 rounded-xl text-xs font-black border-2 transition-all ${selectedTime === t ? 'border-primary bg-primary/10 text-primary' : 'border-gray-50 hover:border-primary/20 text-gray-600'}`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="lg:col-span-1">
          <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 sticky top-8">
            <h3 className="text-lg font-black text-gray-800 mb-8 tracking-tight">Chi tiết đặt hẹn</h3>
            {!selectedDoctor ? (
              <div className="text-center py-12 text-gray-300">
                <Calendar size={64} className="mx-auto mb-6 opacity-10" />
                <p className="text-xs font-bold uppercase tracking-widest leading-loose">Vui lòng chọn bác sĩ và thời gian khám</p>
              </div>
            ) : (
              <div className="space-y-8 animate-in fade-in duration-500">
                <div className="flex items-center gap-4 pb-8 border-b border-gray-50">
                  <img src={`https://ui-avatars.com/api/?name=${selectedDoctor.userId.fullName}&background=random`} alt="Dr" className="w-14 h-14 rounded-2xl object-cover" />
                  <div>
                    <h4 className="font-black text-gray-800 tracking-tight">{selectedDoctor.userId.fullName}</h4>
                    <p className="text-[10px] text-primary font-bold uppercase mt-1">{selectedDoctor.department}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-xs font-bold uppercase tracking-tighter">
                    <span className="text-gray-400 flex items-center gap-2"><Calendar size={14} /> Ngày</span>
                    <span className="text-gray-800">{selectedDate ? new Date(selectedDate).toLocaleDateString('vi-VN') : '---'}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs font-bold uppercase tracking-tighter">
                    <span className="text-gray-400 flex items-center gap-2"><Clock size={14} /> Giờ</span>
                    <span className="text-gray-800">{selectedTime || '---'}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs font-bold uppercase tracking-tighter pt-4 border-t border-gray-50">
                    <span className="text-gray-400">Phí khám</span>
                    <span className="text-lg font-black text-emerald-500 tracking-tighter">{fixedFee.toLocaleString('vi-VN')} đ</span>
                  </div>
                </div>
                <div className="pt-4">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Triệu chứng</p>
                  <textarea rows="3" className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-xs font-medium focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all resize-none"
                    placeholder="Mô tả triệu chứng..." value={symptoms} onChange={(e) => setSymptoms(e.target.value)} />
                </div>
                <button onClick={handleBooking} disabled={!selectedDate || !selectedTime}
                  className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl ${!selectedDate || !selectedTime ? 'bg-gray-100 text-gray-300 cursor-not-allowed' : 'bg-primary text-white hover:scale-[1.02] shadow-primary/30 active:scale-95'}`}
                >
                  Xác nhận & Thanh toán
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
