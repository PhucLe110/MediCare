import { API_URL } from '../config';
import React, { useState, useEffect } from 'react';
import { 
  Users, Award, DollarSign, Calendar, Clipboard, 
  Search, Pill, FileText, CheckCircle2, ChevronRight, 
  Trash2, Plus, RefreshCw, UserCheck, AlertCircle, 
  Printer, X, Activity, Info
} from 'lucide-react';

const DoctorDashboard = () => {
  const [lang, setLang] = useState(localStorage.getItem('lang') || 'vi');
  const [activeTab, setActiveTab] = useState('confirmed'); // 'confirmed', 'completed', 'cancelled'
  const [appointments, setAppointments] = useState([]);
  const [medicinesList, setMedicinesList] = useState([]);
  const [profileData, setProfileData] = useState(null);
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Clinical Session Form State
  const [diagnosis, setDiagnosis] = useState('');
  const [doctorNotes, setDoctorNotes] = useState('');
  const [prescribedMedicines, setPrescribedMedicines] = useState([]);
  const [selectedMedId, setSelectedMedId] = useState('');
  const [medDosage, setMedDosage] = useState('500mg');
  const [medFrequency, setMedFrequency] = useState('2 lần/ngày (Sáng/Tối)');
  const [medDuration, setMedDuration] = useState('7 ngày');
  const [medQuantity, setMedQuantity] = useState(14);
  
  // Lab Tests State
  const [labTests, setLabTests] = useState([]);
  const [newTestName, setNewTestName] = useState('');
  const [newTestType, setNewTestType] = useState('blood');
  const [testNotes, setTestNotes] = useState('');

  // History state
  const [patientHistory, setPatientHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  // Notifications/Errors
  const [toast, setToast] = useState(null);

  // const API_URL = API_URL;
  const user = JSON.parse(localStorage.getItem('userInfo') || '{}');
  const authHeader = { Authorization: `Bearer ${user.token}` };

  useEffect(() => {
    const handleLangChange = () => setLang(localStorage.getItem('lang') || 'vi');
    window.addEventListener('language-change', handleLangChange);
    return () => window.removeEventListener('language-change', handleLangChange);
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Profile
      const profRes = await fetch(`${API_URL}/api/doctors/profile`, { headers: authHeader });
      const profData = await profRes.json();
      if (profData.success) {
        setProfileData(profData.data);
      }

      // 2. Fetch Appointments
      const apptRes = await fetch(`${API_URL}/api/doctors/appointments`, { headers: authHeader });
      const apptData = await apptRes.json();
      if (apptData.success) {
        setAppointments(apptData.data);
      }

      // 3. Fetch Medicines
      const medRes = await fetch(`${API_URL}/api/doctors/medicines`, { headers: authHeader });
      const medData = await medRes.json();
      if (medData.success) {
        setMedicinesList(medData.data);
      }
    } catch (error) {
      console.error(error);
      showToast(lang === 'vi' ? 'Lỗi đồng bộ dữ liệu hệ thống!' : 'Failed to synchronize system data!', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [lang]);

  // Load Patient clinical history
  const loadPatientHistory = async (patientId) => {
    setLoadingHistory(true);
    try {
      const res = await fetch(`${API_URL}/api/doctors/patient-history/${patientId}`, { headers: authHeader });
      const data = await res.json();
      if (data.success) {
        setPatientHistory(data.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleSelectAppt = (appt) => {
    setSelectedAppt(appt);
    setDiagnosis('');
    setDoctorNotes('');
    setPrescribedMedicines([]);
    setLabTests([]);
    loadPatientHistory(appt.patient._id);
  };

  // Prescribing Medicines Handlers
  const handleAddMedicine = () => {
    if (!selectedMedId) {
      showToast(lang === 'vi' ? 'Vui lòng chọn loại thuốc!' : 'Please select a medicine!', 'error');
      return;
    }
    const medObj = medicinesList.find(m => m._id === selectedMedId);
    if (!medObj) return;

    // Check duplicate
    if (prescribedMedicines.some(m => m.medicineId === selectedMedId)) {
      showToast(lang === 'vi' ? 'Thuốc này đã được thêm vào đơn!' : 'This medicine is already added!', 'error');
      return;
    }

    setPrescribedMedicines([
      ...prescribedMedicines,
      {
        medicineId: medObj._id,
        name: medObj.name,
        dosage: medDosage,
        frequency: medFrequency,
        duration: medDuration,
        quantity: Number(medQuantity),
        unitPrice: medObj.price || 0
      }
    ]);

    // reset fields
    setSelectedMedId('');
    setMedQuantity(14);
  };

  const handleRemoveMedicine = (medId) => {
    setPrescribedMedicines(prescribedMedicines.filter(m => m.medicineId !== medId));
  };

  // Lab Request Handlers
  const handleAddLabTest = () => {
    const defaultTestNames = {
      blood: lang === 'vi' ? 'Xét nghiệm công thức máu toàn phần' : 'Complete Blood Count (CBC)',
      urine: lang === 'vi' ? 'Xét nghiệm phân tích nước tiểu' : 'Urinalysis (UA)',
      xray: lang === 'vi' ? 'Chụp X-quang Ngực thẳng' : 'Chest X-Ray',
      mri: lang === 'vi' ? 'Chụp cộng hưởng từ khớp/não' : 'MRI Scan',
      ct: lang === 'vi' ? 'Chụp cắt lớp vi tính' : 'CT Scan',
      ultrasound: lang === 'vi' ? 'Siêu âm tổng quát ổ bụng' : 'Abdominal Ultrasound',
      ecg: lang === 'vi' ? 'Đo điện tâm đồ (ECG)' : 'Electrocardiogram (ECG)',
      other: lang === 'vi' ? 'Chỉ định lâm sàng khác' : 'Other Diagnostic Test'
    };

    const name = newTestName.trim() || defaultTestNames[newTestType];

    setLabTests([
      ...labTests,
      {
        testName: name,
        testType: newTestType,
        clinicalNotes: testNotes || (lang === 'vi' ? 'Đánh giá lâm sàng' : 'Clinical evaluation'),
        urgency: 'normal'
      }
    ]);

    setNewTestName('');
    setTestNotes('');
  };

  const handleRemoveLabTest = (index) => {
    setLabTests(labTests.filter((_, i) => i !== index));
  };

  // Submit Consultation / Diagnosis
  const handleSubmitDiagnosis = async () => {
    if (!diagnosis.trim()) {
      showToast(lang === 'vi' ? 'Vui lòng điền kết luận chẩn đoán!' : 'Please fill in the diagnosis conclusion!', 'error');
      return;
    }

    try {
      const payload = {
        diagnosis,
        doctorNotes,
        medicines: prescribedMedicines,
        labTests
      };

      const res = await fetch(`${API_URL}/api/doctors/diagnose/${selectedAppt._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success) {
        showToast(lang === 'vi' ? 'Kê đơn và hoàn tất ca khám thành công!' : 'Prescription completed and consultation saved!');
        setSelectedAppt(null);
        fetchData();
      } else {
        showToast(data.message, 'error');
      }
    } catch (error) {
      console.error(error);
      showToast(lang === 'vi' ? 'Không thể lưu chẩn đoán!' : 'Could not save diagnosis!', 'error');
    }
  };

  // Dictionary Translations
  const t = {
    vi: {
      doctorDesk: 'Bàn Làm Việc Bác Sĩ chuyên khoa',
      subtitle: 'Hệ thống quản lý chẩn đoán, kê đơn & chỉ định cận lâm sàng',
      totalAppts: 'Tổng ca phụ trách',
      patientsCured: 'Đã hoàn tất khám',
      clinicalExp: 'Kinh nghiệm lâm sàng',
      experienceSub: 'Thâm niên hoạt động bác sĩ',
      earnings: 'Doanh thu hôm nay',
      patientList: 'Danh sách bệnh nhân đăng ký',
      searchPatient: 'Tìm bệnh nhân...',
      noPatient: 'Không tìm thấy bệnh nhân nào',
      detailsTitle: 'Chi tiết ca khám & Bệnh án',
      selectToStart: 'Vui lòng chọn một ca khám để tiến hành chẩn đoán',
      symptoms: 'Triệu chứng khai báo:',
      aiSuspect: 'AI chẩn đoán nghi ngờ:',
      diagnoseTitle: 'KẾT LUẬN & CHỈ ĐỊNH ĐIỀU TRỊ',
      diagnosisLabel: 'Kết luận chẩn đoán bệnh:',
      diagnosisPlaceholder: 'Nhập chẩn đoán chính xác (VD: Viêm họng cấp, Gout cấp...)',
      adviceLabel: 'Lời dặn điều trị / Chế độ ăn uống:',
      advicePlaceholder: 'Uống thuốc đúng giờ, hạn chế bia rượu, tái khám sau 7 ngày...',
      prescribeTitle: 'Kê Đơn Thuốc Điều Trị',
      selectMed: 'Chọn thuốc...',
      qty: 'SL',
      dosage: 'Liều lượng',
      frequency: 'Tần suất uống',
      duration: 'Thời gian uống',
      btnAddMed: 'Thêm thuốc',
      medTableMed: 'Tên thuốc',
      medTableDosage: 'Liều dùng',
      medTableFreq: 'Cách dùng',
      medTableQty: 'Số lượng',
      medTableCost: 'Đơn giá',
      labRequestTitle: 'Chỉ Định Xét Nghiệm Cận Lâm Sàng',
      labTestName: 'Tên xét nghiệm (để trống lấy mặc định)',
      labTestType: 'Phân loại cận lâm sàng',
      labTestNotes: 'Ghi chú lâm sàng cho kỹ thuật viên',
      btnAddTest: 'Chỉ định XN',
      testTableType: 'Phân loại',
      testTableName: 'Tên xét nghiệm',
      btnSubmitConsult: 'Hoàn Tất Khám & Gửi Hóa Đơn',
      historyTitle: 'Lịch sử bệnh án cũ của bệnh nhân',
      viewHistory: 'Xem lịch sử đầy đủ',
      noHistory: 'Chưa có bệnh án cũ nào',
      date: 'Ngày khám',
      doctor: 'Bác sĩ phụ trách',
      treatment: 'Chẩn đoán điều trị',
      medicines: 'Đơn thuốc',
      labResults: 'Kết quả cận lâm sàng',
      close: 'Đóng',
      waitingList: 'Chờ khám',
      completedList: 'Đã khám xong',
      cancelledList: 'Đã hủy ca',
      refresh: 'Làm mới',
      phone: 'Điện thoại',
      gender: 'Giới tính',
      dob: 'Ngày sinh',
    },
    en: {
      doctorDesk: 'Specialist Physician Workspace',
      subtitle: 'Intelligent clinical diagnoses, prescriptions & lab test request center',
      totalAppts: 'Assigned Appointments',
      patientsCured: 'Completed Consultations',
      clinicalExp: 'Clinical Experience',
      experienceSub: 'Years of clinical practice',
      earnings: 'Earnings Today',
      patientList: 'Patient Consultation Registry',
      searchPatient: 'Search patient...',
      noPatient: 'No patients found',
      detailsTitle: 'Clinical Consultation Workspace',
      selectToStart: 'Please select a patient appointment card to start diagnosis',
      symptoms: 'Patient-declared Symptoms:',
      aiSuspect: 'Suspected AI Triage:',
      diagnoseTitle: 'CLINICAL CONSTRUCTS & DIAGNOSES',
      diagnosisLabel: 'Diagnostic Conclusion / Disease:',
      diagnosisPlaceholder: 'Enter precise medical conclusion (e.g. Acute Pharyngitis)',
      adviceLabel: 'Doctor Advice & Recommendations:',
      advicePlaceholder: 'Take pills on time, rest well, avoid drinking, follow-up in 7 days...',
      prescribeTitle: 'Pharmacological Prescription',
      selectMed: 'Select medicine...',
      qty: 'Qty',
      dosage: 'Dosage',
      frequency: 'Frequency',
      duration: 'Duration',
      btnAddMed: 'Prescribe',
      medTableMed: 'Medicine Name',
      medTableDosage: 'Dosage',
      medTableFreq: 'Frequency',
      medTableQty: 'Qty',
      medTableCost: 'Price',
      labRequestTitle: 'Diagnostic Lab Test Orders',
      labTestName: 'Test Name (leave empty for default)',
      labTestType: 'Test Category',
      labTestNotes: 'Clinical indications/notes for lab technicians',
      btnAddTest: 'Order Test',
      testTableType: 'Category',
      testTableName: 'Diagnostic Test',
      btnSubmitConsult: 'Submit Diagnoses & Issue Invoice',
      historyTitle: 'Patient Past Medical Records',
      viewHistory: 'Full Clinical History',
      noHistory: 'No past medical records',
      date: 'Date',
      doctor: 'Physician',
      treatment: 'Diagnosis',
      medicines: 'Prescription',
      labResults: 'Lab Results',
      close: 'Close',
      waitingList: 'Queueing',
      completedList: 'Diagnosed',
      cancelledList: 'Cancelled',
      refresh: 'Refresh',
      phone: 'Phone',
      gender: 'Gender',
      dob: 'DOB',
    }
  }[lang];

  // Filtering appointments based on tab and search
  const filteredAppointments = appointments.filter(a => {
    // Status check
    const statusMatches = 
      activeTab === 'confirmed' ? (a.status === 'confirmed' || a.status === 'pending') :
      activeTab === 'completed' ? (a.status === 'completed') :
      a.status === 'cancelled';

    // Search query check
    const nameMatches = a.patient?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        a.ticketNumber?.toLowerCase().includes(searchQuery.toLowerCase());

    return statusMatches && nameMatches;
  });

  return (
    <div className="space-y-6 font-sans">
      {/* Toast Alert */}
      {toast && (
        <div className={`fixed top-4 right-4 z-[9999] px-6 py-4 rounded-2xl shadow-xl flex items-center gap-3 border text-white font-bold animate-bounce-short ${
          toast.type === 'success' ? 'bg-emerald-500 border-emerald-400' : 'bg-rose-500 border-rose-400'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header Deck */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            <Activity className="text-primary animate-pulse" size={32} />
            {t.doctorDesk}
          </h1>
          <p className="text-sm text-gray-500 font-medium mt-1">{t.subtitle}</p>
        </div>
        <button 
          onClick={fetchData}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-blue-50 text-primary font-extrabold text-sm border border-blue-100 hover:bg-primary hover:text-white transition-all shadow-sm"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          {t.refresh}
        </button>
      </div>

      {/* Profile Metrics Deck */}
      {profileData && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-blue-900 to-indigo-950 text-white p-6 rounded-3xl shadow-lg shadow-indigo-900/10 border border-white/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full transform translate-x-8 -translate-y-8" />
            <p className="text-[11px] font-black text-blue-200 uppercase tracking-widest">{lang === 'vi' ? 'Bác sĩ phụ trách' : 'Physician'}</p>
            <h3 className="text-2xl font-black mt-2">{profileData.profile?.userId?.fullName}</h3>
            <p className="text-xs text-blue-300 font-bold mt-1">
              {profileData.profile?.specialty} • {profileData.profile?.department}
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-primary flex items-center justify-center border border-blue-100">
              <Calendar size={22} />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-extrabold uppercase tracking-wide">{t.totalAppts}</p>
              <h3 className="text-2xl font-black text-gray-900 mt-1">{appointments.length}</h3>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
              <Award size={22} />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-extrabold uppercase tracking-wide">{t.clinicalExp}</p>
              <h3 className="text-2xl font-black text-gray-900 mt-1">
                {profileData.profile?.experience || '0'} {lang === 'vi' ? 'năm' : 'years'}
              </h3>
              <p className="text-[10px] text-gray-400 font-bold mt-0.5">{t.experienceSub}</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
              <DollarSign size={22} />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-extrabold uppercase tracking-wide">{t.earnings}</p>
              <h3 className="text-2xl font-black text-gray-900 mt-1">
                {(profileData.stats?.totalEarnings || 0).toLocaleString('vi-VN')} VNĐ
              </h3>
            </div>
          </div>
        </div>
      )}

      {/* Main Attending Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left column: Registry & Patient cards */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col max-h-[850px]">
          <div className="p-6 border-b border-gray-100 bg-gray-50/50">
            <h2 className="text-lg font-black text-gray-800 uppercase tracking-tight flex items-center gap-2">
              <Users size={18} className="text-primary" />
              {t.patientList}
            </h2>
            
            {/* Filter Tabs */}
            <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mt-4">
              {[
                { id: 'confirmed', label: t.waitingList, color: 'bg-primary text-white' },
                { id: 'completed', label: t.completedList, color: 'bg-emerald-600 text-white' },
                { id: 'cancelled', label: t.cancelledList, color: 'bg-rose-600 text-white' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); setSelectedAppt(null); }}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                    activeTab === tab.id ? tab.color : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search Box */}
            <div className="relative mt-4">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder={t.searchPatient}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-primary focus:border-primary bg-white outline-none"
              />
            </div>
          </div>

          {/* List of cards */}
          <div className="flex-1 overflow-y-auto p-6 space-y-3">
            {filteredAppointments.length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle className="mx-auto text-gray-300 mb-2" size={32} />
                <p className="text-sm font-bold text-gray-400">{t.noPatient}</p>
              </div>
            ) : (
              filteredAppointments.map(appt => {
                const isSelected = selectedAppt?._id === appt._id;
                return (
                  <div
                    key={appt._id}
                    onClick={() => handleSelectAppt(appt)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex justify-between items-center ${
                      isSelected 
                        ? 'bg-blue-50 border-primary shadow-sm ring-1 ring-primary'
                        : 'bg-white border-gray-100 hover:border-gray-300 shadow-sm'
                    }`}
                  >
                    <div className="space-y-1 overflow-hidden pr-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-wider bg-blue-100 text-primary px-2 py-0.5 rounded">
                          #{appt.queueNumber || '01'}
                        </span>
                        <span className="text-[10px] font-bold text-gray-400 font-mono">
                          {appt.ticketNumber}
                        </span>
                      </div>
                      <h4 className="font-extrabold text-sm text-gray-800 truncate">{appt.patient?.fullName}</h4>
                      <p className="text-xs text-gray-500 font-medium">
                        {appt.time} • {new Date(appt.date).toLocaleDateString(lang === 'vi' ? 'vi-VN' : 'en-US')}
                      </p>
                      {appt.symptoms && (
                        <p className="text-xs text-gray-400 truncate italic">
                          "{appt.symptoms}"
                        </p>
                      )}
                    </div>
                    <ChevronRight size={16} className={isSelected ? 'text-primary' : 'text-gray-300'} />
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right column: Workspace diagnoses & prescription */}
        <div className="lg:col-span-7 space-y-6">
          {!selectedAppt ? (
            <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center shadow-sm h-full flex flex-col justify-center items-center min-h-[500px]">
              <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center text-primary mb-4 animate-bounce-slow">
                <Clipboard size={32} />
              </div>
              <h3 className="text-lg font-black text-gray-800 uppercase tracking-tight">{t.detailsTitle}</h3>
              <p className="text-sm text-gray-400 font-medium mt-2 max-w-sm">{t.selectToStart}</p>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-6">
              
              {/* Patient Quick Header Info */}
              <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-extrabold text-gray-800 flex items-center gap-2">
                      <UserCheck className="text-emerald-500" size={20} />
                      {selectedAppt.patient?.fullName}
                    </h3>
                    <div className="flex gap-4 text-xs text-gray-500 font-bold mt-2">
                      <span>{t.gender}: <strong className="text-gray-700">{selectedAppt.patient?.gender || 'Nam'}</strong></span>
                      {selectedAppt.patient?.dateOfBirth && (
                        <span>{t.dob}: <strong className="text-gray-700">{new Date(selectedAppt.patient?.dateOfBirth).toLocaleDateString(lang === 'vi' ? 'vi-VN' : 'en-US')}</strong></span>
                      )}
                      <span>{t.phone}: <strong className="text-gray-700">{selectedAppt.patient?.phone}</strong></span>
                    </div>
                  </div>
                  {/* Historical medical records search shortcut */}
                  <button
                    onClick={() => setShowHistoryModal(true)}
                    className="text-xs bg-indigo-50 text-indigo-600 font-black border border-indigo-100 px-4 py-2 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                  >
                    {t.viewHistory}
                  </button>
                </div>

                {/* Patient Symptoms */}
                {selectedAppt.symptoms && (
                  <div className="p-3 bg-white rounded-xl border border-gray-100">
                    <p className="text-xs font-bold text-gray-400 tracking-wider uppercase">{t.symptoms}</p>
                    <p className="text-sm text-gray-700 font-bold mt-1">"{selectedAppt.symptoms}"</p>
                  </div>
                )}
              </div>

              {activeTab === 'confirmed' ? (
                // Diagnosis form when in confirmed queue list
                <div className="space-y-6">
                  <div className="border-t border-gray-100 pt-6">
                    <h4 className="text-sm font-black text-gray-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <FileText size={16} className="text-primary" />
                      {t.diagnoseTitle}
                    </h4>

                    {/* Inputs */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-black text-gray-600 uppercase mb-1">{t.diagnosisLabel}</label>
                        <input
                          type="text"
                          required
                          value={diagnosis}
                          onChange={e => setDiagnosis(e.target.value)}
                          placeholder={t.diagnosisPlaceholder}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:ring-primary focus:border-primary outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-black text-gray-600 uppercase mb-1">{t.adviceLabel}</label>
                        <textarea
                          rows={3}
                          value={doctorNotes}
                          onChange={e => setDoctorNotes(e.target.value)}
                          placeholder={t.advicePlaceholder}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:ring-primary focus:border-primary outline-none resize-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Pharmacological Prescription Section */}
                  <div className="border-t border-gray-100 pt-6">
                    <h4 className="text-sm font-black text-gray-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Pill size={16} className="text-amber-500" />
                      {t.prescribeTitle}
                    </h4>

                    <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                        {/* Select Medicine */}
                        <div className="md:col-span-5">
                          <label className="block text-[10px] font-black text-gray-500 uppercase mb-1">{t.medTableMed}</label>
                          <select
                            value={selectedMedId}
                            onChange={e => setSelectedMedId(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:ring-primary focus:border-primary outline-none bg-white font-bold"
                          >
                            <option value="">{t.selectMed}</option>
                            {medicinesList.map(med => (
                              <option key={med._id} value={med._id}>
                                {med.name} ({(med.price || 0).toLocaleString('vi-VN')}đ)
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Dosage */}
                        <div className="md:col-span-3">
                          <label className="block text-[10px] font-black text-gray-500 uppercase mb-1">{t.dosage}</label>
                          <input
                            type="text"
                            value={medDosage}
                            onChange={e => setMedDosage(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:ring-primary focus:border-primary outline-none bg-white font-bold"
                          />
                        </div>

                        {/* Frequency */}
                        <div className="md:col-span-4">
                          <label className="block text-[10px] font-black text-gray-500 uppercase mb-1">{t.frequency}</label>
                          <input
                            type="text"
                            value={medFrequency}
                            onChange={e => setMedFrequency(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:ring-primary focus:border-primary outline-none bg-white font-bold"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                        {/* Duration */}
                        <div className="md:col-span-4">
                          <label className="block text-[10px] font-black text-gray-500 uppercase mb-1">{t.duration}</label>
                          <input
                            type="text"
                            value={medDuration}
                            onChange={e => setMedDuration(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:ring-primary focus:border-primary outline-none bg-white font-bold"
                          />
                        </div>

                        {/* Qty */}
                        <div className="md:col-span-3">
                          <label className="block text-[10px] font-black text-gray-500 uppercase mb-1">{t.qty}</label>
                          <input
                            type="number"
                            min={1}
                            value={medQuantity}
                            onChange={e => setMedQuantity(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:ring-primary focus:border-primary outline-none bg-white font-bold"
                          />
                        </div>

                        <div className="md:col-span-5 flex items-end">
                          <button
                            type="button"
                            onClick={handleAddMedicine}
                            className="w-full py-2 bg-amber-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 hover:bg-amber-600 transition-all shadow-md shadow-amber-500/10"
                          >
                            <Plus size={14} />
                            {t.btnAddMed}
                          </button>
                        </div>
                      </div>

                      {/* Prescribed Table */}
                      {prescribedMedicines.length > 0 && (
                        <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
                          <table className="w-full text-left text-xs border-collapse">
                            <thead>
                              <tr className="bg-gray-100 border-b border-gray-200 text-gray-600 font-extrabold">
                                <th className="p-3">{t.medTableMed}</th>
                                <th className="p-3">{t.medTableDosage}</th>
                                <th className="p-3">{t.medTableQty}</th>
                                <th className="p-3 text-right">{t.medTableCost}</th>
                                <th className="p-3 text-center"></th>
                              </tr>
                            </thead>
                            <tbody>
                              {prescribedMedicines.map(med => (
                                <tr key={med.medicineId} className="border-b border-gray-100 text-gray-700 font-bold hover:bg-gray-50/50">
                                  <td className="p-3">
                                    <p className="font-extrabold">{med.name}</p>
                                    <p className="text-[10px] text-gray-400 font-medium">{med.frequency} • {med.duration}</p>
                                  </td>
                                  <td className="p-3">{med.dosage}</td>
                                  <td className="p-3">{med.quantity}</td>
                                  <td className="p-3 text-right">{(med.unitPrice * med.quantity).toLocaleString('vi-VN')}đ</td>
                                  <td className="p-3 text-center">
                                    <button
                                      onClick={() => handleRemoveMedicine(med.medicineId)}
                                      className="text-rose-500 hover:text-rose-700 p-1"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Diagnostic Lab Test Orders Section */}
                  <div className="border-t border-gray-100 pt-6">
                    <h4 className="text-sm font-black text-gray-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <FileText size={16} className="text-blue-500" />
                      {t.labRequestTitle}
                    </h4>

                    <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                        <div className="md:col-span-5">
                          <label className="block text-[10px] font-black text-gray-500 uppercase mb-1">{t.labTestType}</label>
                          <select
                            value={newTestType}
                            onChange={e => setNewTestType(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:ring-primary focus:border-primary outline-none bg-white font-bold"
                          >
                            <option value="blood">{lang === 'vi' ? 'Xét nghiệm máu (Blood)' : 'Blood Test'}</option>
                            <option value="urine">{lang === 'vi' ? 'Xét nghiệm nước tiểu (Urine)' : 'Urine Analysis'}</option>
                            <option value="xray">{lang === 'vi' ? 'Chụp X-quang (X-Ray)' : 'X-Ray'}</option>
                            <option value="ultrasound">{lang === 'vi' ? 'Siêu âm (Ultrasound)' : 'Ultrasound'}</option>
                            <option value="ct">{lang === 'vi' ? 'Chụp CT-Scan' : 'CT Scan'}</option>
                            <option value="mri">{lang === 'vi' ? 'Chụp cộng hưởng từ MRI' : 'MRI Scan'}</option>
                            <option value="ecg">{lang === 'vi' ? 'Đo điện tâm đồ (ECG)' : 'ECG'}</option>
                            <option value="other">{lang === 'vi' ? 'Khác (Other)' : 'Other'}</option>
                          </select>
                        </div>

                        <div className="md:col-span-7">
                          <label className="block text-[10px] font-black text-gray-500 uppercase mb-1">{t.labTestName}</label>
                          <input
                            type="text"
                            value={newTestName}
                            onChange={e => setNewTestName(e.target.value)}
                            placeholder={lang === 'vi' ? 'Nhập tên xét nghiệm cụ thể' : 'Enter test name'}
                            className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:ring-primary focus:border-primary outline-none bg-white font-bold"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                        <div className="md:col-span-8">
                          <label className="block text-[10px] font-black text-gray-500 uppercase mb-1">{t.labTestNotes}</label>
                          <input
                            type="text"
                            value={testNotes}
                            onChange={e => setTestNotes(e.target.value)}
                            placeholder={lang === 'vi' ? 'Ghi chú kỹ thuật hoặc triệu chứng lâm sàng' : 'Indications'}
                            className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:ring-primary focus:border-primary outline-none bg-white font-bold"
                          />
                        </div>

                        <div className="md:col-span-4 flex items-end">
                          <button
                            type="button"
                            onClick={handleAddLabTest}
                            className="w-full py-2 bg-blue-600 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 hover:bg-blue-700 transition-all shadow-md shadow-blue-500/10"
                          >
                            <Plus size={14} />
                            {t.btnAddTest}
                          </button>
                        </div>
                      </div>

                      {/* Lab Test Requests list */}
                      {labTests.length > 0 && (
                        <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
                          <table className="w-full text-left text-xs border-collapse">
                            <thead>
                              <tr className="bg-gray-100 border-b border-gray-200 text-gray-600 font-extrabold">
                                <th className="p-3">{t.testTableType}</th>
                                <th className="p-3">{t.testTableName}</th>
                                <th className="p-3">Ghi chú lâm sàng</th>
                                <th className="p-3 text-center"></th>
                              </tr>
                            </thead>
                            <tbody>
                              {labTests.map((test, idx) => (
                                <tr key={idx} className="border-b border-gray-100 text-gray-700 font-bold hover:bg-gray-50/50">
                                  <td className="p-3 uppercase tracking-wider text-[10px] text-primary">{test.testType}</td>
                                  <td className="p-3 text-gray-900 font-extrabold">{test.testName}</td>
                                  <td className="p-3 text-gray-400 font-medium">{test.clinicalNotes}</td>
                                  <td className="p-3 text-center">
                                    <button
                                      onClick={() => handleRemoveLabTest(idx)}
                                      className="text-rose-500 hover:text-rose-700 p-1"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Submission deck */}
                  <div className="border-t border-gray-100 pt-6 flex justify-end gap-3">
                    <button
                      onClick={() => setSelectedAppt(null)}
                      className="px-6 py-3 rounded-2xl bg-gray-100 text-gray-600 font-extrabold text-sm hover:bg-gray-200 transition-all"
                    >
                      {t.close}
                    </button>
                    <button
                      onClick={handleSubmitDiagnosis}
                      className="px-6 py-3 rounded-2xl bg-primary text-white font-extrabold text-sm hover:bg-blue-800 transition-all shadow-lg shadow-blue-500/25 flex items-center gap-2"
                    >
                      <CheckCircle2 size={16} />
                      {t.btnSubmitConsult}
                    </button>
                  </div>
                </div>
              ) : (
                // Diagnosis summary view when looking at Completed/Cancelled list
                <div className="space-y-6">
                  <div className="p-4 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-100 font-bold text-sm flex items-center gap-2">
                    <CheckCircle2 size={18} />
                    {activeTab === 'completed' 
                      ? (lang === 'vi' ? 'Ca khám này đã được hoàn tất thăm khám thành công!' : 'This consultation has been completed successfully!')
                      : (lang === 'vi' ? 'Ca khám này đã bị hủy bỏ.' : 'This appointment was cancelled.')
                    }
                  </div>

                  {loadingHistory ? (
                    <div className="text-center py-6 text-gray-400 font-medium">{lang === 'vi' ? 'Đang truy xuất hồ sơ khám...' : 'Retrieving record...'}</div>
                  ) : (
                    patientHistory.filter(h => h.appointment._id === selectedAppt._id).map((hist, idx) => (
                      <div key={idx} className="space-y-6">
                        {hist.prescription && (
                          <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100 space-y-4">
                            <h4 className="text-sm font-black text-gray-800 uppercase tracking-wider flex items-center gap-2">
                              <FileText size={16} className="text-emerald-500" />
                              Hồ sơ chẩn đoán & Đơn thuốc
                            </h4>
                            
                            <div className="grid grid-cols-2 gap-4 text-xs font-bold text-gray-600">
                              <div>
                                <span className="text-gray-400 uppercase tracking-wider">Chẩn đoán:</span>
                                <p className="text-sm text-gray-900 font-extrabold mt-1">{hist.prescription.diagnosis}</p>
                              </div>
                              {hist.prescription.doctorNotes && (
                                <div>
                                  <span className="text-gray-400 uppercase tracking-wider">Lời dặn bác sĩ:</span>
                                  <p className="text-sm text-gray-900 font-extrabold mt-1">{hist.prescription.doctorNotes}</p>
                                </div>
                              )}
                            </div>

                            {hist.prescription.medicines && hist.prescription.medicines.length > 0 && (
                              <div className="border border-gray-200 rounded-xl overflow-hidden bg-white mt-4">
                                <table className="w-full text-left text-xs border-collapse">
                                  <thead>
                                    <tr className="bg-gray-100 border-b border-gray-200 text-gray-600 font-extrabold">
                                      <th className="p-3">{t.medTableMed}</th>
                                      <th className="p-3">{t.medTableDosage}</th>
                                      <th className="p-3">{t.medTableQty}</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {hist.prescription.medicines.map((med, mIdx) => (
                                      <tr key={mIdx} className="border-b border-gray-100 text-gray-700 font-bold">
                                        <td className="p-3">
                                          <p className="font-extrabold text-gray-900">{med.name}</p>
                                          <p className="text-[10px] text-gray-400 font-medium">{med.frequency} • {med.duration}</p>
                                        </td>
                                        <td className="p-3">{med.dosage}</td>
                                        <td className="p-3">{med.quantity}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </div>
                        )}

                        {hist.labRequests && hist.labRequests.length > 0 && (
                          <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100 space-y-4">
                            <h4 className="text-sm font-black text-gray-800 uppercase tracking-wider flex items-center gap-2">
                              <FlaskConical size={16} className="text-blue-500" />
                              Chỉ định cận lâm sàng & Kết quả
                            </h4>

                            <div className="space-y-3">
                              {hist.labRequests.map((req, rIdx) => (
                                <div key={rIdx} className="p-4 bg-white rounded-xl border border-gray-100 space-y-2">
                                  <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-black uppercase tracking-wider bg-blue-50 text-primary px-2 py-0.5 rounded">
                                      {req.testType}
                                    </span>
                                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                                      req.status === 'completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                                    }`}>
                                      {req.status === 'completed' ? 'Đã có kết quả' : 'Đang chờ xử lý'}
                                    </span>
                                  </div>
                                  <h5 className="font-extrabold text-sm text-gray-800">{req.testName}</h5>
                                  <p className="text-xs text-gray-400 font-medium">Ghi chú: {req.clinicalNotes}</p>

                                  {req.result && (
                                    <div className="mt-3 pt-3 border-t border-gray-100 bg-gray-50 p-3 rounded-lg space-y-2">
                                      <p className="text-xs font-black text-gray-500 uppercase tracking-wider flex items-center gap-1">
                                        <Info size={12} className="text-primary" />
                                        Kết luận kết quả xét nghiệm
                                      </p>
                                      <p className="text-sm text-gray-800 font-bold">{req.result.conclusion || 'Bình thường'}</p>
                                      {req.result.fileUrl && (
                                        <a
                                          href={`${API_URL}${req.result.fileUrl}`}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="text-xs text-primary font-bold hover:underline inline-flex items-center gap-1 mt-1"
                                        >
                                          <Printer size={12} />
                                          Tải File Kết Quả / Phiếu Xét Nghiệm
                                        </a>
                                      )}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  )}

                  <div className="flex justify-end pt-4 border-t border-gray-100">
                    <button
                      onClick={() => setSelectedAppt(null)}
                      className="px-6 py-2.5 rounded-xl bg-gray-100 text-gray-600 font-extrabold text-sm hover:bg-gray-200 transition-all"
                    >
                      {t.close}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Full Patient Past Medical History Modal */}
      {showHistoryModal && selectedAppt && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[85vh] shadow-2xl overflow-hidden flex flex-col relative animate-in fade-in zoom-in duration-200">
            <button 
              onClick={() => setShowHistoryModal(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 z-10"
            >
              <X size={18} />
            </button>

            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 bg-gray-50/50">
              <h3 className="text-lg font-black text-gray-800 uppercase tracking-tight flex items-center gap-2">
                <Clipboard size={20} className="text-primary" />
                {t.historyTitle}: <span className="text-primary">{selectedAppt.patient?.fullName}</span>
              </h3>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {loadingHistory ? (
                <div className="text-center py-12 text-gray-400 font-medium">{lang === 'vi' ? 'Đang truy xuất lịch sử y khoa...' : 'Loading history...'}</div>
              ) : patientHistory.length === 0 ? (
                <div className="text-center py-12">
                  <AlertCircle className="mx-auto text-gray-300 mb-2" size={36} />
                  <p className="text-sm font-bold text-gray-400">{t.noHistory}</p>
                </div>
              ) : (
                patientHistory.map((hist, idx) => (
                  <div key={idx} className="border border-gray-200 rounded-2xl p-5 space-y-4 hover:border-gray-300 transition-colors bg-white">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-100 pb-3 gap-2">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded">
                          {t.date}: {new Date(hist.appointment.date).toLocaleDateString(lang === 'vi' ? 'vi-VN' : 'en-US')}
                        </span>
                        <p className="text-xs text-gray-500 font-bold mt-1">
                          {t.doctor}: <strong className="text-gray-800">{hist.appointment.doctor?.userId?.fullName}</strong>
                        </p>
                      </div>
                      <span className="text-xs font-mono font-bold text-gray-400">#{hist.appointment.ticketNumber}</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-bold text-gray-600">
                      <div>
                        <span className="text-gray-400 uppercase tracking-wider">{t.treatment}:</span>
                        <p className="text-sm text-gray-800 font-extrabold mt-1">{hist.prescription?.diagnosis || 'Khám chuyên khoa'}</p>
                        {hist.prescription?.doctorNotes && (
                          <p className="text-xs text-gray-500 font-bold mt-1">Lời dặn: {hist.prescription.doctorNotes}</p>
                        )}
                      </div>

                      {hist.prescription?.medicines && hist.prescription.medicines.length > 0 && (
                        <div>
                          <span className="text-gray-400 uppercase tracking-wider">{t.medicines}:</span>
                          <ul className="list-disc pl-4 mt-1 space-y-1 text-gray-700">
                            {hist.prescription.medicines.map((m, mIdx) => (
                              <li key={mIdx}>
                                <strong className="text-gray-900">{m.name}</strong> • {m.dosage} ({m.quantity} viên) - {m.frequency}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {hist.labRequests && hist.labRequests.length > 0 && (
                      <div className="pt-3 border-t border-gray-100 space-y-2">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t.labResults}:</span>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {hist.labRequests.map((req, rIdx) => (
                            <div key={rIdx} className="p-3 bg-gray-50 rounded-xl border border-gray-150 text-xs font-bold space-y-1">
                              <div className="flex justify-between items-center text-[10px]">
                                <span className="uppercase text-primary font-black">{req.testType}</span>
                                <span className="text-emerald-600 font-black">{req.status === 'completed' ? 'Đã hoàn thành' : 'Đang xử lý'}</span>
                              </div>
                              <p className="text-gray-800 font-extrabold">{req.testName}</p>
                              {req.result && (
                                <p className="text-gray-600 font-medium italic mt-1 bg-white p-2 rounded border border-gray-100">
                                  Kết luận: {req.result.conclusion}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setShowHistoryModal(false)}
                className="px-6 py-2.5 rounded-xl bg-gray-200 text-gray-700 font-extrabold text-sm hover:bg-gray-300 transition-all"
              >
                {t.close}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorDashboard;
