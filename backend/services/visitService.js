const Visit = require('../models/Visit');
const Patient = require('../models/Patient');

const generateVisitId = async (doctorId) => {
  const count = await Visit.countDocuments({ doctorId });
  return `V-${(count + 1).toString().padStart(6, '0')}`;
};

const createVisit = async (doctorId, data) => {
  const { patientId, diagnosis, treatment } = data;
  
  // Verify patient exists and belongs to doctor
  const patient = await Patient.findOne({ _id: patientId, doctorId });
  if (!patient) {
    throw new Error('Patient not found or unauthorized');
  }

  const visitId = await generateVisitId(doctorId);
  
  const visit = await Visit.create({
    doctorId,
    patientId,
    visitId,
    diagnosis,
    treatment
  });

  // Increment totalVisits
  patient.totalVisits += 1;
  await patient.save();

  return visit;
};

const getPatientVisits = async (doctorId, patientId) => {
  // Verify ownership
  const patient = await Patient.findOne({ _id: patientId, doctorId });
  if (!patient) {
    throw new Error('Patient not found or unauthorized');
  }

  const visits = await Visit.find({ doctorId, patientId }).sort({ visitDate: -1 });
  return visits;
};

const updateVisit = async (doctorId, id, data) => {
  const { diagnosis, treatment } = data;
  const visit = await Visit.findOneAndUpdate(
    { _id: id, doctorId },
    { diagnosis, treatment },
    { new: true, runValidators: true }
  );
  if (!visit) {
    throw new Error('Visit not found or unauthorized');
  }
  return visit;
};

const deleteVisit = async (doctorId, id) => {
  const visit = await Visit.findOne({ _id: id, doctorId });
  if (!visit) {
    throw new Error('Visit not found or unauthorized');
  }

  await Visit.deleteOne({ _id: id });

  // Decrement totalVisits
  await Patient.findByIdAndUpdate(visit.patientId, { $inc: { totalVisits: -1 } });

  return visit;
};

module.exports = {
  createVisit,
  getPatientVisits,
  updateVisit,
  deleteVisit
};
