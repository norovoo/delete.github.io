import axios from 'axios';
import config from '../config'; // Adjust the path to your configuration file if necessary

const LAMBDA_URL = 'https://6d6qnwzps73kzauiqbl6nkdrwy0ylkcn.lambda-url.us-east-1.on.aws/orders';
const API_KEY = 'a2F8ZikP6c37aDLijmdFb1o4YCDEG0Mc20ZX31TL'; // Your API key for secure Lambda endpoint

// Fetch technician locations with a specific technician ID
export const getTechnicianLocations = async (token, technicianId) => {
  try {
    const url = `${config.BASE_URL}/api/locations/getLocation`;
    console.log(`Fetching technician location from: ${url} with technicianId: ${technicianId}`);

    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` },
      params: { ID: technicianId }, // Pass technicianId as a query parameter
    });

    console.log("Technician location data retrieved successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching technician location:', error);
    throw error;
  }
};

// Fetch all jobs data
export const fetchJobs = async () => {
  try {
    const response = await axios.get(`${config.BASE_URL}/api/jobs`);
    console.log("Jobs data retrieved successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching jobs:', error);
    throw error;
  }
};

// Fetch measurements data
export const getMeasurements = async (token) => {
  try {
    const url = `${config.BASE_URL}/api/measurements`;
    console.log(`Fetching measurements from: ${url}`);

    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    console.log("Measurements data retrieved successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching measurements:', error);
    throw error;
  }
};

// Fetch orders with filters from Lambda
export const fetchOrders = async (filters = {}) => {
  const { location, lotNumber, orderNumber } = filters;

  try {
    console.log(`Fetching orders with filters: ${JSON.stringify(filters)}`);
    
    const response = await axios.get(LAMBDA_URL, {
      headers: { 'x-api-key': API_KEY },
      params: { location, lotNumber, orderNumber },
    });

    console.log("Orders data retrieved successfully:", response.data);
    return response.data.orders;
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
};

// Fetch recent orders from Lambda
export const fetchRecentOrders = async () => {
  try {
    const response = await axios.get('https://6d6qnwzps73kzauiqbl6nkdrwy0ylkcn.lambda-url.us-east-1.on.aws/orders', {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.data && response.data.orders) {
      return response.data.orders;
    } else {
      console.error('Unexpected API response structure:', response.data);
      return [];
    }
  } catch (error) {
    console.error('Error fetching recent orders:', error);
    throw error;
  }
};