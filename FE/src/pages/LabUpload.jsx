import { API_URL, authFetch } from "../config";
import React, { useState, useRef } from "react";
import {
  Upload,
  FlaskConical,
  User,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
} from "lucide-react";
import { useTranslation } from "../hooks/useTranslation";

// const API_URL = API_URL;

const trans = {
  vi: {
    toastAttached: "Vui lòng đính kèm file kết quả.",
    toastPatientId: "Vui lòng nhập mã bệnh nhân.",
    toastTestName: "Vui lòng nhập tên xét nghiệm.",
    toastConnError: "Lỗi kết nối, vui lòng thử lại.",
    toastSending: "Đang gửi...",
    toastSendSuccess: "Gửi kết quả thành công!",
    title: "Gửi Kết Quả Xét Nghiệm",
    subtitle: "Nhân viên xét nghiệm - Tải lên và gửi kết quả đến bệnh nhân",
    patientIdLabel: "Mã Bệnh nhân (BN-XXXXXX)",
    patientIdPlaceholder: "VD: BN000001",
    testNameLabel: "Tên xét nghiệm",
    testNamePlaceholder: "VD: Công thức máu toàn bộ",
    testTypeLabel: "Loại xét nghiệm",
    notesLabel: "Ghi chú kết quả (Tùy chọn)",
    notesPlaceholder: "Ví dụ: Bạch cầu hơi cao, cần theo dõi thêm...",
    uploadZoneText: "Kéo thả file vào đây hoặc click để chọn",
    uploadZoneSub: "Hỗ trợ PDF, JPG, PNG — Tối đa 10MB",
    btnSubmit: "Gửi kết quả tới bệnh nhân",
    typeBlood: "Xét nghiệm máu",
    typeUrine: "Xét nghiệm nước tiểu",
    typeXray: "Chụp X-Quang",
    typeMri: "Chụp MRI",
    typeCt: "Chụp CT Scan",
    typeUltrasound: "Siêu âm",
    typeEcg: "Điện tâm đồ (ECG)",
    typeOther: "Loại khác",
  },
  en: {
    toastAttached: "Please attach the test result file.",
    toastPatientId: "Please enter the patient ID.",
    toastTestName: "Please enter the test name.",
    toastConnError: "Connection error, please try again.",
    toastSending: "Sending...",
    toastSendSuccess: "Test results successfully sent!",
    title: "Submit Laboratory Results",
    subtitle:
      "Lab Technician - Upload and send test results to patient dashboard",
    patientIdLabel: "Patient Identification Code (BN-XXXXXX)",
    patientIdPlaceholder: "e.g., BN000001",
    testNameLabel: "Clinical Test Name",
    testNamePlaceholder: "e.g., Complete Blood Count (CBC)",
    testTypeLabel: "Clinical Test Category",
    notesLabel: "Diagnostic Advisory Notes (Optional)",
    notesPlaceholder:
      "e.g., Mild elevation in WBC, request follow-up observation...",
    uploadZoneText: "Drag and drop clinical report here, or browse files",
    uploadZoneSub: "Supports PDF, JPG, PNG formats — Maximum file size 10MB",
    btnSubmit: "Dispatch Test Result to Patient",
    typeBlood: "Blood Test",
    typeUrine: "Urinalysis",
    typeXray: "X-Ray Imaging",
    typeMri: "MRI Scan",
    typeCt: "CT Scan",
    typeUltrasound: "Ultrasound",
    typeEcg: "Electrocardiogram (ECG)",
    typeOther: "Other Test",
  },
};

