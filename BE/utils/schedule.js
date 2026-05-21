const ShiftRequest = require('../models/ShiftRequest');
const {
  SLOT_TIMES_BOOKING,
  SLOT_TIMES_SHIFT,
  DEFAULT_SHIFT_PATTERN
} = require('../constants/appointment');

const isWorkingDayForPattern = (pattern, dayOfWeek) => {
  if (pattern === 'Cả tuần') return true;
  if (pattern === 'T2-T3-T4' && [1, 2, 3].includes(dayOfWeek)) return true;
  if (pattern === 'T5-T6-T7' && [4, 5, 6].includes(dayOfWeek)) return true;
  if (pattern === 'T2-T4-T6' && [1, 3, 5].includes(dayOfWeek)) return true;
  if (pattern === 'T3-T5-T7' && [2, 4, 6].includes(dayOfWeek)) return true;
  return false;
};

const applyApprovedShiftRequests = (baseTimes, approvedRequests) => {
  let times = [...baseTimes];
  for (const request of approvedRequests) {
    for (const t of (request.times || [])) {
      if (request.type === 'cancel') {
        times = times.filter(bt => bt !== t);
      } else if (request.type === 'add' && !times.includes(t)) {
        times.push(t);
      }
    }
  }
  return times.sort();
};

const getDayOfWeek = (dateStr) => {
  const dateObj = dateStr.includes('T') ? new Date(dateStr) : new Date(dateStr + 'T00:00:00');
  return dateObj.getDay();
};

const getBaseTimesForPattern = (pattern, dayOfWeek, slotSet = 'booking') => {
  if (dayOfWeek === 0) return [];
  if (!isWorkingDayForPattern(pattern, dayOfWeek)) return [];
  const slots = slotSet === 'shift' ? SLOT_TIMES_SHIFT : SLOT_TIMES_BOOKING;
  return [...slots];
};

const getEffectiveTimesForDate = async (doctorId, date, doctor, slotSet = 'booking') => {
  const dayOfWeek = getDayOfWeek(date);
  if (dayOfWeek === 0) return [];

  const pattern = doctor.shiftPattern || DEFAULT_SHIFT_PATTERN;
  let times = getBaseTimesForPattern(pattern, dayOfWeek, slotSet);

  const approvedRequests = await ShiftRequest.find({
    doctor: doctorId,
    date,
    status: 'approved'
  });

  return applyApprovedShiftRequests(times, approvedRequests);
};

const buildMonthlySchedule = async (doctorId, doctor, year, month, slotSet = 'shift') => {
  const pattern = doctor.shiftPattern || DEFAULT_SHIFT_PATTERN;
  const daysInMonth = new Date(year, month, 0).getDate();
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const endDate = `${year}-${String(month).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}`;

  const approvedRequests = await ShiftRequest.find({
    doctor: doctorId,
    status: 'approved',
    date: { $gte: startDate, $lte: endDate }
  });

  const schedule = [];
  for (let day = 1; day <= daysInMonth; day++) {
    const d = new Date(year, month - 1, day);
    const dayOfWeek = d.getDay();
    if (dayOfWeek === 0) continue;

    let times = getBaseTimesForPattern(pattern, dayOfWeek, slotSet);
    const dateString = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayReqs = approvedRequests.filter(r => r.date === dateString);
    times = applyApprovedShiftRequests(times, dayReqs);

    if (times.length > 0) {
      schedule.push({ date: dateString, dayOfWeek, times });
    }
  }

  return schedule;
};

module.exports = {
  isWorkingDayForPattern,
  applyApprovedShiftRequests,
  getEffectiveTimesForDate,
  buildMonthlySchedule,
  getDayOfWeek
};
