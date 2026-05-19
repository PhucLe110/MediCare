import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Heart, Calendar } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';

const trans = {
  vi: {
    badge: 'Hệ thống 15 khoa chuyên sâu',
    title: 'Dịch Vụ Y Tế \nĐẳng Cấp Quốc Tế',
    desc: 'Hệ thống chuyên khoa toàn diện, quy tụ đội ngũ chuyên gia đầu ngành cùng cơ sở vật chất trang thiết bị hiện đại nhập khẩu nguyên chiếc từ Châu Âu.',
    subSpecialties: 'Chuyên khoa chuyên sâu',
    btnBook: 'Đặt lịch khám ngay',
    services: [
      {
        img: 'https://images.unsplash.com/photo-1576086213369-97a306d36557?w=600&q=80',
        name: 'Khoa Nội tổng quát',
        desc: 'Điều trị nội khoa toàn diện các bệnh lý về tim mạch, tiêu hóa, hô hấp, nội tiết và thần kinh trung ương.',
        specialties: ['Nội tim mạch', 'Nội hô hấp', 'Nội tiêu hóa', 'Nội tiết', 'Nội thần kinh']
      },
      {
        img: 'https://images.unsplash.com/photo-1551076805-e1869033e561?w=600&q=80',
        name: 'Khoa Ngoại tổng quát',
        desc: 'Phẫu thuật điều trị kỹ thuật cao, can thiệp ít xâm lấn nâng cao tính an toàn và đẩy nhanh thời gian hồi phục.',
        specialties: ['Ngoại tiêu hóa', 'Ngoại gan mật', 'Ngoại thần kinh', 'Ngoại lồng ngực']
      },
      {
        img: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=600&q=80',
        name: 'Khoa Nhi',
        desc: 'Chăm sóc sức khỏe y khoa toàn diện cho trẻ sơ sinh và trẻ nhỏ, tư vấn dinh dưỡng và tiêm chủng phòng bệnh.',
        specialties: ['Nhi sơ sinh', 'Nhi hô hấp', 'Nhi tiêu hóa', 'Nhi tim mạch']
      },
      {
        img: 'https://images.unsplash.com/photo-1531983412531-1f49a365ffed?w=600&q=80',
        name: 'Khoa Sản',
        desc: 'Dịch vụ thai sản trọn gói cao cấp, theo dõi thai kỳ toàn diện, hỗ trợ sinh sản và chăm sóc mẹ bé sau sinh.',
        specialties: ['Sản thường', 'Sản bệnh lý', 'Hỗ trợ sinh sản', 'Chăm sóc sau sinh']
      },
      {
        img: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=600&q=80',
        name: 'Khoa Cấp cứu',
        desc: 'Hệ thống tiếp nhận, phân loại cấp cứu và xử lý khẩn cấp các ca tai nạn hiểm nghèo hoạt động 24/7.',
        specialties: ['Cấp cứu nội khoa', 'Cấp cứu ngoại khoa', 'Hồi sức cấp cứu']
      },
      {
        img: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=600&q=80',
        name: 'Khoa Hồi sức tích cực (ICU)',
        desc: 'Theo dõi liên tục và can thiệp hồi sức nâng cao cho các bệnh nhân suy đa tạng nguy kịch và chống độc.',
        specialties: ['ICU nội', 'ICU ngoại', 'Chống độc']
      },
      {
        img: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=600&q=80',
        name: 'Khoa Tim mạch',
        desc: 'Chẩn đoán và can thiệp chuyên sâu các bệnh lý tim bẩm sinh, mạch vành, siêu âm tim và điện tâm đồ.',
        specialties: ['Can thiệp tim mạch', 'Điện tim', 'Siêu âm tim']
      },
      {
        img: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600&q=80',
        name: 'Khoa Ung bướu',
        desc: 'Tầm soát ung thư sớm, thiết lập phác đồ đa mô thức cá thể hóa gồm hóa trị, xạ trị và điều trị giảm nhẹ.',
        specialties: ['Hóa trị', 'Xạ trị', 'Ung thư nội khoa', 'Chăm sóc giảm nhẹ']
      },
      {
        img: 'https://images.unsplash.com/photo-1612538498456-e861df91d4d0?w=600&q=80',
        name: 'Khoa Chấn thương chỉnh hình',
        desc: 'Phẫu thuật thay khớp, chỉnh hình cột sống, can thiệp chấn thương thể thao và vật lý trị liệu phục hồi.',
        specialties: ['Chỉnh hình', 'Cột sống', 'Thay khớp', 'Phục hồi chấn thương']
      },
      {
        img: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=600&q=80',
        name: 'Khoa Tai Mũi Họng',
        desc: 'Điều trị nội, ngoại khoa toàn diện các bệnh lý tai học, mũi xoang và dây thanh quản nâng cao.',
        specialties: ['Tai học', 'Mũi xoang', 'Thanh quan']
      },
      {
        img: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=600&q=80',
        name: 'Khoa Răng Hàm Mặt',
        desc: 'Dịch vụ nha khoa thẩm mỹ cao cấp, chỉnh nha kỹ thuật số và cấy ghép Implant không đau thế hệ mới.',
        specialties: ['Nha tổng quát', 'Chỉnh nha', 'Cấy ghép Implant']
      },
      {
        img: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=600&q=80',
        name: 'Khoa Da liễu',
        desc: 'Khám chữa các bệnh lý ngoài da chuyên sâu, dị ứng da và thẩm mỹ công nghệ cao bằng sóng laser.',
        specialties: ['Điều trị da', 'Laser thẩm mỹ', 'Dị ứng da']
      },
      {
        img: 'https://images.unsplash.com/photo-1576086213369-97a306d36557?w=600&q=80',
        name: 'Khoa Mắt',
        desc: 'Đo khúc xạ, khám điều trị tăng nhãn áp Glaucoma và phẫu thuật đục thủy tinh thể bằng công nghệ Phaco.',
        specialties: ['Khúc xạ', 'Phẫu thuật mắt', 'Glaucoma']
      },
      {
        img: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&q=80',
        name: 'Khoa Xét nghiệm',
        desc: 'Hệ thống xét nghiệm robot hóa tự động thực hiện huyết học, sinh hóa lâm sàng và vi sinh vật siêu tốc.',
        specialties: ['Huyết học', 'Sinh hóa', 'Vi sinh']
      },
      {
        img: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=600&q=80',
        name: 'Khoa Chẩn đoán hình ảnh',
        desc: 'Hệ thống chụp cộng hưởng từ MRI 3.0T, cắt lớp vi tính CT 512 dãy và siêu âm 5D hàng đầu thế giới.',
        specialties: ['X-quang', 'CT Scan', 'MRI', 'Siêu âm']
      }
    ]
  },
  en: {
    badge: '15 Specialized Clinical Units',
    title: 'World-Class \nHealthcare Services',
    desc: 'Fully integrated specialized clinical ecosystem pooling top-tier physicians, advanced procedures, and stellar medical technology directly imported from Europe.',
    subSpecialties: 'Clinical Subspecialties',
    btnBook: 'Book Appointment Now',
    services: [
      {
        img: 'https://images.unsplash.com/photo-1576086213369-97a306d36557?w=600&q=80',
        name: 'General Internal Medicine',
        desc: 'Comprehensive medical assessment and therapeutic care for cardiovascular, digestive, respiratory, endocrine, and neurological conditions.',
        specialties: ['Cardiology', 'Pulmonology', 'Gastroenterology', 'Endocrinology', 'Neurology']
      },
      {
        img: 'https://images.unsplash.com/photo-1551076805-e1869033e561?w=600&q=80',
        name: 'General Surgery',
        desc: 'High-precision surgical interventions leveraging advanced minimally-invasive techniques for superior safety and accelerated rehabilitation.',
        specialties: ['Gastrointestinal Surgery', 'Hepatobiliary Surgery', 'Neurosurgery', 'Thoracic Surgery']
      },
      {
        img: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=600&q=80',
        name: 'Pediatrics Department',
        desc: 'Full-spectrum pediatric care for infants and children, featuring personalized nutrition guides and complete immunizations.',
        specialties: ['Neonatology', 'Pediatric Pulmonology', 'Pediatric Gastroenterology', 'Pediatric Cardiology']
      },
      {
        img: 'https://images.unsplash.com/photo-1531983412531-1f49a365ffed?w=600&q=80',
        name: 'Obstetrics & Gynecology',
        desc: 'Premium maternity plans, comprehensive gestational mapping, reproductive endocrinology support, and postpartum recovery pathways.',
        specialties: ['Normal Delivery', 'High-Risk Pregnancy', 'Infertility Support', 'Postnatal Care']
      },
      {
        img: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=600&q=80',
        name: 'Emergency & Trauma Care',
        desc: 'Highly optimized trauma center equipped for instant triage and emergency resuscitation operational 24/7.',
        specialties: ['Medical Emergency', 'Surgical Emergency', 'Critical Resuscitation']
      },
      {
        img: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=600&q=80',
        name: 'Intensive Care Unit (ICU)',
        desc: 'Continuous multi-parameter clinical monitoring and advanced life-support interventions for critically ill or toxicological patients.',
        specialties: ['Medical ICU', 'Surgical ICU', 'Toxicology Unit']
      },
      {
        img: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=600&q=80',
        name: 'Cardiology Care',
        desc: 'Specialized diagnostic mapping and therapeutic procedures for coronary diseases, congenital abnormalities, and echo-cardiography.',
        specialties: ['Interventional Cardiology', 'ECG Mapping', 'Echocardiography']
      },
      {
        img: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600&q=80',
        name: 'Oncology Center',
        desc: 'Multi-modal diagnostic cancer screening and patient-centric therapies combining chemotherapy, radiotherapy, and palliative pathways.',
        specialties: ['Chemotherapy', 'Radiotherapy', 'Medical Oncology', 'Palliative Care']
      },
      {
        img: 'https://images.unsplash.com/photo-1612538498456-e861df91d4d0?w=600&q=80',
        name: 'Orthopedics & Joint Care',
        desc: 'Stellar joint arthroplasty, spinal deformity corrections, sports trauma interventions, and dedicated physical therapy.',
        specialties: ['Orthopedic Surgery', 'Spinal Interventions', 'Joint Arthroplasty', 'Trauma Rehabilitation']
      },
      {
        img: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=600&q=80',
        name: 'Otolaryngology (ENT)',
        desc: 'Specialized medical and surgical management of clinical disorders affecting the ears, nose, sinuses, and larynx.',
        specialties: ['Otology', 'Rhinology & Sinus', 'Laryngology']
      },
      {
        img: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=600&q=80',
        name: 'Odonto-Stomatology (Dental)',
        desc: 'State-of-the-art cosmetic dentistry, digital orthodontics, and painless premium dental implant surgery.',
        specialties: ['General Dentistry', 'Orthodontics', 'Dental Implants']
      },
      {
        img: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=600&q=80',
        name: 'Dermatology & Cosmetology',
        desc: 'Advanced therapeutics for acute and chronic skin conditions, immune allergies, and premium laser cosmetic therapies.',
        specialties: ['Clinical Dermatology', 'Aesthetic Laser', 'Allergy Unit']
      },
      {
        img: 'https://images.unsplash.com/photo-1576086213369-97a306d36557?w=600&q=80',
        name: 'Ophthalmology Department',
        desc: 'Refractive correction diagnostics, glaucoma monitoring, and next-generation Phaco cataract replacement surgery.',
        specialties: ['Refraction Clinic', 'Ophthalmic Surgery', 'Glaucoma Clinic']
      },
      {
        img: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&q=80',
        name: 'Medical Laboratories',
        desc: 'Highly automated robotic laboratory indexing hematological panels, clinical chemistry, and microbiology profiles.',
        specialties: ['Hematology', 'Clinical Chemistry', 'Microbiology']
      },
      {
        img: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=600&q=80',
        name: 'Diagnostic Imaging Unit',
        desc: 'Premium high-resolution clinical imaging powered by 3.0T MRI, 512-slice CT scanners, and 5D ultrasound systems.',
        specialties: ['X-ray Imaging', 'CT Scan Mapping', '3.0T MRI', '5D Ultrasound']
      }
    ]
  }
};

