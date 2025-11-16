// "use client";

// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import { useToast } from "@/components/ui/use-toast";
// import DashboardNav from "@/components/dashboard-nav";
// import { Button } from "@/components/ui/button";
// import { authService } from "@/lib/authService";

// interface User {
//   id: number;
//   name: string;
//   email: string;
// }

// interface Job {
//   id: number;
//   title: string;
//   company: string;
//   company_id?: number;
//   location: string;
//   salary: string;
//   description: string;
//   requirements: string[];
// }

// interface Company {
//   id: number;
//   name: string;
//   description: string;
//   website?: string;
//   logo?: string;
//   location?: string;
// }

// export default function JobSearchPage() {
//   const { toast } = useToast();
//   const router = useRouter();
//   const [user, setUser] = useState<User | null>(null);
//   const [jobs, setJobs] = useState<Job[]>([]);
//   const [company, setCompany] = useState<Company[]>([]);
//   const [filteredCompany, setFilteredCompany] = useState<Job[]>([]);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [locationFilter, setLocationFilter] = useState("");
//   const [savedCompany, setSavedCompany] = useState<string[]>([]);
//   const [loading, setLoading] = useState(true);

//   // Companies
//   const [companies, setCompanies] = useState<Company[]>([]);

//   // form management
//   const [showForm, setShowForm] = useState(false);
//   const [formType, setFormType] = useState<"add" | "edit">("add");
//   const [selectedJob, setSelectedJob] = useState<any>(null);
//   const [formData, setFormData] = useState({
//     company_id: "",
//     title: "",
//     description: "",
//     requirements: "",
//     location: "",
//     type: "",
//     salary_from: "",
//     salary_to: "",
//     deadline: "",
//     is_active: "",
//   });

//   useEffect(() => {
//     const userData = localStorage.getItem("cvmaster_user");
//     if (!userData) {
//       router.push("/login");
//       return;
//     }
//     setUser(JSON.parse(userData));

//     const saved = localStorage.getItem("cvmaster_saved_jobs");
//     if (saved) setSavedJobs(JSON.parse(saved));

//     // fetch both jobs and companies
//     fetchJobs();
//     fetchCompanies();
//   }, []);

//   const fetchCompanies = async () => {
//     try {
//       const res = await authService.getAllCompanies();
//       // authService.getAllCompanies returns res.data (earlier impl returns res.data)
//       const companiesArray = res.data?.data || res.data || [];
//       // handle common shapes: {data: [...] } or direct array
//       const formatted: Company[] = Array.isArray(companiesArray)
//         ? companiesArray.map((c: any) => ({ id: c.id, name: c.name }))
//         : companiesArray;
//       setCompanies(formatted);
//     } catch (err) {
//       console.error("Error fetching companies:", err);
//     }
//   };

//   const fetchJobs = async () => {
//     try {
//       const res = await authService.getAllJobs();
//       // authService.getAllJobs currently returns the axios response
//       const jobsArray = res.data?.data || res.data || [];

//       const formattedJobs = jobsArray.map((job: any) => ({
//         id: job.id,
//         title: job.title,
//         company: job.company?.name || job.company_name || "Unknown Company",
//         company_id: job.company?.id ?? job.company_id ?? null,
//         location: job.location,
//         salary:
//           job.salary_from !== undefined || job.salary_to !== undefined
//             ? `${job.salary_from ?? ""} - ${job.salary_to ?? ""}`
//             : job.salary ?? "",
//         description: job.description,
//         requirements: job.requirements
//           ? job.requirements.split(",").map((r: string) => r.trim())
//           : [],
//       }));

//       setJobs(formattedJobs);
//       setFilteredJobs(formattedJobs);
//     } catch (err) {
//       console.error("Error fetching jobs:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // filters
//   useEffect(() => {
//     let filtered = jobs;

//     if (searchTerm) {
//       filtered = filtered.filter(
//         (job) =>
//           job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
//           job.company.toLowerCase().includes(searchTerm.toLowerCase())
//       );
//     }

//     if (locationFilter) {
//       filtered = filtered.filter((job) =>
//         job.location.toLowerCase().includes(locationFilter.toLowerCase())
//       );
//     }

//     setFilteredJobs(filtered);
//   }, [searchTerm, locationFilter, jobs]);

//   // SAVE JOB
//   const toggleSaveJob = (jobId: number) => {
//     const updated = savedJobs.includes(String(jobId))
//       ? savedJobs.filter((id) => id !== String(jobId))
//       : [...savedJobs, String(jobId)];
//     setSavedJobs(updated);
//     localStorage.setItem("cvmaster_saved_jobs", JSON.stringify(updated));
//   };

