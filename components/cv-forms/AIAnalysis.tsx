"use client"

import { useState } from "react"
import { useCV } from "@/contexts/CVContext"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { 
  LoaderCircle, 
  Brain, 
  CheckCircle, 
  AlertCircle, 
  Rocket,
  Search,
  Layers,
  FileText,
  Briefcase,
  GraduationCap,
  Trophy,
  Code2,
  Sparkles
} from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface AnalysisResult {
  overallScore: number
  ats_keywords: Array<{
    keyword: string
    score: number
    recommended_sections: string[]
    example_usage: string
  }>
  section_edits: {
    summary: string[]
    skills: string[]
    experience: string[]
    education: string[]
    projects: string[]
    achievements: string[]
  }
  skill_gaps: Array<{
    skill: string
    importance: number
    improvement_strategy: string
    resources: string[]
  }>
  positives: Array<{
    strength: string
    section: string
    impact: string
  }>
  skills_hierarchy: {
    core: string[]
    advanced: string[]
    distinguishing: string[]
  }
  match_percentage: number
  role_specific_insights: string
}

export default function AIAnalysis() {
  const { cvData } = useCV()
  const [jobTitle, setJobTitle] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [loading, setLoading] = useState(false)

  const sectionIcons = {
    summary: <FileText className="h-4 w-4" />,
    skills: <Code2 className="h-4 w-4" />,
    experience: <Briefcase className="h-4 w-4" />,
    education: <GraduationCap className="h-4 w-4" />,
    projects: <Sparkles className="h-4 w-4" />,
    achievements: <Trophy className="h-4 w-4" />
  }

  const generateAnalysisPrompt = () => `
    Analyze this resume for a ${jobTitle.trim()} position against the provided job description. Provide:
    1. Top 10 ATS keywords with relevance scores and specific sections to add them
    2. Skill gaps with improvement strategies specific to ${jobTitle.trim()} role
    3. Key strengths aligned with ${jobTitle.trim()} requirements
    4. Skills hierarchy organized by importance for ${jobTitle.trim()}
    5. Match percentage specifically for ${jobTitle.trim()} role
    6. Role-specific edits for each resume section
    
    Resume: ${JSON.stringify({
      summary: cvData?.summary,
      experience: cvData?.experience,
      skills: cvData?.skills,
      education: cvData?.education,
      projects: cvData?.projects,
      achievements: cvData?.achievements
    })}
    
    Job Description: ${jobDescription.trim()}
    
    Respond in JSON format:
    {
      "ats_keywords": [{ 
        "keyword": "", 
        "score": 0, 
        "recommended_sections": [],
        "example_usage": ""
      }],
      "section_edits": {
        "summary": [],
        "skills": [],
        "experience": [],
        "education": [],
        "projects": [],
        "achievements": []
      },
      "skill_gaps": [{
        "skill": "",
        "importance": 0,
        "improvement_strategy": "",
        "resources": []
      }],
      "positives": [{
        "strength": "",
        "section": "",
        "impact": ""
      }],
      "skills_hierarchy": {
        "core": [],
        "advanced": [],
        "distinguishing": []
      },
      "match_percentage": 0,
      "role_specific_insights": ""
    }
  `

  const handleAnalyze = async () => {
    if (!jobTitle.trim() || !jobDescription.trim()) {
      alert('Please enter both job title and description')
      return
    }

    setLoading(true)
    setAnalysisResult(null)

    try {
      // Simulate AI analysis with realistic data
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      const mockAnalysis: AnalysisResult = {
        overallScore: 78,
        ats_keywords: [
          { keyword: "JavaScript", score: 95, recommended_sections: ["skills", "experience"], example_usage: "Developed JavaScript applications" },
          { keyword: "React", score: 90, recommended_sections: ["skills", "projects"], example_usage: "Built React components" },
          { keyword: "Node.js", score: 85, recommended_sections: ["experience", "projects"], example_usage: "Implemented Node.js backend" },
          { keyword: "Agile", score: 80, recommended_sections: ["experience"], example_usage: "Worked in Agile development environment" },
          { keyword: "Git", score: 75, recommended_sections: ["skills"], example_usage: "Version control with Git" }
        ],
        section_edits: {
          summary: ["Add specific technologies mentioned in job description", "Include quantifiable achievements"],
          skills: ["Add missing technical skills", "Organize by proficiency level"],
          experience: ["Add more metrics and results", "Include relevant project details"],
          education: ["Add relevant coursework", "Include certifications"],
          projects: ["Add live project links", "Include tech stack details"],
          achievements: ["Add quantifiable metrics", "Include industry recognition"]
        },
        skill_gaps: [
          { skill: "TypeScript", importance: 90, improvement_strategy: "Take online course and build projects", resources: ["TypeScript Handbook", "Udemy Course"] },
          { skill: "Docker", importance: 85, improvement_strategy: "Practice containerization", resources: ["Docker Documentation", "YouTube Tutorials"] }
        ],
        positives: [
          { strength: "Strong technical foundation", section: "skills", impact: "High" },
          { strength: "Relevant project experience", section: "projects", impact: "Medium" }
        ],
        skills_hierarchy: {
          core: ["JavaScript", "React", "HTML", "CSS"],
          advanced: ["Node.js", "Express", "MongoDB"],
          distinguishing: ["GraphQL", "AWS", "Microservices"]
        },
        match_percentage: 78,
        role_specific_insights: "Strong foundation in frontend development with good project experience. Consider adding more backend technologies and DevOps skills."
      }

      setAnalysisResult(mockAnalysis)
    } catch (error) {
      console.error('Analysis failed:', error)
      alert('Analysis failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="space-y-2">
        <h2 className="flex items-center gap-2 text-xl font-bold">
          <Brain className="h-6 w-6 text-primary" />
          AI Resume Analysis
        </h2>
        <p className="text-muted-foreground text-sm">
          Get AI-powered insights tailored to specific job roles
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-3">
          <Input
            placeholder="Job Title (e.g., 'Senior Software Engineer')"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            className="text-sm border-2 focus:border-primary"
          />
          <Textarea
            rows={4}
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste job description here..."
            className="text-sm min-h-[120px] border-2 focus:border-primary"
          />
        </div>
        
        <Button
          className="w-full gap-2 font-medium bg-primary hover:bg-primary/90"
          onClick={handleAnalyze}
          disabled={loading || !jobTitle.trim() || !jobDescription.trim()}
        >
          {loading ? (
            <LoaderCircle className="animate-spin h-4 w-4" />
          ) : (
            <>
              <Rocket className="h-4 w-4" />
              Analyze Resume
            </>
          )}
        </Button>
      </div>

      {analysisResult && (
        <div className="space-y-6">
          {/* Overall Score */}
          <div className="bg-card p-4 rounded-lg border">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">Overall Match Score</h3>
              <span className="text-2xl font-bold text-primary">{analysisResult.match_percentage}%</span>
            </div>
            <Progress value={analysisResult.match_percentage} className="h-2" />
            <p className="text-sm text-muted-foreground mt-2">{analysisResult.role_specific_insights}</p>
          </div>

          {/* ATS Keywords */}
          <div className="bg-card p-4 rounded-lg border">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Search className="h-4 w-4" />
              Top ATS Keywords
            </h3>
            <div className="space-y-2">
              {analysisResult.ats_keywords.map((keyword, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 bg-muted rounded">
                  <div>
                    <span className="font-medium">{keyword.keyword}</span>
                    <p className="text-xs text-muted-foreground">{keyword.example_usage}</p>
                  </div>
                  <Badge variant="secondary">{keyword.score}%</Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Skill Gaps */}
          <div className="bg-card p-4 rounded-lg border">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Skill Gaps
            </h3>
            <div className="space-y-3">
              {analysisResult.skill_gaps.map((gap, idx) => (
                <div key={idx} className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium">{gap.skill}</span>
                    <Badge variant="destructive">Priority: {gap.importance}%</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{gap.improvement_strategy}</p>
                  <div className="flex flex-wrap gap-1">
                    {gap.resources.map((resource, ridx) => (
                      <Badge key={ridx} variant="outline" className="text-xs">{resource}</Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section Edits */}
          <div className="bg-card p-4 rounded-lg border">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Layers className="h-4 w-4" />
              Recommended Edits
            </h3>
            <div className="space-y-3">
              {Object.entries(analysisResult.section_edits).map(([section, edits]) => (
                edits.length > 0 && (
                  <div key={section} className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      {sectionIcons[section as keyof typeof sectionIcons]}
                      <span className="font-medium capitalize">{section}</span>
                    </div>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {edits.map((edit, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle className="h-3 w-3 mt-0.5 text-green-600" />
                          {edit}
                        </li>
                      ))}
                    </ul>
                  </div>
                )
              ))}
            </div>
          </div>

          {/* Strengths */}
          <div className="bg-card p-4 rounded-lg border">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Key Strengths
            </h3>
            <div className="space-y-2">
              {analysisResult.positives.map((positive, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-900/20 rounded">
                  <div>
                    <span className="font-medium">{positive.strength}</span>
                    <p className="text-xs text-muted-foreground">{positive.section} section</p>
                  </div>
                  <Badge variant="secondary">{positive.impact}</Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
