import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Register the necessary components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const API_URL = 'https://3h1r5eijb8.execute-api.us-east-1.amazonaws.com/default/ordersByMonths';
const API_KEY = 'a2F8ZikP6c37aDLijmdFb1o4YCDEG0Mc20ZX31TL';

const MonthlyOrdersChart = () => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const response = await axios.get(API_URL, {
          headers: { 'x-api-key': API_KEY },
        });

        const data = response.data.groupedOrders;
        const labels = data.map((item) => item.monthYear);
        const counts = data.map((item) => item.count);

        setChartData({
          labels,
          datasets: [
            {
              label: 'Orders by Month',
              data: counts,
              backgroundColor: 'rgba(75, 192, 192, 0.5)',
              borderColor: 'rgba(75, 192, 192, 1)',
              borderWidth: 1,
            },
          ],
        });
      } catch (err) {
        setError('Failed to fetch chart data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchChartData();
  }, []);

  if (loading) return <div>Loading chart...</div>;
  if (error) return <div>{error}</div>;

  return <Bar data={chartData} />;
};

export default MonthlyOrdersChart;