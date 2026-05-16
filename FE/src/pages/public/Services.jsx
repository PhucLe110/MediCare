import React from 'react';
import { ChevronRight } from 'lucide-react';

export default function Services() {
  const services = [
    { img: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=500&q=80', name: 'Tim Mạch', desc: 'Chẩn đoán và điều trị bệnh lý tim mạch bằng hệ thống siêu âm Doppler 4D và Holter điện tâm đồ thế hệ mới.' },
    { img: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=500&q=80', name: 'Thần Kinh', desc: 'Tầm soát rối loạn tiền đình, đau nửa đầu và các hội chứng thần kinh trung ương.' },
    { img: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=500&q=80', name: 'Cơ Xương Khớp', desc: 'Phục hồi chức năng, điều trị thoái hóa khớp và phẫu thuật chỉnh hình ít xâm lấn.' },
    { img: 'https://images.unsplash.com/photo-1576086213369-97a306d36557?w=500&q=80', name: 'Nhãn Khoa', desc: 'Đo khúc xạ kỹ thuật số, phẫu thuật Phaco và điều trị đục thủy tinh thể.' },
    { img: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=500&q=80', name: 'Nội Tổng Quát', desc: 'Khám sức khỏe tổng quát định kỳ, tầm soát sớm nguy cơ mắc các bệnh lý mãn tính.' },
    { img: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=500&q=80', name: 'Nhi Khoa', desc: 'Chăm sóc sức khỏe toàn diện cho trẻ em, tư vấn dinh dưỡng và tiêm chủng.' },
    { img: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=500&q=80', name: 'Da Liễu', desc: 'Điều trị mụn, chàm, vảy nến và các dịch vụ thẩm mỹ da liễu chuyên sâu.' },
    { img: 'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?w=500&q=80', name: 'Tiêu Hóa', desc: 'Nội soi dạ dày, đại tràng không đau. Điều trị viêm loét và tầm soát ung thư.' },
  ];

  return (
    <div className="bg-gray-50 min-h-screen pt-24 pb-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-sm font-black text-primary uppercase tracking-[0.2em] mb-4">Các chuyên khoa</h2>
          <h3 className="text-4xl lg:text-5xl font-black text-[#102A63] mb-6 leading-[1.1]">Dịch vụ y tế <br/>Chất lượng chuyên sâu</h3>
          <p className="text-gray-500 text-lg font-medium leading-relaxed">
            Hệ thống chuyên khoa đa dạng, trang bị máy móc nhập khẩu nguyên chiếc từ Châu Âu, 
            cùng phác đồ điều trị chuẩn quốc tế.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {services.map((s, i) => (
            <div key={i} className="bg-white rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-xl shadow-gray-200/40 hover:-translate-y-2 transition-all duration-500 cursor-pointer flex flex-col group">
              <div className="h-64 overflow-hidden relative">
                <div className="absolute inset-0 bg-[#102A63]/10 z-10 group-hover:bg-[#102A63]/0 transition-colors duration-500"></div>
                <img src={s.img} alt={s.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              </div>
              
              <div className="p-10 flex flex-col flex-grow">
                <h4 className="text-3xl font-black text-gray-900 mb-4">{s.name}</h4>
                <p className="text-gray-500 font-medium leading-relaxed mb-10 flex-grow">{s.desc}</p>
                
                <div 
                  className="mt-auto flex items-center justify-between border-t border-gray-100 pt-6"
                  onClick={() => document.dispatchEvent(new CustomEvent('open-auth', { detail: 'login' }))}
                >
                  <span className="text-sm font-bold text-gray-400 group-hover:text-primary transition-colors uppercase tracking-wider">
                    Khám phá chuyên khoa
                  </span>
                  <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-primary group-hover:text-white transition-all">
                    <ChevronRight size={20} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
