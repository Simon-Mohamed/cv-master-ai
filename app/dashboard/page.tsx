// "use client";
// import { useEffect, useState } from "react";
// import { authService } from "@/lib/authService";
// import { useToast } from "@/components/ui/use-toast";
// import { Button } from "@/components/ui/button";
// import { useRouter } from "next/navigation";
// // import router from "next/router";


// export default function AdminDashboard() {
//   const router = useRouter();
//   const { toast } = useToast();
//   const [users, setUsers] = useState<any[]>([]);
//   const [companies, setCompanies] = useState<any[]>([]);
//   const [jobs, setJobs] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [showForm, setShowForm] = useState(false);
//   const [formType, setFormType] = useState<"add" | "edit">("add");
//   const [selectedUser, setSelectedUser] = useState<any>(null);

//   const [formData, setFormData] = useState({
//     name: "",
//     email: "",
//     role: "user",
//     password: "",
//     password_confirmation: "",
//   });
//   const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;

//   // =============================
//   // 🔹 FETCH DATA
//   // =============================
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const usersRes = await authService.getAllUsers();
//         const companiesRes = await authService.getAllCompanies();
//         const jobsRes = await authService.getAllJobs();

//         setUsers(
//           Array.isArray(usersRes.data) ? usersRes.data : usersRes.data.data
//         );
//         setCompanies(
//           Array.isArray(companiesRes.data)
//             ? companiesRes.data
//             : companiesRes.data.data
//         );
//         setJobs(Array.isArray(jobsRes.data) ? jobsRes.data : jobsRes.data.data);
//       } catch (error) {
//         toast({
//           title: "Error",
//           description: "Failed to load dashboard data.",
//           variant: "destructive",
//         });
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchData();
//   }, [toast]);

//   // =============================
//   // 🔹 DELETE USER
//   // =============================
//   const handleDeleteUser = async (id: number) => {
//     if (!confirm("Are you sure you want to delete this user?")) return;
//     try {
//       await authService.deleteUser(id);
//       setUsers((prev) => prev.filter((u) => u.id !== id));
//       toast({
//         title: "Success",
//         description: "User deleted successfully.",
//       });
//     } catch (error) {
//       toast({
//         title: "Error",
//         description: "Failed to delete user.",
//         variant: "destructive",
//       });
//     }
//   };

//   // =============================
//   // 🔹 OPEN ADD OR EDIT FORM
//   // =============================
//   const handleOpenForm = (type: "add" | "edit", user?: any) => {
//     setFormType(type);
//     setShowForm(true);
//     if (type === "edit" && user) {
//       setSelectedUser(user);
//       setFormData({
//         name: user.name,
//         email: user.email,
//         role: user.role,
//         password: "",
//         password_confirmation: "",
//       });
//     } else {
//       setSelectedUser(null);
//       setFormData({
//         name: "",
//         email: "",
//         role: "user",
//         password: "",
//         password_confirmation: "",
//       });
//     }
//   };

//   // =============================
//   // 🔹 SUBMIT FORM (ADD / EDIT)
//   // =============================
//   const handleSubmit = async (e: any) => {
//     e.preventDefault();
//     try {
//       if (formType === "add") {
//         const res = await authService.addUser(formData);
//         const newUser = res.user || res.data?.user;
//         setUsers((prev) => [...prev, newUser]);
//         toast({
//           title: "User Added",
//           description: "User has been added successfully.",
//         });
//       } else if (formType === "edit" && selectedUser) {
//         const res = await authService.updateUser(selectedUser.id, formData);
//         const updatedUser = res.user || res.data?.user;
//         setUsers((prev) =>
//           prev.map((u) => (u.id === selectedUser.id ? updatedUser : u))
//         );
//         toast({
//           title: "User Updated",
//           description: res.message || "User updated successfully.",
//         });
//       }
//       setShowForm(false);
//     } catch (error: any) {
//       toast({
//         title: "Error",
//         description:
//           error?.response?.data?.message || "Failed to save user data.",
//         variant: "destructive",
//       });
//     }
//   };

//   if (loading) return <p className="text-center mt-10">Loading dashboard...</p>;

