const ExcelJS = require('exceljs');
const Visit = require('../models/Visit');
const Doctor = require('../models/Doctor');

const getVisitsReportData = async (doctorId, startDate, endDate) => {
  const query = { doctorId };
  if (startDate && endDate) {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    query.visitDate = { $gte: start, $lte: end };
  }

  const visits = await Visit.find(query)
    .populate('patientId', 'name mobile patientId age gender')
    .sort({ visitDate: -1 });
    
  return visits;
};

const generateVisitsExcel = async (doctorId, startDate, endDate) => {
  const visits = await getVisitsReportData(doctorId, startDate, endDate);

  const doctor = await Doctor.findById(doctorId);

  const workbook = new ExcelJS.Workbook();
  workbook.creator = doctor.clinicName;
  const sheet = workbook.addWorksheet('Consultations');

  sheet.columns = [
    { header: 'Visit Date', key: 'date', width: 15 },
    { header: 'Visit ID', key: 'visitId', width: 15 },
    { header: 'Patient ID', key: 'patientId', width: 15 },
    { header: 'Patient Name', key: 'name', width: 25 },
    { header: 'Mobile', key: 'mobile', width: 15 },
    { header: 'Age/Gender', key: 'demographics', width: 15 },
    { header: 'Diagnosis', key: 'diagnosis', width: 30 },
    { header: 'Treatment', key: 'treatment', width: 40 }
  ];

  sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  sheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF1E3A8A' } 
  };
  sheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

  visits.forEach((v) => {
    sheet.addRow({
      date: new Date(v.visitDate).toLocaleDateString(),
      visitId: v.visitId,
      patientId: v.patientId?.patientId || 'N/A',
      name: v.patientId?.name || 'Unknown Patient',
      mobile: v.patientId?.mobile || 'N/A',
      demographics: v.patientId ? `${v.patientId.age} / ${v.patientId.gender.charAt(0)}` : 'N/A',
      diagnosis: v.diagnosis,
      treatment: v.treatment
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
};

module.exports = {
  generateVisitsExcel,
  getVisitsReportData
};
