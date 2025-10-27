"use client"

import { useState } from "react"
import { useCV } from "@/contexts/CVContext"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { LoaderCircle, CheckCircle, Plus, Trash2 } from "lucide-react"

interface ProjectsProps {
  onNext: () => void
}

export default function Projects({ onNext }: ProjectsProps) {
  const { cvData, addProject, removeProject, updateProject } = useCV()
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
      <h2 className="font-bold text-lg">Projects</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400">Add your notable projects and achievements</p>

      <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="mt-6">
        <div className="space-y-6">
          {cvData.projects.map((project, index) => (
            <div key={project.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold">Project {index + 1}</h3>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => removeProject(project.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Project Name</label>
                  <Input
                    value={project.name}
                    onChange={(e) => updateProject(project.id, "name", e.target.value)}
                    className="w-full mt-1"
                    placeholder="e.g., E-commerce Website"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Technologies Used</label>
                  <Input
                    value={project.technologies}
                    onChange={(e) => updateProject(project.id, "technologies", e.target.value)}
                    className="w-full mt-1"
                    placeholder="e.g., React, Node.js, MongoDB"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Project URL</label>
                  <Input
                    value={project.url}
                    onChange={(e) => updateProject(project.id, "url", e.target.value)}
                    className="w-full mt-1"
                    placeholder="https://github.com/username/project"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    value={project.description}
                    onChange={(e) => updateProject(project.id, "description", e.target.value)}
                    className="w-full mt-1 min-h-[100px]"
                    placeholder="Describe the project, your role, and key achievements..."
                  />
                </div>
              </div>
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            onClick={addProject}
            className="w-full"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Project
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
