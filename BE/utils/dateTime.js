const getVietnamDateTime = () => {
  const d = new Date();
  const utc = d.getTime() + (d.getTimezoneOffset() * 60000);
  const vnTime = new Date(utc + (3600000 * 7));
  const year = vnTime.getFullYear();
  const month = String(vnTime.getMonth() + 1).padStart(2, '0');
  const day = String(vnTime.getDate()).padStart(2, '0');
  const hour = String(vnTime.getHours()).padStart(2, '0');
  const min = String(vnTime.getMinutes()).padStart(2, '0');
  return {
    date: `${year}-${month}-${day}`,
    time: `${hour}:${min}`
  };
};

const normalizeAppointmentDate = (date) => {
  if (!date) return '';
  return String(date).includes('T') ? String(date).slice(0, 10) : String(date);
};

/** Đã đến hoặc qua giờ hẹn (GMT+7) */
const isAppointmentTimeReached = (appt) => {
  if (!appt?.date || !appt?.time) return false;
  const vn = getVietnamDateTime();
  const apptDate = normalizeAppointmentDate(appt.date);
  if (apptDate < vn.date) return true;
  if (apptDate > vn.date) return false;
  return appt.time <= vn.time;
};

module.exports = { getVietnamDateTime, normalizeAppointmentDate, isAppointmentTimeReached };