//   // OPEN ADD/EDIT FORM
//   const handleOpenForm = (type: "add" | "edit", job?: any) => {
//     setFormType(type);
//     setShowForm(true);

//     if (type === "edit" && job) {
//       setSelectedJob(job);

//       const salaryParts = job.salary ? job.salary.split(" - ") : ["", ""];

//       setFormData({
//         company_id: job.company_id
//           ? String(job.company_id)
//           : job.company
//           ? ""
//           : "",
//         title: job.title || "",
//         description: job.description || "",
//         requirements: job.requirements?.join(", ") || "",
//         location: job.location || "",
//         type: (job as any).type || "",
//         salary_from: salaryParts[0] || "",
//         salary_to: salaryParts[1] || "",
//         deadline: (job as any).deadline
//           ? String((job as any).deadline).slice(0, 10)
//           : "",
//         is_active: (job as any).is_active ? "true" : "",
//       });
//     } else {
//       setSelectedJob(null);
//       setFormData({
//         company_id: companies.length > 0 ? String(companies[0].id) : "",
//         title: "",
//         description: "",
//         requirements: "",
//         location: "",
//         type: "",
//         salary_from: "",
//         salary_to: "",
//         deadline: "",
//         is_active: "",
//       });
//     }
//   };

//   const handleDeleteJob = async (id: number) => {
//     if (!confirm("Are you sure you want to delete this Job?")) return;
//     try {
//       await authService.deleteJob(id);
//       setJobs((prev) => prev.filter((j) => j.id !== id));
//       toast({
//         title: "Success",
//         description: "Job deleted successfully.",
//       });
//     } catch (err) {
//       console.error("Delete error:", err);
//       toast({
//         title: "Error",
//         description: "Failed to delete Job.",
//         variant: "destructive",
//       });
//     }
//   };

//   // SUBMIT ADD/EDIT
//   const handleSubmit = async (e: any) => {
//     e.preventDefault();

//     // Prepare payload according to API examples you provided
//     const payload: any = {
//       company_id: formData.company_id ? Number(formData.company_id) : undefined,
//       title: formData.title,
//       description: formData.description,
//       requirements: formData.requirements,
//       location: formData.location,
//       type: formData.type || undefined,
//       salary_from:
//         formData.salary_from !== "" ? formData.salary_from : undefined,
//       salary_to: formData.salary_to !== "" ? formData.salary_to : undefined,
//       deadline: formData.deadline || undefined,
//       is_active:
//         formData.is_active === "" ? undefined : formData.is_active === "true",
//     };

//     // Remove undefined fields to avoid sending empty values
//     Object.keys(payload).forEach((k) => {
//       if (payload[k] === undefined || payload[k] === "") delete payload[k];
//     });

//     try {
//       // ====== ADD NEW JOB ======
//       if (formType === "add") {
//         const res = await authService.createJob(payload);
//         // authService.createJob returns res.data (per your file)
//         const created = res?.job || res?.data || res;

//         // created may be the job object or { job: {...} }
//         const jobObj = created.job || created || res;

//         const newJobFormatted: Job = {
//           id: jobObj.id,
//           title: jobObj.title,
//           company:
//             jobObj.company?.name ||
//             findCompanyName(jobObj.company_id) ||
//             "Unknown Company",
//           company_id: jobObj.company?.id ?? jobObj.company_id ?? null,
//           location: jobObj.location,
//           salary: `${jobObj.salary_from ?? ""} - ${jobObj.salary_to ?? ""}`,
//           description: jobObj.description,
//           requirements: jobObj.requirements
//             ? jobObj.requirements.split(",").map((r: string) => r.trim())
//             : [],
//         };

//         setJobs((prev) => [...prev, newJobFormatted]);
//         setFilteredCompany((prev) => [...prev, newJobFormatted]);

//         toast({
//           title: "Success",
//           description: "Job added successfully.",
//         });
//       }

//       // ====== EDIT JOB ======
//       if (formType === "edit" && selectedJob) {
//         const res = await authService.updateJob(selectedJob.id, payload);
//         const updatedResp = res?.job || res?.data || res;
//         const jobObj = updatedResp.job || updatedResp || res;

