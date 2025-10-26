import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api';

export const authService = {
    register: async (userData: any) => {
        try {
            const response = await axios.post(`${API_URL}/register`, userData);
              if (response.data.access_token) {
                localStorage.setItem('cvmaster_user', JSON.stringify(response.data.user));
                localStorage.setItem('token', response.data.access_token);
            }
            return response.data;
        } catch (error: any) {
            throw error.response?.data || error.message;
        }
    },

    login: async (credentials: any) => {
        try {
            const response = await axios.post(`${API_URL}/login`, credentials);
            if (response.data.access_token) {
                localStorage.setItem('cvmaster_user', JSON.stringify(response.data.user));
                localStorage.setItem('token', response.data.access_token);
            }
            return response.data;
        } catch (error: any) {
            throw error.response?.data || error.message;
        }
    },

    logout: () => {
        localStorage.removeItem('user');
    }
};