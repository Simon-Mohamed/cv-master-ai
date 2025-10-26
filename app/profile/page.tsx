"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardNav from "@/components/dashboard-nav";
import { Button } from "@/components/ui/button";
import { authService } from "@/lib/authService";
import {
  Mail,
  MapPin,
  Briefcase,
  Award,
  Edit2,
  Save,
  X,
  Upload,
  Plus,
  MoreVertical,
  TrendingUp,
  Zap,
} from "lucide-react";
import Link from "next/link";

// ----------------- Interfaces ------------------
interface User {
  id?: number;
  name?: string;
  email?: string;
  created_at?: string;
}

export interface Education {
  id?: number;
  institution?: string;
  degree?: string;
  field_of_study?: string;
  start_date?: string;
  end_date?: string;
  grade?: string;
  description?: string;
}

export interface WorkExperience {
  id?: number;
  company_name?: string;
  position?: string;
  start_date?: string;
  end_date?: string;
  is_current?: boolean;
  location?: string;
  description?: string;
  achievements?: string;
}

export interface Skill {
  id?: number;
  years_of_experience?: number;
  proficiency_level?: string;
}

export interface JobApplication {
  id?: number;
  job_title?: string;
  status?: string;
}

export interface Profile {
  id?: number;
  name?: string;
  email?: string;
  role?: string;
  email_verified_at?: string | null;
  created_at?: string;
  updated_at?: string;
  education?: Education[];
  work_experiences?: WorkExperience[];
  skills?: Skill[];
  job_applications?: JobApplication[];
  phone_number?: string | null;
  location?: string | null;
  professional_bio?: string | null;
  years_of_experience?: number;
  profile_picture?: string | null;
}

interface CV {
  id?: string;
  name?: string;
  createdAt?: string;
}

// ---------------- Component --------------------

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [skillInput, setSkillInput] = useState("");
  const [cvs, setCvs] = useState<CV[]>([]);
  const [jobStats] = useState({
    applied: 12,
    interviewing: 3,
    offered: 1,
  });

  useEffect(() => {
    const fetchData = async () => {
      const userData = localStorage.getItem("cvmaster_user");
      if (!userData) {
        router.push("/login");
        return;
      }

      setUser(JSON.parse(userData));

      try {
        const profileData = await authService.getProfile();
        setProfile(profileData);
        localStorage.setItem("cvmaster_profile", JSON.stringify(profileData));
      } catch (error) {
        console.error("Error fetching profile:", error);
      }

      const savedCvs = localStorage.getItem("cvmaster_cvs");
      if (savedCvs) setCvs(JSON.parse(savedCvs));

      setLoading(false);
    };

    fetchData();
  }, [router]);

  const handleSave = () => {
    if (profile) {
      localStorage.setItem("cvmaster_profile", JSON.stringify(profile));
      setEditing(false);
    }
  };

  if (loading || !user || !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 to-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-900">
      <DashboardNav user={user} />

      <main className="max-w-6xl mx-auto px-4 py-12">
        {/* ---------------- Header ---------------- */}
        <div className="mb-8">
          <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-2xl">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                  {profile.name && profile.name.charAt(0).toUpperCase()}
                </div>

                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">
                    {profile.name}
                  </h1>
                  <p className="text-purple-200 text-lg">
                    {profile.role || "Professional"}
                  </p>
                </div>
              </div>

              <Button
                onClick={() => setEditing(!editing)}
                className={`flex items-center gap-2 px-6 py-2 rounded-lg font-semibold transition ${
                  editing
                    ? "bg-red-500 hover:bg-red-600 text-white"
                    : "bg-purple-500 hover:bg-purple-600 text-white"
                }`}
              >
                {editing ? (
                  <>
                    <X size={18} /> Cancel
                  </>
                ) : (
                  <>
                    <Edit2 size={18} /> Edit Profile
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* ---------------- Basic Info ---------------- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Mail size={20} className="text-purple-400" /> Basic Information
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-purple-200 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={profile.email}
                  disabled
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm text-purple-200 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={profile.phone_number || ""}
                  onChange={(e) =>
                    setProfile({ ...profile, phone_number: e.target.value })
                  }
                  disabled={!editing}
                  placeholder="+20..."
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white rounded-lg"
                />
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <MapPin size={20} className="text-purple-400" /> Location
            </h2>
            <input
              type="text"
              value={profile.location || ""}
              onChange={(e) =>
                setProfile({ ...profile, location: e.target.value })
              }
              disabled={!editing}
              placeholder="City, Country"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white rounded-lg"
            />
          </div>
        </div>

        {/* ---------------- Bio ---------------- */}
        <div className="mb-8 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Briefcase size={20} className="text-purple-400" /> Professional Bio
          </h2>
          <textarea
            value={profile.professional_bio || ""}
            onChange={(e) =>
              setProfile({ ...profile, professional_bio: e.target.value })
            }
            disabled={!editing}
            placeholder="Tell us about yourself..."
            className="w-full h-32 px-4 py-3 bg-white/5 border border-white/10 text-white rounded-lg"
          />
        </div>

        {/* ---------------- Experience ---------------- */}
        <div className="mb-8 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Award size={20} className="text-purple-400" /> Years of Experience
          </h2>
          <input
            type="number"
            value={profile.years_of_experience || 0}
            onChange={(e) =>
              setProfile({
                ...profile,
                years_of_experience: Number(e.target.value),
              })
            }
            disabled={!editing}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white rounded-lg"
          />
        </div>

        {/* ---------------- Skills ---------------- */}
        <div className="mb-8 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl">
          <h2 className="text-xl font-bold text-white mb-6">Skills</h2>
          <div className="flex flex-wrap gap-3 mb-6">
            {profile.skills && profile.skills.length > 0 ? (
              profile.skills.map((skill, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2"
                >
                  {`${skill.proficiency_level} (${skill.years_of_experience} yrs)`}
                </div>
              ))
            ) : (
              <p className="text-white/50 text-sm">No skills added yet</p>
            )}
          </div>
        </div>

        {/* ---------------- Action Buttons ---------------- */}
        {editing && (
          <div className="flex gap-4 justify-end">
            <Button
              onClick={handleSave}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold"
            >
              <Save size={18} /> Save Changes
            </Button>
            <Button
              onClick={() => setEditing(false)}
              variant="outline"
              className="px-8 py-3 rounded-lg font-semibold border-white/20 text-white hover:bg-white/10"
            >
              Cancel
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
