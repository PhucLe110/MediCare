import { API_URL, authFetch } from "../config";
import { useState } from "react";
import { Bot, Activity, ArrowRight, Loader2, RefreshCcw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "../hooks/useTranslation";
import { getLocalizedDept } from "../utils/i18nHelpers";

const trans = {
  vi: {
    title: "AI Tư Vấn Sức Khỏe",
    subtitle:
      "Trợ lý y tế ảo giúp bạn phân tích triệu chứng và tìm đúng chuyên khoa",
    promptError: "Vui lòng nhập triệu chứng của bạn để AI phân tích.",
    networkError: "Đã xảy ra lỗi hệ thống khi kết nối đến AI.",
    leftTitle: "Bạn đang cảm thấy thế nào?",
    leftDesc:
      "Hãy mô tả chi tiết các triệu chứng, cảm giác khó chịu hoặc biểu hiện bất thường trên cơ thể bạn.",
    placeholderText:
      "Ví dụ: Tôi bị đau đầu dữ dội 2 ngày nay, kèm theo chóng mặt khi đứng lên ngồi xuống và hơi buồn nôn vào buổi sáng...",
    quickSugg: "Gợi ý nhanh:",
    suggestions: [
      "Đau đầu, sốt ho",
      "Đau dạ dày, buồn nôn",
      "Sốt cao, phát ban",
      "Đau mỏi vai gáy",
    ],
    btnPredict: "Phân tích triệu chứng",
    analyzing: "Đang phân tích dữ liệu...",
    tooltipReset: "Bắt đầu lại",
    aiWaitingTitle: "AI Đang Chờ",
    aiWaitingDesc:
      "Nhập triệu chứng của bạn vào khung bên trái. Trí tuệ nhân tạo sẽ đối chiếu với cơ sở dữ liệu y khoa để đưa ra lời khuyên.",
    processingTitle: "Hệ thống đang xử lý...",
    processingDesc:
      "Thuật toán đang bóc tách từ khóa và đánh giá trọng số bệnh lý.",
    recDept: "Khoa Đề Xuất",
    accHigh: "ĐỘ CHÍNH XÁC CAO",
    accMedium: "ĐỘ CHÍNH XÁC KHÁ",
    accLow: "CẦN KHÁM TỔNG QUÁT",
    specLabel: "Chuyên khoa cụ thể:",
    matchedKws: "Điểm nhấn triệu chứng:",
    disclaimer:
      "Đánh giá của AI chỉ mang tính chất tham khảo định hướng, giúp bạn tiết kiệm thời gian chọn khoa. Vui lòng thảo luận trực tiếp với Bác sĩ để có kết luận chính xác nhất.",
    btnBook: "Tiến hành Đặt lịch chuyên khoa này",
  },
  en: {
    title: "AI Clinical Health Triage",
    subtitle:
      "An intelligent virtual medical assistant resolving symptoms to recommend appropriate departments",
    promptError:
      "Please input your health concerns so the medical AI can analyze them.",
    networkError:
      "A network communication anomaly occurred when connecting with the clinical AI engine.",
    leftTitle: "Describe Your Current Health Status",
    leftDesc:
      "Provide detailed descriptors of symptoms, localized discomforts, or unusual systemic shifts.",
    placeholderText:
      "E.g., Severe pounding headache for 2 days, accompanied by lightheadedness when standing up and mild nausea in the mornings...",
    quickSugg: "Quick Suggestions:",
    suggestions: [
      "Headache, fever and cough",
      "Stomach ache and nausea",
      "High fever with skin rash",
      "Neck and shoulder muscle pain",
    ],
    btnPredict: "Analyze Clinical Symptoms",
    analyzing: "Processing clinical descriptors...",
    tooltipReset: "Reset Assistant",
    aiWaitingTitle: "AI Core Standby",
    aiWaitingDesc:
      "Enter your clinical symptoms into the console. The deep learning system will cross-reference medical databases to output triage guidelines.",
    processingTitle: "Analyzing pathology logs...",
    processingDesc:
      "Natural language tokenizers are extracting clinical entities and assessing semantic weight.",
    recDept: "Suggested Department",
    accHigh: "HIGH PREDICTIVE CONFIDENCE",
    accMedium: "MODERATE CONFIDENCE",
    accLow: "GENERAL CONSULTATION REQUIRED",
    specLabel: "Specific Clinical Specialty:",
    matchedKws: "Identified Clinical Markers:",
    disclaimer:
      "This automated triage diagnostic output is strictly for operational routing optimization and reference, not formal diagnostic confirmation. Settle clinical consultations directly with authorized physicians.",
    btnBook: "Settle Appointment for Recommended Department",
  },
};

const AITriage = () => {
  const { lang, t } = useTranslation(trans);
  const [symptoms, setSymptoms] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handlePredict = async () => {
    if (!symptoms.trim()) {
      setError(t.promptError);
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await authFetch(`${API_URL}/api/ai/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symptoms }),
      });
      const data = await res.json();

      if (data.success) {
        setResult(data.data);
      } else {
        setError(data.message);
      }
    } catch (err) {
      console.error(err);
      setError(t.networkError);
    } finally {
      setLoading(false);
    }
  };

  const handleGoToBooking = () => {
    if (result) {
      navigate("/dashboard/booking", {
        state: {
          prefilledDepartment: result.department,
          prefilledSpecialty: result.specialty,
          symptomsText: symptoms,
        },
      });
    }
  };

  const resetForm = () => {
    setSymptoms("");
    setResult(null);
    setError("");
  };

  return (
    <div className="max-w-5xl mx-auto px-3 md:px-4">
      <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-8 bg-[var(--card-bg)] p-4 md:p-6 rounded-2xl md:rounded-3xl shadow-sm border border-[var(--border-color)]">
        <div className="relative shrink-0">
          <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-blue-100 dark:from-blue-900/30 to-indigo-100 dark:to-indigo-900/30 text-primary rounded-2xl flex items-center justify-center shadow-inner relative z-10">
            <Bot size={24} />
          </div>
          <div className="absolute inset-0 bg-primary rounded-2xl blur-lg opacity-20 animate-pulse"></div>
        </div>
        <div>
          <h1 className="text-lg md:text-2xl font-bold text-[var(--text-primary)] bg-clip-text text-transparent bg-gradient-to-r from-[var(--text-primary)] to-primary">
            {t.title}
          </h1>
          <p className="text-xs md:text-sm text-[var(--text-secondary)] mt-1">
            {t.subtitle}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        {/* Left Column - Input Area */}
        <div className="bg-[var(--card-bg)] p-4 md:p-8 rounded-2xl md:rounded-3xl shadow-sm border border-[var(--border-color)] flex flex-col h-full relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 md:w-32 md:h-32 bg-blue-50 dark:bg-blue-900/20 rounded-full blur-3xl -z-10"></div>

          <h2 className="text-base md:text-lg font-bold text-[var(--text-primary)] mb-3 md:mb-4 flex items-center gap-2">
            {t.leftTitle}
          </h2>
          <p className="text-xs md:text-sm text-[var(--text-secondary)] mb-4 md:mb-6 leading-relaxed">
            {t.leftDesc}
          </p>

          <div className="relative flex-1 flex flex-col">
            <textarea
              className={`w-full flex-1 min-h-[180px] md:min-h-[200px] p-3 md:p-5 bg-[var(--bg-tertiary)] border ${error ? "border-red-300 dark:border-red-900/30 focus:ring-red-200" : "border-[var(--border-color)] focus:border-primary/50 focus:ring-primary/10"} rounded-2xl text-xs md:text-sm focus:outline-none focus:ring-4 transition-all resize-none shadow-inner text-[var(--text-primary)]`}
              placeholder={t.placeholderText}
              value={symptoms}
              onChange={(e) => {
                setSymptoms(e.target.value);
                if (error) setError("");
              }}
            ></textarea>

            {/* Quick Suggestions */}
            <div className="mt-3 md:mt-4 flex flex-wrap gap-2">
              <span className="text-[10px] md:text-xs text-[var(--text-tertiary)] font-medium w-full mb-1">
                {t.quickSugg}
              </span>
              {t.suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setSymptoms(suggestion)}
                  className="px-2 md:px-3 py-1 md:py-1.5 bg-[var(--card-bg)] border border-[var(--border-color)] text-[var(--text-secondary)] text-[10px] md:text-xs rounded-full hover:border-primary hover:text-primary transition-all shadow-sm"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p className="text-red-500 text-xs md:text-sm mt-3 md:mt-4 font-medium animate-in fade-in">
              {error}
            </p>
          )}

          <div className="flex gap-2 md:gap-3 mt-4 md:mt-6">
            <button
              onClick={handlePredict}
              disabled={loading || !symptoms.trim()}
              className="flex-1 py-3 md:py-4 bg-gradient-to-r from-primary to-blue-600 text-white rounded-xl font-bold hover:from-primary-light hover:to-blue-500 transition-all shadow-lg shadow-blue-500/30 flex justify-center items-center gap-2 disabled:from-gray-300 disabled:to-gray-400 disabled:shadow-none text-xs md:text-sm"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> {t.analyzing}
                </>
              ) : (
                <>
                  <Activity size={16} /> {t.btnPredict}
                </>
              )}
            </button>

            {result && (
              <button
                onClick={resetForm}
                className="p-3 md:p-4 bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-secondary)] rounded-xl hover:bg-[var(--border-color)] hover:text-primary transition-all tooltip"
                title={t.tooltipReset}
              >
                <RefreshCcw size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Right Column - Result Area */}
        <div className="h-full min-h-[350px] md:min-h-[400px]">
          {!result && !loading && (
            <div className="h-full bg-gradient-to-br from-blue-50/50 dark:from-blue-900/20 to-indigo-50/50 dark:to-indigo-900/20 border border-blue-100/50 dark:border-blue-900/30 rounded-2xl md:rounded-3xl p-4 md:p-8 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 md:w-24 md:h-24 bg-[var(--card-bg)] rounded-full flex items-center justify-center shadow-sm mb-4 md:mb-6 border border-blue-50 dark:border-blue-900/30">
                <Bot size={32} className="text-blue-300" />
              </div>
              <h3 className="text-base md:text-xl font-bold text-[var(--text-secondary)] mb-2">
                {t.aiWaitingTitle}
              </h3>
              <p className="text-[10px] md:text-sm text-[var(--text-tertiary)] max-w-xs leading-relaxed">
                {t.aiWaitingDesc}
              </p>
            </div>
          )}

          {loading && (
            <div className="h-full bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl md:rounded-3xl p-4 md:p-8 flex flex-col items-center justify-center text-center shadow-sm">
              <div className="relative mb-4 md:mb-8">
                <div className="w-16 h-16 md:w-24 md:h-24 bg-blue-100 dark:bg-blue-900/30 rounded-full animate-ping absolute opacity-40"></div>
                <div className="w-16 h-16 md:w-24 md:h-24 bg-gradient-to-tr from-primary to-blue-400 rounded-full flex items-center justify-center relative z-10 shadow-xl shadow-blue-500/20">
                  <Bot size={28} className="text-white animate-pulse" />
                </div>
              </div>
              <h3 className="text-base md:text-xl font-bold text-[var(--text-primary)] mb-2">
                {t.processingTitle}
              </h3>
              <p className="text-[10px] md:text-sm text-[var(--text-secondary)]">
                {t.processingDesc}
              </p>
            </div>
          )}

          {result && !loading && (
            <div className="bg-[var(--card-bg)] rounded-2xl md:rounded-3xl shadow-xl shadow-blue-900/5 border border-[var(--border-color)] overflow-hidden animate-in slide-in-from-right-8 duration-500 h-full flex flex-col relative group">
              <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 dark:from-blue-900/20 to-[var(--card-bg)] pointer-events-none"></div>

              <div className="p-4 md:p-8 relative z-10 border-b border-[var(--border-color)]">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-0 mb-4 md:mb-6">
                  <div className="flex items-center gap-2 md:gap-3">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 dark:bg-blue-900/30 text-primary rounded-xl flex items-center justify-center shrink-0">
                      <Activity size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] md:text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider">
                        {t.recDept}
                      </p>
                      <h3 className="text-lg md:text-2xl font-black text-[var(--text-primary)]">
                        {getLocalizedDept(lang, result.department)}
                      </h3>
                    </div>
                  </div>
                  <span
                    className={`px-3 md:px-4 py-1 md:py-2 text-[10px] md:text-xs font-black uppercase rounded-xl border tracking-wider shadow-sm ${
                      result.confidence === "high"
                        ? "bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 border-green-200 dark:border-green-900/30"
                        : result.confidence === "medium"
                          ? "bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-900/30"
                          : "bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border-[var(--border-color)]"
                    }`}
                  >
                    {result.confidence === "high"
                      ? t.accHigh
                      : result.confidence === "medium"
                        ? t.accMedium
                        : t.accLow}
                  </span>
                </div>

                <div className="bg-primary text-white p-3 md:p-4 rounded-2xl shadow-inner relative overflow-hidden">
                  <div className="absolute right-0 top-0 opacity-10 transform translate-x-4 -translate-y-4">
                    <Bot size={80} />
                  </div>
                  <p className="text-xs md:text-sm font-medium text-blue-100 mb-1">
                    {t.specLabel}
                  </p>
                  <p className="text-base md:text-xl font-bold relative z-10">
                    {getLocalizedDept(lang, result.specialty)}
                  </p>
                </div>
              </div>

              <div className="p-4 md:p-8 flex-1 flex flex-col relative z-10 bg-[var(--card-bg)]/80 backdrop-blur-sm">
                <div className="flex-1">
                  <div className="flex items-start gap-2 md:gap-3 mb-4 md:mb-6">
                    <div className="mt-1 shrink-0 text-primary">
                      <Bot size={16} />
                    </div>
                    <p className="text-xs md:text-sm text-[var(--text-primary)] leading-relaxed font-medium">
                      "{result.message}"
                    </p>
                  </div>

                  {result.matchedKeywords.length > 0 && (
                    <div className="mb-4 md:mb-6 p-3 md:p-5 bg-[var(--bg-tertiary)] rounded-2xl border border-[var(--border-color)]">
                      <p className="text-[10px] md:text-xs text-[var(--text-secondary)] font-bold uppercase tracking-wider mb-2 md:mb-3 flex items-center gap-2">
                        <Activity size={12} /> {t.matchedKws}
                      </p>
                      <div className="flex flex-wrap gap-1 md:gap-2">
                        {result.matchedKeywords.map((kw, idx) => (
                          <span
                            key={idx}
                            className="px-2 md:px-3 py-1 md:py-1.5 bg-[var(--card-bg)] text-accent text-[10px] md:text-xs font-bold rounded-xl border border-red-100 dark:border-red-900/30 shadow-sm"
                          >
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-3 md:mt-4 p-3 md:p-4 rounded-xl flex items-start gap-2 md:gap-3 bg-blue-50/50 dark:bg-blue-900/20">
                    <div className="text-blue-500 shrink-0 mt-0.5 text-xs md:text-sm">
                      ℹ️
                    </div>
                    <p className="text-[10px] md:text-xs text-[var(--text-secondary)] leading-relaxed">
                      {t.disclaimer}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleGoToBooking}
                  className="w-full mt-4 md:mt-8 py-3 md:py-4 bg-gray-900 dark:bg-[var(--text-primary)] text-white rounded-xl font-bold hover:bg-black dark:hover:bg-[var(--text-primary)] transition-all shadow-xl shadow-gray-900/20 flex justify-center items-center gap-2 group overflow-hidden relative text-xs md:text-sm"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                  {t.btnBook}
                  <ArrowRight
                    size={14}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AITriage;
