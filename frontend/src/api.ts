import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

export const analyzeDam = async (data: FormData) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/analyze`, data, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error analyzing dam:', error);
        throw error;
    }
};

export const compareDams = async (data: FormData) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/compare`, data, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error comparing dams:', error);
        throw error;
    }
};

export const fetchAssets = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/assets`);
        return response.data;
    } catch (error) {
        console.error('Error fetching assets:', error);
        throw error;
    }
};