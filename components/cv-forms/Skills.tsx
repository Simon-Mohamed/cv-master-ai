"use client"

import { useState } from "react"
import { useCV } from "@/contexts/CVContext"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { LoaderCircle, CheckCircle, Plus, Trash2 } from "lucide-react"

interface SkillsProps {
  onNext: () => void
}

export default function Skills({ onNext }: SkillsProps) {
  const { cvData, updateSkills } = useCV()
  const [loading, setLoading] = useState(false)
  const [newSkill, setNewSkill] = useState("")

  const handleSave = async () => {
    setLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setLoading(false)
    onNext()
  }

  const addSkill = () => {
    if (newSkill.trim() && !cvData.skills.includes(newSkill.trim())) {
      const updatedSkills = [...cvData.skills, newSkill.trim()]
      updateSkills(updatedSkills)
      setNewSkill("")
    }
  }

  const removeSkill = (skillToRemove: string) => {
    const updatedSkills = cvData.skills.filter(skill => skill !== skillToRemove)
    updateSkills(updatedSkills)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addSkill()
    }
  }

  return (
    <div className="p-5 shadow-lg rounded-lg border-t-primary border-t-4 mt-10">
      <h2 className="font-bold text-lg">Skills</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400">Add your technical and soft skills</p>

      <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="mt-6">
        <div className="space-y-4">
          {/* Add New Skill */}
          <div className="flex gap-2">
            <Input
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter a skill (e.g., JavaScript, Project Management)"
              className="flex-1"
            />
            <Button
              type="button"
              onClick={addSkill}
              disabled={!newSkill.trim() || cvData.skills.includes(newSkill.trim())}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Skill
            </Button>
          </div>

          {/* Skills List */}
          {cvData.skills.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-medium text-sm">Your Skills:</h3>
              <div className="flex flex-wrap gap-2">
                {cvData.skills.map((skill, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 bg-primary/10 text-primary px-3 py-2 rounded-lg"
                  >
                    <span className="text-sm">{skill}</span>
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="text-primary hover:text-primary/70 transition-colors"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bulk Add Option */}
          <div className="border-t pt-4">
            <p className="text-sm text-gray-500 mb-2">Or add multiple skills at once:</p>
            <textarea
              className="w-full px-3 py-2 rounded-md bg-background border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent h-20 resize-none"
              placeholder="Enter skills separated by commas (e.g., JavaScript, React, Node.js, Project Management, Leadership)"
              onChange={(e) => {
                const skills = e.target.value
                  .split(",")
                  .map(skill => skill.trim())
                  .filter(skill => skill.length > 0)
                updateSkills(skills)
              }}
            />
            <p className="text-xs text-gray-500 mt-1">
              Separate multiple skills with commas
            </p>
          </div>
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
