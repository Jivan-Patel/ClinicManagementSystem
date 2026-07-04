const reportService = require('../services/reportService');

const exportVisitsExcel = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const buffer = await reportService.generateVisitsExcel(req.doctor.id, startDate, endDate);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=Consultations_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
    
    return res.status(200).send(buffer);
  } catch (error) {
    next(error);
  }
};

const getReportData = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const visits = await reportService.getVisitsReportData(req.doctor.id, startDate, endDate);
    res.status(200).json({ success: true, data: visits });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  exportVisitsExcel,
  getReportData
};
