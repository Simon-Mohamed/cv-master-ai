
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import DashboardNav from "@/components/dashboard-nav";
import { Button } from "@/components/ui/button";
import { authService } from "@/lib/authService";

interface User {
  id: number;
  name: string;
  email: string;
  role?: string;
}

interface Job {
  id: number;
  title: string;
  company: string;
  company_id?: number;
  location: string;
  salary: string;
  description: string;
  requirements: string[];
  type?: string;
  deadline?: string;
  is_active?: boolean;
}

interface Company {
  id: number;
  name: string;
}

export default function JobSearchPage() {
  const { toast } = useToast();
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [savedJobs, setSavedJobs] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const [companies, setCompanies] = useState<Company[]>([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("");

  // FORM
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState<"add" | "edit">("add");
  const [selectedJob, setSelectedJob] = useState<any>(null);

  const [formData, setFormData] = useState({
    company_id: "",
    title: "",
    description: "",
    requirements: "",
    location: "",
    type: "",
    salary_from: "",
    salary_to: "",
    deadline: "",
    is_active: "",
  });

  // =============================
  // 🟢 INITIAL LOAD
  // =============================
  useEffect(() => {
    const userData = localStorage.getItem("cvmaster_user");
    if (!userData) {
      router.push("/login");
      return;
    }

    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);

    if (parsedUser.role !== "admin") {
      router.push("/dashboard");
      return;
    }

    const saved = localStorage.getItem("cvmaster_saved_jobs");
    if (saved) setSavedJobs(JSON.parse(saved));

    const loadData = async () => {
      await fetchCompanies();
      await fetchJobs();
    };

    loadData();
  }, []);

  // =============================
  // 🟢 FETCH COMPANIES
  // =============================
  const fetchCompanies = async () => {
    try {
      const res = await authService.getAllCompanies();
      let companiesArray: any[] = [];

      if (Array.isArray(res)) companiesArray = res;
      else if (res.data && Array.isArray(res.data)) companiesArray = res.data;

      const formatted = companiesArray.map((c: any) => ({
        id: c.id,
        name: c.name || "Unnamed Company",
      }));

      setCompanies(formatted);

      if (formatted.length === 0) {
        toast({
          title: "Warning",
          description: "No companies found. Please create companies first.",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      console.error("Companies error:", err);
      toast({
        title: "Error",
        description: "Failed to load companies",
        variant: "destructive",
      });
    }
  };

  // =============================
  // 🟢 FETCH JOBS
  // =============================
  const fetchJobs = async () => {
    try {
      const res = await authService.getAllJobs();
      const jobsArray = res.data?.data || res.data || [];

      const formattedJobs: Job[] = jobsArray.map((job: any) => ({
        id: job.id,
        title: job.title,
        company: job.company?.name || "Unknown",
        company_id: job.company_id,
        location: job.location,
        salary: `${job.salary_from ?? ""} - ${job.salary_to ?? ""}`,
        description: job.description,
        requirements: job.requirements
          ? job.requirements.split(",").map((r: string) => r.trim())
          : [],
        type: job.type,
        deadline: job.deadline,
        is_active: job.is_active === 1 || job.is_active === true,
      }));

      setJobs(formattedJobs);
      setFilteredJobs(formattedJobs);
    } catch (error) {
      console.error("Jobs error:", error);
    } finally {
      setLoading(false);
    }
  };

  // =============================
  // 🟢 FILTER LOGIC
  // =============================
  useEffect(() => {
    let filtered = jobs;

    if (searchTerm) {
      filtered = filtered.filter(
        (j) =>
          j.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          j.company.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (locationFilter) {
      filtered = filtered.filter((j) =>
        j.location.toLowerCase().includes(locationFilter.toLowerCase())
      );
    }

    setFilteredJobs(filtered);
  }, [searchTerm, locationFilter, jobs]);

  // =============================
  // 🟢 OPEN ADD / EDIT FORM
  // =============================
  const handleOpenForm = (type: "add" | "edit", job?: any) => {
    setFormType(type);
    setShowForm(true);

    if (type === "edit" && job) {
      setSelectedJob(job);

      const salaryParts = job.salary.split(" - ");

      setFormData({
        company_id: job.company_id ? String(job.company_id) : "",
        title: job.title,
        description: job.description,
        requirements: job.requirements.join(", "),
        location: job.location,
        type: job.type || "",
        salary_from: salaryParts[0],
        salary_to: salaryParts[1],
        deadline: job.deadline || "",
        is_active: job.is_active ? "true" : "false",
      });
    } else {
      setSelectedJob(null);
      setFormData({
        company_id: "",
        title: "",
        description: "",
        requirements: "",
        location: "",
        type: "",
        salary_from: "",
        salary_to: "",
        deadline: "",
        is_active: "",
      });
    }
  };

  // =============================
  // 🟢 HANDLE ADD / EDIT JOBS
  // =============================
  const handleSubmit = async (e: any) => {
    e.preventDefault();

    const payload: any = {
      company_id: Number(formData.company_id),
      title: formData.title,
      description: formData.description,
      requirements: formData.requirements,
      location: formData.location,
      type: formData.type || undefined,
      salary_from: formData.salary_from || undefined,
      salary_to: formData.salary_to || undefined,
      deadline: formData.deadline || undefined,
      is_active:
        formData.is_active === "true"
          ? 1
          : formData.is_active === "false"
          ? 0
          : undefined,
    };

    Object.keys(payload).forEach((k) => {
      if (payload[k] === "" || payload[k] === undefined) delete payload[k];
    });

    try {
      let jobRes: any;

      if (formType === "add") {
        const res = await authService.createJob(payload);
        jobRes = res.job ?? res.data?.job ?? res.data;
      }

      if (formType === "edit" && selectedJob) {
        const res = await authService.updateJob(selectedJob.id, payload);
        jobRes = res.job ?? res.data?.job ?? res.data;
      }

      if (!jobRes) throw new Error("No job data returned from API");

      const newJob: Job = {
        id: jobRes.id,
        title: jobRes.title,
        company:
          jobRes.company?.name ||
          findCompanyName(jobRes.company_id) ||
          "Unknown",
        company_id: jobRes.company_id,
        location: jobRes.location,
        salary: `${jobRes.salary_from ?? ""} - ${jobRes.salary_to ?? ""}`,
        description: jobRes.description,
        requirements: jobRes.requirements
          ? jobRes.requirements.split(",").map((r: string) => r.trim())
          : [],
        type: jobRes.type,
        deadline: jobRes.deadline,
        is_active: jobRes.is_active === 1 || jobRes.is_active === true,
      };

      if (formType === "add") {
        setJobs((prev) => [...prev, newJob]);
        setFilteredJobs((prev) => [...prev, newJob]);
      } else {
        setJobs((prev) =>
          prev.map((j) => (j.id === selectedJob.id ? newJob : j))
        );
        setFilteredJobs((prev) =>
          prev.map((j) => (j.id === selectedJob.id ? newJob : j))
        );
      }

      setShowForm(false);
      toast({ title: "Success", description: "Job saved successfully" });
    } catch (err: any) {
      console.error("save error:", err);

      let message = "Failed to save job";

      try {
        if (!err) {
          message = "Unknown error";
        } else if (err.errors && typeof err.errors === "object") {
          const msgs = Object.values(err.errors)
            .flat()
            .map((m: any) => String(m))
            .join(" ");
          message = msgs || message;
        } else if (err.message) {
          message = String(err.message);
        } else if (err?.data) {
          message = JSON.stringify(err.data);
        } else if (typeof err === "string") {
          message = err;
        }
      } catch (parseErr) {
        console.error("Error parsing API error:", parseErr);
      }

      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    }
  };

  const findCompanyName = (id?: number) => {
    return companies.find((c) => c.id === id)?.name;
  };

  // =============================
  // 🟢 HANDLE DELETE JOB
  // =============================
  const handleDeleteJob = async (id: number) => {
    if (!confirm("Are you sure you want to delete this job?")) return;

    try {
      await authService.deleteJob(id);
      setJobs((prev) => prev.filter((j) => j.id !== id));
      setFilteredJobs((prev) => prev.filter((j) => j.id !== id));
      toast({ title: "Success", description: "Job deleted successfully" });
    } catch (err: any) {
      console.error("Delete error:", err);
      toast({
        title: "Error",
        description: err?.message || "Failed to delete job",
        variant: "destructive",
      });
    }
  };

  if (loading) return <p>Loading…</p>;

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav user={user!} />

      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-md p-8">
          <section className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-primary mb-2">All Jobs</h1>
            <Button
              onClick={() => handleOpenForm("add")}
              className="bg-accent hover:bg-accent/90"
            >
              + Add New Job
            </Button>
          </section>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <input
              placeholder="Search title/company"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border px-3 py-2 rounded"
            />
            <input
              placeholder="Filter by location"
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="border px-3 py-2 rounded"
            />
          </div>

          {/* Job List */}
          {filteredJobs.map((job) => (
            <div
              key={job.id}
              className="border rounded p-6 mb-4 hover:shadow transition"
            >
              <h3 className="text-xl font-semibold">{job.title}</h3>
              <div className="flex flex-wrap gap-4 p-2">
                <p className="mx-3 p-2">Company: {job.company}</p>
                <p className="mx-3 p-2">Salary: {job.salary}</p>
                <p className="mx-3 p-2">
                  Deadline: {job.deadline ? new Date(job.deadline).toLocaleDateString() : "N/A"}
                </p>
                <p className="mx-3 p-2">Type: {job.type || "N/A"}</p>
                <p className="mx-3 p-2">
                  Status: {job.is_active ? "Active" : "Inactive"}
                </p>
              </div>
              <p className="mx-3 p-2">Location: {job.location}</p>
              <p className="mx-3 p-2">Description: {job.description}</p>
              <p className="mx-3 p-2">
                Requirements: {job.requirements.length ? job.requirements.join(", ") : "None"}
              </p>

              <div className="flex gap-3 mt-4">
                <Button onClick={() => handleOpenForm("edit", job)}>Edit</Button>
                <Button
                  onClick={() => handleDeleteJob(job.id)}
                  className="bg-red-500 hover:bg-red-600"
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}

          <Button
            className="w-full mt-10"
            variant="outline"
            onClick={() => router.push("/dashboard")}
          >
            Back to Dashboard
          </Button>
        </div>
      </main>

      {/* FORM */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-2xl">
            <h2 className="text-xl font-semibold">
              {formType === "add" ? "Add Job" : "Edit Job"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Company <span className="text-red-500">*</span>
                </label>
                <select
                  className="border px-3 py-2 rounded w-full bg-white"
                  value={formData.company_id}
                  required
                  onChange={(e) =>
                    setFormData({ ...formData, company_id: e.target.value })
                  }
                >
                  <option value="">
                    {companies.length === 0
                      ? "No companies available"
                      : "Select a company"}
                  </option>
                  {companies.map((c) => (
                    <option key={c.id} value={String(c.id)}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  className="border px-3 py-2 rounded w-full"
                  placeholder="Job Title"
                  value={formData.title}
                  required
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  className="border px-3 py-2 rounded w-full"
                  rows={4}
                  placeholder="Job Description"
                  value={formData.description}
                  required
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Requirements
                </label>
                <input
                  className="border px-3 py-2 rounded w-full"
                  placeholder="Requirements (comma separated)"
                  value={formData.requirements}
                  onChange={(e) =>
                    setFormData({ ...formData, requirements: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Location
                </label>
                <input
                  className="border px-3 py-2 rounded w-full"
                  placeholder="Job Location"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Salary From
                  </label>
                  <input
                    className="border px-3 py-2 rounded w-full"
                    placeholder="Salary From"
                    value={formData.salary_from}
                    onChange={(e) =>
                      setFormData({ ...formData, salary_from: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Salary To
                  </label>
                  <input
                    className="border px-3 py-2 rounded w-full"
                    placeholder="Salary To"
                    value={formData.salary_to}
                    onChange={(e) =>
                      setFormData({ ...formData, salary_to: e.target.value })
                    }
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Deadline
                </label>
                <input
                  type="date"
                  className="border px-3 py-2 rounded w-full"
                  value={formData.deadline}
                  onChange={(e) =>
                    setFormData({ ...formData, deadline: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Type
                </label>
                <input
                  className="border px-3 py-2 rounded w-full"
                  placeholder="Full-time / Part-time"
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Status
                </label>
                <select
                  className="border px-3 py-2 rounded w-full"
                  value={formData.is_active}
                  onChange={(e) =>
                    setFormData({ ...formData, is_active: e.target.value })
                  }
                >
                  <option value="">Select status</option>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>

              <div className="flex justify-end gap-4 mt-4">
                <Button type="submit">
                  {formType === "add" ? "Add Job" : "Update Job"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