//         const updatedFormatted: Job = {
//           id: jobObj.id,
//           title: jobObj.title,
//           company:
//             jobObj.company?.name ||
//             findCompanyName(jobObj.company_id) ||
//             "Unknown Company",
//           company_id:
//             jobObj.company?.id ??
//             jobObj.company_id ??
//             selectedJob.company_id ??
//             null,
//           location: jobObj.location,
//           salary: `${jobObj.salary_from ?? ""} - ${jobObj.salary_to ?? ""}`,
//           description: jobObj.description,
//           requirements: jobObj.requirements
//             ? jobObj.requirements.split(",").map((r: string) => r.trim())
//             : [],
//         };

//         setJobs((prev) =>
//           prev.map((j) => (j.id === selectedJob.id ? updatedFormatted : j))
//         );
//         setFilteredCompany((prev) =>
//           prev.map((j) => (j.id === selectedJob.id ? updatedFormatted : j))
//         );

//         toast({
//           title: "Success",
//           description: "Job updated successfully.",
//         });
//       }

//       setShowForm(false);
//     } catch (error: any) {
//       console.error("Save job error:", error);
//       toast({
//         title: "Error",
//         description: error?.response?.data?.message || "Failed to save job.",
//         variant: "destructive",
//       });
//     }
//   };

//   const findCompanyName = (company_id?: number) => {
//     if (!company_id) return undefined;
//     const c = companies.find((x) => x.id === Number(company_id));
//     return c?.name;
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         Loading jobs...
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-background">
//       <DashboardNav user={user!} />

//       <main className="max-w-6xl mx-auto px-4 py-12">
//         <div className="bg-white rounded-lg shadow-md p-8">
//           <section className="flex items-center justify-between mb-8">
//             <h1 className="text-3xl font-bold text-primary mb-2">
//               {" "}
//               All Companies
//             </h1>
//             <Button
//               onClick={() => {
//                 // open add form and set default company if available
//                 handleOpenForm("add");
//               }}
//               className="bg-accent hover:bg-accent/90"
//             >
//               + Add New Company
//             </Button>
//           </section>

//           {/* Filters */}
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
//             <div>
//               <label className="block text-sm font-medium text-foreground mb-2">
//                 Search by Title or Company
//               </label>
//               <input
//                 type="text"
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
//                 placeholder="e.g., React Developer"
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-foreground mb-2">
//                 Filter by Location
//               </label>
//               <input
//                 type="text"
//                 value={locationFilter}
//                 onChange={(e) => setLocationFilter(e.target.value)}
//                 className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
//                 placeholder="e.g., Remote, Cairo"
//               />
//             </div>
//           </div>

//           {/* Jobs List */}
//           <div className="space-y-4">
//             {filteredJobs.length > 0 ? (
//               filteredJobs.map((job) => (
//                 <div
//                   key={job.id}
//                   className="border border-border rounded-lg p-6 hover:shadow-md transition"
//                 >
//                   <div className="flex items-start justify-between mb-4">
//                     <div className="flex-1">
//                       <h3 className="text-xl font-semibold text-primary">
//                         Job Title: {job.title}
//                       </h3>
//                       <span className="text-muted-foreground">
//                         Company Name:
//                       </span>
//                       <p className="text-muted-foreground">{job.company}</p>
//                     </div>
//                   </div>

//                   <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
//                     <div>
//                       <span className="text-muted-foreground">Location:</span>
//                       <p className="font-medium text-foreground">
//                         {job.location}
//                       </p>
//                     </div>
//                     <div>
//                       <span className="text-muted-foreground">Salary:</span>
//                       <p className="font-medium text-foreground">
//                         {job.salary}
//                       </p>
//                     </div>
//                   </div>

//                   <span className="text-muted-foreground">
//                     Job Description:
//                   </span>
//                   <p className="text-foreground mb-4">{job.description}</p>

//                   <div className="mb-4">
//                     <p className="text-sm font-medium text-foreground mb-2">
//                       Requirements:
//                     </p>
//                     <div className="flex flex-wrap gap-2">
//                       {job.requirements?.map((req, idx) => (
//                         <span
//                           key={idx}
//                           className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
//                         >
//                           {req}
//                         </span>
//                       ))}
//                     </div>
//                   </div>

//                   <section className="flex items-center gap-4">
//                     <Button
//                       onClick={(e) => {
//                         // prevent parent click if any
//                         e.stopPropagation();
//                         handleOpenForm("edit", job);
//                       }}
//                       className="bg-accent hover:bg-accent/90"
//                     >
//                       Edit
//                     </Button>

//                     <button
//                       onClick={() => handleDeleteJob(job.id)}
//                       className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
//                     >
//                       Delete
//                     </button>
//                   </section>
//                 </div>
//               ))
//             ) : (
//               <div className="text-center py-12">
//                 <p className="text-muted-foreground">
//                   No jobs found matching your criteria
//                 </p>
//               </div>
//             )}
//           </div>

