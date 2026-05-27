import { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import AccountBlockedModal from "./components/AccountBlockedModal";

// Layouts
import MainLayout from "./layouts/MainLayout";
import DashboardLayout from "./layouts/DashboardLayout";

// Pages
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import Booking from "./pages/Booking";
import AITriage from "./pages/AITriage";
import Records from "./pages/Records";
import ComingSoon from "./pages/ComingSoon";
import LabResults from "./pages/LabResults";
import LabStaffDashboard from "./pages/LabStaffDashboard";
import Prescriptions from "./pages/Prescriptions";
import Billing from "./pages/Billing";
import Notifications from "./pages/Notifications";
import AppointmentsHistory from "./pages/AppointmentsHistory";
import AppointmentDetail from "./pages/AppointmentDetail";
import DoctorDashboard from "./pages/DoctorDashboard";
import DoctorShifts from "./pages/DoctorShifts";

// Public Pages
import About from "./pages/public/About";
import Services from "./pages/public/Services";
import Doctors from "./pages/public/Doctors";
import FAQ from "./pages/public/FAQ";
import UserGuide from "./pages/public/UserGuide";
import PrivacyPolicy from "./pages/public/PrivacyPolicy";
import TermsOfUse from "./pages/public/TermsOfUse";
import Contact from "./pages/public/Contact";

// Admin Pages
import AdminLayout from "./layouts/AdminLayout";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminDoctors from "./pages/admin/AdminDoctors";
import AdminAppointments from "./pages/admin/AdminAppointments";
import AdminRecords from "./pages/admin/AdminRecords";
import AdminInventory from "./pages/admin/AdminInventory";
import AdminBilling from "./pages/admin/AdminBilling";

// Scroll to top component
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
  }, [pathname]);

  return null;
};

function App() {
  const [accountBlocked, setAccountBlocked] = useState(false);
  const [lang, setLang] = useState(localStorage.getItem("lang") || "vi");

  // Listen for account blocked event
  useEffect(() => {
    const handleAccountBlocked = () => {
      setAccountBlocked(true);
    };

    window.addEventListener("account-blocked", handleAccountBlocked);
    return () =>
      window.removeEventListener("account-blocked", handleAccountBlocked);
  }, []);

  // Update lang when language changes
  useEffect(() => {
    const handleLangChange = () => {
      setLang(localStorage.getItem("lang") || "vi");
    };
    window.addEventListener("language-change", handleLangChange);
    return () =>
      window.removeEventListener("language-change", handleLangChange);
  }, []);

  return (
    <Router>
      <ScrollToTop />
      <AccountBlockedModal isOpen={accountBlocked} lang={lang} />
      <Routes>
        {/* Public Routes with Layout */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<LandingPage />} />
          <Route path="about" element={<About />} />
          <Route path="services" element={<Services />} />
          <Route path="doctors" element={<Doctors />} />
          <Route path="faq" element={<FAQ />} />
          <Route path="user-guide" element={<UserGuide />} />
          <Route path="privacy" element={<PrivacyPolicy />} />
          <Route path="terms" element={<TermsOfUse />} />
          <Route path="contact" element={<Contact />} />
        </Route>

        {/* Dashboard Routes */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="booking" element={<Booking />} />
          <Route path="ai" element={<AITriage />} />
          <Route path="records" element={<Records />} />
          <Route path="results" element={<LabResults />} />
          <Route path="lab-upload" element={<LabStaffDashboard />} />
          <Route path="prescriptions" element={<Prescriptions />} />
          <Route path="billing" element={<Billing />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="history" element={<AppointmentsHistory />} />
          <Route path="appointment/:id" element={<AppointmentDetail />} />
          <Route path="lab-results" element={<LabResults />} />
          <Route path="doctor" element={<DoctorDashboard />} />
          <Route path="doctor-shifts" element={<DoctorShifts />} />
          <Route
            path="settings"
            element={<ComingSoon titleKey="settingsTitle" />}
          />
        </Route>

        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="doctors" element={<AdminDoctors />} />
          <Route path="appointments" element={<AdminAppointments />} />
          <Route path="records" element={<AdminRecords />} />
          <Route path="inventory" element={<AdminInventory />} />
          <Route path="billing" element={<AdminBilling />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
