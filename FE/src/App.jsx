import { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";

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

// Admin Pages
import AdminLayout from "./layouts/AdminLayout";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminDoctors from "./pages/admin/AdminDoctors";
import AdminAppointments from "./pages/admin/AdminAppointments";
import AdminRecords from "./pages/admin/AdminRecords";
import AdminInventory from "./pages/admin/AdminInventory";
import AdminBilling from "./pages/admin/AdminBilling";
import AdminAI from "./pages/admin/AdminAI";

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
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        {/* Public Routes with Layout */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<LandingPage />} />
          <Route path="about" element={<About />} />
          <Route path="services" element={<Services />} />
          <Route path="doctors" element={<Doctors />} />
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
          <Route path="ai" element={<AdminAI />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
