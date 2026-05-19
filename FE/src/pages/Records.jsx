import { API_URL } from '../config';
import React, { useState, useEffect } from 'react';
import { FolderHeart, Calendar, FileText, Download, HeartPulse, Activity, UserCircle, Edit3, Save, Info, CheckCircle2, Droplet, Ruler, Scale, Loader2, ChevronRight } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';

// const API_URL = API_URL;

const getAuthHeaders = () => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${userInfo.token}`
  };
};

const trans = {
  vi: {
    title: 'Hồ Sơ Sức Khỏe',
    sub: 'Quản lý toàn diện dữ liệu y tế cá nhân của bạn',
    exportPdf: 'Xuất PDF',
    tabPersonal: 'Thông tin cá nhân',
    tabMedical: 'Bệnh án điện tử',
    notFilled: 'Chưa có thông tin sức khỏe!',
    notFilledSub: 'Việc cung cấp các thông tin cơ bản (nhóm máu, dị ứng) là bắt buộc để Bác sĩ có cơ sở chẩn đoán chính xác và kê đơn thuốc an toàn.',
    updateNow: 'Cập nhật ngay',
    healthProfile: 'Chỉ số sinh tồn & Tiền sử bệnh',
    edit: 'Chỉnh sửa',
    saving: 'Đang lưu...',
    save: 'Lưu thông tin',
    toastSaveSuccess: 'Lưu thành công',
    toastSaveSuccessSub: 'Thông tin sức khỏe đã được lưu thành công!',
    toastLoadError: 'Không thể tải dữ liệu sức khỏe và bệnh án.',
    toastSaveError: 'Lưu thất bại.',
    toastConnError: 'Lỗi kết nối, không thể lưu dữ liệu.',
    bloodType: 'Nhóm máu',
    selectBloodType: 'Chọn nhóm máu',
    height: 'Chiều cao (cm)',
    weight: 'Cân nặng (kg)',
    bloodPressure: 'Huyết áp trung bình',
    allergies: 'Tiền sử Dị ứng (Thuốc, Thức ăn...)',
    allergiesPlaceholder: 'Ghi rõ dị ứng với loại thuốc hay thức ăn nào...',
    noAllergies: 'Không ghi nhận dị ứng',
    noAllergiesDisplay: 'Không có hoặc chưa cập nhật',
    medicalHistory: 'Bệnh lý nền (Tiểu đường, Huyết áp...)',
    medicalHistoryPlaceholder: 'Liệt kê các bệnh lý mãn tính đang điều trị...',
    noMedicalHistory: 'Không ghi nhận bệnh nền',
    noMedicalHistoryDisplay: 'Không có hoặc chưa cập nhật',
    treatmentHistory: 'Lịch sử Chẩn đoán & Điều trị',
    treatmentHistorySub: 'Toàn bộ lịch sử đặt khám của bạn tại hệ thống MediCare, sắp xếp theo thứ tự mới nhất.',
    noMedicalHistoryData: 'Chưa có lịch sử khám bệnh',
    noMedicalHistoryDataSub: 'Bạn chưa có ca khám nào được ghi nhận trong hệ thống.',
    confirmed: 'Đã xác nhận',
    completed: 'Hoàn thành',
    cancelled: 'Đã hủy',
    ticketCode: 'Mã phiếu:',
    queueNo: 'Số thứ tự:',
    symptoms: 'Triệu chứng:',
    generalDept: 'Khám tổng quát',
    billingStatus: 'Thanh toán:',
    paid: 'Đã thanh toán',
    unpaid: 'Chưa thanh toán',
    viewDetails: 'Xem thông tin chi tiết',
    futureRecordsMsg: 'Chẩn đoán và đơn thuốc sẽ có sau khi bác sĩ hoàn tất ca khám',
    doctorTitle: 'Bác sĩ phụ trách',

    pdfTitle: 'HỒ SƠ SỨC KHỎE CÁ NHÂN',
    pdfSub: 'Bệnh viện Đa khoa MediCare',
    pdfPatientInfo: 'Thông tin bệnh nhân',
    pdfPatientName: 'Họ và tên',
    pdfPhone: 'Số điện thoại',
    pdfVitalSigns: 'Chỉ số sinh tồn',
    pdfBloodType: 'Nhóm máu',
    pdfBloodPressure: 'Huyết áp',
    pdfHeight: 'Chiều cao',
    pdfWeight: 'Cân nặng',
    pdfMedicalHistory: 'Tiền sử bệnh lý',
    pdfAllergies: 'Tiền sử Dị ứng',
    pdfHistoryTitle: 'Lịch sử Khám bệnh & Bệnh án điện tử',
    pdfNoHistory: 'Chưa có lịch sử khám bệnh ghi nhận trên hệ thống.',
    pdfTableDate: 'Ngày khám',
    pdfTableDept: 'Chuyên khoa / Khoa',
    pdfTableDoctor: 'Bác sĩ điều trị',
    pdfTableSymptoms: 'Triệu chứng lâm sàng',
    pdfTableStatus: 'Trạng thái',
    pdfFooterMsg: 'Báo cáo sức khỏe toàn diện tự động từ hệ thống quản lý MediCare Hospital • Ngày lập:',
  },
  en: {
    title: 'Health Profile',
    sub: 'Comprehensive management of your personal medical records',
    exportPdf: 'Export PDF',
    tabPersonal: 'Personal Info',
    tabMedical: 'Electronic Records',
    notFilled: 'No health profile entered!',
    notFilledSub: 'Providing key information (blood type, allergies) is mandatory to help doctors diagnose accurately and prescribe safely.',
    updateNow: 'Update Now',
    healthProfile: 'Vital Signs & Medical History',
    edit: 'Edit Profile',
    saving: 'Saving...',
    save: 'Save Profile',
    toastSaveSuccess: 'Save Succeeded',
    toastSaveSuccessSub: 'Health profile updated successfully!',
    toastLoadError: 'Could not load health profile and medical records.',
    toastSaveError: 'Save failed.',
    toastConnError: 'Connection error, could not save profile.',
    bloodType: 'Blood Group',
    selectBloodType: 'Select blood group',
    height: 'Height (cm)',
    weight: 'Weight (kg)',
    bloodPressure: 'Blood Pressure',
    allergies: 'Allergies & Sensitivities (Meds, Food...)',
    allergiesPlaceholder: 'Specify any known allergies to drugs or foods...',
    noAllergies: 'No known allergies',
    noAllergiesDisplay: 'None reported or not updated',
    medicalHistory: 'Pre-existing Conditions (Diabetes, HBP...)',
    medicalHistoryPlaceholder: 'List chronic illnesses or pre-existing conditions...',
    noMedicalHistory: 'No chronic conditions recorded',
    noMedicalHistoryDisplay: 'None reported or not updated',
    treatmentHistory: 'Diagnostic & Treatment Logs',
    treatmentHistorySub: 'Comprehensive clinical booking history within the MediCare ecosystem, sorted chronologically.',
    noMedicalHistoryData: 'No Clinical History',
    noMedicalHistoryDataSub: 'You have no clinical consultations recorded yet.',
    confirmed: 'Confirmed',
    completed: 'Completed',
    cancelled: 'Cancelled',
    ticketCode: 'Ticket ID:',
    queueNo: 'Queue No:',
    symptoms: 'Symptoms:',
    generalDept: 'General Consultation',
    billingStatus: 'Billing:',
    paid: 'Paid',
    unpaid: 'Unpaid',
    viewDetails: 'View Details',
    futureRecordsMsg: 'Diagnosis and prescriptions will be available once the physician completes the consultation.',
    doctorTitle: 'Attending Physician',

    pdfTitle: 'PERSONAL HEALTH PROFILE',
    pdfSub: 'MediCare General Hospital',
    pdfPatientInfo: 'Patient Details',
    pdfPatientName: 'Full Name',
    pdfPhone: 'Phone Number',
    pdfVitalSigns: 'Vital Indicators',
    pdfBloodType: 'Blood Group',
    pdfBloodPressure: 'Blood Pressure',
    pdfHeight: 'Height',
    pdfWeight: 'Weight',
    pdfMedicalHistory: 'Clinical Background',
    pdfAllergies: 'Allergies Profile',
    pdfHistoryTitle: 'Clinical Consultations & Electronic Records',
    pdfNoHistory: 'No clinical consultations recorded in the system database.',
    pdfTableDate: 'Schedule',
    pdfTableDept: 'Specialty / Dept',
    pdfTableDoctor: 'Attending Doctor',
    pdfTableSymptoms: 'Clinical Symptoms',
    pdfTableStatus: 'Status',
    pdfFooterMsg: 'Automated health report generated from MediCare Hospital Administration • Issued on:',
  }
};

const Records = () => {
  const { lang, t } = useTranslation(trans);
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(location.state?.activeTab || 'personal');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [labResults, setLabResults] = useState([]);
  const [apptLoading, setApptLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, type: 'success', message: '' });
  const [personalInfo, setPersonalInfo] = useState({
    bloodType: '',
    height: '',
    weight: '',
    bloodPressure: '',
    allergies: '',
    medicalHistory: '',
    isFilled: false
  });

  const getDoctorDisplayName = (name) => {
    if (!name) return t.doctorTitle;
    const trimmed = name.trim();
    const bareName = trimmed.replace(/^(bs\.|bs\s|bác sĩ\s)/i, '').trim();
    return lang === 'vi' ? `BS. ${bareName}` : `Dr. ${bareName}`;
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, type, message });
    setTimeout(() => setToast({ show: false, type: 'success', message: '' }), 3000);
  };

  // Fetch health profile and medical history on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, apptRes, rxRes, labRes] = await Promise.all([
          fetch(`${API_URL}/api/users/health-profile`, { headers: getAuthHeaders() }),
          fetch(`${API_URL}/api/appointments`, { headers: getAuthHeaders() }),
          fetch(`${API_URL}/api/prescriptions/my`, { headers: getAuthHeaders() }),
          fetch(`${API_URL}/api/lab-results/my`, { headers: getAuthHeaders() }),
        ]);
        const profileData = await profileRes.json();
        const apptData = await apptRes.json();
        const rxData = await rxRes.json();
        const labData = await labRes.json();

        if (profileData.success && profileData.data) {
          setPersonalInfo(prev => ({ ...prev, ...profileData.data }));
        }
        if (apptData.success) setAppointments(apptData.data);
        if (rxData.success) setPrescriptions(rxData.data);
        if (labData.success) setLabResults(labData.data);
      } catch (err) {
        showToast(t.toastLoadError, 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Scroll to highlighted appointment if provided in location state
  useEffect(() => {
    if (!loading && location.state?.highlightApptId && activeTab === 'medical') {
      setTimeout(() => {
        const el = document.getElementById(`appt-${location.state.highlightApptId}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 500); // Wait for render
    }
  }, [loading, location.state?.highlightApptId, activeTab]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/users/health-profile`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(personalInfo)
      });
      const data = await res.json();
      if (data.success) {
        setPersonalInfo(prev => ({ ...prev, ...data.data }));
        setIsEditing(false);
        showToast(t.toastSaveSuccessSub);
      } else {
        showToast(data.message || t.toastSaveError, 'error');
      }
    } catch (err) {
      showToast(t.toastConnError, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleExportPDF = () => {
    const printWindow = window.open('', '_blank');
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    
    printWindow.document.write(`
      <html>
        <head>
          <title>${t.pdfTitle} - MediCare Hospital</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
            body {
              font-family: 'Inter', sans-serif;
              color: #1e293b;
              padding: 40px;
              line-height: 1.6;
            }
            .header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              border-bottom: 3px solid #102a63;
              padding-bottom: 20px;
              margin-bottom: 40px;
            }
            .logo {
              height: 50px;
            }
            .title {
              text-align: right;
            }
            .title h1 {
              margin: 0;
              font-size: 24px;
              color: #102a63;
              font-weight: 900;
            }
            .title p {
              margin: 5px 0 0 0;
              font-size: 12px;
              color: #64748b;
              font-weight: 700;
              text-transform: uppercase;
            }
            .section {
              margin-bottom: 35px;
            }
            .section-title {
              font-size: 16px;
              font-weight: 800;
              color: #102a63;
              text-transform: uppercase;
              border-bottom: 1px solid #e2e8f0;
              padding-bottom: 8px;
              margin-bottom: 15px;
            }
            .grid {
              display: grid;
              grid-template-cols: 1fr 1fr;
              gap: 20px;
            }
            .info-item {
              background: #f8fafc;
              padding: 15px;
              border-radius: 12px;
              border: 1px solid #f1f5f9;
            }
            .info-label {
              font-size: 11px;
              text-transform: uppercase;
              color: #94a3b8;
              font-weight: 700;
              margin-bottom: 5px;
            }
            .info-value {
              font-size: 15px;
              font-weight: 700;
              color: #334155;
            }
            .full-width {
              grid-column: span 2;
            }
            .footer {
              margin-top: 60px;
              border-top: 1px solid #e2e8f0;
              padding-top: 20px;
              text-align: center;
              font-size: 11px;
              color: #94a3b8;
              font-weight: 600;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <img src="${window.location.origin}/LOGO.png" class="logo" />
            <div class="title">
              <h1>${t.pdfTitle}</h1>
              <p>${t.pdfSub}</p>
            </div>
          </div>
          
          <div class="section">
            <div class="section-title">${t.pdfPatientInfo}</div>
            <div class="grid">
              <div class="info-item">
                <div class="info-label">${t.pdfPatientName}</div>
                <div class="info-value">${userInfo.fullName || (lang === 'vi' ? 'Chưa cập nhật' : 'Not updated')}</div>
              </div>
              <div class="info-item">
                <div class="info-label">${t.pdfPhone}</div>
                <div class="info-value">${userInfo.phone || (lang === 'vi' ? 'Chưa cập nhật' : 'Not updated')}</div>
              </div>
            </div>
          </div>
          
          <div class="section">
            <div class="section-title">${t.pdfVitalSigns}</div>
            <div class="grid">
              <div class="info-item">
                <div class="info-label">${t.pdfBloodType}</div>
                <div class="info-value">${personalInfo.bloodType || (lang === 'vi' ? 'Chưa cập nhật' : 'Not updated')}</div>
              </div>
              <div class="info-item">
                <div class="info-label">${t.pdfBloodPressure}</div>
                <div class="info-value">${personalInfo.bloodPressure || (lang === 'vi' ? 'Chưa cập nhật' : 'Not updated')}</div>
              </div>
              <div class="info-item">
                <div class="info-label">${t.pdfHeight}</div>
                <div class="info-value">${personalInfo.height ? personalInfo.height + ' cm' : (lang === 'vi' ? 'Chưa cập nhật' : 'Not updated')}</div>
              </div>
              <div class="info-item">
                <div class="info-label">${t.pdfWeight}</div>
                <div class="info-value">${personalInfo.weight ? personalInfo.weight + ' kg' : (lang === 'vi' ? 'Chưa cập nhật' : 'Not updated')}</div>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">${t.pdfMedicalHistory}</div>
            <div class="grid">
              <div class="info-item full-width">
                <div class="info-label">${t.pdfAllergies}</div>
                <div class="info-value" style="color: #b91c1c;">${personalInfo.allergies || t.noAllergies}</div>
              </div>
              <div class="info-item full-width">
                <div class="info-label">${t.medicalHistory}</div>
                <div class="info-value">${personalInfo.medicalHistory || t.noMedicalHistory}</div>
              </div>
            </div>
          </div>

          <!-- Bệnh án điện tử / Lịch sử khám bệnh -->
          <div class="section" style="page-break-before: always; margin-top: 40px;">
            <div class="section-title">${t.pdfHistoryTitle}</div>
            ${appointments.length === 0 ? `
              <p style="font-size: 13px; color: #94a3b8; font-style: italic;">${t.pdfNoHistory}</p>
            ` : `
              <table style="width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 15px;">
                <thead>
                  <tr style="background: #f8fafc; border-bottom: 2px solid #e2e8f0; text-align: left;">
                    <th style="padding: 12px 10px; font-weight: 700; color: #475569;">${t.pdfTableDate}</th>
                    <th style="padding: 12px 10px; font-weight: 700; color: #475569;">${t.pdfTableDept}</th>
                    <th style="padding: 12px 10px; font-weight: 700; color: #475569;">${t.pdfTableDoctor}</th>
                    <th style="padding: 12px 10px; font-weight: 700; color: #475569;">${t.pdfTableSymptoms}</th>
                    <th style="padding: 12px 10px; font-weight: 700; color: #475569; text-align: right;">${t.pdfTableStatus}</th>
                  </tr>
                </thead>
                <tbody>
                  ${[...appointments].reverse().map(appt => {
                    const dateStr = lang === 'vi' 
                      ? new Date(appt.date).toLocaleDateString('vi-VN')
                      : new Date(appt.date).toLocaleDateString('en-US');
                    const statusText = appt.status === 'completed' ? t.completed : appt.status === 'confirmed' ? t.confirmed : t.cancelled;
                    const statusColor = appt.status === 'completed' ? '#16a34a' : appt.status === 'confirmed' ? '#2563eb' : '#94a3b8';
                    const docName = getDoctorDisplayName(appt.doctor?.userId?.fullName);
                    return `
                      <tr style="border-bottom: 1px solid #f1f5f9;">
                        <td style="padding: 12px 10px; font-weight: 700; color: #334155;">
                          ${dateStr}<br/>
                          <span style="font-size: 10px; color: #94a3b8; font-weight: 500;">${appt.time}</span>
                        </td>
                        <td style="padding: 12px 10px; font-weight: 700; color: #102a63;">
                          ${appt.doctor?.specialty || appt.doctor?.department || t.generalDept}<br/>
                          <span style="font-size: 10px; color: #64748b; font-weight: 500;">${appt.doctor?.department || ''}</span>
                        </td>
                        <td style="padding: 12px 10px; font-weight: 600; color: #334155;">${docName}</td>
                        <td style="padding: 12px 10px; color: #64748b; font-style: italic;">${appt.symptoms || (lang === 'vi' ? 'Khám định kỳ' : 'Routine check-up')}</td>
                        <td style="padding: 12px 10px; text-align: right; font-weight: 700; color: ${statusColor};">${statusText}</td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            `}
          </div>

          <div class="footer">
            ${t.pdfFooterMsg} ${lang === 'vi' ? new Date().toLocaleDateString('vi-VN') : new Date().toLocaleDateString('en-US')}
          </div>
          
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto animate-pulse space-y-6">
        <div className="h-28 bg-gray-100 rounded-3xl"></div>
        <div className="h-12 bg-gray-100 rounded-2xl w-80"></div>
        <div className="h-96 bg-gray-100 rounded-3xl"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto relative">
      
      {/* Custom Toast Notification */}
      <div className={`fixed top-8 right-8 z-50 transition-all duration-500 transform ${toast.show ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0 pointer-events-none'}`}>
        <div className={`bg-white px-6 py-4 rounded-2xl shadow-xl flex items-center gap-3 border ${toast.type === 'error' ? 'border-red-100 shadow-red-500/10' : 'border-green-100 shadow-green-500/10'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${toast.type === 'error' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
            <CheckCircle2 size={18} />
          </div>
          <div>
            <h4 className="font-bold text-gray-800 text-sm">{toast.type === 'error' ? (lang === 'vi' ? 'Đã có lỗi xảy ra' : 'Error occurred') : t.toastSaveSuccess}</h4>
            <p className="text-xs text-gray-500">{toast.message}</p>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-end mb-8 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 text-primary rounded-2xl flex items-center justify-center shadow-inner relative z-10">
            <FolderHeart size={32} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800 bg-clip-text text-transparent bg-gradient-to-r from-gray-800 to-primary">{t.title}</h1>
            <p className="text-gray-500 mt-1">{t.sub}</p>
          </div>
        </div>
        <button onClick={handleExportPDF} className="px-5 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl hover:border-primary hover:text-primary transition-all flex items-center gap-2 text-sm font-bold shadow-sm group">
          <Download size={16} className="group-hover:-translate-y-0.5 transition-transform" /> {t.exportPdf}
        </button>
      </div>

      {/* Modern Tabs */}
      <div className="flex gap-2 mb-8 bg-white p-2 rounded-2xl shadow-sm border border-gray-100 inline-flex">
        <button 
          onClick={() => setActiveTab('personal')}
          className={`py-3 px-6 rounded-xl font-bold transition-all flex items-center gap-2 text-sm ${
            activeTab === 'personal' ? 'bg-primary text-white shadow-md' : 'bg-transparent text-gray-500 hover:bg-gray-50'
          }`}
        >
          <UserCircle size={18} /> {t.tabPersonal}
        </button>
        <button 
          onClick={() => setActiveTab('medical')}
          className={`py-3 px-6 rounded-xl font-bold transition-all flex items-center gap-2 text-sm ${
            activeTab === 'medical' ? 'bg-primary text-white shadow-md' : 'bg-transparent text-gray-500 hover:bg-gray-50'
          }`}
        >
          <FileText size={18} /> {t.tabMedical}
        </button>
      </div>

      {/* Tab Content 1: Personal Info */}
      {activeTab === 'personal' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {!personalInfo.isFilled && !isEditing && (
            <div className="bg-gradient-to-r from-orange-50 to-orange-100/50 border border-orange-200 p-6 rounded-3xl mb-8 flex items-start gap-4 shadow-sm relative overflow-hidden">
              <div className="absolute right-0 top-0 opacity-5 transform translate-x-4 -translate-y-4">
                <Info size={120} />
              </div>
              <div className="w-12 h-12 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center shrink-0 shadow-inner z-10">
                <Info size={24} />
              </div>
              <div className="z-10">
                <h3 className="text-orange-800 font-bold text-lg mb-1">{t.notFilled}</h3>
                <p className="text-orange-700 text-sm mb-4 max-w-2xl leading-relaxed">
                  {t.notFilledSub}
                </p>
                <button 
                  onClick={() => setIsEditing(true)}
                  className="px-6 py-2.5 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 transition-all shadow-md hover:shadow-lg"
                >
                  {t.updateNow}
                </button>
              </div>
            </div>
          )}

          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xl shadow-gray-200/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl -z-10 opacity-50"></div>
            
            <div className="flex justify-between items-center mb-8 pb-6 border-b border-gray-50">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-3">
                <HeartPulse className="text-primary" /> {t.healthProfile}
              </h2>
              {!isEditing ? (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="px-5 py-2.5 bg-blue-50 text-primary font-bold rounded-xl hover:bg-primary hover:text-white transition-all flex items-center gap-2 text-sm"
                >
                  <Edit3 size={16} /> {t.edit}
                </button>
              ) : (
                <button 
                  onClick={handleSave}
                  disabled={saving}
                  className="px-6 py-2.5 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600 transition-all flex items-center gap-2 text-sm shadow-md shadow-green-500/20 disabled:opacity-70 disabled:cursor-wait"
                >
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  {saving ? t.saving : t.save}
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-6">
                <div>
                  <label className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2"><Droplet size={16} className="text-red-500" /> {t.bloodType}</label>
                  {isEditing ? (
                    <select 
                      className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      value={personalInfo.bloodType}
                      onChange={(e) => setPersonalInfo({...personalInfo, bloodType: e.target.value})}
                    >
                      <option value="">{t.selectBloodType}</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                    </select>
                  ) : (
                    <div className="p-4 bg-gray-50/80 rounded-xl border border-gray-100 flex items-center">
                      <span className="text-lg font-bold text-gray-800">{personalInfo.bloodType || (lang === 'vi' ? 'Chưa cập nhật' : 'Not updated')}</span>
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2"><Ruler size={16} className="text-blue-500" /> {t.height}</label>
                    {isEditing ? (
                      <input type="number" className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all" value={personalInfo.height} onChange={(e) => setPersonalInfo({...personalInfo, height: e.target.value})} placeholder="VD: 165" />
                    ) : (
                      <div className="p-4 bg-gray-50/80 rounded-xl border border-gray-100 flex items-center">
                        <span className="text-lg font-bold text-gray-800">{personalInfo.height ? `${personalInfo.height} cm` : '--'}</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2"><Scale size={16} className="text-green-500" /> {t.weight}</label>
                    {isEditing ? (
                      <input type="number" className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all" value={personalInfo.weight} onChange={(e) => setPersonalInfo({...personalInfo, weight: e.target.value})} placeholder="VD: 55" />
                    ) : (
                      <div className="p-4 bg-gray-50/80 rounded-xl border border-gray-100 flex items-center">
                        <span className="text-lg font-bold text-gray-800">{personalInfo.weight ? `${personalInfo.weight} kg` : '--'}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2"><Activity size={16} className="text-purple-500" /> {t.bloodPressure}</label>
                  {isEditing ? (
                    <input type="text" className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all" value={personalInfo.bloodPressure} onChange={(e) => setPersonalInfo({...personalInfo, bloodPressure: e.target.value})} placeholder="VD: 110/70" />
                  ) : (
                    <div className="p-4 bg-gray-50/80 rounded-xl border border-gray-100 flex items-center">
                      <span className="text-lg font-bold text-gray-800">{personalInfo.bloodPressure || (lang === 'vi' ? 'Chưa cập nhật' : 'Not updated')}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">{t.allergies}</label>
                  {isEditing ? (
                    <textarea rows="4" className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 resize-none outline-none transition-all" value={personalInfo.allergies} onChange={(e) => setPersonalInfo({...personalInfo, allergies: e.target.value})} placeholder={t.allergiesPlaceholder}></textarea>
                  ) : (
                    <div className="min-h-[100px] bg-red-50/30 p-5 rounded-2xl border border-red-100">
                      {personalInfo.allergies ? <p className="text-red-700 font-medium leading-relaxed">{personalInfo.allergies}</p> : <p className="text-gray-400 italic text-sm">{t.noAllergiesDisplay}</p>}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">{t.medicalHistory}</label>
                  {isEditing ? (
                    <textarea rows="4" className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 resize-none outline-none transition-all" value={personalInfo.medicalHistory} onChange={(e) => setPersonalInfo({...personalInfo, medicalHistory: e.target.value})} placeholder={t.medicalHistoryPlaceholder}></textarea>
                  ) : (
                    <div className="min-h-[100px] bg-orange-50/30 p-5 rounded-2xl border border-orange-100">
                      {personalInfo.medicalHistory ? <p className="text-orange-800 font-medium leading-relaxed">{personalInfo.medicalHistory}</p> : <p className="text-gray-400 italic text-sm">{t.noMedicalHistoryDisplay}</p>}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content 2: Medical Records (Bệnh án) — REAL DATA */}
      {activeTab === 'medical' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/20 relative">
            <h2 className="text-xl font-bold text-gray-800 mb-2">{t.treatmentHistory}</h2>
            <p className="text-gray-500 text-sm mb-10">{t.treatmentHistorySub}</p>

            {apptLoading ? (
              <div className="space-y-4 animate-pulse">
                {[1,2,3].map(i => <div key={i} className="h-36 bg-gray-100 rounded-2xl"></div>)}
              </div>
            ) : appointments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <FileText size={36} className="text-gray-300" />
                </div>
                <h3 className="font-bold text-gray-500 text-lg mb-1">{t.noMedicalHistoryData}</h3>
                <p className="text-gray-400 text-sm">{t.noMedicalHistoryDataSub}</p>
              </div>
            ) : (
              <div className="relative">
                <div className="absolute left-[7px] top-6 bottom-6 w-0.5 bg-gray-100 hidden md:block"></div>
                <div className="space-y-6">
                  {[...appointments].reverse().map((appt, idx) => {
                    const isLatest = idx === 0;
                    const statusColor = appt.status === 'confirmed' ? 'bg-blue-500' : appt.status === 'completed' ? 'bg-green-500' : 'bg-gray-400';
                    const statusLabel = appt.status === 'confirmed' ? t.confirmed : appt.status === 'completed' ? t.completed : appt.status === 'cancelled' ? t.cancelled : appt.status;
                    const isHighlighted = location.state?.highlightApptId === appt._id;
                    
                    return (
                      <div key={appt._id} className="relative md:pl-12" id={`appt-${appt._id}`}>
                        <div className={`absolute left-[3px] top-6 w-4 h-4 rounded-full ring-4 hidden md:block shadow-sm ${isLatest || isHighlighted ? 'bg-primary ring-blue-50' : 'bg-gray-300 ring-white'}`}></div>
                        <div className={`p-6 rounded-2xl border transition-all group shadow-sm ${isHighlighted ? 'bg-blue-50/30 border-primary ring-2 ring-primary/20' : isLatest ? 'bg-gradient-to-r from-blue-50/50 to-transparent border-blue-100 hover:border-primary/30' : 'bg-white border-gray-100 hover:border-gray-200'}`}>
                          <div className="flex flex-col md:flex-row justify-between items-start mb-5 gap-4">
                            <div>
                              <h4 className="font-bold text-gray-800 text-xl group-hover:text-primary transition-colors">
                                {appt.doctor?.specialty || appt.doctor?.department || t.generalDept}
                              </h4>
                              <p className="text-sm text-gray-500 font-medium mt-1">
                                {appt.doctor?.department} • {getDoctorDisplayName(appt.doctor?.userId?.fullName)}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className={`px-3 py-1 text-xs font-bold text-white rounded-full ${statusColor}`}>{statusLabel}</span>
                              <span className="px-4 py-2 bg-white border border-gray-200 text-gray-600 text-sm font-bold rounded-xl flex items-center gap-2 shadow-sm">
                                <Calendar size={14} className="text-primary" />
                                {lang === 'vi' ? new Date(appt.date).toLocaleDateString('vi-VN') : new Date(appt.date).toLocaleDateString('en-US')} • {appt.time}
                              </span>
                            </div>
                          </div>

                          <div className={`p-5 rounded-2xl border mb-5 text-sm text-gray-700 space-y-3 ${isLatest ? 'bg-white border-gray-100 shadow-sm' : 'bg-gray-50 border-transparent'}`}>
                            <div className="flex gap-3">
                              <strong className="text-gray-500 shrink-0 w-36">{t.ticketCode}</strong>
                              <span className="font-mono font-bold text-primary">{appt.ticketNumber || 'N/A'}</span>
                            </div>
                            <div className="h-px w-full bg-gray-100"></div>
                            <div className="flex gap-3">
                              <strong className="text-gray-500 shrink-0 w-36">{t.queueNo}</strong>
                              <span className="font-bold text-orange-500">#{appt.queueNumber || '--'}</span>
                            </div>
                            {appt.symptoms && (
                              <>
                                <div className="h-px w-full bg-gray-100"></div>
                                <div className="flex gap-3">
                                  <strong className="text-gray-500 shrink-0 w-36">{t.symptoms}</strong>
                                  <span className="text-gray-700 italic">{appt.symptoms}</span>
                                </div>
                              </>
                            )}
                            <div className="h-px w-full bg-gray-100"></div>
                            <div className="flex gap-3">
                              <strong className="text-gray-500 shrink-0 w-36">{t.billingStatus}</strong>
                              <span className={`font-bold ${appt.paymentStatus === 'paid' ? 'text-green-600' : 'text-orange-500'}`}>
                                {appt.paymentStatus === 'paid' ? t.paid : t.unpaid}
                              </span>
                            </div>
                          </div>

                          {appt.status === 'completed' ? (
                            <div className="mt-5 flex justify-end">
                              <button onClick={() => navigate(`/dashboard/appointment/${appt._id}`)}
                                className="px-5 py-2.5 bg-primary text-white font-bold rounded-xl flex items-center gap-2 hover:bg-primary-dark transition-all shadow-md shadow-primary/20">
                                {t.viewDetails} <ChevronRight size={16}/>
                              </button>
                            </div>
                          ) : (
                            <div className="flex gap-3">
                              <span className="px-4 py-3 w-full text-gray-500 bg-gray-50/80 border border-gray-100 text-sm font-medium rounded-xl flex items-center justify-center gap-2">
                                <Info size={16} className="text-gray-400"/> {t.futureRecordsMsg}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default Records;
