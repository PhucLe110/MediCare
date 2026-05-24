import { API_URL, authFetch } from "../config";
import { useState, useEffect } from "react";
import {
  Pill,
  User,
  Clock,
  FileText,
  ChevronRight,
  Download,
  Activity,
} from "lucide-react";
import { useTranslation } from "../hooks/useTranslation";
import {
  formatMoney,
  formatDoctorName,
  formatDate,
  formatDateTime,
} from "../utils/i18nHelpers";

const trans = {
  vi: {
    title: "Đơn thuốc điện tử",
    sub: "Quản lý và xem lại tất cả đơn thuốc từ các ca khám của bạn",
    loading: "Đang tải đơn thuốc...",
    noPrescription: "Chưa có đơn thuốc nào",
    noPrescriptionSub:
      "Đơn thuốc của bạn sẽ xuất hiện ở đây sau khi bác sĩ hoàn tất khám bệnh.",
    listTitle: "Danh sách đơn thuốc",
    datePrescribed: "Ngày kê:",
    code: "Mã đơn:",
    downloadPdf: "Tải PDF",
    doctorTitle: "Bác sĩ điều trị",
    specialty: "Chuyên khoa:",
    generalMedicine: "Đa khoa",
    diagnosis: "Chẩn đoán",
    notUpdated: "Chưa cập nhật chẩn đoán",
    needFollowUp: "Cần theo dõi thêm",
    medicinesList: "Danh mục thuốc",
    medName: "Tên thuốc",
    quantity: "Số lượng",
    usage: "Cách dùng",
    pills: "viên",
    useIn: "Sử dụng trong",
    doctorAdvice: "Lời dặn từ Bác sĩ",
    estimatedCost: "Tổng cộng tiền thuốc dự kiến",
  },
  en: {
    title: "Electronic Prescriptions",
    sub: "Manage and review all prescriptions from your clinical consultations",
    loading: "Loading prescriptions...",
    noPrescription: "No prescriptions available",
    noPrescriptionSub:
      "Your prescriptions will appear here once the physician completes the consultation.",
    listTitle: "Prescriptions List",
    datePrescribed: "Prescribed:",
    code: "Prescription ID:",
    downloadPdf: "Download PDF",
    doctorTitle: "Attending Physician",
    specialty: "Department:",
    generalMedicine: "General Medicine",
    diagnosis: "Diagnosis",
    notUpdated: "Diagnosis not updated",
    needFollowUp: "Requires follow-up observation",
    medicinesList: "Medicines List",
    medName: "Medicine Name",
    quantity: "Qty",
    usage: "Directions",
    pills: "pill(s)",
    useIn: "Use for",
    doctorAdvice: "Doctor's Advisory Notes",
    estimatedCost: "Estimated Total Cost",
  },
};

