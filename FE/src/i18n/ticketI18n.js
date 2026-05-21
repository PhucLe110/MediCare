/** Shared queue ticket modal strings (Dashboard, History, AppointmentDetail) */
export const ticketTrans = {
  vi: {
    viewTicket: 'Xem phiếu STT',
    ticketTitle: 'PHIẾU HẸN & SỐ THỨ TỰ',
    ticketSubtitle: 'Hệ thống Y tế thông minh MediCare',
    yourQueue: 'Số Thứ Tự Của Bạn',
    watchMonitor: 'Vui lòng theo dõi bảng điện tử tại sảnh chờ',
    ticketId: 'Mã ca khám:',
    patient: 'Bệnh nhân:',
    physician: 'Bác sĩ khám:',
    department: 'Chuyên khoa:',
    schedule: 'Thời gian:',
    printTicket: 'In phiếu',
    close: 'Đóng',
    medicalTicket: 'Phiếu Khám Bệnh',
  },
  en: {
    viewTicket: 'View Ticket',
    ticketTitle: 'QUEUE TICKET',
    ticketSubtitle: 'MediCare Smart Hospital System',
    yourQueue: 'Your Queue Number',
    watchMonitor: 'Please watch the monitor in the waiting hall',
    ticketId: 'Ticket ID:',
    patient: 'Patient:',
    physician: 'Physician:',
    department: 'Department:',
    schedule: 'Schedule:',
    printTicket: 'Print Ticket',
    close: 'Close',
    medicalTicket: 'Medical Ticket',
  },
};

export const mergeTrans = (base, extra) => ({
  vi: { ...base.vi, ...extra.vi },
  en: { ...base.en, ...extra.en },
});
