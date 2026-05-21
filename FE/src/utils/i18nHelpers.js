/** Shared i18n helpers for locale, money, doctor names, departments */

export const getLocale = (lang) => (lang === 'vi' ? 'vi-VN' : 'en-US');

export const formatMoney = (lang, n) => {
  const locale = getLocale(lang);
  const value = lang === 'vi' ? (n || 0) : Math.round((n || 0) / 25000);
  const currency = lang === 'vi' ? 'VND' : 'USD';
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(value);
};

export const formatDoctorName = (lang, name) => {
  if (!name) return lang === 'vi' ? 'Bác sĩ phụ trách' : 'Attending Physician';
  const trimmed = name.trim();
  const bare = trimmed.replace(/^(bs\.|bs\s|bác sĩ\s|dr\.|dr\s)/i, '').trim();
  return lang === 'vi' ? `BS. ${bare}` : `Dr. ${bare}`;
};

const DEPT_MAP_EN = {
  'Khoa Nội': 'Internal Medicine',
  'Khoa Ngoại': 'Surgery',
  'Khoa Nhi': 'Pediatrics',
  'Khoa Sản': 'Obstetrics & Gynecology',
  'Khoa Da liễu': 'Dermatology',
  'Khoa Tai Mũi Họng': 'ENT',
  'Khoa Mắt': 'Ophthalmology',
  'Khoa Răng Hàm Mặt': 'Dental',
  'Khoa Tim mạch': 'Cardiology',
  'Khoa Thần kinh': 'Neurology',
  'Khoa Cơ xương khớp': 'Orthopedics',
  'Khoa Cấp cứu': 'Emergency',
  'Khoa Xét nghiệm': 'Laboratory',
  'Khoa Chẩn đoán hình ảnh': 'Imaging',
  'Ngoại tổng quát': 'General Surgery',
  'Nội tổng quát': 'General Internal Medicine',
  'Khoa Nội tổng quát': 'General Internal Medicine',
  'Khoa Ngoại tổng quát': 'General Surgery',
};

export const getLocalizedDept = (lang, dept) => {
  if (!dept) return '';
  if (lang === 'vi') return dept;
  return DEPT_MAP_EN[dept] || dept;
};

export const formatApptMonth = (lang, dateObj) => {
  if (lang === 'vi') return `Th${dateObj.getMonth() + 1}`;
  return dateObj.toLocaleDateString('en-US', { month: 'short' });
};

export const formatDate = (lang, date) =>
  new Date(date).toLocaleDateString(getLocale(lang));

export const formatDateTime = (lang, date) =>
  new Date(date).toLocaleString(getLocale(lang));

export const DEFAULT_LAB_TEST_NAMES = {
  vi: {
    blood: 'Xét nghiệm công thức máu toàn phần',
    urine: 'Xét nghiệm phân tích nước tiểu',
    xray: 'Chụp X-quang Ngực thẳng',
    mri: 'Chụp cộng hưởng từ khớp/não',
    ct: 'Chụp cắt lớp vi tính',
    ultrasound: 'Siêu âm tổng quát ổ bụng',
    ecg: 'Đo điện tâm đồ (ECG)',
    other: 'Chỉ định lâm sàng khác',
    clinicalEval: 'Đánh giá lâm sàng',
  },
  en: {
    blood: 'Complete Blood Count (CBC)',
    urine: 'Urinalysis (UA)',
    xray: 'Chest X-Ray',
    mri: 'MRI Scan',
    ct: 'CT Scan',
    ultrasound: 'Abdominal Ultrasound',
    ecg: 'Electrocardiogram (ECG)',
    other: 'Other Diagnostic Test',
    clinicalEval: 'Clinical evaluation',
  },
};

export const getDefaultLabTests = (lang) => DEFAULT_LAB_TEST_NAMES[lang] || DEFAULT_LAB_TEST_NAMES.vi;

export const pickLang = (lang, viVal, enVal) => (lang === 'vi' ? viVal : enVal);

