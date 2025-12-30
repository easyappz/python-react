import instance from './axios';

export const getProfitLoss = async (period = 'current_month', dateFrom = null, dateTo = null) => {
  const params = { period };
  if (period === 'custom' && dateFrom && dateTo) {
    params.date_from = dateFrom;
    params.date_to = dateTo;
  }
  const response = await instance.get('/api/reports/profit-loss/', { params });
  return response.data;
};

export const getCashFlow = async (period = 'current_month', dateFrom = null, dateTo = null) => {
  const params = { period };
  if (period === 'custom' && dateFrom && dateTo) {
    params.date_from = dateFrom;
    params.date_to = dateTo;
  }
  const response = await instance.get('/api/reports/cash-flow/', { params });
  return response.data;
};

export const getTaxReport = async (period = 'current_month', dateFrom = null, dateTo = null) => {
  const params = { period };
  if (period === 'custom' && dateFrom && dateTo) {
    params.date_from = dateFrom;
    params.date_to = dateTo;
  }
  const response = await instance.get('/api/reports/tax/', { params });
  return response.data;
};

export const exportReport = async (reportType, format, period = 'current_month', dateFrom = null, dateTo = null) => {
  const params = { 
    report_type: reportType, 
    format,
    period
  };
  if (period === 'custom' && dateFrom && dateTo) {
    params.date_from = dateFrom;
    params.date_to = dateTo;
  }
  const response = await instance.get('/api/reports/export/', { 
    params,
    responseType: 'blob'
  });
  return response.data;
};
