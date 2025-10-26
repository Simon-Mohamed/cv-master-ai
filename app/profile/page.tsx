"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import DashboardNav from "@/components/dashboard-nav"
import { Button } from "@/components/ui/button"
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
} from "lucide-react"
import Link from "next/link"

interface User {
  id: string
  name: string
  email: string
  createdAt: string
}

interface ProfileData {
  phone?: string
  location?: string
  bio?: string
  skills?: string[]
  experience?: string
  title?: string
  avatar?: string
}

interface CV {
  id: string
  name: string
  createdAt: string
}

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<ProfileData>({})
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [skillInput, setSkillInput] = useState("")
  const [cvs, setCvs] = useState<CV[]>([])
  const [jobStats, setJobStats] = useState({ applied: 12, interviewing: 3, offered: 1 })

  useEffect(() => {
    const userData = localStorage.getItem("cvmaster_user")
    if (!userData) {
      router.push("/login")
      return
    }
    setUser(JSON.parse(userData))

    const profileData = localStorage.getItem("cvmaster_profile")
    if (profileData) {
      setProfile(JSON.parse(profileData))
    }

    const savedCvs = localStorage.getItem("cvmaster_cvs")
    if (savedCvs) {
      setCvs(JSON.parse(savedCvs))
    }

    setLoading(false)
  }, [router])

  const handleSave = () => {
    localStorage.setItem("cvmaster_profile", JSON.stringify(profile))
    setEditing(false)
  }

  const addSkill = () => {
    if (skillInput.trim()) {
      setProfile({
        ...profile,
        skills: [...(profile.skills || []), skillInput.trim()],
      })
      setSkillInput("")
    }
  }

  const removeSkill = (index: number) => {
    setProfile({
      ...profile,
      skills: profile.skills?.filter((_, i) => i !== index) || [],
    })
  }

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900  to-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900  to-slate-900">
      <DashboardNav user={user} />

      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="mb-8">
          <div className="relative">
            {/* Background gradient card */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-purple-400 rounded-2xl blur-xl opacity-20"></div>

            <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-2xl">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                  {/* Avatar */}
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    {editing && (
                      <button className="absolute bottom-0 right-0 bg-purple-500 hover:bg-purple-600 text-white p-2 rounded-full shadow-lg transition">
                        <Upload size={16} />
                      </button>
                    )}
                  </div>

                  {/* User info */}
                  <div>
                    <h1 className="text-3xl font-bold text-white mb-2">{user.name}</h1>
                    {editing ? (
                      <input
                        type="text"
                        value={profile.title || ""}
                        onChange={(e) => setProfile({ ...profile, title: e.target.value })}
                        placeholder="Your professional title"
                        className="bg-white/20 border border-white/30 text-white placeholder-white/50 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    ) : (
                      <p className="text-purple-200 text-lg">{profile.title || "Professional"}</p>
                    )}
                  </div>
                </div>

                {/* Edit button */}
                <Button
                  onClick={() => setEditing(!editing)}
                  className={`flex items-center gap-2 px-6 py-2 rounded-lg font-semibold transition ${
                    editing ? "bg-red-500 hover:bg-red-600 text-white" : "bg-purple-500 hover:bg-purple-600 text-white"
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
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Basic Info Card */}
          <div className="lg:col-span-2">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl blur-xl opacity-20"></div>
              <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <Mail size={20} className="text-purple-400" />
                  Basic Information
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-purple-200 mb-2">Email Address</label>
                    <input
                      type="email"
                      value={user.email}
                      disabled
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white rounded-lg disabled:opacity-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-purple-200 mb-2">Phone Number</label>
                    <input
                      type="tel"
                      value={profile.phone || ""}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      disabled={!editing}
                      placeholder="+1 (555) 000-0000"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white placeholder-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 transition"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Location Card */}
          <div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur-xl opacity-20"></div>
              <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl h-full">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <MapPin size={20} className="text-purple-400" />
                  Location
                </h2>
                <input
                  type="text"
                  value={profile.location || ""}
                  onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                  disabled={!editing}
                  placeholder="City, Country"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white placeholder-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 transition"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bio Section */}
        <div className="mb-8">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur-xl opacity-20"></div>
            <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Briefcase size={20} className="text-purple-400" />
                Professional Bio
              </h2>
              <textarea
                value={profile.bio || ""}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                disabled={!editing}
                placeholder="Tell us about yourself and your professional journey..."
                className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white placeholder-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 transition h-32 resize-none"
              />
            </div>
          </div>
        </div>

        {/* Experience Section */}
        <div className="mb-8">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-600 rounded-2xl blur-xl opacity-20"></div>
            <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Award size={20} className="text-purple-400" />
                Years of Experience
              </h2>
              <input
                type="text"
                value={profile.experience || ""}
                onChange={(e) => setProfile({ ...profile, experience: e.target.value })}
                disabled={!editing}
                placeholder="e.g., 5 years"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white placeholder-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 transition"
              />
            </div>
          </div>
        </div>

        {/* Skills Section */}
        <div className="mb-8">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl blur-xl opacity-20"></div>
            <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl">
              <h2 className="text-xl font-bold text-white mb-6">Skills</h2>

              {/* Skills display */}
              <div className="flex flex-wrap gap-3 mb-6">
                {profile.skills && profile.skills.length > 0 ? (
                  profile.skills.map((skill, index) => (
                    <div
                      key={index}
                      className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 hover:shadow-lg transition"
                    >
                      {skill}
                      {editing && (
                        <button onClick={() => removeSkill(index)} className="ml-2 hover:text-red-200 transition">
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-white/50 text-sm">No skills added yet</p>
                )}
              </div>

              {/* Add skill input */}
              {editing && (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && addSkill()}
                    placeholder="Add a new skill..."
                    className="flex-1 px-4 py-2 bg-white/5 border border-white/10 text-white placeholder-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                  />
                  <Button
                    onClick={addSkill}
                    className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition"
                  >
                    Add
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* My CVs Card */}
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl hover:shadow-xl transition-shadow duration-300">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">My CVs</h2>
              <Link href="/create-cv">
                <button className="flex items-center gap-2 text-sm font-bold text-purple-400 hover:text-purple-300 transition-colors">
                  <span>Add New</span>
                  <Plus size={18} />
                </button>
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {cvs.length > 0 ? (
                cvs.map((cv) => (
                  <div key={cv.id} className="relative group">
                    <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-lg p-4 aspect-[3/4] flex flex-col justify-end hover:shadow-lg transition-all duration-300 group-hover:scale-105 cursor-pointer">
                      <p className="text-white text-sm font-bold truncate">{cv.name}</p>
                    </div>
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="text-white bg-black/30 rounded-full p-1.5 hover:bg-black/50">
                        <MoreVertical size={16} />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-white/50 text-sm col-span-2">No CVs created yet</p>
              )}
            </div>
          </div>

          {/* Job Applications Card */}
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl hover:shadow-xl transition-shadow duration-300">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Job Applications</h2>
              <Link href="/job-search" className="text-sm font-bold text-purple-400 hover:text-purple-300 transition-colors">
                View All
              </Link>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-white/70">Applied</span>
                <span className="font-bold text-white text-lg">{jobStats.applied}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/70">Interviewing</span>
                <span className="font-bold text-white text-lg">{jobStats.interviewing}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/70">Offered</span>
                <span className="font-bold text-white text-lg">{jobStats.offered}</span>
              </div>
              <div className="mt-6">
                <p className="text-sm text-white/70 mb-2">Application Progress</p>
                <div className="w-full bg-white/10 rounded-full h-2.5">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-purple-600 h-2.5 rounded-full"
                    style={{ width: "25%" }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* AI Tools Card */}
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl hover:shadow-xl transition-shadow duration-300">
            <h2 className="text-xl font-bold text-white mb-6">AI Tools</h2>
            <div className="space-y-5">
              <Link href="/cv-analysis">
                <div className="flex items-start gap-4 group cursor-pointer">
                  <div className="flex-shrink-0 size-12 bg-purple-500/20 text-purple-400 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                    <TrendingUp size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-white group-hover:text-purple-300 transition">CV Analyzer</h3>
                    <p className="text-sm text-white/60">Get AI feedback on your CV</p>
                  </div>
                </div>
              </Link>
              <Link href="/shadow-interviews">
                <div className="flex items-start gap-4 group cursor-pointer">
                  <div className="flex-shrink-0 size-12 bg-purple-500/20 text-purple-400 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                    <Zap size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-white group-hover:text-purple-300 transition">Interview Simulator</h3>
                    <p className="text-sm text-white/60">Practice with AI-powered interviews</p>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {editing && (
          <div className="flex gap-4 justify-end">
            <Button
              onClick={handleSave}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-8 py-3 rounded-lg font-semibold transition shadow-lg"
            >
              <Save size={18} /> Save Changes
            </Button>
            <Button
              onClick={() => setEditing(false)}
              variant="outline"
              className="px-8 py-3 rounded-lg font-semibold border-white/20 text-white hover:bg-white/10 transition"
            >
              Cancel
            </Button>
          </div>
        )}
      </main>
    </div>
  )
}