const Prescriptions = () => {
  const { lang, t } = useTranslation(trans);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPrescription, setSelectedPrescription] = useState(null);

  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        const res = await authFetch(`${API_URL}/api/prescriptions/my`);
        const data = await res.json();
        if (data.success) {
          setPrescriptions(data.data);
          if (data.data.length > 0) setSelectedPrescription(data.data[0]);
        }
      } catch (err) {
        console.error("Error fetching prescriptions:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPrescriptions();
  }, []);

  const formatPrice = (price) => formatMoney(lang, price);
  const getDoctorDisplayName = (name) =>
    formatDoctorName(lang, name) || t.doctorTitle;

  return (
    <div className="max-w-6xl mx-auto px-3 md:px-4 py-4 md:py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 md:mb-8 gap-3 md:gap-4">
        <div>
          <h1 className="text-xl md:text-3xl font-bold text-[var(--text-primary)] flex items-center gap-2 md:gap-3">
            <Pill className="text-primary animate-bounce-slow" size={32} />
            {t.title}
          </h1>
          <p className="text-xs md:text-sm text-[var(--text-secondary)] mt-1 md:mt-2">
            {t.sub}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-48 md:h-64">
          <div className="animate-spin rounded-full h-10 w-10 md:h-12 md:w-12 border-b-2 border-primary"></div>
        </div>
      ) : prescriptions.length === 0 ? (
        <div className="bg-[var(--card-bg)] rounded-2xl md:rounded-3xl p-6 md:p-12 text-center border border-[var(--border-color)] shadow-sm">
          <div className="w-16 h-16 md:w-20 md:h-20 bg-[var(--bg-tertiary)] rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6">
            <Pill size={40} className="text-[var(--text-tertiary)]" />
          </div>
          <h3 className="text-base md:text-xl font-bold text-[var(--text-secondary)]">
            {t.noPrescription}
          </h3>
          <p className="text-xs md:text-sm text-[var(--text-tertiary)] mt-1 md:mt-2">
            {t.noPrescriptionSub}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-8">
          {/* List Section */}
          <div className="lg:col-span-4 space-y-3 md:space-y-4">
            <h3 className="text-xs md:text-sm font-bold text-[var(--text-tertiary)] uppercase tracking-wider px-2">
              {t.listTitle}
            </h3>
            <div className="max-h-[calc(100vh-250px)] overflow-y-auto pr-2 custom-scrollbar">
              {prescriptions.map((prescription) => (
                <div
                  key={prescription._id}
                  onClick={() => setSelectedPrescription(prescription)}
                  className={`p-3 md:p-4 rounded-xl md:rounded-2xl cursor-pointer transition-all border-2 mb-2 md:mb-3 ${
                    selectedPrescription?._id === prescription._id
                      ? "border-primary bg-primary/5 shadow-md"
                      : "border-transparent bg-[var(--card-bg)] hover:border-[var(--border-color)]"
                  }`}
                >
                  <div className="flex justify-between items-start mb-1 md:mb-2">
                    <span className="text-[10px] md:text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 md:py-1 rounded-lg">
                      {formatDate(lang, prescription.createdAt)}
                    </span>
                    <ChevronRight
                      size={16}
                      className={
                        selectedPrescription?._id === prescription._id
                          ? "text-primary"
                          : "text-[var(--text-tertiary)]"
                      }
                    />
                  </div>
                  <h4 className="font-bold text-xs md:text-sm text-[var(--text-primary)] truncate">
                    {getDoctorDisplayName(prescription.doctor?.fullName)}
                  </h4>
                  <p className="text-[10px] md:text-xs text-[var(--text-secondary)] mt-0.5 md:mt-1 line-clamp-1 italic">
                    {prescription.diagnosis || t.notUpdated}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Detail Section */}
          <div className="lg:col-span-8">
            {selectedPrescription && (
              <div className="bg-[var(--card-bg)] rounded-2xl md:rounded-3xl shadow-sm border border-[var(--border-color)] overflow-hidden animate-in fade-in slide-in-from-right-4 duration-300">
                {/* Detail Header */}
                <div className="p-4 md:p-8 bg-gradient-to-r from-primary to-blue-600 text-white relative">
                  <div className="absolute top-0 right-0 w-24 h-24 md:w-32 md:h-32 bg-white/10 rounded-full -mr-12 md:-mr-16 -mt-12 md:-mt-16 blur-3xl"></div>
                  <div className="flex flex-col md:flex-row justify-between items-start gap-3 md:gap-4 relative z-10">
                    <div>
                      <div className="flex items-center gap-1.5 md:gap-2 text-white/80 text-xs md:text-sm mb-1 md:mb-2">
                        <Clock size={14} />
                        {t.datePrescribed}{" "}
                        {formatDateTime(lang, selectedPrescription.createdAt)}
                      </div>
                      <h2 className="text-lg md:text-2xl font-bold uppercase">
                        {t.title}
                      </h2>
                      <p className="text-white/90 mt-0.5 md:mt-1 text-xs md:text-sm">
                        {t.code}{" "}
                        {selectedPrescription._id.substring(18).toUpperCase()}
                      </p>
                    </div>
                    <button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm p-2 md:p-3 rounded-lg md:rounded-xl transition-all flex items-center gap-1.5 md:gap-2 text-[10px] md:text-sm font-bold border border-white/20">
                      <Download size={18} /> {t.downloadPdf}
                    </button>
                  </div>
                </div>

                <div className="p-4 md:p-8">
                  {/* Doctor & Diagnosis */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 mb-6 md:mb-10 pb-6 md:pb-10 border-b border-[var(--border-color)]">
                    <div className="space-y-2 md:space-y-4">
                      <h4 className="text-[10px] md:text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider flex items-center gap-1.5 md:gap-2">
                        <User size={14} /> {t.doctorTitle}
                      </h4>
                      <p className="text-sm md:text-lg font-bold text-[var(--text-primary)]">
                        {getDoctorDisplayName(
                          selectedPrescription.doctor?.fullName,
                        )}
                      </p>
                      <p className="text-xs md:text-sm text-[var(--text-secondary)]">
                        {t.specialty}{" "}
                        {selectedPrescription.appointment?.doctor?.specialty ||
                          t.generalMedicine}
                      </p>
                    </div>
                    <div className="space-y-2 md:space-y-4">
                      <h4 className="text-[10px] md:text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider flex items-center gap-1.5 md:gap-2">
                        <Activity size={14} /> {t.diagnosis}
                      </h4>
                      <div className="p-3 md:p-4 bg-[var(--bg-tertiary)] rounded-xl md:rounded-2xl border border-[var(--border-color)]">
                        <p className="text-xs md:text-sm text-[var(--text-primary)] font-semibold">
                          {selectedPrescription.diagnosis || t.needFollowUp}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Medicines Table */}
                  <div className="mb-6 md:mb-10">
                    <h4 className="text-[10px] md:text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-2 md:mb-4 flex items-center gap-1.5 md:gap-2">
                      <Pill size={14} /> {t.medicinesList} (
                      {selectedPrescription.medicines?.length || 0})
                    </h4>
                    <div className="overflow-x-auto rounded-xl md:rounded-2xl border border-[var(--border-color)]">
                      <table className="w-full text-left">
                        <thead className="bg-[var(--bg-tertiary)]">
                          <tr>
                            <th className="px-3 md:px-6 py-2 md:py-4 text-[10px] md:text-xs font-bold text-[var(--text-secondary)] uppercase">
                              {t.medName}
                            </th>
                            <th className="px-3 md:px-6 py-2 md:py-4 text-[10px] md:text-xs font-bold text-[var(--text-secondary)] uppercase">
                              {t.quantity}
                            </th>
                            <th className="px-3 md:px-6 py-2 md:py-4 text-[10px] md:text-xs font-bold text-[var(--text-secondary)] uppercase">
                              {t.usage}
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border-color)]">
                          {selectedPrescription.medicines?.map((med, idx) => (
                            <tr
                              key={idx}
                              className="hover:bg-[var(--bg-tertiary)]/50 transition-colors"
                            >
                              <td className="px-3 md:px-6 py-2 md:py-4">
                                <p className="font-bold text-xs md:text-sm text-[var(--text-primary)]">
                                  {med.name}
                                </p>
                                <p className="text-[10px] md:text-xs text-[var(--text-secondary)]">
                                  {med.dosage}
                                </p>
                              </td>
                              <td className="px-3 md:px-6 py-2 md:py-4 font-bold text-xs md:text-sm text-[var(--text-primary)]">
                                {med.quantity} {t.pills}
                              </td>
                              <td className="px-3 md:px-6 py-2 md:py-4 text-[10px] md:text-sm text-[var(--text-secondary)]">
                                <span className="block">{med.frequency}</span>
                                <span className="text-[9px] md:text-xs text-primary font-medium italic">
                                  {t.useIn} {med.duration}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Doctor Notes */}
                  {selectedPrescription.doctorNotes && (
                    <div className="bg-yellow-50/50 dark:bg-yellow-900/20 rounded-xl md:rounded-2xl p-4 md:p-6 border border-yellow-100 dark:border-yellow-900/30 mb-4 md:mb-8">
                      <h4 className="text-xs md:text-sm font-bold text-yellow-700 dark:text-yellow-500 mb-1 md:mb-2 flex items-center gap-1.5 md:gap-2">
                        <FileText size={16} /> {t.doctorAdvice}
                      </h4>
                      <p className="text-xs md:text-sm text-[var(--text-primary)] leading-relaxed italic">
                        {selectedPrescription.doctorNotes}
                      </p>
                    </div>
                  )}

                  {/* Footer Stats */}
                  <div className="flex justify-end p-4 md:p-6 bg-[var(--bg-tertiary)] rounded-xl md:rounded-2xl border border-[var(--border-color)]">
                    <div className="text-right">
                      <p className="text-[var(--text-secondary)] text-xs md:text-sm mb-0.5 md:mb-1">
                        {t.estimatedCost}
                      </p>
                      <p className="text-lg md:text-2xl font-black text-primary">
                        {formatPrice(selectedPrescription.totalMedicineCost)}
                      </p>
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
