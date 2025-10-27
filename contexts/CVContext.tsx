"use client"

import { createContext, useContext, useState, ReactNode } from "react"

interface CVData {
  template: "modernist" | "classic" | "creative" | "minimalist"
  themeColor: string
  personalInfo: {
    firstName: string
    lastName: string
    jobTitle: string
    address: string
    phone: string
    email: string
    linkedin: string
  }
  summary: string
  experience: Array<{
    id: string
    company: string
    position: string
    startDate: string
    endDate: string
    description: string
  }>
  education: Array<{
    id: string
    school: string
    degree: string
    field: string
    graduationDate: string
  }>
  projects: Array<{
    id: string
    name: string
    description: string
    technologies: string
    url: string
  }>
  achievements: Array<{
    id: string
    title: string
    description: string
    date: string
  }>
  skills: string[]
}

interface CVContextType {
  cvData: CVData
  setCVData: (data: CVData | ((prev: CVData) => CVData)) => void
  updatePersonalInfo: (field: string, value: string) => void
  updateExperience: (id: string, field: string, value: string) => void
  updateEducation: (id: string, field: string, value: string) => void
  updateProject: (id: string, field: string, value: string) => void
  updateAchievement: (id: string, field: string, value: string) => void
  addExperience: () => void
  removeExperience: (id: string) => void
  addEducation: () => void
  removeEducation: (id: string) => void
  addProject: () => void
  removeProject: (id: string) => void
  addAchievement: () => void
  removeAchievement: (id: string) => void
  updateSkills: (skills: string[]) => void
  updateSummary: (summary: string) => void
  updateThemeColor: (color: string) => void
  updateTemplate: (template: CVData['template']) => void
}

const CVContext = createContext<CVContextType | undefined>(undefined)

const initialCVData: CVData = {
  template: "modernist",
  themeColor: "#000000",
  personalInfo: {
    firstName: "",
    lastName: "",
    jobTitle: "",
    address: "",
    phone: "",
    email: "",
    linkedin: "",
  },
  summary: "",
  experience: [],
  education: [],
  projects: [],
  achievements: [],
  skills: [],
}

export function CVProvider({ children }: { children: ReactNode }) {
  const [cvData, setCVData] = useState<CVData>(initialCVData)

  const updatePersonalInfo = (field: string, value: string) => {
    setCVData(prev => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        [field]: value,
      },
    }))
  }

  const updateExperience = (id: string, field: string, value: string) => {
    setCVData(prev => ({
      ...prev,
      experience: prev.experience.map(exp => 
        exp.id === id ? { ...exp, [field]: value } : exp
      ),
    }))
  }

  const updateEducation = (id: string, field: string, value: string) => {
    setCVData(prev => ({
      ...prev,
      education: prev.education.map(edu => 
        edu.id === id ? { ...edu, [field]: value } : edu
      ),
    }))
  }

  const updateProject = (id: string, field: string, value: string) => {
    setCVData(prev => ({
      ...prev,
      projects: prev.projects.map(project => 
        project.id === id ? { ...project, [field]: value } : project
      ),
    }))
  }

  const updateAchievement = (id: string, field: string, value: string) => {
    setCVData(prev => ({
      ...prev,
      achievements: prev.achievements.map(achievement => 
        achievement.id === id ? { ...achievement, [field]: value } : achievement
      ),
    }))
  }

  const addExperience = () => {
    setCVData(prev => ({
      ...prev,
      experience: [
        ...prev.experience,
        {
          id: Date.now().toString(),
          company: "",
          position: "",
          startDate: "",
          endDate: "",
          description: "",
        },
      ],
    }))
  }

  const removeExperience = (id: string) => {
    setCVData(prev => ({
      ...prev,
      experience: prev.experience.filter(exp => exp.id !== id),
    }))
  }

  const addEducation = () => {
    setCVData(prev => ({
      ...prev,
      education: [
        ...prev.education,
        {
          id: Date.now().toString(),
          school: "",
          degree: "",
          field: "",
          graduationDate: "",
        },
      ],
    }))
  }

  const removeEducation = (id: string) => {
    setCVData(prev => ({
      ...prev,
      education: prev.education.filter(edu => edu.id !== id),
    }))
  }

  const addProject = () => {
    setCVData(prev => ({
      ...prev,
      projects: [
        ...prev.projects,
        {
          id: Date.now().toString(),
          name: "",
          description: "",
          technologies: "",
          url: "",
        },
      ],
    }))
  }

  const removeProject = (id: string) => {
    setCVData(prev => ({
      ...prev,
      projects: prev.projects.filter(project => project.id !== id),
    }))
  }

  const addAchievement = () => {
    setCVData(prev => ({
      ...prev,
      achievements: [
        ...prev.achievements,
        {
          id: Date.now().toString(),
          title: "",
          description: "",
          date: "",
        },
      ],
    }))
  }

  const removeAchievement = (id: string) => {
    setCVData(prev => ({
      ...prev,
      achievements: prev.achievements.filter(achievement => achievement.id !== id),
    }))
  }

  const updateSkills = (skills: string[]) => {
    setCVData(prev => ({
      ...prev,
      skills,
    }))
  }

  const updateSummary = (summary: string) => {
    setCVData(prev => ({
      ...prev,
      summary,
    }))
  }

  const updateThemeColor = (color: string) => {
    setCVData(prev => ({
      ...prev,
      themeColor: color,
    }))
  }

  const updateTemplate = (template: CVData['template']) => {
    setCVData(prev => ({
      ...prev,
      template,
    }))
  }

  return (
    <CVContext.Provider
      value={{
        cvData,
        setCVData,
        updatePersonalInfo,
        updateExperience,
        updateEducation,
        updateProject,
        updateAchievement,
        addExperience,
        removeExperience,
        addEducation,
        removeEducation,
        addProject,
        removeProject,
        addAchievement,
        removeAchievement,
        updateSkills,
        updateSummary,
        updateThemeColor,
        updateTemplate,
      }}
    >
      {children}
    </CVContext.Provider>
  )
}

export function useCV() {
  const context = useContext(CVContext)
  if (context === undefined) {
    throw new Error("useCV must be used within a CVProvider")
  }
  return context
}
