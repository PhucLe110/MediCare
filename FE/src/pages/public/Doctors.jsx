import { API_URL } from "../../config";
import { useState, useEffect } from "react";
import {
  Filter,
  Search,
  Award,
  Users,
  Activity,
  ChevronRight,
} from "lucide-react";
import { useTranslation } from "../../hooks/useTranslation";
import {
  resolveDeptLabel,
  resolveSpecialtyLabel,
  otherDeptLabel,
} from "../../utils/i18nHelpers";

const trans = {
  vi: {
    subtitle: "Đội ngũ Bác sĩ",
    title: "Chuyên gia y tế \nTận tâm vì bạn",
    searchPlaceholder: "Tìm tên bác sĩ...",
    filterTitle: "Bộ lọc tìm kiếm",
    deptLabel: "Khoa",
    allDepts: "Tất cả khoa",
    specialtyLabel: "Chuyên khoa",
    allSpecialties: "Tất cả chuyên khoa",
    expLabel: "Kinh nghiệm",
    allExperience: "Mọi kinh nghiệm",
    expUnder5: "Dưới 5 năm",
    exp5To10: "5 - 10 năm",
    expOver10: "Trên 10 năm",
    clearFilter: "Xóa lọc",
    applyFilter: "Áp dụng",
    tabAll: "Tất cả",
    selectDept: "Chọn chuyên khoa",
    noResults: "Không tìm thấy bác sĩ nào phù hợp với tìm kiếm của bạn.",
    yearsExperience: "Chuyên gia với {exp} năm kinh nghiệm",
    btnBookNow: "Đặt khám ngay",
    statTitle1: "200+",
    statLabel1: "Bác sĩ chuyên khoa",
    statTitle2: "15+",
    statLabel2: "Năm kinh nghiệm trung bình",
    statTitle3: "100%",
    statLabel3: "Tận tâm với nghề",
  },
  en: {
    subtitle: "Medical Experts",
    title: "Clinical Specialists \nDedicated to You",
    searchPlaceholder: "Search physician name...",
    filterTitle: "Search Filter Options",
    deptLabel: "Department",
    allDepts: "All Departments",
    specialtyLabel: "Specialty",
    allSpecialties: "All Specialties",
    expLabel: "Experience",
    allExperience: "All Experience levels",
    expUnder5: "Under 5 years",
    exp5To10: "5 - 10 years",
    expOver10: "Over 10 years",
    clearFilter: "Clear Filters",
    applyFilter: "Apply",
    tabAll: "All",
    selectDept: "Select Specialized Department",
    noResults: "No physicians found matching your criteria.",
    yearsExperience: "Specialist with {exp} years of experience",
    btnBookNow: "Book Now",
    statTitle1: "200+",
    statLabel1: "Specialist Doctors",
    statTitle2: "15+",
    statLabel2: "Avg Years of Experience",
    statTitle3: "100%",
    statLabel3: "Dedicated Care",
  },
};

