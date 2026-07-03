const mongoose = require('mongoose');

const visitSchema = new mongoose.Schema({
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true,
    index: true
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true,
    index: true
  },
  visitId: {
    type: String,
    required: true
  },
  visitDate: {
    type: Date,
    required: true,
    default: Date.now,
    index: true
  },
  diagnosis: {
    type: String,
    required: true
  },
  treatment: {
    type: String,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Visit', visitSchema);
