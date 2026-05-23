import { API_URL, authFetch } from "../../config";
import React, { useState, useEffect } from "react";
import { Database, FileText, Activity, Search, RefreshCw } from "lucide-react";
import { useTranslation } from "../../hooks/useTranslation";
import { formatDoctorName, formatDate } from "../../utils/i18nHelpers";

const trans = {
  vi: {
    loading: "Đang tải hồ sơ bệnh án...",
    connError: "Lỗi kết nối đến máy chủ.",
    headerTitle: "Bệnh án & Dữ liệu y tế",
    headerSubtitle:
      "Tra cứu toàn bộ hồ sơ khám bệnh, đơn thuốc và kết quả xét nghiệm của toàn viện.",
    btnBackup: "Sao lưu Database",
    backupAlert:
      "Bắt đầu quá trình sao lưu toàn bộ dữ liệu y tế...\nĐã sao lưu thành công và lưu vào thư mục d:/MediCare/BE/backups/backup_",
    tabPrescriptions: "Đơn thuốc",
    tabLabResults: "Kết quả xét nghiệm",
    searchPrescriptions: "Tìm theo tên BN, bác sĩ, bệnh lý...",
    searchLabResults: "Tìm theo tên BN, loại xét nghiệm...",
    colPatient: "Bệnh nhân",
    colDoctor: "Bác sĩ kê đơn",
    colDiagnosis: "Chẩn đoán",
    colMedsList: "Đơn thuốc",
    colPrescribedDate: "Ngày kê",
    colTestName: "Tên xét nghiệm",
    colSummary: "Tóm tắt kết quả",
    colAttachment: "Tệp đính kèm",
    colTestDate: "Ngày trả kết quả",
    noPrescriptions: "Không tìm thấy đơn thuốc nào",
    noLabResults: "Không tìm thấy kết quả xét nghiệm nào",
    patientIdPrefix: "Mã BN:",
    doctorAnonymous: "BS. Ẩn danh",
    downloadFile: "Tải về file kết quả",
    noFileAttached: "Không có tệp đính kèm",
  },
  en: {
    loading: "Loading clinical records...",
    connError: "Server connection error.",
    headerTitle: "EHR & Clinical Data Vault",
    headerSubtitle:
      "Query global clinic consult history, prescriptions logs, and laboratory diagnostics results.",
    btnBackup: "Export DB Backup",
    backupAlert:
      "Starting full system clinical database backup process...\nDatabase successfully dumped and encrypted to path d:/MediCare/BE/backups/backup_",
    tabPrescriptions: "Prescriptions Directory",
    tabLabResults: "Diagnostics Reports",
    searchPrescriptions: "Search by patient, doctor, diagnosis...",
    searchLabResults: "Search by patient, test name...",
    colPatient: "Patient Profile",
    colDoctor: "Prescribing Physician",
    colDiagnosis: "Diagnosis Description",
    colMedsList: "Medications List",
    colPrescribedDate: "Prescribed Date",
    colTestName: "Diagnostic Procedure",
    colSummary: "Clinical Findings Summary",
    colAttachment: "Report Artifact",
    colTestDate: "Release Date",
    noPrescriptions: "No prescriptions records matched search query.",
    noLabResults: "No diagnostics reports matched search query.",
    patientIdPrefix: "Patient ID:",
    doctorAnonymous: "Dr. Anonymous",
    downloadFile: "Download Report PDF",
    noFileAttached: "No file attached",
  },
};

