"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Save, X } from "lucide-react";
import { toast } from "sonner";
import FormSection, { CVData as BuilderCVData } from "./components/FormSection";
import ResumePreview from "./components/ResumePreview";

interface User {
  id?: string;
  name?: string;
  email?: string;
  createdAt?: string;
}

export default function CreateCVPage() {
  const STORAGE_VERSION = "2";
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const stepsTotal = 7;
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  const [cv, setCV] = useState<BuilderCVData>({
    personalInfo: { fullName: "", jobTitle: "", email: "", phone: "", location: "" },
    summary: "",
    experience: [],
    education: [],
    skills: [],
    projects: [],
    fontSize: 10.5,
    fontSizes: { name: 26, title: 14, body: 10.5 },
    linkifyContacts: false,
  });

  useEffect(() => {
    try {
      const storedVersion = typeof window !== "undefined" ? localStorage.getItem("cvmaster_storage_version") : null;
      if (storedVersion !== STORAGE_VERSION) {
        localStorage.removeItem("cvmaster_cv");
        localStorage.removeItem("cvmaster_cv_step");
        localStorage.setItem("cvmaster_storage_version", STORAGE_VERSION);
      }
      const userData = typeof window !== "undefined" ? localStorage.getItem("cvmaster_user") : null;
      if (userData) {
        setUser(JSON.parse(userData));
      }
      const saved = typeof window !== "undefined" ? localStorage.getItem("cvmaster_cv") : null;
      if (saved) setCV(JSON.parse(saved));
    } catch {
      // ignore localStorage issues
    } finally {
      setLoading(false);
    }
  }, []);

  const handleReset = () => {
    try {
      localStorage.removeItem("cvmaster_cv");
      setCV({
        personalInfo: { fullName: "", jobTitle: "", email: "", phone: "", location: "" },
        summary: "",
        experience: [],
        education: [],
        skills: [],
        projects: [],
        fontSize: 10.5,
        fontSizes: { name: 26, title: 14, body: 10.5 },
        linkifyContacts: false,
      });
      toast.success("Reset completed");
    } catch {
      toast.error("Failed to reset CV");
    }
  };

const handleSave = async () => {
  try {
    // Get token from localStorage (adjust the key if different)
    const token = localStorage.getItem("token") || localStorage.getItem("auth_token");
    
    if (!token) {
      toast.error("You must be logged in to save CV");
      return;
    }

    console.log("Saving CV with data:", cv);

    const res = await fetch(`${API_BASE}/api/user-cvs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
        "Accept": "application/json",
      },
      body: JSON.stringify({ 
        cv_json: cv,
        title: `CV - ${new Date().toLocaleDateString()}`,
      }),
    });

    const data = await res.json();
    console.log("Response:", data);

    if (!res.ok) {
      toast.error(`Failed to save CV: ${data.message || res.statusText}`);
      return;
    }

    toast.success("CV saved successfully");
    setShowSuccessPopup(true);
  } catch (e: any) {
    console.error("Save error:", e);
    toast.error(e?.message || "Failed to save CV");
  }
};

  return (
    <div className="min-h-screen bg-background relative">
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
              <span className="text-accent text-xl">📄</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground">CV Builder</h1>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="gap-2 bg-transparent" onClick={handleReset}>
              <X className="w-4 h-4" />
              Reset
            </Button>
            <Button
              onClick={handleSave}
              className="gap-2 bg-primary hover:bg-primary/90"
              disabled={currentStep < stepsTotal}
            >
              <Save className="w-4 h-4" />
              Save
            </Button>
          </div>
        </div>
      </header>

      <div className="relative">
        <div className="grid grid-cols-1 md:grid-cols-2 p-6 md:p-10 gap-8">
          <FormSection cv={cv} setCV={setCV} onStepChange={setCurrentStep} />
          <ResumePreview cv={cv} />
        </div>
      </div>

      {showSuccessPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-card rounded-lg shadow-lg p-6 max-w-sm w-full mx-4 text-center">
            <h2 className="text-lg font-semibold mb-2">Saved successfully</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Your CV has been saved. You can safely leave this page or continue editing.
            </p>
            <Button onClick={() => setShowSuccessPopup(false)} className="px-4 py-2">
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}