//           {/* BACK BUTTON */}
//           <div className="mt-8 pt-8 border-t border-border">
//             <Button
//               onClick={() => router.push("/dashboard")}
//               variant="outline"
//               className="w-full"
//             >
//               Back to Dashboard
//             </Button>
//           </div>
//         </div>
//       </main>

//       {/* =========================== */}
//       {/*      ADD / EDIT FORM        */}
//       {/* =========================== */}
//       {showForm && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
//           <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6">
//             <h2 className="text-xl font-semibold mb-4">
//               {formType === "add" ? "Add New Job" : "Edit Job"}
//             </h2>

//             <form onSubmit={handleSubmit} className="space-y-4">
//               {/* Company select */}
//               <div>
//                 <label className="block text-sm font-medium">Company</label>
//                 <select
//                   value={formData.company_id}
//                   onChange={(e) =>
//                     setFormData({ ...formData, company_id: e.target.value })
//                   }
//                   className="w-full px-3 py-2 border rounded"
//                   required
//                 >
//                   <option value="">Select company</option>
//                   {companies.map((c) => (
//                     <option key={c.id} value={String(c.id)}>
//                       {c.name}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium">Title</label>
//                 <input
//                   value={formData.title}
//                   onChange={(e) =>
//                     setFormData({ ...formData, title: e.target.value })
//                   }
//                   className="w-full px-3 py-2 border rounded"
//                   required
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium">Description</label>
//                 <textarea
//                   value={formData.description}
//                   onChange={(e) =>
//                     setFormData({
//                       ...formData,
//                       description: e.target.value,
//                     })
//                   }
//                   className="w-full px-3 py-2 border rounded"
//                   rows={4}
//                   required
//                 />
//               </div>

//               <div className="grid grid-cols-2 gap-4">
//                 <div>
//                   <label className="block text-sm font-medium">
//                     Salary From
//                   </label>
//                   <input
//                     value={formData.salary_from}
//                     onChange={(e) =>
//                       setFormData({
//                         ...formData,
//                         salary_from: e.target.value,
//                       })
//                     }
//                     className="w-full px-3 py-2 border rounded"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium">Salary To</label>
//                   <input
//                     value={formData.salary_to}
//                     onChange={(e) =>
//                       setFormData({
//                         ...formData,
//                         salary_to: e.target.value,
//                       })
//                     }
//                     className="w-full px-3 py-2 border rounded"
//                   />
//                 </div>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium">Location</label>
//                 <input
//                   value={formData.location}
//                   onChange={(e) =>
//                     setFormData({
//                       ...formData,
//                       location: e.target.value,
//                     })
//                   }
//                   className="w-full px-3 py-2 border rounded"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium">Type</label>
//                 <input
//                   value={formData.type}
//                   onChange={(e) =>
//                     setFormData({
//                       ...formData,
//                       type: e.target.value,
//                     })
//                   }
//                   className="w-full px-3 py-2 border rounded"
//                   placeholder="e.g., full-time, part-time"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium">
//                   Requirements (comma separated)
//                 </label>
//                 <input
//                   value={formData.requirements}
//                   onChange={(e) =>
//                     setFormData({
//                       ...formData,
//                       requirements: e.target.value,
//                     })
//                   }
//                   className="w-full px-3 py-2 border rounded"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium">Deadline</label>
//                 <input
//                   type="date"
//                   value={formData.deadline}
//                   onChange={(e) =>
//                     setFormData({ ...formData, deadline: e.target.value })
//                   }
//                   className="w-full px-3 py-2 border rounded"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium">Active</label>
//                 <select
//                   value={formData.is_active}
//                   onChange={(e) =>
//                     setFormData({ ...formData, is_active: e.target.value })
//                   }
//                   className="w-full px-3 py-2 border rounded"
//                 >
//                   <option value="">Select</option>
//                   <option value="true">Active</option>
//                   <option value="false">Inactive</option>
//                 </select>
//               </div>

//               <div className="flex items-center justify-end gap-3 pt-2">
//                 <button
//                   type="button"
//                   onClick={() => setShowForm(false)}
//                   className="px-4 py-2 border rounded"
//                 >
//                   Cancel
//                 </button>

//                 <button
//                   type="submit"
//                   className="px-4 py-2 bg-accent text-white rounded"
//                 >
//                   {formType === "add" ? "Create" : "Save"}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