export default function Doctors() {
  const { lang, t } = useTranslation(trans);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/doctors`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setDoctors(data.data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const [activeTab, setActiveTab] = useState("Tất cả");
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [filters, setFilters] = useState({
    department: "",
    specialty: "",
    experience: "",
  });

  const getDeptTranslation = (dept) => resolveDeptLabel(lang, dept, "doctors");
  const getSpecialtyTranslation = (spec) => resolveSpecialtyLabel(lang, spec);

  // Nhóm bác sĩ theo khoa
  const groupedDoctors = doctors.reduce((acc, doc) => {
    const dept = doc.department || otherDeptLabel(lang);
    if (!acc[dept]) acc[dept] = [];
    acc[dept].push(doc);
    return acc;
  }, {});

  const departments = Object.keys(groupedDoctors);

  // Lấy các chuyên khoa duy nhất
  const specialties = [
    ...new Set(doctors.map((d) => d.specialty).filter(Boolean)),
  ];

  // Lọc bác sĩ
  const filteredDoctors = doctors.filter((doc) => {
    if (
      searchTerm &&
      !doc.userId?.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
    )
      return false;

    if (activeTab !== "Tất cả" && doc.department !== activeTab) return false;

    if (filters.department && doc.department !== filters.department)
      return false;
    if (filters.specialty && doc.specialty !== filters.specialty) return false;
    if (filters.experience) {
      const exp = doc.experience || 0;
      if (filters.experience === "0-5" && exp > 5) return false;
      if (filters.experience === "5-10" && (exp <= 5 || exp > 10)) return false;
      if (filters.experience === "10+" && exp <= 10) return false;
    }

    return true;
  });

  const filteredGrouped = filteredDoctors.reduce((acc, doc) => {
    const dept = doc.department || otherDeptLabel(lang);
    if (!acc[dept]) acc[dept] = [];
    acc[dept].push(doc);
    return acc;
  }, {});

  return (
    <div className="bg-[var(--bg-primary)] min-h-screen pt-24 pb-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-8 relative">
          <div className="max-w-2xl">
            <h2 className="text-sm font-black text-primary uppercase tracking-[0.2em] mb-4">
              {t.subtitle}
            </h2>
            <h3 className="text-4xl lg:text-5xl font-black text-[var(--text-primary)] leading-[1.1] whitespace-pre-line">
              {t.title}
            </h3>
          </div>

          <div className="flex gap-4 relative">
            <div className="relative">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]"
                size={18}
              />
              <input
                type="text"
                placeholder={t.searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-6 py-4 bg-[var(--bg-tertiary)] border-none rounded-2xl text-sm font-bold w-64 focus:ring-2 focus:ring-primary/20 outline-none text-[var(--text-primary)]"
              />
            </div>
            <button
              onClick={() => setShowFilter(!showFilter)}
              className={`px-6 py-4 rounded-2xl transition-colors flex items-center justify-center ${showFilter ? "bg-[#102A63] text-white shadow-lg" : "bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--border-color)]"}`}
            >
              <Filter size={20} />
            </button>

            {/* Filter Panel */}
            {showFilter && (
              <div className="absolute top-full right-0 mt-4 w-80 bg-[var(--card-bg)] border border-[var(--border-color)] shadow-2xl rounded-3xl p-6 z-50">
                <h4 className="font-black text-[var(--text-primary)] mb-4 border-b border-[var(--border-color)] pb-3">
                  {t.filterTitle}
                </h4>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-[var(--text-secondary)] uppercase mb-2 block">
                      {t.deptLabel}
                    </label>
                    <select
                      value={filters.department}
                      onChange={(e) => {
                        setFilters({ ...filters, department: e.target.value });
                        if (e.target.value) setActiveTab("Tất cả");
                      }}
                      className="w-full p-3 bg-[var(--bg-tertiary)] rounded-xl border-none outline-none text-sm font-medium text-[var(--text-primary)]"
                    >
                      <option value="">{t.allDepts}</option>
                      {departments.map((d) => (
                        <option key={d} value={d}>
                          {getDeptTranslation(d)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[var(--text-secondary)] uppercase mb-2 block">
                      {t.specialtyLabel}
                    </label>
                    <select
                      value={filters.specialty}
                      onChange={(e) =>
                        setFilters({ ...filters, specialty: e.target.value })
                      }
                      className="w-full p-3 bg-[var(--bg-tertiary)] rounded-xl border-none outline-none text-sm font-medium text-[var(--text-primary)]"
                    >
                      <option value="">{t.allSpecialties}</option>
                      {specialties.map((s) => (
                        <option key={s} value={s}>
                          {getSpecialtyTranslation(s)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[var(--text-secondary)] uppercase mb-2 block">
                      {t.expLabel}
                    </label>
                    <select
                      value={filters.experience}
                      onChange={(e) =>
                        setFilters({ ...filters, experience: e.target.value })
                      }
                      className="w-full p-3 bg-[var(--bg-tertiary)] rounded-xl border-none outline-none text-sm font-medium text-[var(--text-primary)]"
                    >
                      <option value="">{t.allExperience}</option>
                      <option value="0-5">{t.expUnder5}</option>
                      <option value="5-10">{t.exp5To10}</option>
                      <option value="10+">{t.expOver10}</option>
                    </select>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-[var(--border-color)] flex justify-end">
                  <button
                    onClick={() =>
                      setFilters({
                        department: "",
                        specialty: "",
                        experience: "",
                      })
                    }
                    className="text-sm font-bold text-[var(--text-tertiary)] hover:text-[var(--text-primary)] px-4"
                  >
                    {t.clearFilter}
                  </button>
                  <button
                    onClick={() => setShowFilter(false)}
                    className="px-4 py-2 bg-primary text-white text-sm font-bold rounded-xl hover:bg-blue-600"
                  >
                    {t.applyFilter}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tabs Tất cả và Chọn chuyên khoa */}
        <div className="flex gap-4 mb-12 border-b border-[var(--border-color)] pb-4">
          <button
            onClick={() => setActiveTab("Tất cả")}
            className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all duration-300 ${
              activeTab === "Tất cả"
                ? "bg-[#102A63] text-white shadow-lg shadow-blue-900/20"
                : "bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--border-color)]"
            }`}
          >
            {t.tabAll}
          </button>

          <div className="relative">
            <select
              value={activeTab !== "Tất cả" ? activeTab : ""}
              onChange={(e) => setActiveTab(e.target.value)}
              className={`appearance-none px-6 py-2.5 rounded-full font-bold text-sm outline-none cursor-pointer border-none transition-all duration-300 pr-10 ${
                activeTab !== "Tất cả"
                  ? "bg-[#102A63] text-white shadow-lg shadow-blue-900/20"
                  : "bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--border-color)]"
              }`}
            >
              <option value="" disabled hidden>
                {t.selectDept}
              </option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {getDeptTranslation(dept)}
                </option>
              ))}
            </select>
            <ChevronRight
              size={14}
              className={`absolute right-4 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none ${activeTab !== "Tất cả" ? "text-white" : "text-[var(--text-tertiary)]"}`}
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-16">
            {Object.keys(filteredGrouped).length === 0 ? (
              <div className="text-center py-20 text-[var(--text-secondary)] font-medium">
                {t.noResults}
              </div>
            ) : (
              Object.entries(filteredGrouped).map(
                ([department, deptDoctors], deptIndex) => (
                  <div key={deptIndex} className="mb-12">
                    <h3 className="text-2xl font-black text-[var(--text-primary)] mb-8 pb-4 border-b-2 border-[var(--border-color)] flex items-center gap-3">
                      <span className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-primary flex items-center justify-center text-sm">
                        {deptIndex + 1}
                      </span>
                      {getDeptTranslation(department)}
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                      {deptDoctors.map((d, i) => {
                        const name = d.userId?.fullName || "Bác sĩ";
                        const doctorImages = [
                          "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=500&q=80",
                          "https://images.unsplash.com/photo-1594824401831-2ff3282eb10e?w=500&q=80",
                          "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=500&q=80",
                          "https://images.unsplash.com/photo-1612276527156-05459f0f9db3?w=500&q=80",
                          "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=500&q=80",
                          "https://images.unsplash.com/photo-1618498082410-b4aa22193b38?w=500&q=80",
                          "https://images.unsplash.com/photo-1582750433449-648ed127d09e?w=500&q=80",
                          "https://images.unsplash.com/photo-1550831107-1553da8c8464?w=500&q=80",
                          "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=500&q=80",
                          "https://images.unsplash.com/photo-1638202993928-7267aad84c31?w=500&q=80",
                          "https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=500&q=80",
                          "https://images.unsplash.com/photo-1643297654416-05795d62e39c?w=500&q=80",
                          "https://images.unsplash.com/photo-1624561172888-530b1eb1b4bb?w=500&q=80",
                          "https://images.unsplash.com/photo-1623854767648-e72fa7462fa4?w=500&q=80",
                          "https://images.unsplash.com/photo-1527613426441-4da17471b66d?w=500&q=80",
                          "https://images.unsplash.com/photo-1605684954998-685c79d6a018?w=500&q=80",
                          "https://images.unsplash.com/photo-1581056771107-24ca5f033842?w=500&q=80",
                          "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=500&q=80",
                          "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=500&q=80",
                          "https://images.unsplash.com/photo-1582750433449-648ed127d09e?w=500&q=80",
                        ];

                        const globalIndex = doctors.findIndex(
                          (doc) => doc._id === d._id,
                        );
                        const idx = globalIndex !== -1 ? globalIndex : i;
                        const avatar =
                          d.avatar || doctorImages[idx % doctorImages.length];

                        return (
                          <div
                            key={i}
                            className="group relative flex flex-col items-center"
                          >
                            <div className="w-full h-80 rounded-[3rem] overflow-hidden mb-8 relative shadow-lg">
                              <div className="absolute inset-0 bg-gray-100 animate-pulse"></div>
                              <img
                                src={avatar}
                                alt={name}
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=102A63&color=fff&size=512`;
                                }}
                                className="w-full h-full object-cover relative z-10 group-hover:scale-105 transition-transform duration-500"
                              />
                            </div>

                            <div className="text-center w-full px-4">
                              <span className="text-xs font-black tracking-widest text-primary uppercase mb-3 block">
                                {getSpecialtyTranslation(d.specialty) ||
                                  getDeptTranslation(department)}
                              </span>
                              <h4 className="text-2xl font-black text-[#102A63] mb-2">
                                {name}
                              </h4>
                              <p className="text-gray-500 font-medium mb-6">
                                {t.yearsExperience.replace(
                                  "{exp}",
                                  d.experience,
                                )}
                              </p>

                              <button
                                onClick={() =>
                                  document.dispatchEvent(
                                    new CustomEvent("open-auth", {
                                      detail: "login",
                                    }),
                                  )
                                }
                                className="w-full py-4 bg-[var(--card-bg)] border-2 border-[var(--border-color)] text-[var(--text-primary)] font-bold rounded-2xl hover:border-primary hover:bg-primary hover:text-white transition-all duration-300 shadow-sm hover:shadow-md"
                              >
                                {t.btnBookNow}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ),
              )
            )}
          </div>
        )}

        {/* Stats Section to make page longer */}
        <div className="mt-32 bg-primary rounded-[3rem] p-12 lg:p-20 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/20 to-transparent pointer-events-none"></div>
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div>
              <div className="w-16 h-16 mx-auto bg-white/10 rounded-2xl flex items-center justify-center mb-6">
                <Users size={32} className="text-blue-200" />
              </div>
              <h4 className="text-5xl font-black mb-2">{t.statTitle1}</h4>
              <p className="text-blue-200 font-medium uppercase tracking-widest text-sm">
                {t.statLabel1}
              </p>
            </div>
            <div>
              <div className="w-16 h-16 mx-auto bg-white/10 rounded-2xl flex items-center justify-center mb-6">
                <Award size={32} className="text-blue-200" />
              </div>
              <h4 className="text-5xl font-black mb-2">{t.statTitle2}</h4>
              <p className="text-blue-200 font-medium uppercase tracking-widest text-sm">
                {t.statLabel2}
              </p>
            </div>
            <div>
              <div className="w-16 h-16 mx-auto bg-white/10 rounded-2xl flex items-center justify-center mb-6">
                <Activity size={32} className="text-blue-200" />
              </div>
              <h4 className="text-5xl font-black mb-2">{t.statTitle3}</h4>
              <p className="text-blue-200 font-medium uppercase tracking-widest text-sm">
                {t.statLabel3}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