//   return (
//     <div className="p-6 space-y-8">
//       {/* 📊 Stats */}
//       <div className="grid grid-cols-3 gap-4 text-center">
//         <div className="bg-white shadow rounded-lg p-4">
//           <p className="text-gray-500">Total Users</p>
//           <p className="text-3xl font-bold">{users.length}</p>
//         </div>
//         <div
//           className="bg-white shadow rounded-lg p-4 cursor-pointer hover:bg-blue-50"
//           onClick={() => (window.location.href = "/admin/companies")}
//         >
//           <p className="text-gray-500">Total Companies</p>
//           <p className="text-3xl font-bold">{companies.length}</p>
//         </div>
//         <div
//           className="bg-white shadow rounded-lg p-4 cursor-pointer hover:bg-green-50"
//           onClick={() => (window.location.href = "/admin/jobs")}
//         >
//           <p className="text-gray-500">Total Jobs</p>
//           <p className="text-3xl font-bold">{jobs.length}</p>
//         </div>
//       </div>

//       {/* 👥 Users Section */}
//       <section>
//         <div className="flex justify-between items-center mb-4">
//           <h2 className="text-2xl font-bold">Users</h2>
//           <button
//             onClick={() => handleOpenForm("add")}
//             className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
//           >
//             + Add User
//           </button>
//         </div>

//         <div className="space-y-4">
//           {Array.isArray(users) && users.length > 0 ? (
//             users.map((user) => (
//               <div
//                 key={user.id}
//                 className="flex justify-between items-center p-4 bg-white shadow rounded-lg"
//               >
//                 <div>
//                   <p className="font-semibold">{user.name}</p>
//                   <p className="text-gray-600 text-sm">{user.email}</p>
//                   <p className="text-sm text-gray-500">Role: {user.role}</p>
//                 </div>
//                 <div className="space-x-2">
//                   <button
//                     onClick={() => handleOpenForm("edit", user)}
//                     className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
//                   >
//                     Edit
//                   </button>
//                   <button
//                     onClick={() => handleDeleteUser(user.id)}
//                     className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
//                   >
//                     Delete
//                   </button>
//                 </div>
//               </div>
//             ))
//           ) : (
//             <p className="text-gray-500">No users found.</p>
//           )}
//         </div>

//           {/* ======================= Back Button ======================= */}
//           <div className="mt-8 pt-8 border-t border-border">
//             <Button
//               onClick={() => router.push("/")}
//               variant="outline"
//               className="w-full"
//             >
//               Back to Home Page
//             </Button>
//           </div>
//       </section>

//       {/* 🔹 Popup Modal for Add/Edit */}
//       {showForm && (
//         <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50">
//           <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg relative">
//             <h3 className="text-xl font-semibold mb-4">
//               {formType === "add" ? "Add New User" : "Edit User"}
//             </h3>

//             <form onSubmit={handleSubmit} className="space-y-4">
//               <input
//                 type="text"
//                 placeholder="Name"
//                 value={formData.name}
//                 onChange={(e) =>
//                   setFormData({ ...formData, name: e.target.value })
//                 }
//                 className="w-full border p-2 rounded"
//               />
//               <input
//                 type="email"
//                 placeholder="Email"
//                 value={formData.email}
//                 onChange={(e) =>
//                   setFormData({ ...formData, email: e.target.value })
//                 }
//                 className="w-full border p-2 rounded"
//               />
//               <select
//                 value={formData.role}
//                 onChange={(e) =>
//                   setFormData({ ...formData, role: e.target.value })
//                 }
//                 className="w-full border p-2 rounded"
//               >
//                 <option value="user">User</option>
//                 <option value="admin">Admin</option>
//               </select>
//               <input
//                 type="password"
//                 placeholder="Password"
//                 value={formData.password}
//                 onChange={(e) =>
//                   setFormData({ ...formData, password: e.target.value })
//                 }
//                 className="w-full border p-2 rounded"
//               />
//               <input
//                 type="password"
//                 placeholder="Confirm Password"
//                 value={formData.password_confirmation}
//                 onChange={(e) =>
//                   setFormData({
//                     ...formData,
//                     password_confirmation: e.target.value,
//                   })
//                 }
//                 className="w-full border p-2 rounded"
//               />
//               <div className="flex justify-end space-x-2">
//                 <button
//                   type="button"
//                   onClick={() => setShowForm(false)}
//                   className="px-4 py-2 bg-gray-300 rounded"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
//                 >
//                   Save
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }


