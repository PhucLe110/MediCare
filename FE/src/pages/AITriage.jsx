import { API_URL } from '../config';
import React, { useState } from 'react';
import { Bot, Activity, ArrowRight, Loader2, RefreshCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';

const trans = {
  vi: {
    title: 'AI Tư Vấn Sức Khỏe',
    subtitle: 'Trợ lý y tế ảo giúp bạn phân tích triệu chứng và tìm đúng chuyên khoa',
    promptError: 'Vui lòng nhập triệu chứng của bạn để AI phân tích.',
    networkError: 'Đã xảy ra lỗi hệ thống khi kết nối đến AI.',
    leftTitle: 'Bạn đang cảm thấy thế nào?',
    leftDesc: 'Hãy mô tả chi tiết các triệu chứng, cảm giác khó chịu hoặc biểu hiện bất thường trên cơ thể bạn.',
    placeholderText: 'Ví dụ: Tôi bị đau đầu dữ dội 2 ngày nay, kèm theo chóng mặt khi đứng lên ngồi xuống và hơi buồn nôn vào buổi sáng...',
    quickSugg: 'Gợi ý nhanh:',
    suggestions: ['Đau đầu, sốt ho', 'Đau dạ dày, buồn nôn', 'Sốt cao, phát ban', 'Đau mỏi vai gáy'],
    btnPredict: 'Phân tích triệu chứng',
    analyzing: 'Đang phân tích dữ liệu...',
    tooltipReset: 'Bắt đầu lại',
    aiWaitingTitle: 'AI Đang Chờ',
    aiWaitingDesc: 'Nhập triệu chứng của bạn vào khung bên trái. Trí tuệ nhân tạo sẽ đối chiếu với cơ sở dữ liệu y khoa để đưa ra lời khuyên.',
    processingTitle: 'Hệ thống đang xử lý...',
    processingDesc: 'Thuật toán đang bóc tách từ khóa và đánh giá trọng số bệnh lý.',
    recDept: 'Khoa Đề Xuất',
    accHigh: 'ĐỘ CHÍNH XÁC CAO',
    accMedium: 'ĐỘ CHÍNH XÁC KHÁ',
    accLow: 'CẦN KHÁM TỔNG QUÁT',
    specLabel: 'Chuyên khoa cụ thể:',
    matchedKws: 'Điểm nhấn triệu chứng:',
    disclaimer: 'Đánh giá của AI chỉ mang tính chất tham khảo định hướng, giúp bạn tiết kiệm thời gian chọn khoa. Vui lòng thảo luận trực tiếp với Bác sĩ để có kết luận chính xác nhất.',
    btnBook: 'Tiến hành Đặt lịch chuyên khoa này',
  },
  en: {
    title: 'AI Clinical Health Triage',
    subtitle: 'An intelligent virtual medical assistant resolving symptoms to recommend appropriate departments',
    promptError: 'Please input your health concerns so the medical AI can analyze them.',
    networkError: 'A network communication anomaly occurred when connecting with the clinical AI engine.',
    leftTitle: 'Describe Your Current Health Status',
    leftDesc: 'Provide detailed descriptors of symptoms, localized discomforts, or unusual systemic shifts.',
    placeholderText: 'E.g., Severe pounding headache for 2 days, accompanied by lightheadedness when standing up and mild nausea in the mornings...',
    quickSugg: 'Quick Suggestions:',
    suggestions: ['Headache, fever and cough', 'Stomach ache and nausea', 'High fever with skin rash', 'Neck and shoulder muscle pain'],
    btnPredict: 'Analyze Clinical Symptoms',
    analyzing: 'Processing clinical descriptors...',
    tooltipReset: 'Reset Assistant',
    aiWaitingTitle: 'AI Core Standby',
    aiWaitingDesc: 'Enter your clinical symptoms into the console. The deep learning system will cross-reference medical databases to output triage guidelines.',
    processingTitle: 'Analyzing pathology logs...',
    processingDesc: 'Natural language tokenizers are extracting clinical entities and assessing semantic weight.',
    recDept: 'Suggested Department',
    accHigh: 'HIGH PREDICTIVE CONFIDENCE',
    accMedium: 'MODERATE CONFIDENCE',
    accLow: 'GENERAL CONSULTATION REQUIRED',
    specLabel: 'Specific Clinical Specialty:',
    matchedKws: 'Identified Clinical Markers:',
    disclaimer: 'This automated triage diagnostic output is strictly for operational routing optimization and reference, not formal diagnostic confirmation. Settle clinical consultations directly with authorized physicians.',
    btnBook: 'Settle Appointment for Recommended Department',
  }
};

const AITriage = () => {
  const { lang, t } = useTranslation(trans);
  const [symptoms, setSymptoms] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

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

  const handlePredict = async () => {
    if (!symptoms.trim()) {
      setError(t.promptError);
      return;
    }
    
    setError('');
    setLoading(true);

    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const res = await fetch(`${API_URL}/api/ai/predict`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userInfo.token}`
        },
        body: JSON.stringify({ symptoms })
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
      navigate('/dashboard/booking', { 
        state: { 
          prefilledDepartment: result.department,
          prefilledSpecialty: result.specialty,
          symptomsText: symptoms
        } 
      });
    }
  };

  const resetForm = () => {
    setSymptoms('');
    setResult(null);
    setError('');
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center gap-4 mb-8 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div className="relative">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 text-primary rounded-2xl flex items-center justify-center shadow-inner relative z-10">
            <Bot size={32} />
          </div>
          <div className="absolute inset-0 bg-primary rounded-2xl blur-lg opacity-20 animate-pulse"></div>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800 bg-clip-text text-transparent bg-gradient-to-r from-gray-800 to-primary">{t.title}</h1>
          <p className="text-gray-500 mt-1">{t.subtitle}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Input Area */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col h-full relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-3xl -z-10"></div>
          
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            {t.leftTitle}
          </h2>
          <p className="text-sm text-gray-500 mb-6 leading-relaxed">
            {t.leftDesc}
          </p>

          <div className="relative flex-1 flex flex-col">
            <textarea
              className={`w-full flex-1 min-h-[200px] p-5 bg-gray-50/50 border ${error ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:border-primary/50 focus:ring-primary/10'} rounded-2xl text-sm focus:outline-none focus:ring-4 transition-all resize-none shadow-inner`}
              placeholder={t.placeholderText}
              value={symptoms}
              onChange={(e) => {
                setSymptoms(e.target.value);
                if (error) setError('');
              }}
            ></textarea>
            
            {/* Quick Suggestions */}
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="text-xs text-gray-400 font-medium w-full mb-1">{t.quickSugg}</span>
              {t.suggestions.map(suggestion => (
                <button 
                  key={suggestion}
                  onClick={() => setSymptoms(suggestion)}
                  className="px-3 py-1.5 bg-white border border-gray-200 text-gray-600 text-xs rounded-full hover:border-primary hover:text-primary transition-all shadow-sm"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
          
          {error && <p className="text-red-500 text-sm mt-4 font-medium animate-in fade-in">{error}</p>}

          <div className="flex gap-3 mt-6">
            <button 
              onClick={handlePredict}
              disabled={loading || !symptoms.trim()}
              className="flex-1 py-4 bg-gradient-to-r from-primary to-blue-600 text-white rounded-xl font-bold hover:from-primary-light hover:to-blue-500 transition-all shadow-lg shadow-blue-500/30 flex justify-center items-center gap-2 disabled:from-gray-300 disabled:to-gray-400 disabled:shadow-none"
            >
              {loading ? (
                <><Loader2 size={20} className="animate-spin" /> {t.analyzing}</>
              ) : (
                <><Activity size={20} /> {t.btnPredict}</>
              )}
            </button>
            
            {result && (
              <button 
                onClick={resetForm}
                className="p-4 bg-gray-50 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-100 hover:text-primary transition-all tooltip"
                title={t.tooltipReset}
              >
                <RefreshCcw size={20} />
              </button>
            )}
          </div>
        </div>

        {/* Right Column - Result Area */}
        <div className="h-full min-h-[400px]">
          {!result && !loading && (
            <div className="h-full bg-gradient-to-br from-blue-50/50 to-indigo-50/50 border border-blue-100/50 rounded-3xl p-8 flex flex-col items-center justify-center text-center">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-sm mb-6 border border-blue-50">
                <Bot size={48} className="text-blue-300" />
              </div>
              <h3 className="text-xl font-bold text-gray-500 mb-2">{t.aiWaitingTitle}</h3>
              <p className="text-sm text-gray-400 max-w-xs leading-relaxed">
                {t.aiWaitingDesc}
              </p>
            </div>
          )}

          {loading && (
            <div className="h-full bg-white border border-gray-100 rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-sm">
              <div className="relative mb-8">
                <div className="w-24 h-24 bg-blue-100 rounded-full animate-ping absolute opacity-40"></div>
                <div className="w-24 h-24 bg-gradient-to-tr from-primary to-blue-400 rounded-full flex items-center justify-center relative z-10 shadow-xl shadow-blue-500/20">
                  <Bot size={40} className="text-white animate-pulse" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">{t.processingTitle}</h3>
              <p className="text-sm text-gray-500">{t.processingDesc}</p>
            </div>
          )}

          {result && !loading && (
            <div className="bg-white rounded-3xl shadow-xl shadow-blue-900/5 border border-gray-100 overflow-hidden animate-in slide-in-from-right-8 duration-500 h-full flex flex-col relative group">
              <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 to-white pointer-events-none"></div>
              
              <div className="p-8 relative z-10 border-b border-gray-50">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 text-primary rounded-xl flex items-center justify-center">
                      <Activity size={24} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t.recDept}</p>
                      <h3 className="text-2xl font-black text-gray-800">{getLocalizedDept(result.department)}</h3>
                    </div>
                  </div>
                  <span className={`px-4 py-2 text-xs font-black uppercase rounded-xl border tracking-wider shadow-sm ${
                    result.confidence === 'high' ? 'bg-green-50 text-green-600 border-green-200' : 
                    result.confidence === 'medium' ? 'bg-yellow-50 text-yellow-600 border-yellow-200' : 'bg-gray-50 text-gray-600 border-gray-200'
                  }`}>
                    {result.confidence === 'high' ? t.accHigh : result.confidence === 'medium' ? t.accMedium : t.accLow}
                  </span>
                </div>
                
                <div className="bg-primary text-white p-4 rounded-2xl shadow-inner relative overflow-hidden">
                  <div className="absolute right-0 top-0 opacity-10 transform translate-x-4 -translate-y-4">
                    <Bot size={100} />
                  </div>
                  <p className="text-sm font-medium text-blue-100 mb-1">{t.specLabel}</p>
                  <p className="text-xl font-bold relative z-10">{getLocalizedDept(result.specialty)}</p>
                </div>
              </div>
              
              <div className="p-8 flex-1 flex flex-col relative z-10 bg-white/80 backdrop-blur-sm">
                <div className="flex-1">
                  <div className="flex items-start gap-3 mb-6">
                    <div className="mt-1 shrink-0 text-primary">
                      <Bot size={20} />
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed font-medium">"{result.message}"</p>
                  </div>
                  
                  {result.matchedKeywords.length > 0 && (
                    <div className="mb-6 p-5 bg-gray-50 rounded-2xl border border-gray-100">
                      <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
                        <Activity size={14} /> {t.matchedKws}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {result.matchedKeywords.map((kw, idx) => (
                          <span key={idx} className="px-3 py-1.5 bg-white text-accent text-xs font-bold rounded-xl border border-red-100 shadow-sm">
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-4 p-4 rounded-xl flex items-start gap-3 bg-blue-50/50">
                    <div className="text-blue-500 shrink-0 mt-0.5">ℹ️</div>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      {t.disclaimer}
                    </p>
                  </div>
                </div>

                <button 
                  onClick={handleGoToBooking}
                  className="w-full mt-8 py-4 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-all shadow-xl shadow-gray-900/20 flex justify-center items-center gap-2 group overflow-hidden relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                  {t.btnBook}
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
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
