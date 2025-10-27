"use client"

import { useState } from "react"
import { useCV } from "@/contexts/CVContext"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { LoaderCircle, CheckCircle, Plus, Trash2 } from "lucide-react"

interface AchievementsProps {
  onNext: () => void
}

export default function Achievements({ onNext }: AchievementsProps) {
  const { cvData, addAchievement, removeAchievement, updateAchievement } = useCV()
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
      <h2 className="font-bold text-lg">Achievements</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400">Add your notable achievements and awards</p>

      <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="mt-6">
        <div className="space-y-6">
          {cvData.achievements.map((achievement, index) => (
            <div key={achievement.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold">Achievement {index + 1}</h3>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => removeAchievement(achievement.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Achievement Title</label>
                  <Input
                    value={achievement.title}
                    onChange={(e) => updateAchievement(achievement.id, "title", e.target.value)}
                    className="w-full mt-1"
                    placeholder="e.g., Employee of the Year"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Date</label>
                  <Input
                    type="date"
                    value={achievement.date}
                    onChange={(e) => updateAchievement(achievement.id, "date", e.target.value)}
                    className="w-full mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    value={achievement.description}
                    onChange={(e) => updateAchievement(achievement.id, "description", e.target.value)}
                    className="w-full mt-1 min-h-[80px]"
                    placeholder="Describe the achievement and its significance..."
                  />
                </div>
              </div>
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            onClick={addAchievement}
            className="w-full"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Achievement
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
