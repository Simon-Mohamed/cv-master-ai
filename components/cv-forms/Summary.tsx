"use client"

import { useState } from "react"
import { useCV } from "@/contexts/CVContext"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { LoaderCircle, CheckCircle, Brain } from "lucide-react"

interface SummaryProps {
  onNext: () => void
}

export default function Summary({ onNext }: SummaryProps) {
  const { cvData, updateSummary } = useCV()
  const [loading, setLoading] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)

  const handleSave = async () => {
    setLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setLoading(false)
    onNext()
  }

  const generateAISummary = async () => {
    setAiLoading(true)
    try {
      const prompt = `Generate a professional summary for a ${cvData.personalInfo.jobTitle} position. The person's name is ${cvData.personalInfo.firstName} ${cvData.personalInfo.lastName}. 
      
      Create a compelling 3-4 sentence professional summary that highlights key strengths, experience level, and career objectives. Make it specific to the ${cvData.personalInfo.jobTitle} role and professional.`
      // api link
      const response = await fetch('', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // api key
          'Authorization': ''
        },
        body: JSON.stringify({
        // model name
          model: '',
          messages: [
            {
              role: 'system',
              content: 'You are a professional resume writer and career advisor. Generate compelling, professional summaries for resumes.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 200
        })
      })

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`)
      }

      const data = await response.json()
      const aiSummary = data.choices[0].message.content.trim()
      
      updateSummary(aiSummary)
    } catch (error) {
      console.error("AI generation failed:", error)
      
      // Fallback summary
      const fallbackSummary = `Experienced ${cvData.personalInfo.jobTitle} with a strong background in delivering high-quality solutions. Proven track record of success in collaborative environments and commitment to continuous learning and professional development.`
      
      updateSummary(fallbackSummary)
      alert('Using fallback summary due to API error. Please check your connection.')
    } finally {
      setAiLoading(false)
    }
  }

  return (
    <div className="p-5 shadow-lg rounded-lg border-t-primary border-t-4 mt-10">
      <h2 className="font-bold text-lg">Professional Summary</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400">Add a compelling summary for your CV</p>

      <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="mt-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3">
          <label className="font-medium">Professional Summary</label>
          <Button
            type="button"
            size="sm"
            onClick={generateAISummary}
            disabled={aiLoading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {aiLoading ? (
              <>
                <LoaderCircle className="animate-spin mr-2 h-4 w-4" />
                Generating...
              </>
            ) : (
              <>
                <Brain className="mr-2 h-4 w-4" />
                Generate with AI
              </>
            )}
          </Button>
        </div>

        <Textarea
          className="mt-4 w-full min-h-[120px]"
          value={cvData.summary}
          onChange={(e) => updateSummary(e.target.value)}
          placeholder="Write a compelling professional summary that highlights your key strengths, experience, and career objectives..."
        />

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
