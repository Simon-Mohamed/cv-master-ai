"use client"

import { useState } from "react"
import { ArrowLeft, ArrowRight, Home, BarChart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import PersonalDetails from "./PersonalDetails"
import Summary from "./Summary"
import Education from "./Education"
import Experience from "./Experience"
import Projects from "./Projects"
import Achievements from "./Achievements"
import Skills from "./Skills"
import ThemeColor from "./ThemeColor"
import PDFExport from "./PDFExport"
import AIAnalysis from "./AIAnalysis"

const steps = [
  { id: 1, name: "Personal Details", component: PersonalDetails },
  { id: 2, name: "Summary", component: Summary },
  { id: 3, name: "Education", component: Education },
  { id: 4, name: "Experience", component: Experience },
  { id: 5, name: "Projects", component: Projects },
  { id: 6, name: "Achievements", component: Achievements },
  { id: 7, name: "Skills", component: Skills },
]

export default function FormNavigation() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [showAnalysis, setShowAnalysis] = useState(false)

  const currentStepData = steps.find(step => step.id === currentStep)
  const CurrentComponent = currentStepData?.component

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleFinish = () => {
    router.push("/dashboard")
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-6">
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        {/* Left Side: Home + Theme Toggle */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard")}
            className="gap-2"
          >
            <Home className="w-4 h-4" />
            Dashboard
          </Button>
          <ThemeColor />
        </div>

        {/* Right Side: Navigation Buttons */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowAnalysis(!showAnalysis)}
            className="gap-2"
          >
            <BarChart className="w-4 h-4" />
            {showAnalysis ? 'Hide Analysis' : 'Show Analysis'}
          </Button>
          <PDFExport />
          {currentStep > 1 && (
            <Button
              size="sm"
              variant="outline"
              onClick={handlePrevious}
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </Button>
          )}
          {currentStep === steps.length && (
            <Button
              size="sm"
              onClick={handleFinish}
              className="bg-green-600 hover:bg-green-700"
            >
              Finish
            </Button>
          )}
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">
            Step {currentStep} of {steps.length}
          </span>
          <span className="text-sm text-muted-foreground">
            {currentStepData?.name}
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / steps.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Main Content Grid */}
      <div className={`grid gap-6 transition-all duration-300 ${
        showAnalysis ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'
      }`}>
        {/* Form Content */}
        <div>
          {CurrentComponent && (
            <CurrentComponent onNext={handleNext} />
          )}
        </div>

        {/* AI Analysis Panel */}
        {showAnalysis && (
          <div className="bg-card border rounded-lg overflow-y-auto max-h-[600px]">
            <AIAnalysis />
          </div>
        )}
      </div>
    </div>
  )
}
