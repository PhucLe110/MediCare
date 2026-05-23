import { API_URL, authFetch } from "../config";
import { isAppointmentTimeReached } from "../utils/dateTime";
import { getLocale, getDefaultLabTests } from "../utils/i18nHelpers";
import { doctorDashboardTrans } from "../i18n/doctorDashboardI18n";
import { useTranslation } from "../hooks/useTranslation";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  Users,
  Calendar,
  Clipboard,
  Search,
  Pill,
  FileText,
  CheckCircle2,
  ChevronRight,
  Trash2,
  Plus,
  RefreshCw,
  UserCheck,
  AlertCircle,
  Printer,
  X,
  Activity,
  Info,
  Clock,
  Send,
  FlaskConical,
} from "lucide-react";

const getTomorrowString = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const y = tomorrow.getFullYear();
  const m = String(tomorrow.getMonth() + 1).padStart(2, "0");
  const d = String(tomorrow.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const DoctorDashboard = () => {
  const { lang, t } = useTranslation(doctorDashboardTrans);
  const labNames = getDefaultLabTests(lang);
  const locale = getLocale(lang);
  const [activeTab, setActiveTab] = useState("confirmed"); // 'confirmed', 'completed', 'cancelled'
  const [appointments, setAppointments] = useState([]);
  const [medicinesList, setMedicinesList] = useState([]);
  const [profileData, setProfileData] = useState(null);
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [waitingFilter, setWaitingFilter] = useState("today"); // 'today' | 'bydate'
  const [filterDate, setFilterDate] = useState(() => {
    const now = new Date();
    const vn = new Date(now.getTime() + 7 * 60 * 60 * 1000);
    return vn.toISOString().split("T")[0];
  });

  // Clinical Session Form State
  const [diagnosis, setDiagnosis] = useState("");
  const [doctorNotes, setDoctorNotes] = useState("");
  const [prescribedMedicines, setPrescribedMedicines] = useState([]);
  const [medNameInput, setMedNameInput] = useState("");
  const [medUnit, setMedUnit] = useState("");
  const [medFrequency, setMedFrequency] = useState("2 lần/ngày (Sáng/Tối)");
  const [medDuration, setMedDuration] = useState("7 ngày");
  const [medQuantity, setMedQuantity] = useState(1);

  // Lab Tests State
  const [labTests, setLabTests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [newTestName, setNewTestName] = useState("");
  const [newTestType, setNewTestType] = useState("blood");
  const [testNotes, setTestNotes] = useState("");

  // Follow-up State
  const [requireFollowUp, setRequireFollowUp] = useState(false);
  const [followUpDate, setFollowUpDate] = useState("");
  const [followUpTime, setFollowUpTime] = useState("");
  const [followUpNotes, setFollowUpNotes] = useState("");
  const [availableFollowUpTimes, setAvailableFollowUpTimes] = useState([]);
  const [loadingFollowUpTimes, setLoadingFollowUpTimes] = useState(false);

  // History state
  const [patientHistory, setPatientHistory] = useState([]);
  const [patientProfile, setPatientProfile] = useState(null);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [cancelLabConfirm, setCancelLabConfirm] = useState({
    show: false,
    requestId: null,
    label: "",
  });

  // Notifications/Errors
  const [toast, setToast] = useState(null);

  const jsonHeaders = () => ({ "Content-Type": "application/json" });

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    const fetchFollowUpAvailability = async () => {
      if (!profileData?.profile?._id || !followUpDate) {
        setAvailableFollowUpTimes([]);
        return;
      }
      setLoadingFollowUpTimes(true);
      try {
        const res = await authFetch(
          `${API_URL}/api/appointments/doctors/${profileData.profile._id}/availability?date=${followUpDate}`,
        );
        const data = await res.json();
        if (data.success) {
          setAvailableFollowUpTimes(data.data);
          if (!data.data.includes(followUpTime)) {
            setFollowUpTime("");
          }
        }
      } catch {
        // Error handling
      } finally {
        setLoadingFollowUpTimes(false);
      }
    };
    fetchFollowUpAvailability();
  }, [followUpDate, profileData?.profile?._id, followUpTime]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 1. Fetch Profile
        const profRes = await authFetch(`${API_URL}/api/doctors/profile`);
        const profData = await profRes.json();
        if (profData.success) {
          setProfileData(profData.data);
        }

        // 2. Fetch Appointments
        const apptRes = await authFetch(`${API_URL}/api/doctors/appointments`);
        const apptData = await apptRes.json();
        if (apptData.success) {
          setAppointments(apptData.data);
        }

        // 3. Fetch Medicines
        const medRes = await authFetch(`${API_URL}/api/doctors/medicines`);
        const medData = await medRes.json();
        if (medData.success) {
          setMedicinesList(medData.data);
        }
      } catch {
        showToast(t.toastSyncError, "error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load Patient clinical history
  const loadPatientHistory = async (patientId) => {
    setLoadingHistory(true);
    try {
      const res = await authFetch(
        `${API_URL}/api/doctors/patient-history/${patientId}`,
      );
      const data = await res.json();
      if (data.success) {
        setPatientHistory(data.data.history || []);
        setPatientProfile(data.data.patient || null);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleSelectAppt = (appt) => {
    setSelectedAppt(appt);
    if (appt.status === "examining" && appt.draft) {
      // Load draft from DB (already returned in appointment data)
      const d = appt.draft;
      setDiagnosis(d.diagnosis || "");
      setDoctorNotes(d.doctorNotes || "");
      setPrescribedMedicines(d.medicines || []);
      setLabTests(d.labTests || []);
      setRequireFollowUp(d.requireFollowUp || false);
      setFollowUpDate(d.followUpDate || "");
      setFollowUpTime(d.followUpTime || "");
      setFollowUpNotes(d.followUpNotes || "");
    } else {
      setDiagnosis("");
      setDoctorNotes("");
      setPrescribedMedicines([]);
      setLabTests([]);
      setRequireFollowUp(false);
      setFollowUpDate("");
      setFollowUpTime("");
      setFollowUpNotes("");
    }
    loadPatientHistory(appt.patient._id);
    fetchSentRequests(appt._id);
  };

  const fetchSentRequests = async (apptId) => {
    setLoadingRequests(true);
    try {
      const res = await authFetch(
        `${API_URL}/api/lab-requests?appointmentId=${apptId}`,
      );
      const data = await res.json();
      if (data.success) setSentRequests(data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingRequests(false);
    }
  };

  const openCancelLabConfirm = (req) => {
    const label = req.tests?.map((x) => x.testName).join(", ") || "";
    setCancelLabConfirm({ show: true, requestId: req._id, label });
  };

  const closeCancelLabConfirm = () => {
    setCancelLabConfirm({ show: false, requestId: null, label: "" });
  };

  const confirmCancelLabRequest = async () => {
    const requestId = cancelLabConfirm.requestId;
    if (!requestId) return;
    closeCancelLabConfirm();

    try {
      const res = await authFetch(`${API_URL}/api/lab-requests/${requestId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        showToast(t.toastLabCancelled);
        fetchSentRequests(selectedAppt._id);
      } else {
        showToast(data.message, "error");
      }
    } catch (error) {
      console.error(error);
      showToast(t.toastConnError, "error");
    }
  };

  const handleSendLabRequest = async () => {
    if (labTests.length === 0) {
      showToast(t.toastAddLab, "error");
      return;
    }

    try {
      const payload = {
        patientId: selectedAppt.patient._id,
        appointmentId: selectedAppt._id,
        tests: labTests,
      };

      const res = await authFetch(`${API_URL}/api/lab-requests`, {
        method: "POST",
        headers: jsonHeaders(),
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        showToast(t.toastLabSent);
        setLabTests([]);
        fetchSentRequests(selectedAppt._id);
      } else {
        showToast(data.message, "error");
      }
    } catch (error) {
      console.error(error);
      showToast(t.toastConnError, "error");
    }
  };

  // Debounced save draft to server
  const draftTimerRef = useRef(null);
  const saveDraftToServer = useCallback(async (apptId, draftData) => {
    try {
      await authFetch(`${API_URL}/api/doctors/diagnose/${apptId}/draft`, {
        method: "PUT",
        headers: jsonHeaders(),
        body: JSON.stringify(draftData),
      });
    } catch (err) {
      console.error("Draft save error:", err);
    }
  }, []);

  useEffect(() => {
    if (!selectedAppt || selectedAppt.status !== "examining") return;
    // Debounce: wait 1.5s after last change before saving
    clearTimeout(draftTimerRef.current);
    draftTimerRef.current = setTimeout(() => {
      saveDraftToServer(selectedAppt._id, {
        diagnosis,
        doctorNotes,
        medicines: prescribedMedicines,
        labTests,
        requireFollowUp,
        followUpDate,
        followUpTime,
        followUpNotes,
      });
    }, 1500);
    return () => clearTimeout(draftTimerRef.current);
  }, [
    diagnosis,
    doctorNotes,
    prescribedMedicines,
    labTests,
    requireFollowUp,
    followUpDate,
    followUpTime,
    followUpNotes,
    selectedAppt,
    saveDraftToServer,
  ]);

  // Prescribing Medicines Handlers
  const handleAddMedicine = () => {
    if (!medNameInput.trim()) {
      showToast(t.toastAddMed, "error");
      return;
    }

    // Check duplicate by name
    if (
      prescribedMedicines.some(
        (m) => m.name.toLowerCase() === medNameInput.toLowerCase(),
      )
    ) {
      showToast(t.toastMedDup, "error");
      return;
    }

    const medObj = medicinesList.find(
      (m) => m.name.toLowerCase() === medNameInput.trim().toLowerCase(),
    );

    setPrescribedMedicines([
      ...prescribedMedicines,
      {
        medicineId: medObj ? medObj._id : null,
        name: medObj ? medObj.name : medNameInput.trim(),
        dosage: medUnit,
        frequency: medFrequency,
        duration: medDuration,
        quantity: Number(medQuantity),
        unitPrice: medObj ? medObj.unitPrice || 0 : 0,
      },
    ]);

    // Reset form
    setMedNameInput("");
    setMedUnit("");
    setMedFrequency("2 lần/ngày (Sáng/Tối)");
    setMedDuration("7 ngày");
    setMedQuantity(1);
  };

  const handleRemoveMedicine = (medName) => {
    setPrescribedMedicines(
      prescribedMedicines.filter((m) => m.name !== medName),
    );
  };

  // Lab Request Handlers
  const handleAddLabTest = () => {
    const name = newTestName.trim() || labNames[newTestType];

    setLabTests([
      ...labTests,
      {
        testName: name,
        testType: newTestType,
        clinicalNotes: testNotes || labNames.clinicalEval,
        urgency: "normal",
      },
    ]);

    setNewTestName("");
    setTestNotes("");
  };

  const handleRemoveLabTest = (index) => {
    setLabTests(labTests.filter((_, i) => i !== index));
  };

  // Submit Consultation / Diagnosis
  const hasOpenLabRequests = sentRequests.some(
    (r) => r.status !== "completed" && r.status !== "cancelled",
  );

  const handleSubmitDiagnosis = async () => {
    if (!diagnosis.trim()) {
      showToast(t.toastNeedDiagnosis, "error");
      return;
    }

    if (hasOpenLabRequests) {
      showToast(t.toastLabPending, "error");
      return;
    }

    if (requireFollowUp && (!followUpDate || !followUpTime)) {
      showToast(t.toastNeedFollowUp, "error");
      return;
    }

    // Auto-append un-added lab tests
    let finalLabTests = [...labTests];
    if (newTestName.trim() || testNotes.trim()) {
      const name = newTestName.trim() || labNames[newTestType];
      finalLabTests.push({
        testName: name,
        testType: newTestType,
        clinicalNotes: testNotes || labNames.clinicalEval,
        urgency: "normal",
      });
      setNewTestName("");
      setTestNotes("");
      setLabTests(finalLabTests);
    }

    // Auto-append un-added medicines
    let finalMedicines = [...prescribedMedicines];
    if (medNameInput.trim()) {
      if (
        !finalMedicines.some(
          (m) => m.name.toLowerCase() === medNameInput.trim().toLowerCase(),
        )
      ) {
        const medObj = medicinesList.find(
          (m) => m.name.toLowerCase() === medNameInput.trim().toLowerCase(),
        );
        finalMedicines.push({
          medicineId: medObj ? medObj._id : null,
          name: medObj ? medObj.name : medNameInput.trim(),
          dosage: medUnit,
          frequency: medFrequency,
          duration: medDuration,
          quantity: Number(medQuantity) || 1,
          unitPrice: medObj ? medObj.unitPrice || 0 : 0,
        });
        setMedNameInput("");
      }
      setPrescribedMedicines(finalMedicines);
    }

    try {
      const payload = {
        diagnosis,
        doctorNotes,
        medicines: finalMedicines,
        followUp: requireFollowUp
          ? {
              date: followUpDate,
              time: followUpTime,
              notes: followUpNotes,
            }
          : null,
      };

      const res = await authFetch(
        `${API_URL}/api/doctors/diagnose/${selectedAppt._id}`,
        {
          method: "POST",
          headers: jsonHeaders(),
          body: JSON.stringify(payload),
        },
      );

      const data = await res.json();
      if (data.success) {
        showToast(t.toastComplete);
        setSelectedAppt(null);
        // Refetch data
        const refetchData = async () => {
          setLoading(true);
          try {
            const profRes = await authFetch(`${API_URL}/api/doctors/profile`);
            const profData = await profRes.json();
            if (profData.success) setProfileData(profData.data);

            const apptRes = await authFetch(
              `${API_URL}/api/doctors/appointments`,
            );
            const apptData = await apptRes.json();
            if (apptData.success) setAppointments(apptData.data);

            const medRes = await authFetch(`${API_URL}/api/doctors/medicines`);
            const medData = await medRes.json();
            if (medData.success) setMedicinesList(medData.data);
          } catch {
            // Error handling
          } finally {
            setLoading(false);
          }
        };
        refetchData();
      } else {
        showToast(data.message, "error");
      }
    } catch (error) {
      console.error(error);
      showToast(t.toastSaveFail, "error");
    }
  };

  const handleStartExamination = async () => {
    try {
      const res = await authFetch(
        `${API_URL}/api/doctors/diagnose/${selectedAppt._id}/start`,
        {
          method: "PUT",
        },
      );
      const data = await res.json();
      if (data.success) {
        showToast(t.toastStartExam);
        setSelectedAppt({ ...selectedAppt, status: "examining" });
        // Refetch data
        const refetchData = async () => {
          setLoading(true);
          try {
            const profRes = await authFetch(`${API_URL}/api/doctors/profile`);
            const profData = await profRes.json();
            if (profData.success) setProfileData(profData.data);

            const apptRes = await authFetch(
              `${API_URL}/api/doctors/appointments`,
            );
            const apptData = await apptRes.json();
            if (apptData.success) setAppointments(apptData.data);

            const medRes = await authFetch(`${API_URL}/api/doctors/medicines`);
            const medData = await medRes.json();
            if (medData.success) setMedicinesList(medData.data);
          } catch {
            // Error handling
          } finally {
            setLoading(false);
          }
        };
        refetchData();
      } else {
        showToast(data.message, "error");
      }
    } catch (error) {
      console.error(error);
      showToast(t.toastStartFail, "error");
    }
  };

  const isTimeReached = (appt) => isAppointmentTimeReached(appt);

  // Vietnam timezone helpers (GMT+7)
  const getVNToday = () => {
    const now = new Date();
    const vn = new Date(now.getTime() + 7 * 60 * 60 * 1000);
    return vn.toISOString().split("T")[0];
  };

  const vnToday = getVNToday();
  const vnMonth = vnToday.substring(0, 7);

  const todayApptsCount = appointments.filter((a) => {
    const d = a.date ? String(a.date).substring(0, 10) : "";
    return d === vnToday;
  }).length;

  const monthApptsCount = appointments.filter((a) => {
    const d = a.date ? String(a.date).substring(0, 10) : "";
    return d.substring(0, 7) === vnMonth;
  }).length;

  const monthFollowUpCount = appointments.filter((a) => {
    const d = a.date ? String(a.date).substring(0, 10) : "";
    return a.parentAppointment && d.substring(0, 7) === vnMonth;
  }).length;

  const filteredAppointments = appointments.filter((a) => {
    // Status check
    const statusMatches =
      activeTab === "confirmed"
        ? a.status === "confirmed" ||
          a.status === "pending" ||
          a.status === "examining"
        : activeTab === "completed"
          ? a.status === "completed"
          : a.status === "cancelled";

    // Search query check
    const nameMatches =
      a.patient?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.ticketNumber?.toLowerCase().includes(searchQuery.toLowerCase());

    // Date filter
    const apptDate = a.date ? String(a.date).substring(0, 10) : "";
    if (activeTab === "confirmed") {
      const dateMatches =
        waitingFilter === "today"
          ? apptDate === vnToday
          : apptDate === filterDate;
      return statusMatches && nameMatches && dateMatches;
    } else {
      const dateMatches = apptDate === filterDate;
      return statusMatches && nameMatches && dateMatches;
    }
  });

  return (
    <div className="space-y-6 font-sans">
      {/* Toast Alert */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-[9999] px-6 py-4 rounded-2xl shadow-xl flex items-center gap-3 border text-white font-bold animate-bounce-short ${
            toast.type === "success"
              ? "bg-emerald-500 border-emerald-400"
              : "bg-rose-500 border-rose-400"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 size={20} />
          ) : (
            <AlertCircle size={20} />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header Deck */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[var(--card-bg)] p-6 rounded-3xl border border-[var(--border-color)] shadow-sm">
        <div>
          <h1 className="text-3xl font-black text-[var(--text-primary)] tracking-tight flex items-center gap-3">
            <Activity className="text-primary animate-pulse" size={32} />
            {t.doctorDesk}
          </h1>
          <p className="text-sm text-[var(--text-secondary)] font-medium mt-1">
            {t.subtitle}
          </p>
        </div>
        <button
          onClick={() => {
            const fetchData = async () => {
              setLoading(true);
              try {
                const profRes = await authFetch(
                  `${API_URL}/api/doctors/profile`,
                );
                const profData = await profRes.json();
                if (profData.success) setProfileData(profData.data);

                const apptRes = await authFetch(
                  `${API_URL}/api/doctors/appointments`,
                );
                const apptData = await apptRes.json();
                if (apptData.success) setAppointments(apptData.data);

                const medRes = await authFetch(
                  `${API_URL}/api/doctors/medicines`,
                );
                const medData = await medRes.json();
                if (medData.success) setMedicinesList(medData.data);
              } catch {
                // Error handling
              } finally {
                setLoading(false);
              }
            };
            fetchData();
          }}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-blue-50 dark:bg-blue-900/30 text-primary font-extrabold text-sm border border-blue-100 dark:border-blue-900/30 hover:bg-primary hover:text-white transition-all shadow-sm"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          {t.refresh}
        </button>
      </div>

      {/* Profile Metrics Deck */}
      {profileData && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Doctor profile */}
          <div className="bg-gradient-to-br from-blue-900 to-indigo-950 text-white p-6 rounded-3xl shadow-lg shadow-indigo-900/10 border border-white/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full transform translate-x-8 -translate-y-8" />
            <p className="text-[11px] font-black text-blue-200 uppercase tracking-widest">
              {t.physicianLabel}
            </p>
            <h3 className="text-2xl font-black mt-2">
              {profileData.profile?.userId?.fullName}
            </h3>
            <p className="text-xs text-blue-300 font-bold mt-1">
              {profileData.profile?.specialty} •{" "}
              {profileData.profile?.department}
            </p>
          </div>

          {/* Card 2: Tổng ca — split Hôm nay / Trong tháng */}
          <div className="bg-[var(--card-bg)] p-6 rounded-3xl shadow-sm border border-[var(--border-color)] hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-900/30 text-primary flex items-center justify-center border border-blue-100 dark:border-blue-900/30">
                <Calendar size={20} />
              </div>
              <p className="text-xs text-[var(--text-secondary)] font-extrabold uppercase tracking-wide">
                {t.totalAppts}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-blue-50/70 dark:bg-blue-900/30 rounded-2xl p-3 text-center border border-blue-100 dark:border-blue-900/30">
                <h3 className="text-2xl font-black text-[var(--text-primary)]">
                  {todayApptsCount}
                </h3>
                <p className="text-[10px] font-black text-blue-500 dark:text-blue-400 uppercase tracking-wider mt-0.5">
                  {t.today}
                </p>
              </div>
              <div className="bg-indigo-50/70 dark:bg-indigo-900/30 rounded-2xl p-3 text-center border border-indigo-100 dark:border-indigo-900/30">
                <h3 className="text-2xl font-black text-[var(--text-primary)]">
                  {monthApptsCount}
                </h3>
                <p className="text-[10px] font-black text-indigo-500 dark:text-indigo-400 uppercase tracking-wider mt-0.5">
                  {t.thisMonth}
                </p>
              </div>
            </div>
          </div>

          {/* Card 3: Tái khám trong tháng */}
          <div className="bg-[var(--card-bg)] p-6 rounded-3xl shadow-sm border border-[var(--border-color)] flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-100 dark:border-amber-900/30">
              <RefreshCw size={22} />
            </div>
            <div>
              <p className="text-xs text-[var(--text-secondary)] font-extrabold uppercase tracking-wide">
                {t.followUpMonthTitle}
              </p>
              <h3 className="text-2xl font-black text-[var(--text-primary)] mt-1">
                {monthFollowUpCount}
              </h3>
              <p className="text-[10px] text-[var(--text-tertiary)] font-bold mt-0.5">
                {t.followUpMonthSub}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Attending Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left column: Registry & Patient cards */}
        <div className="lg:col-span-5 bg-[var(--card-bg)] rounded-3xl border border-[var(--border-color)] shadow-sm overflow-hidden flex flex-col max-h-[850px]">
          <div className="p-6 border-b border-[var(--border-color)] bg-[var(--bg-tertiary)]">
            <h2 className="text-lg font-black text-[var(--text-primary)] uppercase tracking-tight flex items-center gap-2">
              <Users size={18} className="text-primary" />
              {t.patientList}
            </h2>

            {/* Filter Tabs */}
            <div className="flex gap-1 bg-[var(--bg-tertiary)] p-1 rounded-xl mt-4">
              {[
                {
                  id: "confirmed",
                  label: t.waitingList,
                  color: "bg-primary text-white",
                },
                {
                  id: "completed",
                  label: t.completedList,
                  color: "bg-emerald-600 text-white",
                },
                {
                  id: "cancelled",
                  label: t.cancelledList,
                  color: "bg-rose-600 text-white",
                },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setSelectedAppt(null);
                    setWaitingFilter("today");
                  }}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                    activeTab === tab.id
                      ? tab.color
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Sub-filter: Chờ khám → Hôm nay / Chọn ngày; Đã khám / Đã hủy → Chọn ngày */}
            {activeTab === "confirmed" && (
              <div className="flex items-center gap-2 mt-3 flex-wrap">
                <button
                  onClick={() => setWaitingFilter("today")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    waitingFilter === "today"
                      ? "bg-primary text-white shadow-sm"
                      : "bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--border-color)]"
                  }`}
                >
                  {t.filterToday}
                </button>
                <button
                  onClick={() => setWaitingFilter("bydate")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    waitingFilter === "bydate"
                      ? "bg-primary text-white shadow-sm"
                      : "bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--border-color)]"
                  }`}
                >
                  {t.filterByDate}
                </button>
                {waitingFilter === "bydate" && (
                  <input
                    type="date"
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                    className="px-2 py-1 rounded-lg border border-[var(--border-color)] text-xs focus:ring-primary focus:border-primary outline-none text-[var(--text-primary)] bg-[var(--card-bg)]"
                  />
                )}
              </div>
            )}
            {(activeTab === "completed" || activeTab === "cancelled") && (
              <div className="flex items-center gap-2 mt-3">
                <span className="text-xs font-bold text-[var(--text-tertiary)]">
                  {t.viewDate}
                </span>
                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="px-2 py-1.5 rounded-lg border border-[var(--border-color)] text-xs focus:ring-primary focus:border-primary outline-none text-[var(--text-primary)] bg-[var(--card-bg)]"
                />
              </div>
            )}

            {/* Search Box */}
            <div className="relative mt-4">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]"
                size={16}
              />
              <input
                type="text"
                placeholder={t.searchPatient}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-[var(--border-color)] text-sm focus:ring-primary focus:border-primary bg-[var(--card-bg)] outline-none text-[var(--text-primary)]"
              />
            </div>
          </div>

          {/* List of cards */}
          <div className="flex-1 overflow-y-auto p-6 space-y-3">
            {filteredAppointments.length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle
                  className="mx-auto text-[var(--text-tertiary)] mb-2"
                  size={32}
                />
                <p className="text-sm font-bold text-[var(--text-tertiary)]">
                  {t.noPatient}
                </p>
              </div>
            ) : (
              filteredAppointments.map((appt) => {
                const isSelected = selectedAppt?._id === appt._id;
                return (
                  <div
                    key={appt._id}
                    onClick={() => handleSelectAppt(appt)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex justify-between items-center ${
                      isSelected
                        ? "bg-blue-50 dark:bg-blue-900/30 border-primary shadow-sm ring-1 ring-primary"
                        : "bg-[var(--card-bg)] border-[var(--border-color)] hover:border-[var(--border-color)] shadow-sm"
                    }`}
                  >
                    <div className="space-y-1 overflow-hidden pr-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-wider bg-blue-100 dark:bg-blue-900/30 text-primary px-2 py-0.5 rounded">
                          #{appt.queueNumber || "01"}
                        </span>
                        <span className="text-[10px] font-bold text-[var(--text-tertiary)] font-mono">
                          {appt.ticketNumber}
                        </span>
                      </div>
                      <h4 className="font-extrabold text-sm text-[var(--text-primary)] truncate">
                        {appt.patient?.fullName}
                      </h4>
                      {appt.parentAppointment && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-900/30 w-fit">
                          <RefreshCw size={9} />
                          {t.followUpBadge}
                        </span>
                      )}
                      <p className="text-xs text-[var(--text-secondary)] font-medium">
                        {appt.time} •{" "}
                        {new Date(appt.date).toLocaleDateString(locale)}
                      </p>
                      {appt.symptoms && (
                        <p className="text-xs text-[var(--text-tertiary)] truncate italic">
                          "{appt.symptoms}"
                        </p>
                      )}
                    </div>
                    <ChevronRight
                      size={16}
                      className={
                        isSelected
                          ? "text-primary"
                          : "text-[var(--text-tertiary)]"
                      }
                    />
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right column: Workspace diagnoses & prescription */}
        <div className="lg:col-span-7 space-y-6">
          {!selectedAppt ? (
            <div className="bg-[var(--card-bg)] rounded-3xl border border-[var(--border-color)] p-12 text-center shadow-sm h-full flex flex-col justify-center items-center min-h-[500px]">
              <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-primary mb-4 animate-bounce-slow">
                <Clipboard size={32} />
              </div>
              <h3 className="text-lg font-black text-[var(--text-primary)] uppercase tracking-tight">
                {t.detailsTitle}
              </h3>
              <p className="text-sm text-[var(--text-tertiary)] font-medium mt-2 max-w-sm">
                {t.selectToStart}
              </p>
            </div>
          ) : (
            <div className="bg-[var(--card-bg)] rounded-3xl border border-[var(--border-color)] shadow-sm p-6 space-y-6">
              {/* Patient Quick Header Info */}
              <div className="bg-[var(--bg-tertiary)] p-6 rounded-2xl border border-[var(--border-color)] space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-extrabold text-[var(--text-primary)] flex items-center gap-2 flex-wrap">
                      <UserCheck
                        className="text-emerald-500 dark:text-emerald-400"
                        size={20}
                      />
                      {selectedAppt.patient?.fullName}
                      {selectedAppt.parentAppointment && (
                        <span className="inline-flex items-center gap-1 text-xs font-black uppercase tracking-wider bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-3 py-1 rounded-full border border-amber-200 dark:border-amber-900/30">
                          <RefreshCw size={11} />
                          {t.followUpPatient}
                        </span>
                      )}
                    </h3>
                    <div className="flex gap-4 text-xs text-[var(--text-secondary)] font-bold mt-2">
                      <span>
                        {t.gender}:{" "}
                        <strong className="text-[var(--text-primary)]">
                          {selectedAppt.patient?.gender || "Nam"}
                        </strong>
                      </span>
                      {selectedAppt.patient?.dateOfBirth && (
                        <span>
                          {t.dob}:{" "}
                          <strong className="text-[var(--text-primary)]">
                            {new Date(
                              selectedAppt.patient?.dateOfBirth,
                            ).toLocaleDateString(locale)}
                          </strong>
                        </span>
                      )}
                      <span>
                        {t.phone}:{" "}
                        <strong className="text-[var(--text-primary)]">
                          {selectedAppt.patient?.phone}
                        </strong>
                      </span>
                    </div>
                  </div>
                  {/* Historical medical records search shortcut */}
                  <button
                    onClick={() => setShowHistoryModal(true)}
                    className="text-xs bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-black border border-indigo-100 dark:border-indigo-900/30 px-4 py-2 rounded-xl hover:bg-indigo-600 dark:hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                  >
                    {t.viewHistory}
                  </button>
                </div>

                {/* Patient Symptoms */}
                {selectedAppt.symptoms && (
                  <div className="p-3 bg-[var(--card-bg)] rounded-xl border border-[var(--border-color)]">
                    <p className="text-xs font-bold text-[var(--text-tertiary)] tracking-wider uppercase">
                      {t.symptoms}
                    </p>
                    <p className="text-sm text-[var(--text-primary)] font-bold mt-1">
                      "{selectedAppt.symptoms}"
                    </p>
                  </div>
                )}
              </div>

              {activeTab === "confirmed" ? (
                selectedAppt.status === "examining" ? (
                  // Diagnosis form when in confirmed queue list
                  <div className="space-y-6">
                    <div className="border-t border-[var(--border-color)] pt-6">
                      <h4 className="text-sm font-black text-[var(--text-primary)] uppercase tracking-wider mb-4 flex items-center gap-2">
                        <FileText size={16} className="text-primary" />
                        {t.diagnoseTitle}
                      </h4>

                      {/* Inputs */}
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-black text-[var(--text-secondary)] uppercase mb-1">
                            {t.diagnosisLabel}
                          </label>
                          <input
                            type="text"
                            required
                            value={diagnosis}
                            onChange={(e) => setDiagnosis(e.target.value)}
                            placeholder={t.diagnosisPlaceholder}
                            className="w-full px-4 py-3 rounded-xl border border-[var(--border-color)] text-sm focus:ring-primary focus:border-primary outline-none text-[var(--text-primary)] bg-[var(--card-bg)]"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-black text-[var(--text-secondary)] uppercase mb-1">
                            {t.adviceLabel}
                          </label>
                          <textarea
                            rows={3}
                            value={doctorNotes}
                            onChange={(e) => setDoctorNotes(e.target.value)}
                            placeholder={t.advicePlaceholder}
                            className="w-full px-4 py-3 rounded-xl border border-[var(--border-color)] text-sm focus:ring-primary focus:border-primary outline-none resize-none text-[var(--text-primary)] bg-[var(--card-bg)]"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Pharmacological Prescription Section */}
                    <div className="border-t border-[var(--border-color)] pt-6">
                      <h4 className="text-sm font-black text-[var(--text-primary)] uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Pill
                          size={16}
                          className="text-amber-500 dark:text-amber-400"
                        />
                        {t.prescribeTitle}
                      </h4>

                      <div className="bg-[var(--bg-tertiary)] p-4 rounded-2xl border border-[var(--border-color)] space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                          {/* Select Medicine */}
                          <div className="md:col-span-5">
                            <label className="block text-[10px] font-black text-[var(--text-secondary)] uppercase mb-1">
                              {t.medTableMed}
                            </label>
                            <input
                              type="text"
                              list="medicine-list"
                              value={medNameInput}
                              onChange={(e) => {
                                const val = e.target.value;
                                setMedNameInput(val);
                                const found = medicinesList.find(
                                  (m) =>
                                    m.name.toLowerCase() === val.toLowerCase(),
                                );
                                if (found && found.unit) setMedUnit(found.unit);
                              }}
                              placeholder={t.medPlaceholder}
                              className="w-full px-3 py-2 rounded-xl border border-[var(--border-color)] text-xs focus:ring-primary focus:border-primary outline-none bg-[var(--card-bg)] font-bold text-[var(--text-primary)]"
                            />
                            <datalist id="medicine-list">
                              {medicinesList.map((med) => (
                                <option key={med._id} value={med.name} />
                              ))}
                            </datalist>
                          </div>

                          {/* Unit */}
                          <div className="md:col-span-3">
                            <label className="block text-[10px] font-black text-[var(--text-secondary)] uppercase mb-1">
                              {t.unitLabel}
                            </label>
                            <input
                              type="text"
                              value={medUnit}
                              onChange={(e) => setMedUnit(e.target.value)}
                              placeholder={t.unitPlaceholder}
                              className="w-full px-3 py-2 rounded-xl border border-[var(--border-color)] text-xs focus:ring-primary focus:border-primary outline-none bg-[var(--card-bg)] font-bold text-[var(--text-primary)]"
                            />
                          </div>

                          {/* Frequency */}
                          <div className="md:col-span-4">
                            <label className="block text-[10px] font-black text-[var(--text-secondary)] uppercase mb-1">
                              {t.frequency}
                            </label>
                            <input
                              type="text"
                              value={medFrequency}
                              onChange={(e) => setMedFrequency(e.target.value)}
                              className="w-full px-3 py-2 rounded-xl border border-[var(--border-color)] text-xs focus:ring-primary focus:border-primary outline-none bg-[var(--card-bg)] font-bold text-[var(--text-primary)]"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                          {/* Duration */}
                          <div className="md:col-span-4">
                            <label className="block text-[10px] font-black text-[var(--text-secondary)] uppercase mb-1">
                              {t.duration}
                            </label>
                            <input
                              type="text"
                              value={medDuration}
                              onChange={(e) => setMedDuration(e.target.value)}
                              className="w-full px-3 py-2 rounded-xl border border-[var(--border-color)] text-xs focus:ring-primary focus:border-primary outline-none bg-[var(--card-bg)] font-bold text-[var(--text-primary)]"
                            />
                          </div>

                          {/* Qty */}
                          <div className="md:col-span-3">
                            <label className="block text-[10px] font-black text-[var(--text-secondary)] uppercase mb-1">
                              {t.qty}
                            </label>
                            <input
                              type="number"
                              min={1}
                              value={medQuantity}
                              onChange={(e) => setMedQuantity(e.target.value)}
                              className="w-full px-3 py-2 rounded-xl border border-[var(--border-color)] text-xs focus:ring-primary focus:border-primary outline-none bg-[var(--card-bg)] font-bold text-[var(--text-primary)]"
                            />
                          </div>

                          <div className="md:col-span-5 flex items-end">
                            <button
                              type="button"
                              onClick={handleAddMedicine}
                              className="w-full py-2 bg-amber-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 hover:bg-amber-600 transition-all shadow-md shadow-amber-500/10"
                            >
                              <Plus size={14} />
                              {t.btnAddMed}
                            </button>
                          </div>
                        </div>

                        {/* Prescribed Table */}
                        {prescribedMedicines.length > 0 && (
                          <div className="border border-[var(--border-color)] rounded-xl overflow-hidden bg-[var(--card-bg)]">
                            <table className="w-full text-left text-xs border-collapse">
                              <thead>
                                <tr className="bg-[var(--bg-tertiary)] border-b border-[var(--border-color)] text-[var(--text-secondary)] font-extrabold">
                                  <th className="p-3">{t.medTableMed}</th>
                                  <th className="p-3">{t.unitLabel}</th>
                                  <th className="p-3">{t.medTableQty}</th>
                                  <th className="p-3 text-right">
                                    {t.medTableCost}
                                  </th>
                                  <th className="p-3 text-center"></th>
                                </tr>
                              </thead>
                              <tbody>
                                {prescribedMedicines.map((med, index) => (
                                  <tr
                                    key={med.name || index}
                                    className="border-b border-[var(--border-color)] text-[var(--text-primary)] font-bold hover:bg-[var(--bg-tertiary)]"
                                  >
                                    <td className="p-3">
                                      <p className="font-extrabold">
                                        {med.name}
                                      </p>
                                      <p className="text-[10px] text-[var(--text-tertiary)] font-medium">
                                        {med.frequency} • {med.duration}
                                      </p>
                                    </td>
                                    <td className="p-3">{med.dosage}</td>
                                    <td className="p-3">{med.quantity}</td>
                                    <td className="p-3 text-right">
                                      {(
                                        med.unitPrice * med.quantity
                                      ).toLocaleString("vi-VN")}
                                      đ
                                    </td>
                                    <td className="p-3 text-center">
                                      <button
                                        onClick={() =>
                                          handleRemoveMedicine(med.name)
                                        }
                                        className="text-rose-500 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 p-1"
                                      >
                                        <Trash2 size={14} />
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Diagnostic Lab Test Orders Section */}
                    <div className="border-t border-[var(--border-color)] pt-6">
                      <h4 className="text-sm font-black text-[var(--text-primary)] uppercase tracking-wider mb-4 flex items-center gap-2">
                        <FileText
                          size={16}
                          className="text-blue-500 dark:text-blue-400"
                        />
                        {t.labRequestTitle}
                      </h4>

                      <div className="bg-[var(--bg-tertiary)] p-4 rounded-2xl border border-[var(--border-color)] space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                          <div className="md:col-span-5">
                            <label className="block text-[10px] font-black text-[var(--text-secondary)] uppercase mb-1">
                              {t.labTestType}
                            </label>
                            <select
                              value={newTestType}
                              onChange={(e) => setNewTestType(e.target.value)}
                              className="w-full px-3 py-2 rounded-xl border border-[var(--border-color)] text-xs focus:ring-primary focus:border-primary outline-none bg-[var(--card-bg)] font-bold text-[var(--text-primary)]"
                            >
                              <option value="blood">{t.optBlood}</option>
                              <option value="urine">{t.optUrine}</option>
                              <option value="xray">{t.optXray}</option>
                              <option value="ultrasound">
                                {t.optUltrasound}
                              </option>
                              <option value="ct">{t.optCt}</option>
                              <option value="mri">{t.optMri}</option>
                              <option value="ecg">{t.optEcg}</option>
                              <option value="other">{t.optOther}</option>
                            </select>
                          </div>

                          <div className="md:col-span-7">
                            <label className="block text-[10px] font-black text-[var(--text-secondary)] uppercase mb-1">
                              {t.labTestName}
                            </label>
                            <input
                              type="text"
                              value={newTestName}
                              onChange={(e) => setNewTestName(e.target.value)}
                              placeholder={t.testNamePh}
                              className="w-full px-3 py-2 rounded-xl border border-[var(--border-color)] text-xs focus:ring-primary focus:border-primary outline-none bg-[var(--card-bg)] font-bold text-[var(--text-primary)]"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                          <div className="md:col-span-8">
                            <label className="block text-[10px] font-black text-[var(--text-secondary)] uppercase mb-1">
                              {t.labTestNotes}
                            </label>
                            <input
                              type="text"
                              value={testNotes}
                              onChange={(e) => setTestNotes(e.target.value)}
                              placeholder={t.testNotesPh}
                              className="w-full px-3 py-2 rounded-xl border border-[var(--border-color)] text-xs focus:ring-primary focus:border-primary outline-none bg-[var(--card-bg)] font-bold text-[var(--text-primary)]"
                            />
                          </div>

                          <div className="md:col-span-4 flex items-end">
                            <button
                              type="button"
                              onClick={handleAddLabTest}
                              className="w-full py-2 bg-blue-600 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 hover:bg-blue-700 transition-all shadow-md shadow-blue-500/10"
                            >
                              <Plus size={14} />
                              {t.btnAddTest}
                            </button>
                          </div>
                        </div>

                        {/* Lab Test Requests list */}
                        {labTests.length > 0 && (
                          <div className="border border-[var(--border-color)] rounded-xl overflow-hidden bg-[var(--card-bg)]">
                            <table className="w-full text-left text-xs border-collapse">
                              <thead>
                                <tr className="bg-[var(--bg-tertiary)] border-b border-[var(--border-color)] text-[var(--text-secondary)] font-extrabold">
                                  <th className="p-3">{t.testTableType}</th>
                                  <th className="p-3">{t.testTableName}</th>
                                  <th className="p-3">{t.clinicalNotesCol}</th>
                                  <th className="p-3 text-center"></th>
                                </tr>
                              </thead>
                              <tbody>
                                {labTests.map((test, idx) => (
                                  <tr
                                    key={idx}
                                    className="border-b border-[var(--border-color)] text-[var(--text-primary)] font-bold hover:bg-[var(--bg-tertiary)]"
                                  >
                                    <td className="p-3 uppercase tracking-wider text-[10px] text-primary">
                                      {test.testType}
                                    </td>
                                    <td className="p-3 text-[var(--text-primary)] font-extrabold">
                                      {test.testName}
                                    </td>
                                    <td className="p-3 text-[var(--text-tertiary)] font-medium">
                                      {test.clinicalNotes}
                                    </td>
                                    <td className="p-3 text-center">
                                      <button
                                        onClick={() => handleRemoveLabTest(idx)}
                                        className="text-rose-500 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 p-1"
                                      >
                                        <Trash2 size={14} />
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}

                        {labTests.length > 0 && (
                          <div className="mt-4 flex justify-end">
                            <button
                              type="button"
                              onClick={handleSendLabRequest}
                              className="px-6 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-bold rounded-xl text-sm hover:from-teal-600 hover:to-emerald-600 shadow-md shadow-emerald-500/20 flex items-center gap-2 transition-all"
                            >
                              <Send size={16} />
                              {t.sendLabNow}
                            </button>
                          </div>
                        )}

                        {sentRequests.length > 0 && (
                          <div className="mt-6 border-t border-[var(--border-color)] pt-4">
                            <div className="flex items-center justify-between mb-3">
                              <h5 className="text-xs font-bold text-[var(--text-primary)] uppercase">
                                {t.sentLabRequests}
                              </h5>
                              <button
                                onClick={() =>
                                  fetchSentRequests(selectedAppt._id)
                                }
                                className="text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 p-1 flex items-center gap-1 text-xs font-bold bg-blue-50 dark:bg-blue-900/30 rounded-lg px-2"
                              >
                                <RefreshCw
                                  size={12}
                                  className={
                                    loadingRequests ? "animate-spin" : ""
                                  }
                                />{" "}
                                {t.refresh}
                              </button>
                            </div>

                            <div className="space-y-3">
                              {sentRequests.map((req) => (
                                <div
                                  key={req._id}
                                  className="border border-[var(--border-color)] rounded-xl p-4 bg-[var(--card-bg)] shadow-sm flex items-start justify-between"
                                >
                                  <div>
                                    <div className="flex items-center gap-2 mb-2">
                                      <span
                                        className={`px-2 py-0.5 text-[10px] font-bold rounded-md uppercase ${req.status === "completed" ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" : req.status === "in_progress" ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400" : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400"}`}
                                      >
                                        {req.status === "completed"
                                          ? t.labCompleted
                                          : req.status === "in_progress"
                                            ? t.labInProgress
                                            : t.labPending}
                                      </span>
                                      {req.paymentStatus === "unpaid" && (
                                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-md uppercase bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400">
                                          {t.awaitingLabPay}
                                        </span>
                                      )}
                                      <span className="text-xs text-[var(--text-secondary)] font-mono flex items-center gap-1">
                                        <Clock size={10} />{" "}
                                        {new Date(
                                          req.createdAt,
                                        ).toLocaleTimeString(locale)}
                                      </span>
                                    </div>
                                    <ul className="list-disc pl-4 text-xs text-[var(--text-primary)] font-medium space-y-1">
                                      {req.tests?.map((t, i) => (
                                        <li key={i}>
                                          {t.testName}{" "}
                                          <span className="text-[var(--text-tertiary)]">
                                            ({t.testType})
                                          </span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>

                                  <div className="flex flex-col gap-2 items-end shrink-0">
                                    {req.status === "completed" &&
                                      req.result &&
                                      req.result.files &&
                                      req.result.files.length > 0 && (
                                        <>
                                          {req.result.files.map((f, idx) => (
                                            <a
                                              key={idx}
                                              href={`${API_URL}${f.fileUrl}`}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="px-3 py-1.5 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-900/30 rounded-lg text-xs font-bold hover:bg-green-100 dark:hover:bg-green-900/50 flex items-center gap-1.5 transition-colors"
                                              title={f.fileName}
                                            >
                                              <FileText size={14} />
                                              {t.viewResult}{" "}
                                              {req.result.files.length > 1
                                                ? idx + 1
                                                : ""}
                                            </a>
                                          ))}
                                        </>
                                      )}
                                    {req.status !== "completed" && (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          openCancelLabConfirm(req)
                                        }
                                        className="px-3 py-1.5 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/30 rounded-lg text-xs font-bold hover:bg-rose-100 dark:hover:bg-rose-900/50 flex items-center gap-1.5 transition-colors"
                                        title={t.cancelLabTitleShort}
                                      >
                                        <Trash2 size={14} />
                                        {t.cancelLabBtn}
                                      </button>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Follow-up Section */}
                    <div className="border-t border-[var(--border-color)] pt-6">
                      <div className="flex items-center gap-3 mb-4">
                        <input
                          type="checkbox"
                          id="requireFollowUp"
                          checked={requireFollowUp}
                          onChange={(e) => setRequireFollowUp(e.target.checked)}
                          className="w-4 h-4 text-primary rounded border-[var(--border-color)] focus:ring-primary cursor-pointer"
                        />
                        <label
                          htmlFor="requireFollowUp"
                          className="text-sm font-black text-[var(--text-primary)] uppercase tracking-wider cursor-pointer"
                        >
                          {t.followUpRequire}
                        </label>
                      </div>

                      {requireFollowUp && (
                        <div className="bg-[var(--bg-tertiary)] p-4 rounded-2xl border border-[var(--border-color)] space-y-4 animate-in fade-in slide-in-from-top-2">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[10px] font-black text-[var(--text-secondary)] uppercase mb-1">
                                {t.followUpDate}
                              </label>
                              <input
                                type="date"
                                required={requireFollowUp}
                                min={getTomorrowString()}
                                value={followUpDate}
                                onChange={(e) =>
                                  setFollowUpDate(e.target.value)
                                }
                                className="w-full px-3 py-2 rounded-xl border border-[var(--border-color)] text-sm focus:ring-primary focus:border-primary outline-none text-[var(--text-primary)] bg-[var(--card-bg)]"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-black text-[var(--text-secondary)] uppercase mb-1">
                                {t.followUpTimeLabel}
                              </label>
                              <select
                                required={requireFollowUp}
                                value={followUpTime}
                                onChange={(e) =>
                                  setFollowUpTime(e.target.value)
                                }
                                disabled={!followUpDate || loadingFollowUpTimes}
                                className="w-full px-3 py-2 rounded-xl border border-[var(--border-color)] text-sm focus:ring-primary focus:border-primary outline-none bg-[var(--card-bg)] disabled:bg-[var(--bg-tertiary)] disabled:cursor-not-allowed text-[var(--text-primary)]"
                              >
                                {!followUpDate ? (
                                  <option value="">{t.selectDateFirst}</option>
                                ) : loadingFollowUpTimes ? (
                                  <option value="">{t.loadingDutyHours}</option>
                                ) : availableFollowUpTimes.length === 0 ? (
                                  <option value="">{t.noShiftsDate}</option>
                                ) : (
                                  <>
                                    <option value="">{t.selectTime}</option>
                                    {availableFollowUpTimes.map((t) => (
                                      <option key={t} value={t}>
                                        {t}
                                      </option>
                                    ))}
                                  </>
                                )}
                              </select>
                            </div>
                          </div>
                          <div>
                            <label className="block text-[10px] font-black text-[var(--text-secondary)] uppercase mb-1">
                              {t.followUpNotes}
                            </label>
                            <textarea
                              rows={2}
                              value={followUpNotes}
                              onChange={(e) => setFollowUpNotes(e.target.value)}
                              placeholder={t.followUpNotesPh}
                              className="w-full px-3 py-2 rounded-xl border border-[var(--border-color)] text-sm focus:ring-primary focus:border-primary outline-none resize-none text-[var(--text-primary)] bg-[var(--card-bg)]"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Submission deck */}
                    <div className="border-t border-[var(--border-color)] pt-6 flex justify-end gap-3">
                      <button
                        onClick={() => setSelectedAppt(null)}
                        className="px-6 py-3 rounded-2xl bg-[var(--bg-tertiary)] text-[var(--text-secondary)] font-extrabold text-sm hover:bg-[var(--border-color)] transition-all"
                      >
                        {t.close}
                      </button>
                      {hasOpenLabRequests && (
                        <p className="text-xs text-amber-700 dark:text-amber-400 font-bold mr-auto max-w-md text-left">
                          {t.labPendingBlock}
                        </p>
                      )}
                      <button
                        onClick={handleSubmitDiagnosis}
                        disabled={hasOpenLabRequests}
                        className={`px-6 py-3 rounded-2xl font-extrabold text-sm transition-all shadow-lg flex items-center gap-2 ${
                          hasOpenLabRequests
                            ? "bg-gray-300 text-gray-500 cursor-not-allowed shadow-none"
                            : "bg-primary text-white hover:bg-blue-800 shadow-blue-500/25"
                        }`}
                      >
                        <CheckCircle2 size={16} />
                        {t.btnSubmitConsult}
                      </button>
                    </div>
                  </div>
                ) : (
                  // Waiting view
                  <div className="space-y-6 flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-primary mb-4">
                      <Clock size={32} />
                    </div>
                    <h4 className="text-lg font-black text-[var(--text-primary)] uppercase tracking-wider mb-2">
                      {t.waitingExamTitle}
                    </h4>
                    <p className="text-sm text-[var(--text-secondary)] mb-6 max-w-md">
                      {t.waitingExamDesc}
                    </p>
                    {isTimeReached(selectedAppt) ? (
                      <button
                        onClick={handleStartExamination}
                        className="px-8 py-3 rounded-2xl bg-primary text-white font-extrabold text-sm hover:bg-blue-800 transition-all shadow-lg shadow-blue-500/25 flex items-center gap-2"
                      >
                        <Activity size={18} />
                        {t.startExam}
                      </button>
                    ) : (
                      <button
                        disabled
                        className="px-8 py-3 rounded-2xl bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] font-extrabold text-sm flex items-center gap-2 cursor-not-allowed border border-[var(--border-color)]"
                      >
                        <Clock size={18} />
                        {t.notTimeYet}
                      </button>
                    )}
                  </div>
                )
              ) : (
                // Diagnosis summary view when looking at Completed/Cancelled list
                <div className="space-y-6">
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 font-bold text-sm flex items-center gap-2">
                    <CheckCircle2 size={18} />
                    {activeTab === "completed"
                      ? t.completedVisit
                      : t.cancelledVisitShort}
                  </div>

                  {loadingHistory ? (
                    <div className="text-center py-6 text-[var(--text-tertiary)] font-medium">
                      {t.loadingRecord}
                    </div>
                  ) : (
                    patientHistory
                      .filter((h) => h.appointment._id === selectedAppt._id)
                      .map((hist, idx) => (
                        <div key={idx} className="space-y-6">
                          {hist.prescription && (
                            <div className="bg-[var(--bg-tertiary)] p-6 rounded-2xl border border-[var(--border-color)] space-y-4">
                              <h4 className="text-sm font-black text-[var(--text-primary)] uppercase tracking-wider flex items-center gap-2">
                                <FileText
                                  size={16}
                                  className="text-emerald-500 dark:text-emerald-400"
                                />
                                Hồ sơ chẩn đoán & Đơn thuốc
                              </h4>

                              <div className="grid grid-cols-2 gap-4 text-xs font-bold text-[var(--text-secondary)]">
                                <div>
                                  <span className="text-[var(--text-tertiary)] uppercase tracking-wider">
                                    Chẩn đoán:
                                  </span>
                                  <p className="text-sm text-[var(--text-primary)] font-extrabold mt-1">
                                    {hist.prescription.diagnosis}
                                  </p>
                                </div>
                                {hist.prescription.doctorNotes && (
                                  <div>
                                    <span className="text-[var(--text-tertiary)] uppercase tracking-wider">
                                      Lời dặn bác sĩ:
                                    </span>
                                    <p className="text-sm text-[var(--text-primary)] font-extrabold mt-1">
                                      {hist.prescription.doctorNotes}
                                    </p>
                                  </div>
                                )}
                              </div>

                              {hist.prescription.medicines &&
                                hist.prescription.medicines.length > 0 && (
                                  <div className="border border-[var(--border-color)] rounded-xl overflow-hidden bg-[var(--card-bg)] mt-4">
                                    <table className="w-full text-left text-xs border-collapse">
                                      <thead>
                                        <tr className="bg-[var(--bg-tertiary)] border-b border-[var(--border-color)] text-[var(--text-secondary)] font-extrabold">
                                          <th className="p-3">
                                            {t.medTableMed}
                                          </th>
                                          <th className="p-3">
                                            {t.medTableDosage}
                                          </th>
                                          <th className="p-3">
                                            {t.medTableQty}
                                          </th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {hist.prescription.medicines.map(
                                          (med, mIdx) => (
                                            <tr
                                              key={mIdx}
                                              className="border-b border-[var(--border-color)] text-[var(--text-primary)] font-bold"
                                            >
                                              <td className="p-3">
                                                <p className="font-extrabold text-[var(--text-primary)]">
                                                  {med.name}
                                                </p>
                                                <p className="text-[10px] text-[var(--text-tertiary)] font-medium">
                                                  {med.frequency} •{" "}
                                                  {med.duration}
                                                </p>
                                              </td>
                                              <td className="p-3">
                                                {med.dosage}
                                              </td>
                                              <td className="p-3">
                                                {med.quantity}
                                              </td>
                                            </tr>
                                          ),
                                        )}
                                      </tbody>
                                    </table>
                                  </div>
                                )}
                            </div>
                          )}

                          {hist.labRequests && hist.labRequests.length > 0 && (
                            <div className="bg-[var(--bg-tertiary)] p-6 rounded-2xl border border-[var(--border-color)] space-y-4">
                              <h4 className="text-sm font-black text-[var(--text-primary)] uppercase tracking-wider flex items-center gap-2">
                                <FlaskConical
                                  size={16}
                                  className="text-blue-500 dark:text-blue-400"
                                />
                                Chỉ định cận lâm sàng & Kết quả
                              </h4>

                              <div className="space-y-3">
                                {hist.labRequests.map((req, rIdx) => (
                                  <div
                                    key={rIdx}
                                    className="p-4 bg-[var(--card-bg)] rounded-xl border border-[var(--border-color)] space-y-2"
                                  >
                                    <div className="flex justify-between items-center mb-2">
                                      <span className="text-[10px] font-black uppercase tracking-wider bg-blue-50 dark:bg-blue-900/30 text-primary px-2 py-0.5 rounded">
                                        {req.tests?.length
                                          ? `${req.tests.length} Chỉ định`
                                          : "Chỉ định cận lâm sàng"}
                                      </span>
                                      <span
                                        className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                                          req.status === "completed"
                                            ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
                                            : "bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400"
                                        }`}
                                      >
                                        {req.status === "completed"
                                          ? "Đã có kết quả"
                                          : "Đang chờ xử lý"}
                                      </span>
                                    </div>

                                    {/* List of tests in this request */}
                                    <div className="space-y-2">
                                      {req.tests &&
                                        req.tests.map((test, tIdx) => (
                                          <div
                                            key={tIdx}
                                            className="pl-2 border-l-2 border-[var(--border-color)]"
                                          >
                                            <div className="flex items-center gap-2">
                                              <span className="text-[9px] font-bold bg-[var(--bg-tertiary)] px-1.5 py-0.5 rounded uppercase text-[var(--text-secondary)]">
                                                {test.testType}
                                              </span>
                                              <h5 className="font-extrabold text-sm text-[var(--text-primary)]">
                                                {test.testName}
                                              </h5>
                                            </div>
                                            {test.clinicalNotes && (
                                              <p className="text-xs text-[var(--text-tertiary)] font-medium mt-1">
                                                Ghi chú: {test.clinicalNotes}
                                              </p>
                                            )}
                                          </div>
                                        ))}
                                    </div>

                                    {req.result && (
                                      <div className="mt-3 pt-3 border-t border-[var(--border-color)] bg-[var(--bg-tertiary)] p-3 rounded-lg space-y-2">
                                        <p className="text-xs font-black text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-1">
                                          <Info
                                            size={12}
                                            className="text-primary"
                                          />
                                          Kết luận / Kết quả xét nghiệm
                                        </p>
                                        <p className="text-sm text-[var(--text-primary)] font-bold whitespace-pre-wrap">
                                          {req.result.notes || "Bình thường"}
                                        </p>

                                        {/* Files */}
                                        {req.result.files &&
                                          req.result.files.length > 0 && (
                                            <div className="mt-2 flex flex-wrap gap-2">
                                              {req.result.files.map(
                                                (file, fIdx) => (
                                                  <a
                                                    key={fIdx}
                                                    href={`${API_URL}${file.fileUrl}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="px-3 py-1.5 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-lg text-xs text-primary font-bold hover:border-primary/50 flex items-center gap-1.5 transition-all shadow-sm"
                                                  >
                                                    <Printer size={12} />
                                                    {file.fileName ||
                                                      `Tải File Kết Quả ${fIdx + 1}`}
                                                  </a>
                                                ),
                                              )}
                                            </div>
                                          )}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))
                  )}

                  <div className="flex justify-end pt-4 border-t border-[var(--border-color)]">
                    <button
                      onClick={() => setSelectedAppt(null)}
                      className="px-6 py-2.5 rounded-xl bg-[var(--bg-tertiary)] text-[var(--text-secondary)] font-extrabold text-sm hover:bg-[var(--border-color)] transition-all"
                    >
                      {t.close}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Cancel lab request confirmation */}
      {cancelLabConfirm.show && (
        <div className="fixed inset-0 w-screen h-screen bg-gray-900/50 backdrop-blur-sm z-[10000] flex items-center justify-center p-4">
          <div className="bg-[var(--card-bg)] w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-[var(--border-color)] space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
              <AlertCircle size={28} className="shrink-0" />
              <h3 className="font-black text-lg text-[var(--text-primary)]">
                {t.cancelLabTitle}
              </h3>
            </div>
            <p className="text-sm font-semibold text-[var(--text-secondary)] leading-relaxed">
              {t.cancelLabMessage}
            </p>
            {cancelLabConfirm.label && (
              <p className="text-xs font-bold text-[var(--text-primary)] bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-xl px-3 py-2">
                {cancelLabConfirm.label}
              </p>
            )}
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={closeCancelLabConfirm}
                className="px-4 py-2.5 border border-[var(--border-color)] hover:bg-[var(--bg-tertiary)] rounded-xl text-sm font-bold text-[var(--text-primary)] transition-all"
              >
                {t.btnKeepLab}
              </button>
              <button
                type="button"
                onClick={confirmCancelLabRequest}
                className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-rose-600/20 transition-all"
              >
                {t.btnConfirmCancelLab}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full Patient Past Medical History Modal */}
      {showHistoryModal && selectedAppt && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
          <div className="bg-[var(--card-bg)] rounded-3xl w-full max-w-4xl max-h-[85vh] shadow-2xl overflow-hidden flex flex-col relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setShowHistoryModal(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--border-color)] z-10"
            >
              <X size={18} />
            </button>

            {/* Modal Header */}
            <div className="p-6 border-b border-[var(--border-color)] bg-[var(--bg-tertiary)]">
              <h3 className="text-lg font-black text-[var(--text-primary)] uppercase tracking-tight flex items-center gap-2">
                <Clipboard size={20} className="text-primary" />
                {t.historyTitle}:{" "}
                <span className="text-primary">
                  {selectedAppt.patient?.fullName}
                </span>
              </h3>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {loadingHistory ? (
                <div className="text-center py-12 text-[var(--text-tertiary)] font-medium">
                  {t.loadingHistory}
                </div>
              ) : (
                <>
                  {patientProfile && patientProfile.healthProfile && (
                    <div className="bg-blue-50/50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-900/30 p-5 space-y-4">
                      <h4 className="text-sm font-black text-blue-900 dark:text-blue-100 uppercase tracking-wider flex items-center gap-2">
                        <UserCheck
                          size={16}
                          className="text-blue-500 dark:text-blue-400"
                        />
                        {t.healthBasic}
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                        <div className="bg-white dark:bg-[var(--card-bg)] p-3 rounded-xl border border-blue-50 dark:border-blue-900/30 shadow-sm">
                          <span className="text-[var(--text-tertiary)] uppercase tracking-wider font-bold block mb-1">
                            {t.bloodType}
                          </span>
                          <span className="text-[var(--text-primary)] font-black text-sm">
                            {patientProfile.healthProfile.bloodType || "--"}
                          </span>
                        </div>
                        <div className="bg-white dark:bg-[var(--card-bg)] p-3 rounded-xl border border-blue-50 dark:border-blue-900/30 shadow-sm">
                          <span className="text-[var(--text-tertiary)] uppercase tracking-wider font-bold block mb-1">
                            {t.bloodPressure}
                          </span>
                          <span className="text-[var(--text-primary)] font-black text-sm">
                            {patientProfile.healthProfile.bloodPressure || "--"}
                          </span>
                        </div>
                        <div className="bg-white dark:bg-[var(--card-bg)] p-3 rounded-xl border border-blue-50 dark:border-blue-900/30 shadow-sm">
                          <span className="text-[var(--text-tertiary)] uppercase tracking-wider font-bold block mb-1">
                            {t.height}
                          </span>
                          <span className="text-[var(--text-primary)] font-black text-sm">
                            {patientProfile.healthProfile.height
                              ? patientProfile.healthProfile.height + " cm"
                              : "--"}
                          </span>
                        </div>
                        <div className="bg-white dark:bg-[var(--card-bg)] p-3 rounded-xl border border-blue-50 dark:border-blue-900/30 shadow-sm">
                          <span className="text-[var(--text-tertiary)] uppercase tracking-wider font-bold block mb-1">
                            {t.weight}
                          </span>
                          <span className="text-[var(--text-primary)] font-black text-sm">
                            {patientProfile.healthProfile.weight
                              ? patientProfile.healthProfile.weight + " kg"
                              : "--"}
                          </span>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <div className="bg-white dark:bg-[var(--card-bg)] p-3 rounded-xl border border-blue-50 dark:border-blue-900/30 shadow-sm">
                          <span className="text-[var(--text-tertiary)] uppercase tracking-wider font-bold block mb-1">
                            {t.allergies}
                          </span>
                          <span className="text-[var(--text-primary)] font-bold">
                            {patientProfile.healthProfile.allergies || t.none}
                          </span>
                        </div>
                        <div className="bg-white dark:bg-[var(--card-bg)] p-3 rounded-xl border border-blue-50 dark:border-blue-900/30 shadow-sm">
                          <span className="text-[var(--text-tertiary)] uppercase tracking-wider font-bold block mb-1">
                            {t.medHistory}
                          </span>
                          <span className="text-[var(--text-primary)] font-bold">
                            {patientProfile.healthProfile.medicalHistory ||
                              t.none}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  <h4 className="text-sm font-black text-[var(--text-primary)] uppercase tracking-wider flex items-center gap-2 pt-2">
                    <Clipboard size={16} className="text-primary" />
                    {t.consultHistory}
                  </h4>

                  {patientHistory.length === 0 ? (
                    <div className="text-center py-8 border border-dashed border-[var(--border-color)] rounded-2xl">
                      <AlertCircle
                        className="mx-auto text-[var(--text-tertiary)] mb-2"
                        size={32}
                      />
                      <p className="text-sm font-bold text-[var(--text-tertiary)]">
                        {t.noHistory}
                      </p>
                    </div>
                  ) : (
                    patientHistory.map((hist, idx) => (
                      <div
                        key={idx}
                        className="border border-[var(--border-color)] rounded-2xl p-5 space-y-4 hover:border-[var(--border-color)] transition-colors bg-[var(--card-bg)]"
                      >
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-[var(--border-color)] pb-3 gap-2">
                          <div>
                            <span className="text-[10px] font-black uppercase tracking-wider bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded">
                              {t.date}:{" "}
                              {new Date(
                                hist.appointment.date,
                              ).toLocaleDateString(locale)}
                            </span>
                            <p className="text-xs text-[var(--text-secondary)] font-bold mt-1">
                              {t.doctor}:{" "}
                              <strong className="text-[var(--text-primary)]">
                                {hist.appointment.doctor?.userId?.fullName}
                              </strong>
                            </p>
                          </div>
                          <span className="text-xs font-mono font-bold text-[var(--text-tertiary)]">
                            #{hist.appointment.ticketNumber}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-bold text-[var(--text-secondary)]">
                          <div>
                            <span className="text-[var(--text-tertiary)] uppercase tracking-wider">
                              {t.treatment}:
                            </span>
                            <p className="text-sm text-[var(--text-primary)] font-extrabold mt-1">
                              {hist.prescription?.diagnosis ||
                                "Khám chuyên khoa"}
                            </p>
                            {hist.prescription?.doctorNotes && (
                              <p className="text-xs text-[var(--text-secondary)] font-bold mt-1">
                                Lời dặn: {hist.prescription.doctorNotes}
                              </p>
                            )}
                          </div>

                          {hist.prescription?.medicines &&
                            hist.prescription.medicines.length > 0 && (
                              <div>
                                <span className="text-[var(--text-tertiary)] uppercase tracking-wider">
                                  {t.medicines}:
                                </span>
                                <ul className="list-disc pl-4 mt-1 space-y-1 text-[var(--text-primary)]">
                                  {hist.prescription.medicines.map(
                                    (m, mIdx) => (
                                      <li key={mIdx}>
                                        <strong className="text-[var(--text-primary)]">
                                          {m.name}
                                        </strong>{" "}
                                        • {m.dosage} ({m.quantity} viên) -{" "}
                                        {m.frequency}
                                      </li>
                                    ),
                                  )}
                                </ul>
                              </div>
                            )}
                        </div>

                        {hist.labRequests && hist.labRequests.length > 0 && (
                          <div className="pt-3 border-t border-[var(--border-color)] space-y-2">
                            <span className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider">
                              {t.labResults}:
                            </span>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {hist.labRequests.map((req, rIdx) => (
                                <div
                                  key={rIdx}
                                  className="p-3 bg-[var(--bg-tertiary)] rounded-xl border border-[var(--border-color)] text-xs font-bold space-y-1"
                                >
                                  <div className="flex justify-between items-center text-[10px]">
                                    <span className="uppercase text-primary font-black">
                                      {req.testType}
                                    </span>
                                    <span className="text-emerald-600 dark:text-emerald-400 font-black">
                                      {req.status === "completed"
                                        ? "Đã hoàn thành"
                                        : "Đang xử lý"}
                                    </span>
                                  </div>
                                  <p className="text-[var(--text-primary)] font-extrabold">
                                    {req.testName}
                                  </p>
                                  {req.result && (
                                    <p className="text-[var(--text-secondary)] font-medium italic mt-1 bg-[var(--card-bg)] p-2 rounded border border-[var(--border-color)]">
                                      Kết luận: {req.result.conclusion}
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {hist.followUpAppointment && (
                          <div className="pt-3 border-t border-[var(--border-color)] space-y-2">
                            <span className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider">
                              {t.followUpAppt}:
                            </span>
                            <div className="p-3 bg-indigo-50/50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-900/30 text-xs font-bold space-y-1">
                              <p className="text-indigo-900 dark:text-indigo-100 font-extrabold flex items-center gap-1">
                                <Calendar
                                  size={12}
                                  className="text-indigo-500 dark:text-indigo-400"
                                />
                                {new Date(
                                  hist.followUpAppointment.date,
                                ).toLocaleDateString(locale)}{" "}
                                - {hist.followUpAppointment.time}
                              </p>
                              <p className="text-indigo-700 dark:text-indigo-300 font-medium">
                                {hist.followUpAppointment.symptoms}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-[var(--bg-tertiary)] border-t border-[var(--border-color)] flex justify-end">
              <button
                onClick={() => setShowHistoryModal(false)}
                className="px-6 py-2.5 rounded-xl bg-[var(--border-color)] text-[var(--text-primary)] font-extrabold text-sm hover:bg-[var(--border-color)] transition-all"
              >
                {t.close}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorDashboard;
