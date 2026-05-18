const keywordRules = {
  'Khoa Nội tổng quát': {
    'Nội tim mạch': { 'đau ngực': 3, 'khó thở': 2, 'hồi hộp': 2, 'đánh trống ngực': 3, 'huyết áp': 3, 'nhịp tim': 3, 'tức ngực': 2 },
    'Nội thần kinh': { 'đau đầu': 1, 'đau nửa đầu': 3, 'chóng mặt': 1, 'tê bì': 2, 'co giật': 3, 'mất ngủ': 1, 'liệt': 3, 'nói đớ': 3, 'mất trí nhớ': 3, 'run tay chân': 3 },
    'Nội tiêu hóa': { 'đau bụng': 2, 'đau bao tử': 3, 'đau dạ dày': 3, 'buồn nôn': 1, 'ợ chua': 3, 'tiêu chảy': 3, 'táo bón': 2, 'khó tiêu': 2, 'đi ngoài ra máu': 3, 'nôn mửa': 2 },
    'Nội hô hấp': { 'ho': 2, 'ho có đờm': 3, 'khó thở': 2, 'khạc đờm': 3, 'thở khò khè': 3, 'ho ra máu': 3, 'hen suyễn': 3, 'tức ngực': 1 },
    'Nội tiết': { 'tiểu nhiều': 2, 'khát nước': 2, 'sụt cân': 1, 'bướu cổ': 3, 'đổ mồ hôi nhiều': 2, 'tiểu đường': 3, 'đường huyết': 3 }
  },
  'Khoa Ngoại tổng quát': {
    'Ngoại tiêu hóa': { 'viêm ruột thừa': 3, 'trĩ': 3, 'thoát vị': 3, 'đau ruột thừa': 3 },
    'Ngoại gan mật': { 'sỏi mật': 3, 'đau hạ sườn': 3, 'vàng da': 2, 'vàng mắt': 3, 'túi mật': 3 },
    'Ngoại thần kinh': { 'u não': 3, 'sọ não': 3, 'đau cột sống cổ': 2, 'thần kinh tọa': 3 },
    'Ngoại lồng ngực': { 'tràn dịch màng phổi': 3, 'u phổi': 3, 'phẫu thuật phổi': 3, 'chấn thương ngực': 3 }
  },
  'Khoa Nhi': {
    'Nhi sơ sinh': { 'trẻ sơ sinh': 3, 'vàng da trẻ': 3, 'quấy khóc đêm': 2, 'sinh non': 3, 'rốn trẻ': 3 },
    'Nhi hô hấp': { 'bé ho': 3, 'bé sốt': 3, 'bé sổ mũi': 3, 'trẻ khò khè': 3, 'bé viêm phổi': 3, 'viêm phế quản': 3 },
    'Nhi tiêu hóa': { 'bé biếng ăn': 3, 'trẻ nôn trớ': 3, 'bé tiêu chảy': 3, 'bé đau bụng': 2, 'bé táo bón': 3 },
    'Nhi tim mạch': { 'tim bẩm sinh': 3, 'môi bé tím': 3, 'trẻ thở nhanh': 2 }
  },
  'Khoa Sản': {
    'Sản thường': { 'mang thai': 3, 'khám thai': 3, 'siêu âm thai': 3, 'sinh thường': 3, 'chuyển dạ': 3, 'chậm kinh': 3, 'bầu': 3 },
    'Sản bệnh lý': { 'nghén': 3, 'động thai': 3, 'huyết áp thai kỳ': 3, 'tiểu đường thai kỳ': 3, 'thai nghén': 3 },
    'Hỗ trợ sinh sản': { 'hiếm muộn': 3, 'vô sinh': 3, 'canh trứng': 3, 'thụ tinh': 3, 'khó có con': 3 },
    'Chăm sóc sau sinh': { 'tắc tia sữa': 3, 'trầm cảm sau sinh': 3, 'vết mổ đẻ': 3, 'tầng sinh môn': 3 }
  },
  'Khoa Cấp cứu': {
    'Hồi sức cấp cứu': { 'bất tỉnh': 3, 'hôn mê': 3, 'nguy kịch': 3, 'ngộ độc thực phẩm': 3, 'co giật mạnh': 3, 'sặc dị vật': 3 },
    'Cấp cứu ngoại khoa': { 'vết thương hở': 3, 'chảy máu nhiều': 3, 'gãy xương hở': 3, 'tai nạn giao thông': 3 },
    'Cấp cứu nội khoa': { 'đột quỵ': 3, 'liệt nửa người': 3, 'méo miệng': 3, 'đau ngực cấp': 3 }
  },
  'Khoa Hồi sức tích cực (ICU)': {
    'Chống độc': { 'ngộ độc hóa chất': 3, 'rắn cắn': 3, 'ngộ độc rượu': 3, 'sốc phản vệ': 3 },
    'ICU nội': { 'suy hô hấp': 3, 'suy đa tạng': 3, 'sốc nhiễm khuẩn': 3 },
    'ICU ngoại': { 'hậu phẫu nặng': 3, 'hồi sức sau phẫu thuật': 3, 'đa chấn thương': 3 }
  },
  'Khoa Tim mạch': {
    'Can thiệp tim mạch': { 'hẹp mạch vành': 3, 'nhồi máu cơ tim': 3, 'đặt stent': 3, 'thắt ngực': 3 },
    'Điện tim': { 'loạn nhịp': 3, 'nhịp tim chậm': 3, 'ngoại tâm thu': 3, 'loạn nhịp tim': 3 },
    'Siêu âm tim': { 'hở van tim': 3, 'hẹp van tim': 3, 'suy tim': 3, 'tim to': 3 }
  },
  'Khoa Ung bướu': {
    'Ung thư nội khoa': { 'tầm soát ung thư': 3, 'u hạch': 3, 'nổi u cục': 3, 'ung thư vú': 3, 'ung thư phổi': 3 },
    'Hóa trị': { 'truyền hóa chất': 3, 'hóa trị': 3, 'rụng tóc': 2 },
    'Xạ trị': { 'chiếu xạ': 3, 'xạ trị': 3 },
    'Chăm sóc giảm nhẹ': { 'giảm đau ung thư': 3, 'giai đoạn cuối': 3 }
  },
  'Khoa Chấn thương chỉnh hình': {
    'Chỉnh hình': { 'gãy xương': 3, 'bong gân': 3, 'trật khớp': 3, 'dây chằng': 3, 'chấn thương thể thao': 3 },
    'Cột sống': { 'đau cột sống': 3, 'đau lưng': 2, 'thoát vị đĩa đệm': 3, 'vẹo cột sống': 3, 'đau vai gáy': 3 },
    'Thay khớp': { 'thoái hóa khớp': 3, 'thay khớp háng': 3, 'thay khớp gối': 3 },
    'Phục hồi chấn thương': { 'bó bột': 3, 'nẹp xương': 3, 'sau gãy xương': 3 }
  },
  'Khoa Tai Mũi Họng': {
    'Mũi xoang': { 'nghẹt mũi': 3, 'viêm mũi': 3, 'viêm xoang': 3, 'chảy nước mũi': 3, 'nhức vùng xoang': 3 },
    'Tai học': { 'ù tai': 3, 'đau tai': 3, 'chảy mủ tai': 3, 'nghe kém': 3, 'ngứa tai': 2 },
    'Thanh quản': { 'khàn tiếng': 3, 'mất giọng': 3, 'đau họng': 3, 'amidan': 3, 'viêm amidan': 3 }
  },
  'Khoa Răng Hàm Mặt': {
    'Nha tổng quát': { 'đau răng': 3, 'buốt răng': 3, 'chảy máu chân răng': 3, 'sưng lợi': 3, 'sâu răng': 3, 'hôi miệng': 2 },
    'Chỉnh nha': { 'răng khấp khểnh': 3, 'răng hô': 3, 'niềng răng': 3, 'khớp cắn': 3 },
    'Cấy ghép Implant': { 'mất răng': 3, 'răng giả': 3, 'trồng răng': 3 }
  },
  'Khoa Da liễu': {
    'Dị ứng da': { 'ngứa da': 3, 'mề đay': 3, 'dị ứng': 3, 'viêm da': 3, 'chàm': 3 },
    'Điều trị da': { 'mụn trứng cá': 3, 'nấm da': 3, 'vảy nến': 3, 'zona': 3, 'ghẻ': 3, 'sẹo': 2 },
    'Laser thẩm mỹ': { 'nám': 3, 'xóa xăm': 3, 'trẻ hóa da': 3 }
  },
  'Khoa Mắt': {
    'Khúc xạ': { 'cận thị': 3, 'viễn thị': 3, 'loạn thị': 3, 'mỏi mắt': 3, 'nhức mắt': 2 },
    'Phẫu thuật mắt': { 'đục thủy tinh thể': 3, 'phaco': 3, 'lasik': 3, 'mộng thịt': 3 },
    'Glaucoma': { 'cườm nước': 3, 'tăng nhãn áp': 3, 'đỏ mắt dữ dội': 3 }
  },
  'Khoa Xét nghiệm': {
    'Huyết học': { 'thử máu': 3, 'xét nghiệm máu': 3, 'thiếu máu': 3 },
    'Sinh hóa': { 'mỡ máu': 3, 'cholesterol': 3, 'chức năng gan': 3 },
    'Vi sinh': { 'vi khuẩn HP': 3, 'cấy máu': 3, 'xét nghiệm ký sinh trùng': 3 }
  },
  'Khoa Chẩn đoán hình ảnh': {
    'Siêu âm': { 'siêu âm bụng': 3, 'siêu âm tuyến giáp': 3, 'siêu âm tổng quát': 3 },
    'X-quang': { 'chụp x-quang': 3, 'chụp phổi': 3 },
    'MRI': { 'cộng hưởng từ': 3, 'chụp mri': 3 },
    'CT Scan': { 'cắt lớp sọ não': 3, 'chụp ct': 3 }
  }
};

