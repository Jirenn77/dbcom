import { Bar } from 'react-chartjs-2';

const data = {
  labels: agingReport.map(entry => entry.CustomerName),
  datasets: [
    {
      label: 'Total Amount Due',
      data: agingReport.map(entry => entry.TotalAmountDue),
      backgroundColor: 'rgba(75, 192, 192, 0.6)',
      borderColor: 'rgba(75, 192, 192, 1)',
      borderWidth: 1,
    },
  ],
};

return (
  <Bar data={data} />
);
