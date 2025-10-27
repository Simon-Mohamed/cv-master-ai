"use client"

import { useState } from "react"
import { useCV } from "@/contexts/CVContext"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { LoaderCircle, CheckCircle, Plus, Trash2 } from "lucide-react"

interface EducationProps {
  onNext: () => void
}

export default function Education({ onNext }: EducationProps) {
  const { cvData, addEducation, removeEducation, updateEducation } = useCV()
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
      <h2 className="font-bold text-lg">Education</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400">Add your educational background</p>

      <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="mt-6">
        <div className="space-y-6">
          {cvData.education.map((edu, index) => (
            <div key={edu.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold">Education {index + 1}</h3>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => removeEducation(edu.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Degree</label>
                  <Input
                    value={edu.degree}
                    onChange={(e) => updateEducation(edu.id, "degree", e.target.value)}
                    className="w-full mt-1"
                    placeholder="e.g., Bachelor of Science"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Institution</label>
                  <Input
                    value={edu.school}
                    onChange={(e) => updateEducation(edu.id, "school", e.target.value)}
                    className="w-full mt-1"
                    placeholder="e.g., University Name"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Field of Study</label>
                  <Input
                    value={edu.field}
                    onChange={(e) => updateEducation(edu.id, "field", e.target.value)}
                    className="w-full mt-1"
                    placeholder="e.g., Computer Science"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Graduation Date</label>
                  <Input
                    type="date"
                    value={edu.graduationDate}
                    onChange={(e) => updateEducation(edu.id, "graduationDate", e.target.value)}
                    className="w-full mt-1"
                  />
                </div>
              </div>
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            onClick={addEducation}
            className="w-full"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Education
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
