"use client"

import { useState } from "react"
import { useCV } from "@/contexts/CVContext"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { LoaderCircle, CheckCircle, Plus, Trash2 } from "lucide-react"

interface ExperienceProps {
  onNext: () => void
}

export default function Experience({ onNext }: ExperienceProps) {
  const { cvData, addExperience, removeExperience, updateExperience } = useCV()
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    setLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setLoading(false)
    onNext()
  }

  return (
    <div className="p-5 shadow-lg rounded-lg border-t-primary border-t-4 mt-10">
      <h2 className="font-bold text-lg">Work Experience</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400">Add your professional work experience</p>

      <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="mt-6">
        <div className="space-y-6">
          {cvData.experience.map((exp, index) => (
            <div key={exp.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold">Experience {index + 1}</h3>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => removeExperience(exp.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Company</label>
                  <Input
                    value={exp.company}
                    onChange={(e) => updateExperience(exp.id, "company", e.target.value)}
                    className="w-full mt-1"
                    placeholder="e.g., Tech Corp"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Position</label>
                  <Input
                    value={exp.position}
                    onChange={(e) => updateExperience(exp.id, "position", e.target.value)}
                    className="w-full mt-1"
                    placeholder="e.g., Software Engineer"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Start Date</label>
                  <Input
                    type="date"
                    value={exp.startDate}
                    onChange={(e) => updateExperience(exp.id, "startDate", e.target.value)}
                    className="w-full mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">End Date</label>
                  <Input
                    type="date"
                    value={exp.endDate}
                    onChange={(e) => updateExperience(exp.id, "endDate", e.target.value)}
                    className="w-full mt-1"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="text-sm font-medium">Job Description</label>
                <Textarea
                  value={exp.description}
                  onChange={(e) => updateExperience(exp.id, "description", e.target.value)}
                  className="w-full mt-1 min-h-[100px]"
                  placeholder="Describe your key responsibilities and achievements..."
                />
              </div>
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            onClick={addExperience}
            className="w-full"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Experience
          </Button>
        </div>

        <div className="mt-6 flex justify-end">
          <Button
            type="submit"
            disabled={loading}
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
