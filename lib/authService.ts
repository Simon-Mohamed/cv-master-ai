// import axios from "axios";

// const API_URL = "http://127.0.0.1:8000/api";

// // Function to get token
// const getAuthHeaders = () => {
//   const token = localStorage.getItem("token");
//   return {
//     Authorization: `Bearer ${token}`,
//     Accept: "application/json",
//   };
// };

// export const authService = {
//   // ============================
//   // AUTH
//   // ============================
//   register: async (userData: any) => {
//     const res = await axios.post(`${API_URL}/register`, userData);
//     if (res.data.access_token) {
//       localStorage.setItem("cvmaster_user", JSON.stringify(res.data.user));
//       localStorage.setItem("token", res.data.access_token);
//     }
//     return res.data;
//   },

//   login: async (credentials: any) => {
//     const res = await axios.post(`${API_URL}/login`, credentials);
//     if (res.data.access_token) {
//       localStorage.setItem("cvmaster_user", JSON.stringify(res.data.user));
//       localStorage.setItem("token", res.data.access_token);
//     }
//     return res.data;
//   },

//   logout: () => {
//     localStorage.removeItem("cvmaster_user");
//     localStorage.removeItem("token");
//     localStorage.removeItem("cvmaster_profile");
//   },

//   // ============================
//   // PROFILE
//   // ============================
//   getProfile: async () => {
//     const res = await axios.get(`${API_URL}/profile`, {
//       headers: getAuthHeaders(),
//     });
//     return res.data.profile;
//   },

//   updateProfile: async (profileData: any) => {
//     const payload = { ...profileData, _method: "PUT" };

//     const res = await axios.post(`${API_URL}/profile`, payload, {
//       headers: getAuthHeaders(),
//     });

//     localStorage.setItem("cvmaster_profile", JSON.stringify(res.data.profile));
//     return res.data.profile;
//   },

//   // ============================
//   // USERS CRUD
//   // ============================
//   getAllUsers: async () => {
//     const res = await axios.get(`${API_URL}/admin/users`, {
//       headers: getAuthHeaders(),
//     });
//     return res.data;
//   },

//   getUserById: async (id: number) => {
//     const res = await axios.get(`${API_URL}/admin/users/${id}`, {
//       headers: getAuthHeaders(),
//     });
//     return res.data;
//   },

//   addUser: async (userData: any) => {
//     const res = await axios.post(`${API_URL}/admin/users`, userData, {
//       headers: getAuthHeaders(),
//     });
//     return res.data;
//   },

//   updateUser: async (id: number, data: any) => {
//     const filteredData: any = {};
//     Object.keys(data).forEach((k) => {
//       if (data[k] !== "" && data[k] !== null) filteredData[k] = data[k];
//     });

//     const res = await axios.put(`${API_URL}/admin/users/${id}`, filteredData, {
//       headers: getAuthHeaders(),
//     });
//     return res.data;
//   },

//   deleteUser: async (id: number) => {
//     const res = await axios.delete(`${API_URL}/admin/users/${id}`, {
//       headers: getAuthHeaders(),
//     });
//     return res.data;
//   },

//   // ============================
//   // COMPANIES CRUD
//   // ============================
//   getAllCompanies: async () => {
//     const res = await axios.get(`${API_URL}/admin/companies`, {
//       headers: getAuthHeaders(),
//     });
//     return res.data; // returns array
//   },

//   createCompany: async (companyData: any) => {
//     const res = await axios.post(`${API_URL}/admin/companies`, companyData, {
//       headers: getAuthHeaders(),
//     });
//     return res.data; // returns created company
//   },

//   updateCompany: async (id: number, data: any) => {
//     const payload = { ...data, _method: "PUT" };

//     const res = await axios.post(`${API_URL}/admin/companies/${id}`, payload, {
//       headers: getAuthHeaders(),
//     });

//     return res.data.company ?? res.data; // FIXED
//   },

//   deleteCompany: async (id: number) => {
//     const res = await axios.delete(`${API_URL}/admin/companies/${id}`, {
//       headers: getAuthHeaders(),
//     });
//     return res.data;
//   },

//   // ============================
//   // JOBS
//   // ============================
//   getAllJobs: async () => {
//     const res = await axios.get(`${API_URL}/jobs`, {
//       headers: getAuthHeaders(),
//     });
//     return res.data;
//   },

//   applyToJob: async (jobId: number, formData: FormData) => {
//     const res = await axios.post(
//       `${API_URL}/jobs/${jobId}/apply`,
//       formData,
//       {
//         headers: {
//           ...getAuthHeaders(),
//           "Content-Type": "multipart/form-data",
//         },
//       }
//     );
//     return res.data;
//   },

//   createJob: async (jobData: any) => {
//     const res = await axios.post(`${API_URL}/admin/jobs`, jobData, {
//       headers: getAuthHeaders(),
//     });
//     return res.data;
//   },

//   updateJob: async (id: number, data: any) => {
//     const payload = { ...data, _method: "PUT" };

//     const res = await axios.post(`${API_URL}/admin/jobs/${id}`, payload, {
//       headers: getAuthHeaders(),
//     });
//     return res.data;
//   },

//   deleteJob: async (id: number) => {
//     const res = await axios.delete(`${API_URL}/admin/jobs/${id}`, {
//       headers: getAuthHeaders(),
//     });
//     return res.data;
//   },
// };
import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api";

