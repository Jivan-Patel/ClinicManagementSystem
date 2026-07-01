const Patient = require('../models/Patient');
const Visit = require('../models/Visit');

const getDashboardStats = async (doctorId) => {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  // Total Patients
  const totalPatients = await Patient.countDocuments({ doctorId, archived: false });

  // Today's Visits
  const todaysVisits = await Visit.countDocuments({
    doctorId,
    visitDate: { $gte: startOfToday, $lte: endOfToday }
  });

  // New Patients This Month
  const newPatientsThisMonth = await Patient.countDocuments({
    doctorId,
    archived: false,
    createdAt: { $gte: startOfMonth }
  });

  // Returning Patients Today
  const todaysVisitsData = await Visit.find({
    doctorId,
    visitDate: { $gte: startOfToday, $lte: endOfToday }
  }).populate({
    path: 'patientId',
    match: { createdAt: { $lt: startOfToday } }
  }).exec();

  const returningPatientsToday = todaysVisitsData.filter(v => v.patientId !== null).length;

  // Recent Patients
  const recentPatients = await Patient.find({ doctorId, archived: false })
    .sort({ createdAt: -1 })
    .limit(5)
    .select('patientId name mobile totalVisits createdAt');

  // Recent Visits
  const recentVisits = await Visit.find({ doctorId })
    .sort({ visitDate: -1 })
    .limit(5)
    .populate('patientId', 'name mobile patientId')
    .select('visitDate diagnosis treatment');

  return {
    totalPatients,
    todaysVisits,
    newPatientsThisMonth,
    returningPatientsToday,
    recentPatients,
    recentVisits
  };
};

module.exports = {
  getDashboardStats
};
