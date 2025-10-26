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
    localStorage.removeItem("cvmaster_user")
    localStorage.removeItem("token")
    localStorage.removeItem("cvmaster_profile")
    },
     getProfile: async () => {
    try {
      const token = localStorage.getItem("token")

      if (!token) {
        throw new Error("No authentication token found.")
      }

      const response = await axios.get(`${API_URL}/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      })

      // حفظ البيانات في localStorage (اختياري)
    //   localStorage.setItem("cvmaster_profile", JSON.stringify(response.data.profile))

      return response.data.profile
    } catch (error: any) {
      throw error.response?.data || error.message
    }
  },
};