const LabUpload = () => {
  const { lang, t } = useTranslation(trans);
  const [form, setForm] = useState({
    patientId: "",
    testName: "",
    testType: "blood",
    notes: "",
  });
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({
    show: false,
    type: "success",
    message: "",
  });
  const fileRef = useRef();

  const TEST_TYPES = [
    { value: "blood", label: t.typeBlood },
    { value: "urine", label: t.typeUrine },
    { value: "xray", label: t.typeXray },
    { value: "mri", label: t.typeMri },
    { value: "ct", label: t.typeCt },
    { value: "ultrasound", label: t.typeUltrasound },
    { value: "ecg", label: t.typeEcg },
    { value: "other", label: t.typeOther },
  ];

  const showToast = (message, type = "success") => {
    setToast({ show: true, type, message });
    setTimeout(
      () => setToast({ show: false, type: "success", message: "" }),
      4000,
    );
  };

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (f) setFile(f);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) setFile(f);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return showToast(t.toastAttached, "error");
    if (!form.patientId.trim()) return showToast(t.toastPatientId, "error");
    if (!form.testName.trim()) return showToast(t.toastTestName, "error");

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("patientId", form.patientId.trim());
      formData.append("testName", form.testName);
      formData.append("testType", form.testType);
      formData.append("notes", form.notes);

      const res = await authFetch(`${API_URL}/api/lab-results`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (data.success) {
        showToast(t.toastSendSuccess, "success");
        setForm({ patientId: "", testName: "", testType: "blood", notes: "" });
        setFile(null);
      } else {
        showToast(data.message, "error");
      }
    } catch (err) {
      showToast(t.toastConnError, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Toast */}
      <div
        className={`fixed top-8 right-8 z-50 transition-all duration-500 transform ${toast.show ? "translate-y-0 opacity-100" : "-translate-y-10 opacity-0 pointer-events-none"}`}
      >
        <div
          className={`bg-[var(--card-bg)] px-6 py-4 rounded-2xl shadow-xl flex items-center gap-3 border ${toast.type === "error" ? "border-red-100 dark:border-red-900/30" : "border-green-100 dark:border-green-900/30"}`}
        >
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${toast.type === "error" ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400" : "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"}`}
          >
            {toast.type === "error" ? (
              <AlertCircle size={18} />
            ) : (
              <CheckCircle2 size={18} />
            )}
          </div>
          <p className="text-sm font-bold text-[var(--text-primary)]">
            {toast.message}
          </p>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center gap-4 mb-8 bg-[var(--card-bg)] p-6 rounded-3xl shadow-sm border border-[var(--border-color)]">
        <div className="w-16 h-16 bg-gradient-to-br from-teal-100 dark:from-teal-900/30 to-blue-100 dark:to-blue-900/30 text-teal-600 dark:text-teal-400 rounded-2xl flex items-center justify-center shadow-inner">
          <FlaskConical size={32} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            {t.title}
          </h1>
          <p className="text-[var(--text-secondary)] mt-1">{t.subtitle}</p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-[var(--card-bg)] p-8 rounded-3xl shadow-sm border border-[var(--border-color)] space-y-6 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-48 h-48 bg-teal-50 dark:bg-teal-900/20 rounded-full blur-3xl opacity-50 -z-0 pointer-events-none"></div>

        {/* Patient ID */}
        <div className="relative z-10">
          <label className="block text-sm font-bold text-[var(--text-primary)] mb-2 flex items-center gap-2">
            <User size={16} className="text-primary" /> {t.patientIdLabel}
          </label>
          <input
            type="text"
            className="w-full p-4 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all font-mono text-[var(--text-primary)]"
            placeholder={t.patientIdPlaceholder}
            value={form.patientId}
            onChange={(e) => setForm({ ...form, patientId: e.target.value })}
          />
        </div>

        {/* Test Name & Type */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
          <div>
            <label className="block text-sm font-bold text-[var(--text-primary)] mb-2">
              {t.testNameLabel}
            </label>
            <input
              type="text"
              className="w-full p-4 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all text-[var(--text-primary)]"
              placeholder={t.testNamePlaceholder}
              value={form.testName}
              onChange={(e) => setForm({ ...form, testName: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-[var(--text-primary)] mb-2">
              {t.testTypeLabel}
            </label>
            <select
              className="w-full p-4 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all text-[var(--text-primary)]"
              value={form.testType}
              onChange={(e) => setForm({ ...form, testType: e.target.value })}
            >
              {TEST_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Notes */}
        <div className="relative z-10">
          <label className="block text-sm font-bold text-[var(--text-primary)] mb-2">
            {t.notesLabel}
          </label>
          <textarea
            rows="3"
            className="w-full p-4 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-xl focus:ring-2 focus:ring-primary/20 outline-none resize-none transition-all text-[var(--text-primary)]"
            placeholder={t.notesPlaceholder}
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          ></textarea>
        </div>

        {/* File Upload Zone */}
        <div
          className={`relative z-10 border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
            dragging
              ? "border-teal-400 bg-teal-50 dark:bg-teal-900/20"
              : file
                ? "border-green-400 bg-green-50 dark:bg-green-900/20"
                : "border-[var(--border-color)] hover:border-teal-300 hover:bg-teal-50/30 dark:hover:bg-teal-900/20"
          }`}
          onClick={() => fileRef.current.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
        >
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            className="hidden"
            onChange={handleFileChange}
          />
          {file ? (
            <div className="flex items-center justify-center gap-4 animate-in fade-in">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                <FileText
                  size={24}
                  className="text-green-600 dark:text-green-400"
                />
              </div>
              <div className="text-left">
                <p className="font-bold text-[var(--text-primary)]">
                  {file.name}
                </p>
                <p className="text-sm text-[var(--text-secondary)]">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setFile(null);
                }}
                className="ml-auto p-1.5 hover:bg-[var(--bg-tertiary)] rounded-full text-[var(--text-tertiary)] hover:text-red-500 transition-all"
              >
                <X size={18} />
              </button>
            </div>
          ) : (
            <>
              <div className="w-16 h-16 bg-[var(--bg-tertiary)] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Upload size={28} className="text-[var(--text-tertiary)]" />
              </div>
              <p className="font-bold text-[var(--text-primary)] mb-1">
                {t.uploadZoneText}
              </p>
              <p className="text-sm text-[var(--text-tertiary)]">
                {t.uploadZoneSub}
              </p>
            </>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-gradient-to-r from-teal-600 to-blue-600 text-white font-bold rounded-2xl hover:from-teal-700 hover:to-blue-700 transition-all shadow-lg shadow-teal-500/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-wait relative z-10"
        >
          {loading ? (
            <>
              <Loader2 size={20} className="animate-spin" /> {t.toastSending}
            </>
          ) : (
            <>
              <FlaskConical size={20} /> {t.btnSubmit}
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default LabUpload;