export const authService = {
  // ============================
  // 🔹 AUTHENTICATION
  // ============================

  // Register User
  register: async (userData: any) => {
    try {
      const response = await axios.post(`${API_URL}/register`, userData);
      if (response.data.access_token) {
        localStorage.setItem("cvmaster_user", JSON.stringify(response.data.user));
        localStorage.setItem("token", response.data.access_token);
      }
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  },

  // Login User
  login: async (credentials: any) => {
    try {
      const response = await axios.post(`${API_URL}/login`, credentials);
      if (response.data.access_token) {
        localStorage.setItem("cvmaster_user", JSON.stringify(response.data.user));
        localStorage.setItem("token", response.data.access_token);
      }
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  },

  // Logout
  logout: () => {
    localStorage.removeItem("cvmaster_user");
    localStorage.removeItem("token");
    localStorage.removeItem("cvmaster_profile");
  },

  // ============================
  // 🔹 USER PROFILE
  // ============================

  // Get Profile
  getProfile: async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found.");

      const response = await axios.get(`${API_URL}/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      return response.data.profile;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  },

  // Update Profile
  updateProfile: async (profileData: any) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found.");

      const payload = { ...profileData, _method: "PUT" };

      const response = await axios.post(`${API_URL}/profile`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      localStorage.setItem("cvmaster_profile", JSON.stringify(response.data.profile));
      return response.data.profile;
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        console.error("Error updating profile:", error.response?.data);
        throw error.response?.data || error.message;
      } else {
        console.error("Unexpected error:", error);
        throw error;
      }
    }
  },

  // ============================
  // 🔹 ADMIN CRUDS
  // ============================

  // ----- USERS -----
  getAllUsers: async () => {
    const token = localStorage.getItem("token");
    const res = await axios.get(`${API_URL}/admin/users`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  getUserById: async (id: number) => {
    const token = localStorage.getItem("token");
    const res = await axios.get(`${API_URL}/admin/users/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  addUser: async (userData: any) => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Authentication token is missing.");

    try {
      const res = await axios.post(`${API_URL}/admin/users`, userData, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
      return res.data;
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to add user. Please try again.";
      console.error("Error adding user:", error?.response?.data || message);
      throw new Error(message);
    }
  },

updateUser: async (id: number, data: any) => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Authentication token is missing.");

  try {
    // إزالة الحقول الفارغة لتجنب مشاكل Laravel validation
    const filteredData: any = {};
    Object.keys(data).forEach((key) => {
      if (data[key] !== "" && data[key] !== null && data[key] !== undefined) {
        filteredData[key] = data[key];
      }
    });

    const res = await axios.put(`${API_URL}/admin/users/${id}`, filteredData, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });

    return res.data;
  } catch (error: any) {
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Failed to update user. Please try again.";
    console.error("Error updating user:", error?.response?.data || message);
    throw new Error(message);
  }
},


  deleteUser: async (id: number) => {
    const token = localStorage.getItem("token");
    const res = await axios.delete(`${API_URL}/admin/users/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  // ----- COMPANIES -----
  getAllCompanies: async () => {
    const token = localStorage.getItem("token");
    const res = await axios.get(`${API_URL}/admin/companies`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  createCompany: async (companyData: any) => {
    const token = localStorage.getItem("token");
    const res = await axios.post(`${API_URL}/admin/companies`, companyData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  updateCompany: async (id: number, data: any) => {
    const token = localStorage.getItem("token");
    const payload = { ...data, _method: "PUT" };

    const res = await axios.post(`${API_URL}/admin/companies/${id}`, payload, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  deleteCompany: async (id: number) => {
    const token = localStorage.getItem("token");
    const res = await axios.delete(`${API_URL}/admin/companies/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  // ----- JOBS -----
  // getAllJobs: async () => {
  //   const token = localStorage.getItem("token");
  //   // console.log(token);
    
  //   const res = await axios.get(`${API_URL}/jobs`, {
  //     headers: { Authorization: `Bearer ${token}` },
  //   });
  //   return res.data;
  // },
//   getAllJobs: async () => {
//   const res = await axios.get(`${API_URL}/jobs`);
//   console.log(res);
  
//   return res.data;
// },
getAllJobs: async () => {
  const token = localStorage.getItem("token");
  const res = await axios.get(`${API_URL}/jobs`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res;
},

  // ============================
// 🔹 JOBS (For Users)
// ============================
applyToJob: async (jobId: number, formData: FormData) => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Authentication token is missing.");

  try {
    const res = await axios.post(
      `${API_URL}/jobs/${jobId}/apply`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return res.data;
  } catch (error: any) {
    console.error("Error applying for job:", error.response?.data || error.message);
    throw (
      error.response?.data?.message ||
      "Failed to apply for the job. Please try again."
    );
  }
},

// getAllJobs: async () => {
//   try {
//     const res = await axios.get(`${API_URL}/jobs`);
//     return res.data;
//   } catch (error: any) {
//     console.error("Error fetching jobs:", error.response?.data || error.message);
//     throw (
//       error.response?.data?.message ||
//       "Failed to fetch jobs. Please try again."
//     );
//   }
// },


  createJob: async (jobData: any) => {
    const token = localStorage.getItem("token");
    const res = await axios.post(`${API_URL}/admin/jobs`, jobData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  updateJob: async (id: number, data: any) => {
    const token = localStorage.getItem("token");
    const payload = { ...data, _method: "PUT" };

    const res = await axios.post(`${API_URL}/admin/jobs/${id}`, payload, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  deleteJob: async (id: number) => {
    const token = localStorage.getItem("token");
    const res = await axios.delete(`${API_URL}/admin/jobs/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },
};