"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import DashboardNav from "@/components/dashboard-nav";
import { Button } from "@/components/ui/button";
import { authService } from "@/lib/authService"; // أو حسب مكان الملف عندك

interface User {
  id: number;
  name: string;
  email: string;
}

interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  salary: string;
  description: string;
  requirements: string[];
}

export default function JobSearchPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [savedJobs, setSavedJobs] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState<"add" | "edit">("add");
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [applyingJobId, setApplyingJobId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    requiremnts: "",
    location: "",
    salary_from: "",
    salary_to: "",
    deadline: "",
    is_active: "",
  });

  useEffect(() => {
    const userData = localStorage.getItem("cvmaster_user");
    if (!userData) {
      router.push("/login");
      return;
    }
    setUser(JSON.parse(userData));

    const saved = localStorage.getItem("cvmaster_saved_jobs");
    if (saved) setSavedJobs(JSON.parse(saved));

    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await authService.getAllJobs();
      console.log("Jobs API response:", res);

      // ✅ هنا بناخد الداتا من res.data.data حسب شكل الـ API
      const jobsArray = res.data?.data || [];

      // نحولها لشكل بسيط يناسب الواجهة
      const formattedJobs = jobsArray.map((job: any) => ({
        id: job.id,
        title: job.title,
        company: job.company?.name || "Unknown Company",
        location: job.location,
        salary: `${job.salary_from} - ${job.salary_to}`,
        description: job.description,
        requirements: job.requirements
          ? job.requirements.split(",").map((r: string) => r.trim())
          : [],
      }));

      setJobs(formattedJobs);
      setFilteredJobs(formattedJobs);
    } catch (err) {
      console.error("Error fetching jobs:", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ فلترة الوظائف حسب العنوان والموقع
  useEffect(() => {
    let filtered = jobs;

    if (searchTerm) {
      filtered = filtered.filter(
        (job) =>
          job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.company.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (locationFilter) {
      filtered = filtered.filter((job) =>
        job.location.toLowerCase().includes(locationFilter.toLowerCase())
      );
    }

    setFilteredJobs(filtered);
  }, [searchTerm, locationFilter, jobs]);

  // ✅ حفظ وظيفة
  const toggleSaveJob = (jobId: number) => {
    const updated = savedJobs.includes(String(jobId))
      ? savedJobs.filter((id) => id !== String(jobId))
      : [...savedJobs, String(jobId)];
    setSavedJobs(updated);
    localStorage.setItem("cvmaster_saved_jobs", JSON.stringify(updated));
  };
  // =============================
  // 🔹 OPEN ADD OR EDIT FORM
  // =============================
 const handleOpenForm = (type: "add" | "edit", job?: any) => {
  setFormType(type);
  setShowForm(true);

  if (type === "edit" && job) {
    setSelectedJob(job);

    setFormData({
      title: job.title || "",
      description: job.description || "",
      requiremnts: job.requirements?.join(", ") || "",
      location: job.location || "",
      salary_from: job.salary.split(" - ")[0] || "",
      salary_to: job.salary.split(" - ")[1] || "",
      deadline: job.deadline || "",
      is_active: job.is_active || "",
    });
  } else {
    // إضافة وظيفة جديدة
    setSelectedJob(null);
    setFormData({
      title: "",
      description: "",
      requiremnts: "",
      location: "",
      salary_from: "",
      salary_to: "",
      deadline: "",
      is_active: "",
    });
  }
};

  const handleDeleteJob = async (id: number) => {
    if (!confirm("Are you sure you want to delete this Job?")) return;
    try {
      await authService.deleteJob(id);
      setJobs((prev) => prev.filter((j) => j.id !== id));
      toast({
        title: "Success",
        description: "Job deleted successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete Job.",
        variant: "destructive",
      });
    }
  };
  // =============================
  // 🔹 SUBMIT FORM (ADD / EDIT)
  // =============================
const handleSubmit = async (e: any) => {
  e.preventDefault();

  const payload = {
    title: formData.title,
    description: formData.description,
    requirements: formData.requiremnts,
    location: formData.location,
    salary_from: formData.salary_from,
    salary_to: formData.salary_to,
    deadline: formData.deadline,
    is_active: formData.is_active,
  };

  try {
    // ====== ADD NEW JOB ======
    if (formType === "add") {
      const res = await authService.createJob(payload);
      const created = res.data;

      const newJobFormatted = {
        id: created.id,
        title: created.title,
        company: created.company?.name || "Unknown Company",
        location: created.location,
        salary: `${created.salary_from} - ${created.salary_to}`,
        description: created.description,
        requirements: created.requirements?.split(",") || [],
      };

      setJobs((prev) => [...prev, newJobFormatted]);

      toast({
        title: "Success",
        description: "Job added successfully.",
      });
    }

    // ====== EDIT JOB ======
    if (formType === "edit" && selectedJob) {
      const res = await authService.updateJob(selectedJob.id, payload);
      const updated = res.data;

      const updatedFormatted = {
        id: updated.id,
        title: updated.title,
        company: updated.company?.name || "Unknown Company",
        location: updated.location,
        salary: `${updated.salary_from} - ${updated.salary_to}`,
        description: updated.description,
        requirements: updated.requirements?.split(",") || [],
      };

      setJobs((prev) =>
        prev.map((j) => (j.id === selectedJob.id ? updatedFormatted : j))
      );

      toast({
        title: "Success",
        description: "Job updated successfully.",
      });
    }

    setShowForm(false);
  } catch (error: any) {
    toast({
      title: "Error",
      description:
        error?.response?.data?.message || "Failed to save job.",
      variant: "destructive",
    });
  }
};


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading jobs...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav user={user!} />

      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-md p-8">
          <section className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-primary mb-2"> All Jobs</h1>
            <Button
              onClick={() => router.push("/admin/jobs/add")}
              className="bg-accent hover:bg-accent/90"
            >
              + Add New Job
            </Button>
          </section>

          {/* 🔹 Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Search by Title or Company
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                placeholder="e.g., React Developer"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Filter by Location
              </label>
              <input
                type="text"
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                placeholder="e.g., Remote, Cairo"
              />
            </div>
          </div>

          {/* 🔹 Jobs List */}
          <div className="space-y-4">
            {filteredJobs.length > 0 ? (
              filteredJobs.map((job) => (
                <div
                  key={job.id}
                  className="border border-border rounded-lg p-6 hover:shadow-md transition"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-primary">
                        Job Title: {job.title}
                      </h3>
                      <span className="text-muted-foreground">
                        Company Name :{" "}
                      </span>
                      <p className="text-muted-foreground">{job.company}</p>
                    </div>
                    {/* ============= heart icon for saving job ============= */}
                    {/* <div className="text-right">
                      <button
                        onClick={() => toggleSaveJob(job.id)}
                        className={`text-2xl ${
                          savedJobs.includes(String(job.id))
                            ? "text-accent"
                            : "text-gray-300"
                        }`}
                      >
                        ♥
                      </button>
                    </div> */}
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Location:</span>
                      <p className="font-medium text-foreground">
                        {job.location}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Salary:</span>
                      <p className="font-medium text-foreground">
                        {job.salary}
                      </p>
                    </div>
                  </div>
                  <span className="text-muted-foreground">
                    Job Description:
                  </span>

                  <p className="text-foreground mb-4"> {job.description}</p>

                  <div className="mb-4">
                    <p className="text-sm font-medium text-foreground mb-2">
                      Requirements:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {job.requirements?.map((req, idx) => (
                        <span
                          key={idx}
                          className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                        >
                          {req}
                        </span>
                      ))}
                    </div>
                  </div>

                  <section className="flex items-center gap-4">
                    {/* edit and delete buttons */}
                    <Button
                      onClick={() => handleOpenForm("edit", job)}
                      className="bg-accent hover:bg-accent/90"
                    >Edit</Button>
                    <button
                      onClick={() => handleDeleteJob(job.id)}
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </section>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  No jobs found matching your criteria
                </p>
              </div>
            )}
          </div>

          {/* Back Button */}
          <div className="mt-8 pt-8 border-t border-border">
            <Button
              onClick={() => router.push("/dashboard")}
              variant="outline"
              className="w-full"
            >
              Back to Dashboard
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