exports.predictSpecialty = (req, res) => {
  try {
    const { symptoms } = req.body;
    
    if (!symptoms || symptoms.trim() === '') {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập triệu chứng của bạn.' });
    }

    const text = symptoms.toLowerCase();
    
    // Check specific combo rules for common diseases first
    if (text.includes('đau đầu') && (text.includes('sốt') || text.includes('ho') || text.includes('sổ mũi'))) {
      return res.status(200).json({
        success: true,
        data: {
          confidence: 'high',
          department: 'Khoa Tai Mũi Họng',
          specialty: 'Mũi xoang',
          message: 'Tình trạng đau đầu đi kèm với sốt, ho hoặc sổ mũi là dấu hiệu điển hình của viêm xoang hoặc viêm đường hô hấp. Chúng tôi đề xuất bạn khám chuyên khoa Mũi xoang thuộc Khoa Tai Mũi Họng.',
          matchedKeywords: ['đau đầu', 'sốt', 'ho', 'sổ mũi'].filter(kw => text.includes(kw))
        }
      });
    }

    if (text.includes('sốt') && text.includes('phát ban')) {
      return res.status(200).json({
        success: true,
        data: {
          confidence: 'high',
          department: 'Khoa Da liễu',
          specialty: 'Dị ứng da',
          message: 'Triệu chứng sốt kết hợp với phát ban đỏ ngoài da cần được thăm khám sớm tại chuyên khoa Dị ứng da thuộc Khoa Da liễu để loại trừ viêm da dị ứng cấp hoặc các tình trạng nhiễm trùng.',
          matchedKeywords: ['sốt', 'phát ban'].filter(kw => text.includes(kw))
        }
      });
    }

    // Weighted Scoring system
    const results = [];

    for (const [department, specialties] of Object.entries(keywordRules)) {
      for (const [specialty, keywords] of Object.entries(specialties)) {
        let score = 0;
        const matchedKeywords = [];
        
        for (const [keyword, weight] of Object.entries(keywords)) {
          if (text.includes(keyword)) {
            score += weight;
            matchedKeywords.push(keyword);
          }
        }
        
        if (score > 0) {
          results.push({ department, specialty, score, matchedKeywords });
        }
      }
    }

    // Sort by score descending
    results.sort((a, b) => b.score - a.score);

    // If no strong match found
    if (results.length === 0 || results[0].score < 2) {
      return res.status(200).json({
        success: true,
        data: {
          confidence: 'low',
          department: 'Khoa Nội tổng quát',
          specialty: 'Nội tổng quát',
          message: 'Dựa trên mô tả của bạn, hệ thống chưa thể xác định rõ chuyên khoa đặc thù. Chúng tôi đề xuất bạn nên khám ban đầu tại chuyên khoa Nội tổng quát để bác sĩ đánh giá toàn diện.',
          matchedKeywords: results.length > 0 ? results[0].matchedKeywords : []
        }
      });
    }

    const bestMatch = results[0];

    // Response match
    return res.status(200).json({
      success: true,
      data: {
        confidence: bestMatch.score >= 4 ? 'high' : 'medium',
        department: bestMatch.department,
        specialty: bestMatch.specialty,
        message: `Dựa trên phân tích triệu chứng (${bestMatch.matchedKeywords.join(', ')}), AI nhận thấy sức khỏe của bạn đang có các biểu hiện thuộc chuyên khoa ${bestMatch.specialty}. Chúng tôi khuyên bạn nên đăng ký khám tại ${bestMatch.department}.`,
        matchedKeywords: bestMatch.matchedKeywords
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
