import { API_URL, authFetch } from "../config";
import { useState, useEffect } from "react";
import {
  FlaskConical,
  FileText,
  Download,
  Eye,
  Clock,
  CheckCircle,
  Search,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useTranslation } from "../hooks/useTranslation";
import { formatDate, formatDateTime } from "../utils/i18nHelpers";

const trans = {
  vi: {
    title: "Kết Quả Xét Nghiệm",
    sub: "Nhân viên xét nghiệm gửi tới — Dữ liệu thời gian thực",
    searchPlaceholder: "Tìm kiếm tên xét nghiệm...",
    loading: "Đang tải kết quả...",
    noMatch: "Không tìm thấy kết quả phù hợp",
    noResult: "Chưa có kết quả xét nghiệm",
    tryAnotherSearch: "Thử tìm kiếm với từ khóa khác.",
    resultWillShow:
      "Khi nhân viên xét nghiệm gửi kết quả cho bạn, chúng sẽ xuất hiện tại đây.",
    latestResult: "KẾT QUẢ MỚI NHẤT",
    performedBy: "Thực hiện bởi",
    labStaff: "Nhân viên xét nghiệm",
    linkedAppt: "Liên kết ca khám ngày",
    staffNote: "Ghi chú từ nhân viên xét nghiệm:",
    viewResult: "Xem kết quả",
    download: "Tải xuống",
    tests: "Các chỉ định xét nghiệm",
    files: "File kết quả",
    typeBlood: "Xét nghiệm máu",
    typeUrine: "Xét nghiệm nước tiểu",
    typeXray: "Chụp X-Quang",
    typeMri: "Chụp MRI",
    typeCt: "Chụp CT Scan",
    typeUltrasound: "Siêu âm",
    typeEcg: "Điện tâm đồ (ECG)",
    typeOther: "Xét nghiệm khác",
    hideDetails: "Ẩn chi tiết",
    viewTests: (n) => `Xem ${n} chỉ định xét nghiệm`,
  },
  en: {
    title: "Laboratory Results",
    sub: "Sent by lab technician — Real-time synchronization",
    searchPlaceholder: "Search lab tests...",
    loading: "Loading results...",
    noMatch: "No matching results found",
    noResult: "No laboratory results available",
    tryAnotherSearch: "Try searching with different keywords.",
    resultWillShow:
      "Once the laboratory staff uploads your results, they will appear here.",
    latestResult: "LATEST RESULT",
    performedBy: "Performed by",
    labStaff: "Lab Technician",
    linkedAppt: "Linked with consultation on",
    staffNote: "Notes from lab technician:",
    viewResult: "View Result",
    download: "Download",
    tests: "Requested Tests",
    files: "Result Files",
    typeBlood: "Blood Test",
    typeUrine: "Urinalysis",
    typeXray: "X-Ray Imaging",
    typeMri: "MRI Scan",
    typeCt: "CT Scan",
    typeUltrasound: "Ultrasound",
    typeEcg: "Electrocardiogram (ECG)",
    typeOther: "Other Test",
    hideDetails: "Hide details",
    viewTests: (n) => `View ${n} tests`,
  },
};

const TYPE_COLOR = {
  blood: "text-red-600 bg-red-50 border-red-100",
  urine: "text-yellow-600 bg-yellow-50 border-yellow-100",
  xray: "text-blue-600 bg-blue-50 border-blue-100",
  mri: "text-purple-600 bg-purple-50 border-purple-100",
  ct: "text-indigo-600 bg-indigo-50 border-indigo-100",
  ultrasound: "text-teal-600 bg-teal-50 border-teal-100",
  ecg: "text-green-600 bg-green-50 border-green-100",
  other: "text-gray-600 bg-gray-50 border-gray-100",
};

