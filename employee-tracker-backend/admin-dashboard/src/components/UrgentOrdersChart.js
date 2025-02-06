import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const API_URL = 'https://6v5iu8ksq1.execute-api.us-east-1.amazonaws.com/default/urgentOrders'; // New function URL
const API_KEY = 'a2F8ZikP6c37aDLijmdFb1o4YCDEG0Mc20ZX31TL';

const UrgentOrdersChart = () => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lotNumbers, setLotNumbers] = useState([]); // To store lot numbers for a clicked bar
  const [selectedMonth, setSelectedMonth] = useState(''); // To store the clicked month

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const response = await axios.get(API_URL, {
          headers: { 'x-api-key': API_KEY },
        });

        const data = response.data.urgentOrders;
        const labels = data.map((item) => item.monthYear);
        const counts = data.map((item) => item.count);

        setChartData({
          labels,
          datasets: [
            {
              label: 'Urgent Orders',
              data: counts,
              backgroundColor: 'rgba(255, 99, 132, 0.5)',
              borderColor: 'rgba(255, 99, 132, 1)',
              borderWidth: 1,
            },
          ],
          urgentOrderDetails: data, // Store full data for bar click handling
        });
      } catch (err) {
        setError('Failed to fetch urgent orders data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchChartData();
  }, []);

  const handleBarClick = (elements) => {
    if (!elements.length) return;

    const index = elements[0].index; // Get index of clicked bar
    const monthYear = chartData.labels[index];
    setSelectedMonth(monthYear);

    // Get lot numbers for the clicked bar
    const clickedData = chartData.urgentOrderDetails.find((item) => item.monthYear === monthYear);
    setLotNumbers(clickedData ? clickedData.lots : []);
  };

  if (loading) return <div>Loading chart...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <Bar
        data={chartData}
        options={{
          onClick: (_, elements) => handleBarClick(elements),
          plugins: {
            tooltip: {
              callbacks: {
                label: (context) => `Orders: ${context.raw}`,
              },
            },
          },
        }}
      />

      {/* Display Lot Numbers */}
      {lotNumbers.length > 0 && (
        <div className="lot-numbers">
          <h4>Lot Numbers for {selectedMonth}:</h4>
          <ul>
            {lotNumbers.map((lot, index) => (
              <li key={index}>{lot}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default UrgentOrdersChart;