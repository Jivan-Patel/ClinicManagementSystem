const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true,
    index: true
  },
  patientId: {
    type: String,
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  age: {
    type: Number,
    required: true
  },
  gender: {
    type: String,
    required: true,
    enum: ['Male', 'Female', 'Other']
  },
  address: {
    type: String,
    required: true
  },
  mobile: {
    type: String,
    required: true,
    index: true
  },
  totalVisits: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

// Compound index for search optimization
patientSchema.index({ doctorId: 1, name: 1, mobile: 1 });

module.exports = mongoose.model('Patient', patientSchema);
