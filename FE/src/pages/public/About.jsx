import React from 'react';
import { Award, CheckCircle2 } from 'lucide-react';

export default function About() {
  return (
    <div className="bg-white min-h-screen py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-24">
          <div className="relative">
            <div className="absolute -inset-4 bg-primary/5 rounded-[3rem] transform -rotate-3 z-0"></div>
            <img src="https://i.pinimg.com/1200x/d4/5b/29/d45b297559f95af7511287bebbf3b4fe.jpg" alt="About MediCare" className="rounded-[2rem] shadow-xl relative z-10 w-full object-cover h-[500px]" />
          </div>

          <div>
            <h2 className="text-sm font-black text-primary uppercase tracking-[0.2em] mb-4">Câu chuyện của chúng tôi</h2>
            <h3 className="text-4xl lg:text-5xl font-black text-[#102A63] mb-8 leading-[1.1]">Sứ mệnh mang y tế <br/>tiến gần hơn tới bạn</h3>
            <p className="text-gray-500 mb-6 leading-relaxed text-lg font-medium">
              Được thành lập từ năm 2010, MediCare khởi nguồn từ một khát vọng đơn giản: 
              Làm thế nào để người bệnh không còn phải mệt mỏi chờ đợi hàng giờ đồng hồ chỉ để được gặp bác sĩ?
            </p>
            <p className="text-gray-500 mb-10 leading-relaxed text-lg font-medium">
              Trải qua hơn một thập kỷ, chúng tôi đã chuyển mình trở thành hệ thống y tế công nghệ tiên phong, 
              ứng dụng Trí tuệ Nhân tạo (AI) vào toàn bộ quy trình chăm sóc sức khỏe.
            </p>

            <div className="grid grid-cols-2 gap-8 pt-8 border-t border-gray-100">
              <div>
                <h4 className="text-5xl font-black text-[#102A63] mb-2">15+</h4>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Năm cống hiến</p>
              </div>
              <div>
                <h4 className="text-5xl font-black text-[#102A63] mb-2">2M+</h4>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Lượt tin tưởng</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-[3rem] p-12 lg:p-20 mb-24">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h3 className="text-3xl font-black text-[#102A63] mb-4">Giá trị cốt lõi</h3>
            <p className="text-gray-500 font-medium">Mọi hoạt động của MediCare đều xoay quanh 4 giá trị nền tảng, đảm bảo mang lại trải nghiệm tốt nhất cho người bệnh.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              { t: 'Tận tâm', d: 'Lấy bệnh nhân làm trung tâm, chăm sóc như người nhà.' },
              { t: 'Chính xác', d: 'Chẩn đoán dựa trên dữ liệu khoa học và sự hỗ trợ từ AI.' },
              { t: 'Bảo mật', d: 'Tôn trọng tuyệt đối quyền riêng tư và dữ liệu y tế cá nhân.' },
              { t: 'Đổi mới', d: 'Không ngừng cập nhật công nghệ để tối ưu hóa quy trình.' }
            ].map((v, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="mt-1 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <CheckCircle2 size={16} />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-gray-900 mb-2">{v.t}</h4>
                  <p className="text-gray-500 leading-relaxed">{v.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Vision & Mission */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="order-2 lg:order-1">
            <h2 className="text-sm font-black text-primary uppercase tracking-[0.2em] mb-4">Tầm nhìn chiến lược</h2>
            <h3 className="text-4xl font-black text-[#102A63] mb-6 leading-tight">Y tế thông minh, <br/>Phủ sóng toàn cầu</h3>
            <p className="text-gray-500 mb-6 leading-relaxed text-lg font-medium">
              Đến năm 2030, MediCare hướng tới mục tiêu trở thành mạng lưới y tế số hóa hàng đầu Đông Nam Á, nơi mọi người dân đều có thể tiếp cận với dịch vụ y tế chuẩn quốc tế chỉ bằng một cú chạm trên điện thoại.
            </p>
            <ul className="space-y-4 text-gray-600 font-medium">
              <li className="flex items-center gap-3"><span className="w-2 h-2 rounded-full bg-primary"></span> 100% hồ sơ bệnh án được số hóa.</li>
              <li className="flex items-center gap-3"><span className="w-2 h-2 rounded-full bg-primary"></span> Rút ngắn 50% thời gian chờ đợi.</li>
              <li className="flex items-center gap-3"><span className="w-2 h-2 rounded-full bg-primary"></span> Đưa AI vào hỗ trợ phân tích cận lâm sàng.</li>
            </ul>
          </div>
          <div className="order-1 lg:order-2 relative">
            <img src="https://atpro.com.vn/wp-content/uploads/2025/12/y-te-thong-minh-la-gi-3.jpg" alt="Vision" className="rounded-[3rem] shadow-2xl w-full object-cover h-[400px]" />
            <div className="absolute top-1/2 -left-10 transform -translate-y-1/2 bg-white p-6 rounded-3xl shadow-xl z-20 w-64 border border-gray-100 hidden md:block">
              <p className="font-bold text-gray-900 mb-2">Cam kết của chúng tôi</p>
              <p className="text-sm text-gray-500 leading-relaxed">Chúng tôi không chỉ chữa bệnh, chúng tôi chăm sóc cả chất lượng cuộc sống của bạn.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
