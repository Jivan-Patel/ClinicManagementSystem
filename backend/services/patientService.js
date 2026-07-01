const Patient = require('../models/Patient');
const Visit = require('../models/Visit');

const generatePatientId = async (doctorId) => {
  const count = await Patient.countDocuments({ doctorId });
  return `PT-${(count + 1).toString().padStart(5, '0')}`;
};

const createPatient = async (doctorId, data) => {
  const patientId = await generatePatientId(doctorId);
  const patient = await Patient.create({
    ...data,
    doctorId,
    patientId
  });
  return patient;
};

const getPatients = async (doctorId, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  
  const patients = await Patient.find({ doctorId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
    
  const total = await Patient.countDocuments({ doctorId });
  
  return {
    patients,
    pagination: {
      total,
      page: Number(page),
      pages: Math.ceil(total / limit)
    }
  };
};

const getPatientById = async (doctorId, id) => {
  const patient = await Patient.findOne({ _id: id, doctorId });
  if (!patient) {
    throw new Error('Patient not found');
  }
  return patient;
};

const updatePatient = async (doctorId, id, data) => {
  const patient = await Patient.findOneAndUpdate(
    { _id: id, doctorId },
    data,
    { new: true, runValidators: true }
  );
  if (!patient) {
    throw new Error('Patient not found');
  }
  return patient;
};

const searchPatients = async (doctorId, query) => {
  if (!query) return [];
  
  // Search by exact patientId, or regex name/mobile
  const searchRegex = new RegExp(query, 'i');
  
  const patients = await Patient.find({
    doctorId,
    $or: [
      { name: searchRegex },
      { mobile: searchRegex },
      { patientId: searchRegex }
    ]
  })
  .limit(10)
  .sort({ name: 1 });
  
  // Also fetch their last visit for the dropdown
  const patientsWithVisit = await Promise.all(patients.map(async (p) => {
    const lastVisit = await Visit.findOne({ patientId: p._id }).sort({ visitDate: -1 });
    return {
      ...p.toObject(),
      lastVisitDate: lastVisit ? lastVisit.visitDate : null
    };
  }));

  return patientsWithVisit;
};

const checkDuplicate = async (doctorId, data) => {
  const { name, mobile, address, age } = data;
  
  // Search for potential matches (same name OR same mobile)
  const potentialMatches = await Patient.find({
    doctorId,
    $or: [
      { mobile: mobile },
      { name: new RegExp('^' + name.trim() + '$', 'i') }
    ]
  });

  if (!potentialMatches.length) {
    return { duplicate: false };
  }

  const scoredMatches = [];

  for (const p of potentialMatches) {
    const isSameMobile = p.mobile === mobile;
    const isSameName = p.name.toLowerCase().trim() === name.toLowerCase().trim();
    const isSameAddress = p.address.toLowerCase().trim() === address.toLowerCase().trim();
    const isSameAge = p.age === age;

    let priority = 0;

    if (isSameName && isSameMobile) {
      priority = 4; // Highest confidence
    } else if (isSameName && isSameAddress) {
      priority = 3;
    } else if (isSameName && isSameAge) {
      priority = 2;
    } else if (isSameMobile) {
      priority = 1;
    }

    if (priority > 0) {
      const lastVisit = await Visit.findOne({ patientId: p._id }).sort({ visitDate: -1 });
      scoredMatches.push({
        _id: p._id,
        patientId: p.patientId,
        name: p.name,
        age: p.age,
        gender: p.gender,
        mobile: p.mobile,
        lastVisit: lastVisit ? lastVisit.visitDate : null,
        priority
      });
    }
  }

  if (!scoredMatches.length) {
    return { duplicate: false };
  }

  // Sort by priority descending (highest confidence first)
  scoredMatches.sort((a, b) => b.priority - a.priority);

  // Remove priority key before returning
  const matches = scoredMatches.map(({ priority, ...rest }) => rest);

  return {
    duplicate: true,
    matches
  };
};

module.exports = {
  createPatient,
  getPatients,
  getPatientById,
  updatePatient,
  searchPatients,
  checkDuplicate
};
