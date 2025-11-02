"use client";
import { useEffect, useState } from "react";
import axios from "axios";

export default function AdminDashboard() {
  const [users, setUsers] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const API_URL = "http://127.0.0.1:8000/api";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const [usersRes, companiesRes, jobsRes] = await Promise.all([
          axios.get(`${API_URL}/admin/users`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API_URL}/admin/companies`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API_URL}/admin/jobs`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        // ✅ البيانات الأساسية بداخل data
        setUsers(Array.isArray(usersRes.data.data) ? usersRes.data.data : []);
        setCompanies(
          Array.isArray(companiesRes.data.data)
            ? companiesRes.data.data
            : companiesRes.data
        );
        setJobs(Array.isArray(jobsRes.data.data) ? jobsRes.data.data : []);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDeleteUser = async (id: number) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers((prev) => prev.filter((user) => user.id !== id));
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const handleEditUser = (user: any) => {
    alert(`Edit user: ${user.name}`);
  };

  const handleAddUser = () => {
    alert("Open add user form");
  };

  if (loading) return <p className="text-center">Loading dashboard...</p>;

  return (
    <div className="p-6 space-y-8">
      {/* 📊 الإحصائيات */}
      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="bg-white shadow rounded-lg p-4">
          <p className="text-gray-500">Total Users</p>
          <p className="text-3xl font-bold">{users.length}</p>
        </div>
        <div className="bg-white shadow rounded-lg p-4">
          <p className="text-gray-500">Total Companies</p>
          <p className="text-3xl font-bold">{companies.length}</p>
        </div>
        <div className="bg-white shadow rounded-lg p-4">
          <p className="text-gray-500">Total Jobs</p>
          <p className="text-3xl font-bold">{jobs.length}</p>
        </div>
      </div>

      {/* 👥 المستخدمين */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Users</h2>
          <button
            onClick={handleAddUser}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            + Add User
          </button>
        </div>
        <div className="space-y-4">
          {Array.isArray(users) && users.length > 0 ? (
            users.map((user) => (
              <div
                key={user.id}
                className="flex justify-between items-center p-4 bg-white shadow rounded-lg"
              >
                <div>
                  <p className="font-semibold">{user.name}</p>
                  <p className="text-gray-600 text-sm">{user.email}</p>
                  {user.profile && (
                    <p className="text-sm text-gray-500">
                      {user.profile.professional_bio || "No bio"}
                    </p>
                  )}
                </div>
                <div className="space-x-2">
                  <button
                    onClick={() => handleEditUser(user)}
                    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteUser(user.id)}
                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No users found.</p>
          )}
        </div>
      </section>
    </div>
  );
}
