import { API_URL } from '../config';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Bot, FolderHeart, CreditCard, Activity, ShieldCheck, FileText, ChevronRight, Stethoscope, HeartPulse, Brain, Bone, Eye, Star, CheckCircle2, Award, Users, Clock } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';

const trans = {
  vi: {
    heroTitle1: 'Chăm sóc sức khỏe',
    heroTitle2: 'Toàn diện – Thông minh',
    heroDesc: 'MediCare ứng dụng công nghệ AI để hỗ trợ bạn lựa chọn bác sĩ, khoa khám và lịch hẹn phù hợp nhất.',
    btnBook: 'Đặt lịch khám ngay',
    btnAI: 'AI tư vấn sức khỏe',
    featAI: 'AI khuyến nghị\nthông minh',
    featBooking: 'Đặt lịch nhanh chóng\ntiện lợi',
    featShield: 'Bảo mật thông tin\ntuyệt đối',
    featRecord: 'Quản lý hồ sơ\ndễ dàng',
    actionBookTitle: 'Đặt lịch khám',
    actionBookDesc: 'Chọn bác sĩ, thời gian phù hợp',
    actionAITitle: 'AI tư vấn sức khỏe',
    actionAIDesc: 'Mô tả triệu chứng để nhận khuyến nghị',
    actionRecordTitle: 'Hồ sơ bệnh án',
    actionRecordDesc: 'Xem lịch sử khám và kết quả điều trị',
    actionPayTitle: 'Thanh toán online',
    actionPayDesc: 'Thanh toán nhanh chóng, an toàn',
    aboutSubtitle: 'Về MediCare',
    aboutTitle1: 'Hệ thống Y tế Thông minh',
    aboutTitle2: 'Tiên phong tại Việt Nam',
    aboutDesc: 'MediCare tự hào là hệ thống tiên phong ứng dụng Trí tuệ nhân tạo (AI) vào quy trình khám chữa bệnh. Chúng tôi mang đến trải nghiệm y tế số hóa hoàn toàn từ khâu đặt lịch, phân loại bệnh, đến quản lý hồ sơ sức khỏe trọn đời.',
    aboutPoint1: 'Đội ngũ hơn 200 y bác sĩ chuyên gia hàng đầu.',
    aboutPoint2: 'Trang thiết bị chẩn đoán hình ảnh tiên tiến nhất.',
    aboutPoint3: 'Hồ sơ bệnh án điện tử bảo mật tuyệt đối 100%.',
    aboutPoint4: 'Hệ thống phòng khám phủ sóng khắp cả nước.',
    aboutExp: 'Năm kinh nghiệm',
    aboutTrust: 'Bệnh nhân tin tưởng',
    aboutSatisfied: 'Hài lòng dịch vụ',
    servicesTitle: 'Dịch vụ y tế chất lượng cao',
    servicesDesc: 'Chúng tôi cung cấp các dịch vụ chăm sóc sức khỏe toàn diện với đội ngũ chuyên gia hàng đầu và trang thiết bị hiện đại nhất.',
    service1Name: 'Khoa Nội tổng quát',
    service1Desc: 'Điều trị nội khoa toàn diện các bệnh tim mạch, tiêu hóa, hô hấp, nội tiết và thần kinh.',
    service2Name: 'Khoa Ngoại tổng quát',
    service2Desc: 'Phẫu thuật ngoại khoa kỹ thuật cao và xâm lấn tối thiểu với tính an toàn vượt trội.',
    service3Name: 'Khoa Nhi',
    service3Desc: 'Chăm sóc y khoa toàn diện cho trẻ sơ sinh và trẻ nhỏ, tư vấn dinh dưỡng nâng cao.',
    service4Name: 'Khoa Sản',
    service4Desc: 'Dịch vụ thai sản trọn gói, đồng hành cùng mẹ bầu đón bé yêu chào đời bình an.',
    service5Name: 'Khoa Tim mạch',
    service5Desc: 'Tầm soát chuyên sâu bệnh mạch vành, van tim và can thiệp tim mạch hiện đại.',
    service6Name: 'Khoa Chấn thương chỉnh hình',
    service6Desc: 'Phẫu thuật thay khớp, cột sống, can thiệp chấn thương thể thao và phục hồi.',
    service7Name: 'Khoa Tai Mũi Họng',
    service7Desc: 'Khám chữa chuyên sâu viêm xoang, thanh quản và các bệnh lý vùng họng tai.',
    service8Name: 'Khoa Da liễu',
    service8Desc: 'Điều trị bệnh ngoài da kết hợp laser công nghệ cao phục hồi thẩm mỹ tối ưu.',
    service9Name: 'Khoa Mắt',
    service9Desc: 'Đo khúc xạ kỹ thuật số và phẫu thuật đục thủy tinh thể bằng công nghệ Phaco.',
    learnMore: 'Tìm hiểu thêm',
    doctorsSubtitle: 'Đội ngũ Bác sĩ',
    doctorsTitle: 'Chuyên gia y tế hàng đầu',
    doctorsDesc: 'Đội ngũ y bác sĩ giàu kinh nghiệm, tận tâm vì sức khỏe của bạn và gia đình.',
    btnViewAllDocs: 'Xem tất cả bác sĩ',
    experience: 'Kinh nghiệm',
    years: 'năm',
    btnBookNow: 'Đặt khám ngay',
    processSubtitle: 'Quy Trình',
    processTitle: 'Khám chữa bệnh dễ dàng',
    processDesc: 'Trải nghiệm dịch vụ y tế không chờ đợi, số hóa toàn bộ thủ tục để tối ưu thời gian cho bệnh nhân.',
    step1Title: 'AI Tư vấn sơ bộ',
    step1Desc: 'Nhập triệu chứng, AI sẽ gợi ý chuyên khoa và bác sĩ phù hợp nhất.',
    step2Title: 'Đặt lịch trực tuyến',
    step2Desc: 'Chọn giờ khám, thanh toán nhanh chóng mà không cần xếp hàng lấy số.',
    step3Title: 'Đến khám trực tiếp',
    step3Desc: 'Bác sĩ kiểm tra chuyên sâu dựa trên các thông tin đã được AI phân tích.',
    step4Title: 'Nhận kết quả Online',
    step4Desc: 'Đơn thuốc và bệnh án được lưu trữ điện tử, theo dõi dễ dàng qua app.',
  },
  en: {
    heroTitle1: 'Healthcare Services',
    heroTitle2: 'Comprehensive & Smart',
    heroDesc: 'MediCare leverages state-of-the-art AI technology to help you schedule appropriate physicians, departments, and medical appointments.',
    btnBook: 'Book Appointment Now',
    btnAI: 'AI Health Triage',
    featAI: 'AI Smart\nRecommendation',
    featBooking: 'Fast Booking\nConvenient',
    featShield: 'Absolute Info\nSecurity',
    featRecord: 'Easy Records\nManagement',
    actionBookTitle: 'Book Appointment',
    actionBookDesc: 'Select specialized doctors and suitable slots',
    actionAITitle: 'AI Health Triage',
    actionAIDesc: 'Describe your symptoms for triage suggestions',
    actionRecordTitle: 'Medical Records',
    actionRecordDesc: 'Review diagnosis logs and treatments history',
    actionPayTitle: 'Secure Payments',
    actionPayDesc: 'Settle invoices quickly and securely online',
    aboutSubtitle: 'About MediCare',
    aboutTitle1: 'Intelligent Clinical Network',
    aboutTitle2: 'Leading in Vietnam',
    aboutDesc: 'MediCare proudly stands as a pioneer integrating advanced Artificial Intelligence into clinical pathways. We offer an entirely digital healthcare ecosystem spanning symptom analysis, clinical queues, and lifelong medical record indexing.',
    aboutPoint1: 'Eminent staff of over 200 medical practitioners.',
    aboutPoint2: 'Next-generation diagnostic imaging systems.',
    aboutPoint3: '100% encrypted, HIPAA-compliant electronic medical records.',
    aboutPoint4: 'Country-wide modern clinic network presence.',
    aboutExp: 'Years of Experience',
    aboutTrust: 'Trusted Patients',
    aboutSatisfied: 'Satisfaction Rate',
    servicesTitle: 'Premium Medical Care Services',
    servicesDesc: 'We offer specialized clinical care and comprehensive treatment pathways facilitated by stellar medical specialists and advanced gear.',
    service1Name: 'General Internal Medicine',
    service1Desc: 'Comprehensive medical treatment of cardiovascular, digestive, endocrinological, and neurological systems.',
    service2Name: 'General Surgery Department',
    service2Desc: 'State-of-the-art surgical interventions with micro-invasive techniques for superior patient safety.',
    service3Name: 'Pediatric Care Unit',
    service3Desc: 'Full-spectrum healthcare from neonatology to child growth monitoring and nutritional guidance.',
    service4Name: 'Obstetrics & Gynecology',
    service4Desc: 'All-inclusive maternal wellness paths and supportive birth plans for the safest delivery experience.',
    service5Name: 'Cardiovascular Care',
    service5Desc: 'Comprehensive coronary screenings, heart-valve evaluation, and modern interventional cardiology.',
    service6Name: 'Orthopedics & Joint Care',
    service6Desc: 'Expert joint replacements, spinal surgeries, sports injury interventions, and custom rehab plans.',
    service7Name: 'Otolaryngology (ENT)',
    service7Desc: 'Highly specialized treatment of chronic sinusitis, vocal cord disorders, and middle ear diseases.',
    service8Name: 'Dermatology & Skin Care',
    service8Desc: 'Advanced medical dermatology combined with state-of-the-art laser cosmetic therapies.',
    service9Name: 'Ophthalmology Unit',
    service9Desc: 'Digital refractive diagnostic mapping and premium Phaco cataract replacement surgery.',
    learnMore: 'Learn More',
    doctorsSubtitle: 'Medical Experts',
    doctorsTitle: 'Eminent Attending Physicians',
    doctorsDesc: 'Highly experienced, dedicated medical experts focused entirely on your wellness.',
    btnViewAllDocs: 'View All Physicians',
    experience: 'Experience',
    years: 'years',
    btnBookNow: 'Book Now',
    processSubtitle: 'Our Pathway',
    processTitle: 'Streamlined Clinical Pathway',
    processDesc: 'Enjoy clinical care without waiting queues, with completely paperless digital logistics maximizing your time.',
    step1Title: 'AI Symptom Screening',
    step1Desc: 'Enter symptoms and receive instant triage recommendations for specialist clinics.',
    step2Title: 'Secure Slot Booking',
    step2Desc: 'Choose preferred slot and settle medical fees securely without queuing.',
    step3Title: 'In-Clinic Assessment',
    step3Desc: 'Eminent doctor conducts targeted assessment supported by preliminary AI triage logs.',
    step4Title: 'Digital Results Release',
    step4Desc: 'Review secure clinical transcripts, diagnostics, and prescriptions on the client portal.',
  }
};