// =====*************************************======================
"use client";
import { useEffect, useState } from "react";
import { authService } from "@/lib/authService";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const router = useRouter();
  const { toast } = useToast();

  const [users, setUsers] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState<"add" | "edit">("add");
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "user",
    password: "",
    password_confirmation: "",
  });

  // =============================
  // 🔹 FETCH DASHBOARD DATA
  // =============================
  useEffect(() => {
    const fetchData = async () => {
      try {
        const usersRes = await authService.getAllUsers();
        const companiesRes = await authService.getAllCompanies();
        const jobsRes = await authService.getAllJobs();

        setUsers(Array.isArray(usersRes) ? usersRes : usersRes.data ?? []);
        setCompanies(Array.isArray(companiesRes) ? companiesRes : companiesRes.data ?? []);
        setJobs(Array.isArray(jobsRes.data) ? jobsRes.data : jobsRes.data?.data ?? []);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load dashboard data.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  // =============================
  // 🔹 DELETE USER
  // =============================
  const handleDeleteUser = async (id: number) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      await authService.deleteUser(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
      toast({
        title: "Success",
        description: "User deleted successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete user.",
        variant: "destructive",
      });
    }
  };

  // =============================
  // 🔹 OPEN ADD OR EDIT FORM
  // =============================
  const handleOpenForm = (type: "add" | "edit", user?: any) => {
    setFormType(type);
    setShowForm(true);
    if (type === "edit" && user) {
      setSelectedUser(user);
      setFormData({
        name: user.name,
        email: user.email,
        role: user.role,
        password: "",
        password_confirmation: "",
      });
    } else {
      setSelectedUser(null);
      setFormData({
        name: "",
        email: "",
        role: "user",
        password: "",
        password_confirmation: "",
      });
    }
  };

  // =============================
  // 🔹 SUBMIT FORM (ADD / EDIT)
  // =============================
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      if (formType === "add") {
        const res = await authService.addUser(formData);
        const newUser = res.user || res.data?.user;
        setUsers((prev) => [...prev, newUser]);
        toast({
          title: "User Added",
          description: "User has been added successfully.",
        });
      } else if (formType === "edit" && selectedUser) {
        const res = await authService.updateUser(selectedUser.id, formData);
        const updatedUser = res.user || res.data?.user;
        setUsers((prev) =>
          prev.map((u) => (u.id === selectedUser.id ? updatedUser : u))
        );
        toast({
          title: "User Updated",
          description: res.message || "User updated successfully.",
        });
      }
      setShowForm(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error?.response?.data?.message || "Failed to save user data.",
        variant: "destructive",
      });
    }
  };

  if (loading) return <p className="text-center mt-10">Loading dashboard...</p>;

  return (
    <div className="p-6 space-y-8">
      {/* 📊 Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
        <div className="bg-white shadow rounded-lg p-4">
          <p className="text-gray-500">Total Users</p>
          <p className="text-3xl font-bold">{users.length}</p>
        </div>
        <div
          className="bg-white shadow rounded-lg p-4 cursor-pointer hover:bg-blue-50"
          onClick={() => router.push("/admin/companies")}
        >
          <p className="text-gray-500">Total Companies</p>
          <p className="text-3xl font-bold">{companies.length}</p>
        </div>
        <div
          className="bg-white shadow rounded-lg p-4 cursor-pointer hover:bg-green-50"
          onClick={() => router.push("/admin/jobs")}
        >
          <p className="text-gray-500">Total Jobs</p>
          <p className="text-3xl font-bold">{jobs.length}</p>
        </div>
      </div>

      {/* 👥 Users Section */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Users</h2>
          <button
            onClick={() => handleOpenForm("add")}
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
                  <p className="text-sm text-gray-500">Role: {user.role}</p>
                </div>
                <div className="space-x-2">
                  <button
                    onClick={() => handleOpenForm("edit", user)}
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

        {/* ======================= Back Button ======================= */}
        <div className="mt-8 pt-8 border-t border-border">
          <Button
            onClick={() => router.push("/")}
            variant="outline"
            className="w-full"
          >
            Back to Home Page
          </Button>
        </div>
      </section>

      {/* 🔹 Popup Modal for Add/Edit */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg relative">
            <h3 className="text-xl font-semibold mb-4">
              {formType === "add" ? "Add New User" : "Edit User"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full border p-2 rounded"
              />
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full border p-2 rounded"
              />
              <select
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
                className="w-full border p-2 rounded"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
              <input
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="w-full border p-2 rounded"
              />
              <input
                type="password"
                placeholder="Confirm Password"
                value={formData.password_confirmation}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    password_confirmation: e.target.value,
                  })
                }
                className="w-full border p-2 rounded"
              />
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 bg-gray-300 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}





