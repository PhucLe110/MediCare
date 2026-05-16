const keywordRules = {
  'Khoa Nội': {
    'Nội tim mạch': { 'đau ngực': 3, 'khó thở': 2, 'hồi hộp': 2, 'đánh trống ngực': 3, 'huyết áp': 3, 'nhịp tim': 3, 'tức ngực': 2 },
    'Nội thần kinh': { 'đau đầu': 1, 'đau nửa đầu': 3, 'chóng mặt': 1, 'tê bì': 2, 'co giật': 3, 'mất ngủ': 1, 'liệt': 3, 'nói đớ': 3, 'mất trí nhớ': 3, 'run tay chân': 3 },
    'Nội tiêu hóa': { 'đau bụng': 2, 'đau bao tử': 3, 'đau dạ dày': 3, 'buồn nôn': 1, 'ợ chua': 3, 'tiêu chảy': 3, 'táo bón': 2, 'khó tiêu': 2, 'đi ngoài ra máu': 3, 'nôn mửa': 2 },
    'Nội hô hấp': { 'ho': 2, 'ho có đờm': 3, 'khó thở': 2, 'khạc đờm': 3, 'thở khò khè': 3, 'ho ra máu': 3, 'hen suyễn': 3, 'tức ngực': 1 },
    'Nội tiết': { 'tiểu nhiều': 2, 'khát nước': 2, 'sụt cân': 1, 'bướu cổ': 3, 'đổ mồ hôi nhiều': 2, 'tiểu đường': 3, 'đường huyết': 3 },
    'Nội cơ xương khớp': { 'đau lưng': 2, 'đau nhức': 1, 'sưng khớp': 3, 'cứng khớp': 3, 'thoái hóa': 3, 'gai cột sống': 3, 'mỏi vai gáy': 3, 'tê tay chân': 2 },
    'Nội tổng quát': { 'mệt mỏi': 1, 'suy nhược': 2, 'chán ăn': 1, 'sụt cân': 1, 'đau ê ẩm': 1 }
  },
  'Khoa Ngoại': {
    'Chấn thương chỉnh hình': { 'gãy xương': 3, 'trật khớp': 3, 'bong gân': 3, 'chấn thương': 3, 'tai nạn': 3, 'sưng phù': 2 },
    'Ngoại tổng quát': { 'viêm ruột thừa': 3, 'trĩ': 3, 'thoát vị': 3, 'sưng tấy': 2, 'vết thương hở': 3 },
    'Ngoại tiết niệu': { 'sỏi thận': 3, 'tiểu buốt': 3, 'tiểu rắt': 3, 'tiểu ra máu': 3, 'đau vùng thắt lưng': 2 }
  },
  'Khoa Sản': {
    'Sản khoa': { 'mang thai': 3, 'khám thai': 3, 'siêu âm thai': 3, 'nghén': 3, 'thai kỳ': 3, 'chậm kinh': 3 },
    'Phụ khoa': { 'kinh nguyệt': 3, 'đau bụng dưới': 2, 'tiết dịch': 3, 'ngứa vùng kín': 3, 'khí hư': 3, 'viêm nhiễm phụ khoa': 3 }
  },
  'Khoa Nhi': {
    'Nhi sơ sinh': { 'trẻ sơ sinh': 3, 'vàng da trẻ': 3, 'quấy khóc đêm': 2 },
    'Nhi tổng quát': { 'bé ho': 3, 'bé sốt': 3, 'bé sổ mũi': 3, 'trẻ khò khè': 3, 'bé biếng ăn': 3, 'trẻ nôn trớ': 3, 'bé tiêu chảy': 3 }
  },
  'Khoa Chuyên Khoa': {
    'Tai mũi họng': { 'đau họng': 3, 'sổ mũi': 3, 'nghẹt mũi': 3, 'ù tai': 3, 'chảy máu cam': 3, 'khan tiếng': 3, 'viêm xoang': 3, 'amidan': 3, 'ho': 1, 'sốt': 1 },
    'Răng hàm mặt': { 'đau răng': 3, 'nhức răng': 3, 'chảy máu chân răng': 3, 'sưng nướu': 3, 'hôi miệng': 3, 'nhổ răng': 3 },
    'Nhãn khoa (Mắt)': { 'mờ mắt': 3, 'đau mắt': 3, 'đỏ mắt': 3, 'chảy nước mắt': 3, 'cộm': 3, 'nhức mắt': 3, 'cận thị': 3 },
    'Da liễu': { 'ngứa': 2, 'nổi mẩn': 3, 'phát ban': 3, 'mụn': 3, 'nấm': 3, 'rụng tóc': 3, 'vảy nến': 3, 'mề đay': 3 }
  },
  'Khoa Tâm thần': {
    'Tâm thần học': { 'trầm cảm': 3, 'lo âu': 3, 'căng thẳng': 2, 'ảo giác': 3, 'stress': 3, 'rối loạn cảm xúc': 3, 'sợ hãi vô cớ': 3, 'mất ngủ': 1 }
  },
  'Khoa Truyền nhiễm': {
    'Bệnh nhiệt đới': { 'sốt': 2, 'sốt cao': 3, 'sốt rét': 3, 'sốt xuất huyết': 3, 'viêm gan': 3, 'vàng da': 3, 'sốt kéo dài': 3, 'phát ban đỏ': 3, 'đau mỏi cơ': 2 }
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
          department: 'Khoa Chuyên Khoa',
          specialty: 'Tai mũi họng',
          message: 'Tình trạng đau đầu đi kèm với sốt hoặc ho/sổ mũi thường là dấu hiệu của viêm đường hô hấp trên, cảm cúm hoặc viêm xoang. Chúng tôi đề nghị bạn khám chuyên khoa Tai mũi họng.',
          matchedKeywords: ['đau đầu', 'sốt', 'ho', 'sổ mũi'].filter(kw => text.includes(kw))
        }
      });
    }

    if (text.includes('sốt') && text.includes('phát ban')) {
      return res.status(200).json({
        success: true,
        data: {
          confidence: 'high',
          department: 'Khoa Truyền nhiễm',
          specialty: 'Bệnh nhiệt đới',
          message: 'Sốt kết hợp với phát ban là dấu hiệu điển hình của các bệnh truyền nhiễm như sốt xuất huyết, sởi hoặc Rubella. Cần được thăm khám tại khoa Bệnh nhiệt đới ngay.',
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
          department: 'Khoa Nội',
          specialty: 'Nội tổng quát',
          message: 'Dựa trên mô tả của bạn, hệ thống chưa thể xác định rõ chuyên khoa đặc thù. Chúng tôi đề xuất bạn nên khám Nội tổng quát để được bác sĩ đánh giá toàn diện ban đầu.',
          matchedKeywords: results.length > 0 ? results[0].matchedKeywords : []
        }
      });
    }

    const bestMatch = results[0];

    // High confidence match
    return res.status(200).json({
      success: true,
      data: {
        confidence: bestMatch.score >= 4 ? 'high' : 'medium',
        department: bestMatch.department,
        specialty: bestMatch.specialty,
        message: `Dựa trên các triệu chứng (${bestMatch.matchedKeywords.join(', ')}), AI phân tích bạn có khả năng đang gặp vấn đề thuộc chuyên khoa ${bestMatch.specialty}. Chúng tôi đề xuất bạn đặt lịch với bác sĩ thuộc Khoa này.`,
        matchedKeywords: bestMatch.matchedKeywords
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