/** Dept label with keyword fallback (landing / doctors list variants) */
export const resolveDeptLabel = (lang, dept, variant = 'default') => {
  if (!dept) return '';
  const dLower = dept.toLowerCase();
  if (dLower.includes('tổng quát') || dLower.includes('general')) {
    if (variant === 'landing') return pickLang(lang, 'Khám tổng quát', 'General Practice');
    if (variant === 'doctors') return pickLang(lang, 'Khoa Nội tổng quát', 'General Practice');
  }
  if (dLower.includes('xét nghiệm') || dLower.includes('lab')) {
    return pickLang(lang, 'Xét nghiệm', 'Laboratory');
  }
  return getLocalizedDept(lang, dept);
};

export const resolveSpecialtyLabel = (lang, spec) => {
  if (!spec) return '';
  const sLower = spec.toLowerCase();
  if (sLower.includes('nội') || sLower.includes('internal')) {
    return pickLang(lang, 'Nội tổng quát', 'Internal Medicine');
  }
  if (sLower.includes('ngoại') || sLower.includes('surgery')) {
    return pickLang(lang, 'Ngoại khoa', 'Surgery');
  }
  if (sLower.includes('xét nghiệm') || sLower.includes('laboratory')) {
    return pickLang(lang, 'Xét nghiệm y khoa', 'Medical Laboratory');
  }
  return spec;
};

export const otherDeptLabel = (lang) => pickLang(lang, 'Chuyên Khoa Khác', 'Other Specialties');

const APPT_STATUS = {
  vi: {
    pending: 'Chờ xác nhận',
    pending_payment: 'Chờ thanh toán',
    confirmed: 'Đã xác nhận',
    completed: 'Đã khám',
    cancelled: 'Đã hủy',
  },
  en: {
    pending: 'Pending',
    pending_payment: 'Pending payment',
    confirmed: 'Confirmed',
    completed: 'Completed',
    cancelled: 'Cancelled',
  },
};

export const getApptStatusLabel = (lang, status) =>
  (APPT_STATUS[lang] || APPT_STATUS.vi)[status] || status;

export const formatChartTick = (lang, val) =>
  lang === 'vi' ? `${val / 1000}k` : `$${Math.round(val / 25000)}`;

const MED_UNITS_VI = {
  Tablet: 'Viên', Bottle: 'Lọ', Sachet: 'Gói', Tube: 'Tuýp', Ampoule: 'Ống', Flacon: 'Chai',
};
const MED_UNITS_EN = {
  Viên: 'Tablet', Lọ: 'Bottle', Gói: 'Sachet', Tuýp: 'Tube', Ống: 'Ampoule', Chai: 'Flacon',
};

export const localizeMedicineUnit = (lang, unitVal) => {
  if (!unitVal) return '';
  const map = lang === 'vi' ? MED_UNITS_VI : MED_UNITS_EN;
  return map[unitVal] || unitVal;
};

/** Admin doctor form: bidirectional dept display */
const ADMIN_DEPT_VI = {
  Cardiology: 'Tim mạch', Neurology: 'Thần kinh', Pediatrics: 'Nhi khoa', Dermatology: 'Da liễu',
  Gastroenterology: 'Tiêu hóa', 'Respiratory Medicine': 'Hô hấp', 'General Surgery': 'Ngoại tổng quát',
  'General Internal Medicine': 'Nội tổng quát', ENT: 'Tai Mũi Họng', Ophthalmology: 'Mắt',
  'Odonto-Stomatology': 'Răng Hàm Mặt', Emergency: 'Cấp cứu', Laboratory: 'Xét nghiệm',
  'Diagnostic Imaging': 'Chẩn đoán hình ảnh',
};
const ADMIN_DEPT_EN = Object.fromEntries(
  Object.entries(ADMIN_DEPT_VI).map(([en, vi]) => [vi, en])
);

export const localizeAdminDept = (lang, dept) => {
  if (!dept) return '';
  if (lang === 'vi') return ADMIN_DEPT_VI[dept] || dept;
  return ADMIN_DEPT_EN[dept] || getLocalizedDept(lang, dept);
};