const LandingPage = () => {
  const { lang, t } = useTranslation(trans);
  const [doctors, setDoctors] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API_URL}/api/doctors`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setDoctors(data.data.slice(0, 4));
        }
      })
      .catch(console.error);
  }, []);

  const getDeptTranslation = (dept) => {
    if (!dept) return '';
    const dLower = dept.toLowerCase();
    if (dLower.includes('tổng quát') || dLower.includes('general')) return lang === 'vi' ? 'Khám tổng quát' : 'General Practice';
    if (dLower.includes('xét nghiệm') || dLower.includes('lab')) return lang === 'vi' ? 'Xét nghiệm' : 'Laboratory';
    return dept;
  };

  return (
    <>
      {/* Hero Section */}
      <section 
        className="relative pt-20 pb-32 overflow-hidden"
        style={{ 
          backgroundImage: 'url(https://i.pinimg.com/1200x/b4/9f/ce/b49fce1ac413733758fb3bd8419e3fb5.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center top'
        }}
      >
        {/* Overlays to ensure text readability */}
        <div className="absolute inset-0 bg-white/80 md:bg-white/60 z-0"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-transparent z-0"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Left Content */}
            <div className="max-w-xl">
              <h1 className="text-5xl lg:text-6xl font-extrabold text-[#102A63] leading-tight mb-4">
                {t.heroTitle1} <br />
                <span className="text-primary">{t.heroTitle2}</span>
              </h1>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                {t.heroDesc}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <button 
                  onClick={() => document.dispatchEvent(new CustomEvent('open-auth', { detail: 'login' }))}
                  className="flex items-center justify-center gap-2 px-6 py-3.5 bg-primary text-white font-medium rounded-lg hover:bg-primary-light transition-all shadow-md"
                >
                  <Calendar size={20} />
                  {t.btnBook}
                </button>
                <button 
                  onClick={() => document.dispatchEvent(new CustomEvent('open-auth', { detail: 'login' }))}
                  className="flex items-center justify-center gap-2 px-6 py-3.5 bg-white text-primary border border-primary font-medium rounded-lg hover:bg-primary-pale transition-all shadow-sm"
                >
                  <Bot size={20} />
                  {t.btnAI}
                </button>
              </div>

              {/* Bottom features */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                <div className="flex flex-col gap-2">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-primary">
                    <Activity size={20} />
                  </div>
                  <span className="text-xs font-medium text-gray-700 whitespace-pre-line">{t.featAI}</span>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-primary">
                    <Calendar size={20} />
                  </div>
                  <span className="text-xs font-medium text-gray-700 whitespace-pre-line">{t.featBooking}</span>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-primary">
                    <ShieldCheck size={20} />
                  </div>
                  <span className="text-xs font-medium text-gray-700 whitespace-pre-line">{t.featShield}</span>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-primary">
                    <FileText size={20} />
                  </div>
                  <span className="text-xs font-medium text-gray-700 whitespace-pre-line">{t.featRecord}</span>
                </div>
              </div>
            </div>

            {/* Right Content - Stacked Action Cards */}
            <div className="relative flex justify-center lg:justify-end">
              <div className="w-full max-w-md space-y-4">
                {[
                  { icon: Calendar, title: t.actionBookTitle, desc: t.actionBookDesc, primary: false },
                  { icon: Bot, title: t.actionAITitle, desc: t.actionAIDesc, primary: true },
                  { icon: FolderHeart, title: t.actionRecordTitle, desc: t.actionRecordDesc, primary: false },
                  { icon: CreditCard, title: t.actionPayTitle, desc: t.actionPayDesc, primary: false },
                ].map((item, index) => (
                  <div 
                    key={index}
                    onClick={() => document.dispatchEvent(new CustomEvent('open-auth', { detail: 'login' }))}
                    className={`flex items-center p-5 rounded-2xl cursor-pointer transition-all duration-300 transform hover:-translate-y-1 shadow-lg ${
                      item.primary 
                        ? 'bg-primary text-white border border-primary-light shadow-primary/20' 
                        : 'bg-white/90 backdrop-blur-sm border border-white hover:bg-white text-gray-800'
                    }`}
                  >
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 ${
                      item.primary ? 'bg-white/20' : 'bg-blue-50 text-primary'
                    }`}>
                      <item.icon size={28} />
                    </div>
                    <div className="ml-5 flex-1">
                      <h3 className={`font-black text-lg ${item.primary ? 'text-white' : 'text-gray-900'}`}>
                        {item.title}
                      </h3>
                      <p className={`text-sm mt-0.5 ${item.primary ? 'text-blue-100' : 'text-gray-500'}`}>
                        {item.desc}
                      </p>
                    </div>
                    <ChevronRight size={20} className={item.primary ? 'text-white/70' : 'text-gray-400'} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 bg-gray-50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <div className="absolute -inset-4 bg-primary/10 rounded-[3rem] transform -rotate-3 z-0"></div>
              <img src="https://i.pinimg.com/1200x/d4/5b/29/d45b297559f95af7511287bebbf3b4fe.jpg" alt="About MediCare" className="rounded-3xl shadow-2xl relative z-10 w-full object-cover h-[500px]" />
              
              <div className="absolute -bottom-8 -right-8 bg-white p-6 rounded-3xl shadow-xl z-20 flex items-center gap-4 animate-bounce" style={{ animationDuration: '3s' }}>
                <div className="w-16 h-16 rounded-full bg-blue-50 text-primary flex items-center justify-center">
                  <Award size={32} />
                </div>
                <div>
                  <h4 className="text-3xl font-black text-gray-900">15+</h4>
                  <p className="text-sm font-bold text-gray-500 uppercase">{t.aboutExp}</p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-sm font-bold text-primary uppercase tracking-widest mb-2">{t.aboutSubtitle}</h2>
              <h3 className="text-3xl md:text-4xl font-black text-[#102A63] mb-6 leading-tight">{t.aboutTitle1} <br/>{t.aboutTitle2}</h3>
              <p className="text-gray-600 mb-6 leading-relaxed text-lg">
                {t.aboutDesc}
              </p>
              
              <div className="space-y-4 mb-8">
                {[
                  t.aboutPoint1,
                  t.aboutPoint2,
                  t.aboutPoint3,
                  t.aboutPoint4
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                      <CheckCircle2 size={14} />
                    </div>
                    <span className="text-gray-700 font-medium">{item}</span>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-6 pt-6 border-t border-gray-200">
                <div>
                  <h4 className="text-4xl font-black text-primary mb-1">2M+</h4>
                  <p className="text-sm font-bold text-gray-500 uppercase">{t.aboutTrust}</p>
                </div>
                <div>
                  <h4 className="text-4xl font-black text-primary mb-1">98%</h4>
                  <p className="text-sm font-bold text-gray-500 uppercase">{t.aboutSatisfied}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h3 className="text-3xl md:text-4xl font-black text-[#102A63]">{t.servicesTitle}</h3>
            <p className="mt-4 text-gray-500">{t.servicesDesc}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { img: 'https://images.unsplash.com/photo-1576086213369-97a306d36557?w=500&q=80', name: t.service1Name, desc: t.service1Desc },
              { img: 'https://images.unsplash.com/photo-1551076805-e1869033e561?w=500&q=80', name: t.service2Name, desc: t.service2Desc },
              { img: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=500&q=80', name: t.service3Name, desc: t.service3Desc },
              { img: 'https://images.unsplash.com/photo-1531983412531-1f49a365ffed?w=500&q=80', name: t.service4Name, desc: t.service4Desc },
              { img: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=500&q=80', name: t.service5Name, desc: t.service5Desc },
              { img: 'https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=500&q=80', name: t.service6Name, desc: t.service6Desc },
              { img: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=500&q=80', name: t.service7Name, desc: t.service7Desc },
              { img: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=500&q=80', name: t.service8Name, desc: t.service8Desc },
              { img: 'https://images.unsplash.com/photo-1576086213369-97a306d36557?w=500&q=80', name: t.service9Name, desc: t.service9Desc }
            ].map((s, i) => (
              <div key={i} 
                onClick={() => navigate('/services')}
                className="bg-white rounded-[2rem] overflow-hidden border border-gray-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300 hover:-translate-y-1.5 group cursor-pointer flex flex-col"
              >
                <div className="h-48 overflow-hidden relative">
                  <div className="absolute inset-0 bg-primary/20 z-10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <img src={s.img} alt={s.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                </div>
                <div className="p-6 flex flex-col flex-grow text-left">
                  <h4 className="text-xl font-black text-[#102A63] mb-3 group-hover:text-primary transition-colors">{s.name}</h4>
                  <p className="text-gray-500 text-sm leading-relaxed mb-6">{s.desc}</p>
                  <div className="mt-auto flex items-center justify-between text-sm font-bold text-gray-400 group-hover:text-primary transition-colors border-t border-gray-50 pt-4">
                    <span>{t.learnMore}</span>
                    <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                      <ChevronRight size={14} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Doctors Section */}
      <section id="doctors" className="py-24 bg-gray-50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div className="max-w-2xl">
              <h2 className="text-sm font-bold text-[#102A63] uppercase tracking-widest mb-2">{t.doctorsSubtitle}</h2>
              <h3 className="text-3xl md:text-4xl font-black text-[#102A63]">{t.doctorsTitle}</h3>
              <p className="mt-4 text-gray-500">{t.doctorsDesc}</p>
            </div>
            <button 
              onClick={() => navigate('/doctors')}
              className="w-max px-6 py-3 bg-white border border-[#102A63] text-[#102A63] font-bold rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
            >
              {t.btnViewAllDocs}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {doctors.map((d, i) => {
              const name = d.userId?.fullName || 'Bác sĩ';
              const doctorImages = [
                'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=500&q=80',
                'https://images.unsplash.com/photo-1594824401831-2ff3282eb10e?w=500&q=80',
                'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=500&q=80',
                'https://images.unsplash.com/photo-1612276527156-05459f0f9db3?w=500&q=80',
                'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=500&q=80',
                'https://images.unsplash.com/photo-1618498082410-b4aa22193b38?w=500&q=80',
                'https://images.unsplash.com/photo-1582750433449-648ed127d09e?w=500&q=80',
                'https://images.unsplash.com/photo-1550831107-1553da8c8464?w=500&q=80',
                'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=500&q=80',
                'https://images.unsplash.com/photo-1638202993928-7267aad84c31?w=500&q=80',
                'https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=500&q=80',
                'https://images.unsplash.com/photo-1643297654416-05795d62e39c?w=500&q=80',
                'https://images.unsplash.com/photo-1624561172888-530b1eb1b4bb?w=500&q=80',
                'https://images.unsplash.com/photo-1623854767648-e72fa7462fa4?w=500&q=80',
                'https://images.unsplash.com/photo-1527613426441-4da17471b66d?w=500&q=80',
                'https://images.unsplash.com/photo-1605684954998-685c79d6a018?w=500&q=80',
                'https://images.unsplash.com/photo-1581056771107-24ca5f033842?w=500&q=80',
                'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=500&q=80',
                'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=500&q=80',
                'https://images.unsplash.com/photo-1582750433449-648ed127d09e?w=500&q=80'
              ];
              const avatar = d.avatar || doctorImages[i % doctorImages.length];

              return (
                <div key={i} className="bg-white rounded-[2rem] overflow-hidden shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border border-gray-100 hover:-translate-y-1 transition-all duration-300 group flex flex-col">
                  <div className="h-64 relative bg-gray-100 overflow-hidden">
                    <img 
                      src={avatar} 
                      alt={name} 
                      onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=102A63&color=fff&size=512`; }}
                      className="w-full h-full object-cover relative z-10 group-hover:scale-105 transition-transform duration-500" 
                    />
                  </div>
                  <div className="p-6 flex flex-col flex-grow">
                    <div className="text-[10px] font-black tracking-wider text-[#102A63] bg-blue-50 w-max px-3 py-1.5 rounded-full mb-4 uppercase">{getDeptTranslation(d.department)}</div>
                    <h4 className="text-lg font-black text-gray-900 mb-1">{name}</h4>
                    <p className="text-sm text-gray-500 font-medium mb-6">{t.experience}: {d.experience} {t.years}</p>
                    
                    <div className="mt-auto">
                      <button 
                        onClick={() => document.dispatchEvent(new CustomEvent('open-auth', { detail: 'login' }))}
                        className="w-full py-3 bg-gray-50 text-[#102A63] font-bold rounded-xl hover:bg-[#102A63] hover:text-white transition-colors"
                      >
                        {t.btnBookNow}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Work Process Section */}
      <section id="process" className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-sm font-bold text-primary uppercase tracking-widest mb-2">{t.processSubtitle}</h2>
            <h3 className="text-3xl md:text-4xl font-black text-[#102A63]">{t.processTitle}</h3>
            <p className="mt-4 text-gray-500">{t.processDesc}</p>
          </div>

          <div className="relative">
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-1 bg-blue-50 transform -translate-y-1/2"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">
              {[
                { step: '01', icon: Bot, title: t.step1Title, desc: t.step1Desc },
                { step: '02', icon: Calendar, title: t.step2Title, desc: t.step2Desc },
                { step: '03', icon: Stethoscope, title: t.step3Title, desc: t.step3Desc },
                { step: '04', icon: FolderHeart, title: t.step4Title, desc: t.step4Desc },
              ].map((p, i) => (
                <div key={i} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-primary transition-all group relative text-center">
                  <div className="absolute -top-4 -right-4 w-12 h-12 rounded-full bg-primary text-white font-black text-xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                    {p.step}
                  </div>
                  <div className="w-20 h-20 mx-auto rounded-full bg-blue-50 flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
                    <p.icon size={32} />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-3">{p.title}</h4>
                  <p className="text-gray-500 text-sm leading-relaxed">{p.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default LandingPage;