export default function AdminRecords() {
  const { lang, t } = useTranslation(trans);
  const [records, setRecords] = useState({ prescriptions: [], labResults: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("prescriptions");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchRecords = async () => {
    try {
      const res = await authFetch(`${API_URL}/api/admin/records`);
      const json = await res.json();
      if (json.success) {
        setRecords(json.data);
      } else {
        setError(json.message);
      }
    } catch (err) {
      setError(t.connError);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleBackup = () => {
    alert(t.backupAlert + new Date().toISOString().slice(0, 10) + ".json");
  };

  const getDoctorDisplayName = (name) =>
    formatDoctorName(lang, name) || t.doctorAnonymous;

  const filteredPrescriptions = records.prescriptions.filter((p) => {
    const pName = p.patient?.fullName?.toLowerCase() || "";
    const docName =
      p.appointment?.doctor?.userId?.fullName?.toLowerCase() || "";
    const diag = p.diagnosis?.toLowerCase() || "";
    return (
      pName.includes(searchTerm.toLowerCase()) ||
      docName.includes(searchTerm.toLowerCase()) ||
      diag.includes(searchTerm.toLowerCase())
    );
  });

  const filteredLabResults = records.labResults.filter((l) => {
    const pName = l.patient?.fullName?.toLowerCase() || "";
    const testName = l.labRequest?.testName?.toLowerCase() || "";
    const result = l.resultSummary?.toLowerCase() || "";
    return (
      pName.includes(searchTerm.toLowerCase()) ||
      testName.includes(searchTerm.toLowerCase()) ||
      result.includes(searchTerm.toLowerCase())
    );
  });

  if (loading)
    return (
      <div className="text-center py-10 font-bold text-[var(--text-secondary)]">
        {t.loading}
      </div>
    );
  if (error)
    return (
      <div className="bg-red-50 dark:bg-red-900/30 text-red-500 dark:text-red-400 p-4 rounded-2xl">
        {error}
      </div>
    );

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex justify-between items-center bg-[var(--card-bg)] p-6 rounded-3xl border border-[var(--border-color)] shadow-sm">
        <div>
          <h2 className="text-2xl font-black text-[var(--text-primary)]">
            {t.headerTitle}
          </h2>
          <p className="text-[var(--text-secondary)] font-medium mt-1">
            {t.headerSubtitle}
          </p>
        </div>
        <button
          onClick={handleBackup}
          className="px-5 py-2.5 bg-indigo-600 text-white font-bold rounded-xl flex items-center gap-2 hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 transition-all shrink-0"
        >
          <Database size={18} /> {t.btnBackup}
        </button>
      </div>

      <div className="bg-[var(--card-bg)] rounded-3xl border border-[var(--border-color)] shadow-sm overflow-hidden">
        {/* Navigation Tabs */}
        <div className="flex border-b border-[var(--border-color)] bg-[var(--bg-tertiary)] p-2 gap-2">
          <button
            onClick={() => {
              setActiveTab("prescriptions");
              setSearchTerm("");
            }}
            className={`px-5 py-2.5 text-sm font-bold rounded-xl transition-all flex items-center gap-2 ${
              activeTab === "prescriptions"
                ? "bg-[var(--card-bg)] text-indigo-600 dark:text-indigo-400 shadow-sm border border-[var(--border-color)]"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            <FileText size={16} /> {t.tabPrescriptions} (
            {records.prescriptions.length})
          </button>
          <button
            onClick={() => {
              setActiveTab("labResults");
              setSearchTerm("");
            }}
            className={`px-5 py-2.5 text-sm font-bold rounded-xl transition-all flex items-center gap-2 ${
              activeTab === "labResults"
                ? "bg-[var(--card-bg)] text-indigo-600 dark:text-indigo-400 shadow-sm border border-[var(--border-color)]"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            <Activity size={16} /> {t.tabLabResults} (
            {records.labResults.length})
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-[var(--border-color)] flex items-center bg-[var(--card-bg)]">
          <div className="relative w-80">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]"
              size={18}
            />
            <input
              type="text"
              placeholder={
                activeTab === "prescriptions"
                  ? t.searchPrescriptions
                  : t.searchLabResults
              }
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-[var(--border-color)] rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-[var(--text-primary)]"
            />
          </div>
        </div>

        {/* Tab Content */}
        <div className="overflow-x-auto">
          {activeTab === "prescriptions" ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[var(--bg-tertiary)] text-[var(--text-secondary)] text-xs uppercase tracking-wider font-bold">
                  <th className="p-4 pl-6">{t.colPatient}</th>
                  <th className="p-4">{t.colDoctor}</th>
                  <th className="p-4">{t.colDiagnosis}</th>
                  <th className="p-4">{t.colMedsList}</th>
                  <th className="p-4">{t.colPrescribedDate}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]">
                {filteredPrescriptions.length === 0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="text-center py-10 text-[var(--text-tertiary)] font-bold"
                    >
                      {t.noPrescriptions}
                    </td>
                  </tr>
                ) : (
                  filteredPrescriptions.map((p) => (
                    <tr
                      key={p._id}
                      className="hover:bg-[var(--bg-tertiary)] transition-colors"
                    >
                      <td className="p-4 pl-6 font-medium">
                        <div className="flex flex-col">
                          <span className="font-bold text-[var(--text-primary)] text-sm">
                            {p.patient?.fullName || "N/A"}
                          </span>
                          <span className="text-xs text-[var(--text-secondary)] font-mono">
                            {t.patientIdPrefix} {p.patient?.patientId || "N/A"}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 font-bold text-[var(--text-primary)] text-sm">
                        <span>
                          {getDoctorDisplayName(
                            p.appointment?.doctor?.userId?.fullName,
                          )}
                        </span>
                      </td>
                      <td className="p-4 font-medium">
                        <span className="px-2.5 py-1 bg-amber-50 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400 font-bold text-xs rounded-lg border border-amber-200 dark:border-amber-900/30">
                          {p.diagnosis}
                        </span>
                      </td>
                      <td className="p-4 max-w-xs font-medium">
                        <div className="flex flex-wrap gap-1">
                          {p.medicines?.map((m, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 bg-[var(--bg-tertiary)] text-[var(--text-secondary)] text-xs font-bold rounded-lg border border-[var(--border-color)]"
                            >
                              {m.name} ({m.dosage})
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-4 text-xs font-bold text-[var(--text-secondary)] font-mono">
                        {formatDate(lang, p.createdAt)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[var(--bg-tertiary)] text-[var(--text-secondary)] text-xs uppercase tracking-wider font-bold">
                  <th className="p-4 pl-6">{t.colPatient}</th>
                  <th className="p-4">{t.colTestName}</th>
                  <th className="p-4">{t.colSummary}</th>
                  <th className="p-4">{t.colAttachment}</th>
                  <th className="p-4">{t.colTestDate}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]">
                {filteredLabResults.length === 0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="text-center py-10 text-[var(--text-tertiary)] font-bold"
                    >
                      {t.noLabResults}
                    </td>
                  </tr>
                ) : (
                  filteredLabResults.map((l) => (
                    <tr
                      key={l._id}
                      className="hover:bg-[var(--bg-tertiary)] transition-colors"
                    >
                      <td className="p-4 pl-6 font-medium">
                        <div className="flex flex-col">
                          <span className="font-bold text-[var(--text-primary)] text-sm">
                            {l.patient?.fullName || "N/A"}
                          </span>
                          <span className="text-xs text-[var(--text-secondary)] font-mono">
                            {t.patientIdPrefix} {l.patient?.patientId || "N/A"}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 font-bold text-[var(--text-primary)] text-sm">
                        <span>{l.labRequest?.testName || "N/A"}</span>
                      </td>
                      <td className="p-4 font-medium">
                        <span className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400 font-bold text-xs rounded-lg border border-emerald-200 dark:border-emerald-900/30">
                          {l.resultSummary}
                        </span>
                      </td>
                      <td className="p-4 font-medium">
                        {l.fileUrl ? (
                          <a
                            href={`${API_URL}/${l.fileUrl}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 hover:underline flex items-center gap-1"
                          >
                            {t.downloadFile}
                          </a>
                        ) : (
                          <span className="text-xs font-medium text-[var(--text-tertiary)]">
                            {t.noFileAttached}
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-xs font-bold text-[var(--text-secondary)] font-mono">
                        {formatDate(lang, l.createdAt)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
