"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [savedJobs, setSavedJobs] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [applyingJobId, setApplyingJobId] = useState<number | null>(null);

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

  // ✅ التقديم على وظيفة
  const handleApply = async (jobId: number) => {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = ".pdf,.doc,.docx";

    fileInput.onchange = async (e: any) => {
      const file = e.target.files[0];
      if (!file) return;

      const formData = new FormData();
      formData.append("cv", file);

      try {
        setApplyingJobId(jobId);
        const res = await authService.applyToJob(jobId, formData);
        alert(res.message || "Application submitted successfully!");
      } catch (err: any) {
        alert(err.message || "Failed to apply for this job.");
      } finally {
        setApplyingJobId(null);
      }
    };

    fileInput.click();
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
          <h1 className="text-3xl font-bold text-primary mb-2">Job Search</h1>
          <p className="text-muted-foreground mb-8">
            Find jobs matched to your skills and experience
          </p>

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
                        {job.title}
                      </h3>
                      <p className="text-muted-foreground">{job.company}</p>
                    </div>
                    <div className="text-right">
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
                    </div>
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

                  <p className="text-foreground mb-4">{job.description}</p>

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

                  <Button
                    onClick={() => handleApply(job.id)}
                    disabled={applyingJobId === job.id}
                    className="bg-accent hover:bg-accent/90"
                  >
                    {applyingJobId === job.id ? "Applying..." : "Apply Now"}
                  </Button>
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
              onClick={() => router.push("/")}
              variant="outline"
              className="w-full"
            >
              Back to Home Page
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
