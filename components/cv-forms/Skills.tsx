"use client"

import { useState } from "react"
import { useCV } from "@/contexts/CVContext"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { LoaderCircle, CheckCircle } from "lucide-react"

interface SkillsProps {
  onNext: () => void
}

export default function Skills({ onNext }: SkillsProps) {
  const { cvData, updateSkills } = useCV()
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    setLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setLoading(false)
    onNext()
  }

  const handleSkillsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const skills = e.target.value
      .split(",")
      .map(skill => skill.trim())
      .filter(skill => skill.length > 0)
    updateSkills(skills)
  }

  return (
    <div className="p-5 shadow-lg rounded-lg border-t-primary border-t-4 mt-10">
      <h2 className="font-bold text-lg">Skills</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400">Add your technical and soft skills</p>

      <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="mt-6">
        <div>
          <label className="text-sm font-medium">Skills</label>
          <Textarea
            className="mt-1 w-full min-h-[120px]"
            value={cvData.skills.join(", ")}
            onChange={handleSkillsChange}
            placeholder="Enter skills separated by commas (e.g., JavaScript, React, Node.js, Project Management, Leadership)"
          />
          <p className="text-xs text-gray-500 mt-1">
            Separate multiple skills with commas
          </p>
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
