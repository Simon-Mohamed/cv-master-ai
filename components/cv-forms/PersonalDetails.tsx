"use client"

import { useState } from "react"
import { useCV } from "@/contexts/CVContext"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { LoaderCircle, CheckCircle } from "lucide-react"

interface PersonalDetailsProps {
  onNext: () => void
}

export default function PersonalDetails({ onNext }: PersonalDetailsProps) {
  const { cvData, updatePersonalInfo } = useCV()
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    setLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setLoading(false)
    onNext()
  }

  const isFormValid = () => {
    return (
      cvData.personalInfo.firstName &&
      cvData.personalInfo.lastName &&
      cvData.personalInfo.jobTitle &&
      cvData.personalInfo.address &&
      cvData.personalInfo.phone &&
      cvData.personalInfo.email
    )
  }

  return (
    <div className="p-5 shadow-lg rounded-lg border-t-primary border-t-4 mt-10">
      <h2 className="font-bold text-lg">Personal Details</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400">Get started with basic information</p>

      <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="mt-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">First Name</label>
            <Input
              value={cvData.personalInfo.firstName}
              onChange={(e) => updatePersonalInfo("firstName", e.target.value)}
              className="w-full mt-1"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium">Last Name</label>
            <Input
              value={cvData.personalInfo.lastName}
              onChange={(e) => updatePersonalInfo("lastName", e.target.value)}
              className="w-full mt-1"
              required
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-sm font-medium">Job Title</label>
            <Input
              value={cvData.personalInfo.jobTitle}
              onChange={(e) => updatePersonalInfo("jobTitle", e.target.value)}
              className="w-full mt-1"
              required
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-sm font-medium">Address</label>
            <Input
              value={cvData.personalInfo.address}
              onChange={(e) => updatePersonalInfo("address", e.target.value)}
              className="w-full mt-1"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium">Phone</label>
            <Input
              value={cvData.personalInfo.phone}
              onChange={(e) => updatePersonalInfo("phone", e.target.value)}
              className="w-full mt-1"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium">Email</label>
            <Input
              type="email"
              value={cvData.personalInfo.email}
              onChange={(e) => updatePersonalInfo("email", e.target.value)}
              className="w-full mt-1"
              required
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-sm font-medium">LinkedIn URL</label>
            <Input
              value={cvData.personalInfo.linkedin}
              onChange={(e) => updatePersonalInfo("linkedin", e.target.value)}
              className="w-full mt-1"
              placeholder="https://linkedin.com/in/username"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button
            type="submit"
            disabled={!isFormValid() || loading}
            className="bg-primary hover:bg-primary/90"
          >
            {loading ? (
              <>
                <LoaderCircle className="animate-spin mr-2 h-4 w-4" />
                Saving...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Save & Continue
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
