const Doctor = require('../models/Doctor');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

const signup = async (data) => {
  const { doctorName, clinicName, email, password } = data;

  const doctorExists = await Doctor.findOne({ email });
  if (doctorExists) {
    throw new Error('Doctor with this email already exists');
  }

  const doctor = await Doctor.create({
    doctorName,
    clinicName,
    email,
    password
  });

  return {
    _id: doctor._id,
    doctorName: doctor.doctorName,
    clinicName: doctor.clinicName,
    email: doctor.email,
    token: generateToken(doctor._id)
  };
};

const login = async (email, password) => {
  const doctor = await Doctor.findOne({ email });

  if (doctor && (await doctor.matchPassword(password))) {
    return {
      _id: doctor._id,
      doctorName: doctor.doctorName,
      clinicName: doctor.clinicName,
      email: doctor.email,
      token: generateToken(doctor._id)
    };
  } else {
    throw new Error('Invalid email or password');
  }
};

const updateProfile = async (doctorId, data) => {
  const { doctorName, clinicName } = data;
  const doctor = await Doctor.findByIdAndUpdate(
    doctorId,
    { doctorName, clinicName },
    { new: true, runValidators: true }
  ).select('-password');

  if (!doctor) {
    throw new Error('Doctor not found');
  }
  return doctor;
};

const changePassword = async (doctorId, currentPassword, newPassword) => {
  const doctor = await Doctor.findById(doctorId);
  if (!doctor) {
    throw new Error('Doctor not found');
  }

  const isMatch = await doctor.matchPassword(currentPassword);
  if (!isMatch) {
    throw new Error('Incorrect current password');
  }

  doctor.password = newPassword;
  await doctor.save();
  return true;
};

const getProfile = async (doctorId) => {
  const doctor = await Doctor.findById(doctorId).select('-password');
  if (!doctor) {
    throw new Error('Doctor not found');
  }
  return doctor;
};

module.exports = {
  signup,
  login,
  getProfile,
  updateProfile,
  changePassword
};
