"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardNav from "@/components/dashboard-nav";
import { Button } from "@/components/ui/button";
import { authService } from "@/lib/authService";
import axios from "axios";
import {
  Mail,
  MapPin,
  Briefcase,
  Award,
  Edit2,
  Save,
  X,
  Plus,
} from "lucide-react";

// ---------------- Interfaces -----------------
interface User {
  id?: number;
  name?: string;
  email?: string;
}

interface Skill {
  id?: number;
  title?: string;
  years_of_experience?: number;
  proficiency_level?: string;
}

interface Profile {
  id?: number;
  name?: string;
  email?: string;
  role?: string;
  phone_number?: string | null;
  location?: string | null;
  professional_bio?: string | null;
  years_of_experience?: number;
  skills?: Skill[];
}

// ---------------- Component -----------------
export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [showForm, setShowForm] = useState(false);

  const [newSkill, setNewSkill] = useState<Skill>({
    title: "",
    years_of_experience: 0,
    proficiency_level: "beginner",
  });

  // ---------------- Load Profile ----------------
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
        setSkills(profileData.skills || []);
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  // ---------------- Handle Inputs ----------------
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setNewSkill({ ...newSkill, [e.target.name]: e.target.value });
  };

  // ---------------- Add Skill ----------------
  const handleAddSkill = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem("token");

      const res = await axios.post(
        "http://127.0.0.1:8000/api/profile/skills",
        {
          skills: [newSkill], // ✅ Send as array
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const addedSkills: Skill[] = res.data.skills || [newSkill];
      setSkills((prev) => [...prev, ...addedSkills]);

      if (profile) {
        setProfile({
          ...profile,
          skills: [...(profile.skills || []), ...addedSkills],
        });
      }

      setNewSkill({
        title: "",
        years_of_experience: 0,
        proficiency_level: "beginner",
      });
      setShowForm(false);
    } catch (error: any) {
      console.error(
        "Error adding skill:",
        error.response?.data || error.message
      );
      alert("Failed to add skill. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  // ---------------- Remove Skill ----------------
  const handleRemoveSkill = async (skillId: number) => {
    if (!confirm("Are you sure you want to remove this skill?")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `http://127.0.0.1:8000/api/profile/skills/${skillId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      // تحديث الواجهة بعد الحذف
      setSkills((prev) => prev.filter((skill) => skill.id !== skillId));
      if (profile) {
        setProfile({
          ...profile,
          skills: (profile.skills || []).filter(
            (skill) => skill.id !== skillId
          ),
        });
      }
    } catch (error: any) {
      console.error(
        "Error removing skill:",
        error.response?.data || error.message
      );
      alert("Failed to remove skill. Check console for details.");
    }
  };

  // ---------------- Save Profile ----------------
  const handleSaveProfile = async () => {
    if (!profile) return;
    try {
      await authService.updateProfile(profile);
      localStorage.setItem("cvmaster_profile", JSON.stringify(profile));
      setEditing(false);
    } catch (error) {
      console.error("Error saving profile:", error);
    }
  };

  // ---------------- Loading State ----------------
  if (loading || !user || !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 to-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  // ---------------- Page Layout ----------------
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-900">
      <DashboardNav user={user} />
      <main className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
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

        {/* Basic Info */}
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

        {/* Bio */}
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

        {/* Years of Experience */}
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

        {/* Skills Section */}
        <div className="mb-8 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Skills</h2>
            <Button
              onClick={() => setShowForm(!showForm)}
              className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2"
            >
              <Plus size={18} /> {showForm ? "Cancel" : "Add Skill"}
            </Button>
          </div>

          <div className="flex flex-wrap gap-3 mb-6">
            {skills && skills.length > 0 ? (
              skills.map((skill, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2"
                >
                  {`${skill.title} ${skill.proficiency_level} (${skill.years_of_experience} yrs)`}

                  <button
                    onClick={() => handleRemoveSkill(skill.id!)}
                    className="ml-2 bg-white/20 hover:bg-white/30 rounded-full p-1"
                    title="Remove Skill"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))
            ) : (
              <p className="text-white/50 text-sm">No skills added yet</p>
            )}
          </div>

          {showForm && (
            <form onSubmit={handleAddSkill} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="text"
                  name="title"
                  value={newSkill.title}
                  onChange={handleChange}
                  placeholder="Skill Title"
                  required
                  className="px-4 py-3 bg-white/5 border border-white/10 text-white rounded-lg"
                />
                <input
                  type="number"
                  name="years_of_experience"
                  value={newSkill.years_of_experience}
                  onChange={handleChange}
                  placeholder="Years of Experience"
                  required
                  className="px-4 py-3 bg-white/5 border border-white/10 text-white rounded-lg"
                />
                <select
                  name="proficiency_level"
                  value={newSkill.proficiency_level}
                  onChange={handleChange}
                  className="px-4 py-3 bg-white/5 border border-white/10 text-white rounded-lg"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="expert">Expert</option>
                </select>
              </div>

              <div className="flex justify-end gap-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-gradient-to-r from-purple-500 to-purple-600 text-white"
                >
                  {loading ? "Saving..." : "Save Skill"}
                </Button>
              </div>
            </form>
          )}
        </div>

        {/* Save Button */}
        {editing && (
          <div className="flex gap-4 justify-end">
            <Button
              onClick={handleSaveProfile}
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