export default function Services() {
  const { t } = useTranslation(trans);
  const navigate = useNavigate();

  const getSvgFallback = (name) => {
    return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="100%" height="100%" fill="%23f8fafc"/><circle cx="300" cy="180" r="60" fill="%23102a63" opacity="0.05"/><path d="M280 180h40M300 160v40" stroke="%233b82f6" stroke-width="8" stroke-linecap="round"/><text x="50%" y="300" dominant-baseline="middle" text-anchor="middle" font-family="system-ui,sans-serif" font-weight="900" font-size="24" fill="%23102a63">${name}</text></svg>`;
  };

  const handleAction = (deptName) => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      navigate('/dashboard/booking', { state: { prefilledDepartment: deptName } });
    } else {
      document.dispatchEvent(new CustomEvent('open-auth', { detail: 'login' }));
    }
  };

  return (
    <div className="bg-slate-50/50 min-h-screen pt-24 pb-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 mb-4 shadow-sm animate-fade-in">
            <Heart size={14} className="fill-indigo-600 animate-pulse" />
            <span className="text-[11px] font-black uppercase tracking-wider">{t.badge}</span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-black text-[#102A63] mb-6 leading-[1.1] tracking-tight whitespace-pre-line">
            {t.title}
          </h2>
          <p className="text-gray-500 text-lg font-medium leading-relaxed">
            {t.desc}
          </p>
        </div>

        {/* 15 Departments Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {t.services.map((s, i) => (
            <div key={i} className="bg-white rounded-[2.5rem] overflow-hidden border border-gray-100/80 shadow-xl shadow-slate-200/30 hover:-translate-y-2 hover:shadow-2xl hover:shadow-indigo-900/5 transition-all duration-500 cursor-pointer flex flex-col group relative">
              
              {/* Image Banner */}
              <div className="h-60 overflow-hidden relative">
                <div className="absolute inset-0 bg-[#102A63]/15 z-10 group-hover:bg-[#102A63]/5 transition-colors duration-500"></div>
                <img 
                  src={s.img} 
                  alt={s.name} 
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = getSvgFallback(s.name);
                  }}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                />
              </div>
              
              {/* Content Body */}
              <div className="p-8 flex flex-col flex-grow">
                <h4 className="text-2xl font-black text-slate-800 mb-3 group-hover:text-primary transition-colors tracking-tight">
                  {s.name}
                </h4>
                <p className="text-gray-500 font-medium leading-relaxed text-sm mb-6 flex-grow">
                  {s.desc}
                </p>

                {/* Sub-specialties Badges */}
                <div className="mb-8">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">{t.subSpecialties}</p>
                  <div className="flex flex-wrap gap-2">
                    {s.specialties.map((spec, specIdx) => (
                      <span key={specIdx} className="px-2.5 py-1 bg-slate-50 border border-slate-100 rounded-lg text-xs font-bold text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
                
                {/* Book Action Button */}
                <button
                  onClick={() => handleAction(s.name)}
                  className="mt-auto flex items-center justify-between border-t border-slate-50 pt-5 w-full text-left"
                >
                  <span className="text-xs font-black text-gray-400 group-hover:text-primary transition-colors uppercase tracking-[0.12em] flex items-center gap-2">
                    <Calendar size={14} /> {t.btnBook}
                  </span>
                  <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white transition-all group-hover:translate-x-1 shadow-sm">
                    <ChevronRight size={18} />
                  </div>
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