const ResultCard = ({ result, idx, t, lang }) => {
  const [expanded, setExpanded] = useState(false);
  const isNew = idx === 0;
  const createdDateStr = formatDateTime(lang, result.createdAt);
  const apptDateStr = result.appointment
    ? formatDate(lang, result.appointment?.date)
    : "";

  // Collect all unique test types for badge display
  const uniqueTypes = [...new Set((result.tests || []).map((t) => t.testType))];

  const handleDownload = async (fileUrl, fileName) => {
    const res = await authFetch(`${API_URL}${fileUrl}`);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className={`bg-[var(--card-bg)] rounded-2xl md:rounded-3xl border shadow-sm transition-all hover:shadow-md group overflow-hidden ${isNew ? "border-teal-200 ring-1 ring-teal-100" : "border-[var(--border-color)]"}`}
    >
      {isNew && (
        <div className="bg-gradient-to-r from-teal-500 to-blue-500 text-white text-[10px] md:text-xs font-bold px-3 md:px-4 py-1 md:py-1.5 flex items-center gap-1 md:gap-2">
          <CheckCircle size={10} /> {t.latestResult}
        </div>
      )}
      <div className="p-4 md:p-6">
        {/* Header Row */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-3 md:gap-4">
          <div className="flex-1">
            {/* Type badges */}
            <div className="flex items-center gap-1.5 md:gap-2 mb-2 md:mb-3 flex-wrap">
              {uniqueTypes.map((type, i) => (
                <span
                  key={i}
                  className={`px-2 md:px-3 py-0.5 md:py-1 text-[10px] md:text-xs font-bold rounded-lg md:rounded-xl border ${TYPE_COLOR[type] || TYPE_COLOR.other}`}
                >
                  {t[`type${type.charAt(0).toUpperCase() + type.slice(1)}`] ||
                    type}
                </span>
              ))}
              <span className="flex items-center gap-1 text-[10px] md:text-xs text-[var(--text-tertiary)] font-medium">
                <Clock size={10} /> {createdDateStr}
              </span>
            </div>

            {/* Test count summary */}
            <h3 className="text-sm md:text-lg font-bold text-[var(--text-primary)] group-hover:text-teal-700 transition-colors mb-1">
              {result.tests?.length === 1
                ? result.tests[0].testName
                : `${result.tests?.length || 0} ${t.tests}`}
            </h3>

            {/* Performer & appointment */}
            <p className="text-xs md:text-sm text-[var(--text-secondary)] mb-2 md:mb-3">
              {t.performedBy}:{" "}
              <span className="font-semibold text-[var(--text-primary)] text-xs md:text-sm">
                {result.uploadedBy?.fullName || t.labStaff}
              </span>
              {result.appointment && (
                <span className="ml-2 md:ml-3 text-[var(--text-tertiary] text-[10px] md:text-xs">
                  • {t.linkedAppt} {apptDateStr}
                </span>
              )}
            </p>

            {/* Notes */}
            {result.notes && (
              <div className="p-3 md:p-4 bg-blue-50/50 dark:bg-blue-900/20 rounded-xl md:rounded-2xl border border-blue-100 dark:border-blue-900/30 text-xs md:text-sm text-[var(--text-primary)] mb-2 md:mb-3">
                <strong className="text-[var(--text-primary)] block mb-1 text-[10px] md:text-xs">
                  {t.staffNote}
                </strong>
                <p className="leading-relaxed italic text-[10px] md:text-sm">
                  {result.notes}
                </p>
              </div>
            )}

            {/* Toggle details button */}
            {result.tests?.length > 1 && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="flex items-center gap-1 md:gap-1.5 text-[10px] md:text-xs font-bold text-teal-600 hover:text-teal-800 transition-colors"
              >
                {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                {expanded ? t.hideDetails : t.viewTests(result.tests.length)}
              </button>
            )}

            {/* Expanded test list */}
            {(expanded || result.tests?.length === 1) &&
              result.tests?.length > 0 && (
                <ul className="mt-2 md:mt-3 space-y-1.5 md:space-y-2">
                  {result.tests.map((test, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-1.5 md:gap-2 p-2 bg-[var(--bg-tertiary)] rounded-lg md:rounded-xl border border-[var(--border-color)] text-[10px] md:text-sm"
                    >
                      <span
                        className={`px-1.5 md:px-2 py-0.5 text-[9px] md:text-[10px] font-bold rounded-md border shrink-0 mt-0.5 ${TYPE_COLOR[test.testType] || TYPE_COLOR.other}`}
                      >
                        {test.testType?.toUpperCase()}
                      </span>
                      <span className="font-semibold text-[var(--text-primary)] text-[10px] md:text-sm">
                        {test.testName}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
          </div>

          {/* Files panel */}
          <div className="flex flex-col gap-1.5 md:gap-2 shrink-0 w-full md:w-auto md:min-w-[180px]">
            {(result.files || []).map((file, fi) => (
              <div
                key={fi}
                className="flex flex-col gap-1 md:gap-1.5 p-2 md:p-3 bg-[var(--bg-tertiary)] rounded-xl md:rounded-2xl border border-[var(--border-color)]"
              >
                <div className="flex items-center gap-1.5 md:gap-2">
                  <FileText size={12} className="text-red-500 shrink-0" />
                  <p
                    className="text-[10px] md:text-xs font-bold text-[var(--text-primary)] truncate max-w-[100px] md:max-w-[120px]"
                    title={file.fileName}
                  >
                    {file.fileName}
                  </p>
                </div>
                <div className="flex gap-1.5 md:gap-2">
                  <button
                    onClick={() =>
                      window.open(`${API_URL}${file.fileUrl}`, "_blank")
                    }
                    className="flex-1 px-2 md:px-3 py-1.5 md:py-2 bg-teal-600 text-white text-[10px] md:text-xs font-bold rounded-lg md:rounded-xl hover:bg-teal-700 transition-all shadow-sm flex items-center justify-center gap-1 md:gap-1.5"
                  >
                    <Eye size={10} /> {t.viewResult}{" "}
                    {result.files.length > 1 ? fi + 1 : ""}
                  </button>
                  <button
                    onClick={() => handleDownload(file.fileUrl, file.fileName)}
                    className="px-2 md:px-3 py-1.5 md:py-2 bg-[var(--card-bg)] border border-[var(--border-color)] text-[var(--text-secondary)] text-[10px] md:text-xs font-bold rounded-lg md:rounded-xl hover:border-teal-400 hover:text-teal-600 transition-all flex items-center justify-center"
                    title={t.download}
                  >
                    <Download size={10} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const LabResults = () => {
  const { lang, t } = useTranslation(trans);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await authFetch(`${API_URL}/api/lab-results/my`);
        const data = await res.json();
        if (data.success) setResults(data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, []);

  // Search across all test names in the tests array
  const filtered = results.filter(
    (r) =>
      !search.trim() ||
      (r.tests || []).some((test) =>
        (test.testName || "").toLowerCase().includes(search.toLowerCase()),
      ),
  );

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 md:gap-4 mb-4 md:mb-8 bg-[var(--card-bg)] p-4 md:p-6 rounded-2xl md:rounded-3xl shadow-sm border border-[var(--border-color)]">
        <div className="flex items-center gap-3 md:gap-4">
          <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-teal-100 to-blue-100 dark:from-teal-900/30 dark:to-blue-900/30 text-teal-600 dark:text-teal-400 rounded-xl md:rounded-2xl flex items-center justify-center shadow-inner shrink-0">
            <FlaskConical size={20} />
          </div>
          <div>
            <h1 className="text-lg md:text-2xl font-bold text-[var(--text-primary)]">
              {t.title}
            </h1>
            <p className="text-[var(--text-secondary)] text-xs md:text-sm mt-0.5 md:mt-1">
              {t.sub}
            </p>
          </div>
        </div>
        <div className="relative w-full sm:w-auto">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]"
          />
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            className="pl-9 md:pl-10 pr-3 md:pr-4 py-2 md:py-2.5 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg md:rounded-xl text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-teal-200 w-full sm:w-64 text-[var(--text-primary)]"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="space-y-3 md:space-y-4 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-32 md:h-40 bg-[var(--bg-tertiary)] rounded-2xl md:rounded-3xl"
            ></div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 md:py-24 bg-[var(--card-bg)] rounded-2xl md:rounded-3xl border border-[var(--border-color)] shadow-sm text-center">
          <div className="w-16 h-16 md:w-24 md:h-24 bg-teal-50 dark:bg-teal-900/30 rounded-full flex items-center justify-center mb-4 md:mb-6">
            <FlaskConical
              size={24}
              className="text-teal-300 dark:text-teal-500"
            />
          </div>
          <h3 className="text-base md:text-xl font-bold text-[var(--text-secondary)] mb-1 md:mb-2">
            {search ? t.noMatch : t.noResult}
          </h3>
          <p className="text-[var(--text-tertiary)] text-xs md:text-sm max-w-sm">
            {search ? t.tryAnotherSearch : t.resultWillShow}
          </p>
        </div>
      ) : (
        <div className="space-y-3 md:space-y-5">
          {filtered.map((result, idx) => (
            <ResultCard
              key={result._id}
              result={result}
              idx={idx}
              t={t}
              lang={lang}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default LabResults;
