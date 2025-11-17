//=============================
// "use client";
// import { useEffect, useState } from "react";
// import { authService } from "@/lib/authService";
// import { useToast } from "@/components/ui/use-toast";
// import { Button } from "@/components/ui/button";
// import { useRouter } from "next/navigation";

// export default function AdminDashboard() {
//   const router = useRouter();
//   const { toast } = useToast();

//   const [users, setUsers] = useState<any[]>([]);
//   const [companies, setCompanies] = useState<any[]>([]);
//   const [jobs, setJobs] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);

//   // ================================
//   // 🔹 FETCH DASHBOARD DATA
//   // ================================
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const usersRes = await authService.getAllUsers();
//         const companiesRes = await authService.getAllCompanies();
//         const jobsRes = await authService.getAllJobs();

//         // users
//         setUsers(Array.isArray(usersRes) ? usersRes : usersRes.data ?? usersRes.data?.data ?? []);
//         // companies
//         setCompanies(Array.isArray(companiesRes) ? companiesRes : companiesRes.data ?? companiesRes.data?.data ?? []);
//         // jobs
//         // لاحظ: بعض الـ endpoints للـ jobs يرجعون مباشرة الـ array في res.data أو داخل res.data.data
//         const jobsArray = Array.isArray(jobsRes.data) ? jobsRes.data : jobsRes.data?.data ?? [];
//         setJobs(jobsArray);
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

//   if (loading) return <p className="text-center mt-10">Loading dashboard...</p>;

//   return (
//     <div className="p-6 space-y-8">
//       {/* 📊 Stats */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
//         <div className="bg-white shadow rounded-lg p-4">
//           <p className="text-gray-500">Total Users</p>
//           <p className="text-3xl font-bold">{users.length}</p>
//         </div>
//         <div
//           className="bg-white shadow rounded-lg p-4 cursor-pointer hover:bg-blue-50"
//           onClick={() => router.push("/admin/companies")}
//         >
//           <p className="text-gray-500">Total Companies</p>
//           <p className="text-3xl font-bold">{companies.length}</p>
//         </div>
//         <div
//           className="bg-white shadow rounded-lg p-4 cursor-pointer hover:bg-green-50"
//           onClick={() => router.push("/admin/jobs")}
//         >
//           <p className="text-gray-500">Total Jobs</p>
//           <p className="text-3xl font-bold">{jobs.length}</p>
//         </div>
//       </div>
//     </div>
//   );
// }

// ======        ********************* ==================
// "use client";
// import { useEffect, useState } from "react";
// import { authService } from "@/lib/authService";
// import { useToast } from "@/components/ui/use-toast";
// import { Button } from "@/components/ui/button";
// import { useRouter } from "next/navigation";

// export default function AdminDashboard() {
//   const router = useRouter();
//   const { toast } = useToast();

//   const [users, setUsers] = useState<any[]>([]);
//   const [companies, setCompanies] = useState<any[]>([]);
//   const [jobs, setJobs] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);

//   // ================================
//   // 🔹 FETCH DASHBOARD DATA
//   // ================================
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const usersRes = await authService.getAllUsers();
//         const companiesRes = await authService.getAllCompanies();
//         const jobsRes = await authService.getAllJobs();

//         // users
//         setUsers(Array.isArray(usersRes) ? usersRes : usersRes.data ?? usersRes.data?.data ?? []);
//         // companies
//         setCompanies(Array.isArray(companiesRes) ? companiesRes : companiesRes.data ?? companiesRes.data?.data ?? []);
//         // jobs
//         const jobsArray = Array.isArray(jobsRes.data) ? jobsRes.data : jobsRes.data?.data ?? [];
//         setJobs(jobsArray);
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

//   if (loading) return <p className="text-center mt-10">Loading dashboard...</p>;

//   return (
//     <div className="p-6 space-y-8">
//       {/* 📊 Stats */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
//         <div className="bg-white shadow rounded-lg p-4">
//           <p className="text-gray-500">Total Users</p>
//           <p className="text-3xl font-bold">{users.length}</p>
//         </div>
//         <div
//           className="bg-white shadow rounded-lg p-4 cursor-pointer hover:bg-blue-50"
//           onClick={() => router.push("/admin/companies")}
//         >
//           <p className="text-gray-500">Total Companies</p>
//           <p className="text-3xl font-bold">{companies.length}</p>
//         </div>
//         <div
//           className="bg-white shadow rounded-lg p-4 cursor-pointer hover:bg-green-50"
//           onClick={() => router.push("/admin/jobs")}
//         >
//           <p className="text-gray-500">Total Jobs</p>
//           <p className="text-3xl font-bold">{jobs.length}</p>
//         </div>
//       </div>

//       {/* ======================= Back Button ======================= */}
//       <div className="mt-8 pt-8 border-t border-border">
//         <Button
//           onClick={() => router.push("/")}
//           variant="outline"
//           className="w-full"
//         >
//           Back to Home Page
//         </Button>
//       </div>
//     </div>
//   );
// }