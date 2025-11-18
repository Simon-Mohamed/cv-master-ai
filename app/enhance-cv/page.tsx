
"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import DashboardNav from "@/components/dashboard-nav"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Loader2, Save, Download, FileText, RefreshCw } from "lucide-react"
import { useHotkeys } from 'react-hotkeys-hook'

interface LocalUser {
  id: string
  name: string
  email: string
  createdAt: string
}

export default function EnhanceCVPage() {
  const router = useRouter()
  const [user, setUser] = useState<LocalUser | null>(null)
  const [cvText, setCVText] = useState("")
  const [strengths, setStrengths] = useState<string[]>([])
  const [improvements, setImprovements] = useState<string[]>([])
  const [atsScore, setAtsScore] = useState<number | null>(null)
  const [overallScore, setOverallScore] = useState<number | null>(null)
  const [enhancedCV, setEnhancedCV] = useState("")
  const [enhancedData, setEnhancedData] = useState<any>(null)
  const [lastAnalysis, setLastAnalysis] = useState<any>(null)
  const [customSections, setCustomSections] = useState<Array<{title:string; items:string[]}>>([])
  const [hiddenSections, setHiddenSections] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)
  const [enhancing, setEnhancing] = useState(false)
  const [downloadingPdf, setDownloadingPdf] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [isDraftSaving, setIsDraftSaving] = useState(false)
  const [keyboardShortcuts] = useState({
    analyze: 'Ctrl+Enter',
    enhance: 'Ctrl+E',
    save: 'Ctrl+S',
    download: 'Ctrl+D'
  })

  const API_URL = process.env.NEXT_PUBLIC_ENHANCE_API ?? "http://127.0.0.1:5006"
  
  // Templates state
  const [templates, setTemplates] = useState<Array<{id:string;name:string;colors:string[];fonts:string[]}>>([])
  const [selectedTemplate, setSelectedTemplate] = useState<{id:string;name:string;colors:string[];fonts:string[]}|null>(null)
  const [accentColor, setAccentColor] = useState<string>("#1f3a8a")
  const [fontFamily, setFontFamily] = useState<string>("Inter")

  const previewRef = useRef<HTMLDivElement>(null)

  const toggleSection = (key: string) => {
    setHiddenSections(prev => ({ ...prev, [key]: !prev[key] }))
  }

  // Save draft to localStorage
  const saveDraft = useCallback(async () => {
    if (!cvText.trim()) return
    
    setIsDraftSaving(true)
    try {
      const draft = {
        cvText,
        lastSaved: new Date().toISOString(),
        analysis: lastAnalysis ? {
          strengths,
          improvements,
          atsScore,
          overallScore
        } : null
      }
      localStorage.setItem('cvDraft', JSON.stringify(draft))
      setHasUnsavedChanges(false)
      toast.success('Draft saved successfully')
    } catch (error) {
      console.error('Failed to save draft:', error)
      toast.error('Failed to save draft')
    } finally {
      setIsDraftSaving(false)
    }
  }, [cvText, lastAnalysis, strengths, improvements, atsScore, overallScore])

  // Load draft from localStorage
  const loadDraft = useCallback(() => {
    try {
      const draft = localStorage.getItem('cvDraft')
      if (draft) {
        const parsed = JSON.parse(draft)
        setCVText(parsed.cvText || '')
        if (parsed.analysis) {
          setStrengths(parsed.analysis.strengths || [])
          setImprovements(parsed.analysis.improvements || [])
          setAtsScore(parsed.analysis.atsScore || null)
          setOverallScore(parsed.analysis.overallScore || null)
        }
        toast.success('Draft loaded successfully')
        return true
      }
    } catch (error) {
      console.error('Failed to load draft:', error)
    }
    return false
  }, [])

  // Helper to stringify mixed values from LLM
  const toLine = (item: any): string => {
    if (item == null) return ""
    if (typeof item === "string") return item
    if (typeof item === "number") return String(item)
    if (Array.isArray(item)) return item.map(toLine).join(", ")
    if (typeof item === "object") {
      const preferred = (item as any).text || (item as any).bullet || (item as any).description || (item as any).title
      if (preferred) return String(preferred)
      try { return Object.values(item).map(toLine).join(" — ") } catch { return "" }
    }
    return String(item)
  }

  // Normalize mixed values (array/object/string) into array of strings
  const toArray = (v: any): string[] => {
    if (!v) return []
    if (Array.isArray(v)) return v.map(toLine).filter(Boolean)
    if (typeof v === 'string') return v.split(/\n|\u2022|\-/).map(s=>s.trim()).filter(Boolean)
    if (typeof v === 'object') return Object.values(v).map(toLine).filter(Boolean)
    return []
  }

  const extractWorkExperience = (text: string): Array<{
    company: string
    title: string
    period: string
    location: string
    bullets: string[]
  }> => {
    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean)
    const experiences: Array<{
      company: string
      title: string
      period: string
      location: string
      bullets: string[]
    }> = []

    const expKeywords = ['experience', 'work history', 'employment', 'professional experience', 'career history']
    let expStartIdx = -1
    
    for (let i = 0; i < lines.length; i++) {
      const lineLower = lines[i].toLowerCase()
      if (expKeywords.some(k => lineLower === k || lineLower.includes(k))) {
        expStartIdx = i + 1
        break
      }
    }

    if (expStartIdx === -1) expStartIdx = 0

    let currentExp: any = null
    const endSections = ['education', 'skills', 'languages', 'certifications', 'training', 'projects', 'awards']

    for (let i = expStartIdx; i < lines.length; i++) {
      const line = lines[i]
      const lineLower = line.toLowerCase()

      if (endSections.some(s => lineLower === s || (lineLower.startsWith(s) && line.length < 30))) {
        break
      }

      const pattern1 = line.match(/^(.+?)\s+(?:at|@|-|–)\s+(.+?)\s*[|•]\s*(.+)$/i)
      const pattern2 = line.match(/^(.+?)\s*[-–]\s*(.+?)\s*\((.+?)\)$/i)
      const datePattern = /(\d{1,2}\/\d{4}|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{4})\s*[-–—to]\s*(?:Present|Current|(\d{1,2}\/\d{4}|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{4}))/i
      const durationPattern = /^(?:Duration|Period|Date|Dates?):\s*(.+)$/i
      
      const hasDate = datePattern.test(line)
      const durationMatch = line.match(durationPattern)
      
      if (durationMatch && currentExp) {
        currentExp.period = durationMatch[1].trim()
        continue
      }

      if (pattern1) {
        if (currentExp && (currentExp.company || currentExp.title)) {
          experiences.push(currentExp)
        }
        currentExp = {
          title: pattern1[1].trim(),
          company: pattern1[2].trim(),
          period: pattern1[3].trim(),
          location: '',
          bullets: []
        }
      } else if (pattern2) {
        if (currentExp && (currentExp.company || currentExp.title)) {
          experiences.push(currentExp)
        }
        currentExp = {
          title: pattern2[1].trim(),
          company: pattern2[2].trim(),
          period: pattern2[3].trim(),
          location: '',
          bullets: []
        }
      } else if (hasDate && line.length > 20) {
        if (currentExp && (currentExp.company || currentExp.title)) {
          experiences.push(currentExp)
        }
        const dateMatch = line.match(datePattern)
        const period = dateMatch ? dateMatch[0] : ''
        const remainingText = line.replace(datePattern, '').trim()
        const parts = remainingText.split(/[-–—|@]/).map(p => p.trim()).filter(Boolean)
        
        currentExp = {
          title: parts[0] || '',
          company: parts[1] || remainingText,
          period: period,
          location: '',
          bullets: []
        }
      } else if (currentExp && (line.startsWith('•') || line.startsWith('-') || line.startsWith('*') || line.match(/^\d+\./))) {
        const bullet = line.replace(/^[•\-*\d.]\s*/, '').trim()
        if (bullet.length > 5) {
          currentExp.bullets.push(bullet)
        }
      } else if (currentExp && line.length > 20 && !line.match(/^[A-Z\s]+$/) && currentExp.bullets.length > 0) {
        if (line.match(/^[A-Z]/) && !line.endsWith('.')) {
          currentExp.bullets.push(line.trim())
        } else {
          const lastIdx = currentExp.bullets.length - 1
          currentExp.bullets[lastIdx] += ' ' + line.trim()
        }
      } else if (!currentExp && line.length > 10 && line.length < 100) {
        const nextLine = lines[i + 1] || ''
        
        if (nextLine.match(durationPattern) || nextLine.match(datePattern)) {
          currentExp = {
            title: '',
            company: line.trim(),
            period: '',
            location: '',
            bullets: []
          }
        } else if (nextLine.startsWith('•') || nextLine.startsWith('-')) {
          currentExp = {
            title: line.trim(),
            company: '',
            period: '',
            location: '',
            bullets: []
          }
        }
      }
    }

    if (currentExp && (currentExp.company || currentExp.title)) {
      experiences.push(currentExp)
    }

    return experiences
      .filter(exp => exp.company || exp.title || exp.bullets.length > 0)
      .map(exp => ({
        company: exp.company || 'Company Name',
        title: exp.title || 'Job Title',
        period: exp.period || 'Date - Date',
        location: exp.location || '',
        bullets: exp.bullets.length > 0 ? exp.bullets : ['Add job responsibilities here']
      }))
  }

  const deriveFromText = (text: string) => {
    const lines = text.split(/\r?\n/).map(l=>l.trim()).filter(Boolean)
    const res: any = {}
    
    for (const l of lines.slice(0,6)) {
      if (/@|\d/.test(l)) continue
      if (/^[A-Za-z]{2,}(\s+[A-Za-z\-']{2,})+/.test(l)) { res.name = l; break }
    }
    
    const email = text.match(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/)
    if (email) res.email = email[0]
    const phone = text.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/)
    if (phone) res.phone = phone[0]
    const address = text.match(/(?:\d+\s+[A-Za-z\s,]+\s+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr)\s*,?\s*[A-Za-z\s,]+(?:\d{5})?)/)
    if (address) res.address = address[0]
    
    const eduKeywords = ['Bachelor', 'Master', 'PhD', 'Doctor', 'Bachelor\'s', 'Master\'s', 'BSc', 'MSc', 'MBA', 'BS', 'MS']
    for (const l of lines) {
      if (eduKeywords.some(k => l.includes(k))) {
        res.education = l
        break
      }
    }
    
    const langs: string[] = []
    const langKeywords = ['English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 'Chinese', 'Japanese', 'Korean', 'Russian', 'Arabic']
    for (const l of lines) {
      if (langKeywords.some(k => l.includes(k))) {
        langs.push(l)
      }
    }
    if (langs.length > 0) res.languages = langs
    
    const experienceEntries = extractWorkExperience(text)
    if (experienceEntries.length > 0) {
      res.experienceEntries = experienceEntries
    }
    
    return res
  }

  const analyzeWithText = useCallback(async (text: string) => {
    if (!text.trim()) {
      toast.error("Please paste your CV text")
      return
    }

    setAnalyzing(true)
    try {
      const res = await fetch(`${API_URL}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cv_text: text })
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error || "Analyze failed")
      let r = data.result || {}
      const local = deriveFromText(text)
      r = { ...local, ...r }
      setLastAnalysis(r)
      setStrengths(Array.isArray(r.strengths) ? r.strengths : [])
      setImprovements(Array.isArray(r.improvements) ? r.improvements : [])
      setAtsScore(typeof r.atsScore === "number" ? r.atsScore : null)
      setOverallScore(typeof r.overallScore === "number" ? r.overallScore : null)
    } catch (e: any) {
      toast.error(e.message || "Analyze request failed")
    } finally {
      setAnalyzing(false)
    }
  }, [API_URL])

  const handleAnalyze = useCallback(async () => {
    await analyzeWithText(cvText)
  }, [cvText, analyzeWithText])

  const handleEnhance = async () => {
    if (!cvText.trim()) {
      toast.error("Please paste your CV text")
      return
    }
    if (!lastAnalysis) {
      await analyzeWithText(cvText)
    }
    setEnhancing(true)
    try {
      const res = await fetch(`${API_URL}/enhance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cv_text: cvText, tone: "professional" })
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error || "Enhance failed")
      const ecv = data.enhanced || {}
      // Use experienceEntries from backend if available
      const experienceEntries = ecv?.experienceEntries || []
      
      const local = deriveFromText(cvText)
      const finalExperienceEntries = experienceEntries.length > 0 ? experienceEntries : local.experienceEntries || []
      
      setEnhancedData({ 
        ...ecv, 
        experienceEntries: finalExperienceEntries,
        languages: ecv.languages || local.languages || []
      })
      const lines: string[] = []
      if (ecv.summary) lines.push(ecv.summary, "")
      const itemToString = (item: any): string => {
        if (item == null) return ""
        if (typeof item === "string") return item
        if (typeof item === "number") return String(item)
        if (Array.isArray(item)) return item.map(itemToString).join(", ")
        if (typeof item === "object") {
          const preferred = item.text || item.bullet || item.description || item.title
          if (preferred) return String(preferred)
          try { return Object.values(item).map(itemToString).join(" — ") } catch { return "" }
        }
        return String(item)
      }
      if (Array.isArray(ecv.experience)) {
        lines.push("Experience:")
        ecv.experience.forEach((b: any) => {
          const t = itemToString(b).trim()
          if (t) lines.push(`• ${t}`)
        })
        lines.push("")
      }
      if (Array.isArray(ecv.skills)) {
        lines.push("Skills:")
        ecv.skills.forEach((s: any) => {
          const t = itemToString(s).trim()
          if (t) lines.push(`- ${t}`)
        })
        lines.push("")
      }
      setEnhancedCV(lines.join("\n"))
    } catch (e: any) {
      toast.error(e.message || "Enhance request failed")
    } finally {
      setEnhancing(false)
    }
  }

  const handleDownload = useCallback(() => {
    try {
      const content = enhancedCV || cvText
      if (!content) {
        toast.error("No content to download")
        return
      }
      
      const element = document.createElement("a")
      const now = new Date().toISOString().split('T')[0]
      const filename = `cv-${now}${enhancedCV ? '-enhanced' : ''}.txt`
      
      const file = new Blob([content], { type: "text/plain;charset=utf-8" })
      element.href = URL.createObjectURL(file)
      element.download = filename
      
      document.body.appendChild(element)
      element.click()
      document.body.removeChild(element)
      
      toast.success("CV downloaded successfully")
    } catch (error) {
      console.error("Download failed:", error)
      toast.error("Failed to download CV")
    }
  }, [cvText, enhancedCV])

  const handleDownloadPdf = useCallback(async () => {
    if (!enhancedData && !lastAnalysis) {
      toast.error("Please analyze or enhance your CV first")
      return
    }

    setDownloadingPdf(true)
    try {
      const cvData = {
        name: lastAnalysis?.name || enhancedData?.name || '',
        email: lastAnalysis?.email || enhancedData?.email || '',
        phone: lastAnalysis?.phone || enhancedData?.phone || '',
        address: lastAnalysis?.address || enhancedData?.address || '',
        linkedin: lastAnalysis?.linkedin || enhancedData?.linkedin || '',
        summary: enhancedData?.summary || '',
        experienceEntries: enhancedData?.experienceEntries || [],
        skills: enhancedData?.skills || lastAnalysis?.skills || [],
        education: enhancedData?.education || lastAnalysis?.education || [],
        languages: enhancedData?.languages || lastAnalysis?.languages || [],
        certifications: enhancedData?.certifications || lastAnalysis?.certifications || [],
        projects: enhancedData?.projects || lastAnalysis?.projects || []
      }

      const response = await fetch(`${API_URL}/generate-pdf`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cv_data: cvData,
          template_id: selectedTemplate?.id || 'smart',
          accent_color: accentColor || '#1f3a8a'
        }),
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.error || 'Failed to generate PDF')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      const now = new Date()
      const fileName = `cv-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}.pdf`
      
      link.href = url
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      toast.success("PDF downloaded successfully")
    } catch (error) {
      console.error('Error generating PDF:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to generate PDF')
    } finally {
      setDownloadingPdf(false)
    }
  }, [enhancedData, lastAnalysis, selectedTemplate, accentColor, API_URL])

  // Keyboard shortcuts
  useHotkeys(keyboardShortcuts.analyze, (e) => {
    e.preventDefault()
    handleAnalyze()
  }, { enableOnFormTags: ['TEXTAREA', 'INPUT'] })

  useHotkeys(keyboardShortcuts.enhance, (e) => {
    e.preventDefault()
    handleEnhance()
  }, { enableOnFormTags: ['TEXTAREA', 'INPUT'] })

  useHotkeys(keyboardShortcuts.save, (e) => {
    e.preventDefault()
    saveDraft()
  }, { enableOnFormTags: ['TEXTAREA', 'INPUT'] })

  useHotkeys(keyboardShortcuts.download, (e) => {
    e.preventDefault()
    if (enhancedCV) {
      handleDownload()
    } else if (cvText) {
      handleDownload()
    }
  }, { enableOnFormTags: ['TEXTAREA', 'INPUT'] })

  // Auto-save draft
  useEffect(() => {
    if (hasUnsavedChanges && cvText) {
      const timer = setTimeout(() => {
        saveDraft()
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [cvText, hasUnsavedChanges, saveDraft])

  // Load templates
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API_URL}/templates`)
        const data = await res.json()
        const list = data.templates || []
        setTemplates(list)
        if (list.length) {
          setSelectedTemplate(list[0])
          setAccentColor(list[0].colors?.[0] || "#1f3a8a")
          setFontFamily(list[0].fonts?.[0] || "Inter")
        }
      } catch {}
    }
    load()
  }, [API_URL])

  // User authentication
  useEffect(() => {
    const userData = localStorage.getItem("cvmaster_user")
    if (!userData) {
      router.push("/login")
      return
    }
    setUser(JSON.parse(userData))
    setLoading(false)
  }, [router])

  // Load draft on mount
  useEffect(() => {
    if (!loading && user) {
      const hasDraft = loadDraft()
      if (hasDraft) {
        setHasUnsavedChanges(true)
      }
    }
  }, [loading, user, loadDraft])

  // Warn before leaving
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault()
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?'
        return e.returnValue
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [hasUnsavedChanges])

  // Track changes
  useEffect(() => {
    setHasUnsavedChanges(true)
  }, [cvText])

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav user={user as any} />

      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-primary mb-2">Enhance Your CV</h1>
          <p className="text-muted-foreground mb-8">
            Get AI-powered suggestions to improve your CV and increase your chances of getting hired
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-primary">Your CV</h2>
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  accept=".pdf,.docx,.txt"
                  onChange={async (e) => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    try {
                      const form = new FormData()
                      form.append("file", file)
                      const res = await fetch(`${API_URL}/upload`, {
                        method: "POST",
                        body: form,
                      })
                      const data = await res.json()
                      if (!data.success) throw new Error(data.error || "Upload failed")
                      const text = data.text || ""
                      setCVText(text)
                      if (text) {
                        await analyzeWithText(text)
                      }
                    } catch (err: any) {
                      toast.error(err.message || "Failed to extract text from file")
                    }
                  }}
                  className="block text-sm"
                />
                <span className="text-xs text-muted-foreground">PDF/DOCX/TXT</span>
              </div>
              <textarea
                value={cvText}
                onChange={(e) => setCVText(e.target.value)}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent h-96"
                placeholder="Paste your CV text here..."
              />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Button 
                  onClick={handleAnalyze} 
                  disabled={analyzing || !cvText.trim()} 
                  className="w-full bg-accent hover:bg-accent/90"
                >
                  {analyzing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Analyze CV
                    </>
                  )}
                </Button>
                <Button 
                  onClick={handleEnhance} 
                  disabled={enhancing || !cvText.trim()} 
                  variant="secondary" 
                  className="w-full"
                >
                  {enhancing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enhancing...
                    </>
                  ) : (
                    <>
                      <FileText className="mr-2 h-4 w-4" />
                      Enhance CV
                    </>
                  )}
                </Button>
                <Button 
                  onClick={saveDraft} 
                  disabled={isDraftSaving || !cvText.trim()}
                  variant="outline" 
                  className="w-full"
                >
                  {isDraftSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Draft
                    </>
                  )}
                </Button>
              </div>
              <div className="text-xs text-muted-foreground text-center">
                Keyboard shortcuts: {keyboardShortcuts.analyze} to analyze, {keyboardShortcuts.enhance} to enhance, {keyboardShortcuts.save} to save
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-primary">AI Suggestions</h2>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-5 h-96 overflow-y-auto">
                {!cvText.trim() && (
                  <div className="h-full flex items-center justify-center text-center p-4">
                    <div>
                      <p className="text-muted-foreground mb-4">No CV content to analyze yet.</p>
                      <p className="text-sm text-muted-foreground">Paste your CV text or upload a file to get started.</p>
                    </div>
                  </div>
                )}
                {(strengths.length + improvements.length) > 0 ? (
                  <>
                    <div>
                      <h3 className="font-semibold text-blue-900 mb-2">What you got right</h3>
                      <ul className="list-disc pl-5 space-y-1">
                        {strengths.map((s, i) => (
                          <li key={i} className="text-sm">{s}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-semibold text-blue-900 mb-2">How we'll help you improve</h3>
                      <ul className="list-disc pl-5 space-y-1">
                        {improvements.map((s, i) => (
                          <li key={i} className="text-sm">{s}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="flex gap-4 text-sm text-blue-900">
                      {atsScore !== null && <span>ATS score: <strong>{atsScore}</strong></span>}
                      {overallScore !== null && <span>Overall: <strong>{overallScore}</strong></span>}
                    </div>
                  </>
                ) : (
                  <p className="text-muted-foreground text-center py-12">
                    Paste your CV and click "Analyze" to get suggestions
                  </p>
                )}
              </div>
            </div>
          </div>

          {enhancedCV && (
            <div className="mt-8 pt-8 border-t border-border">
              <h2 className="text-xl font-semibold text-primary mb-4">Template & Preview</h2>
              <div className="flex flex-wrap gap-3 mb-4">
                {templates.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => { 
                      setSelectedTemplate(t)
                      setAccentColor(t.colors?.[0] || accentColor)
                      setFontFamily(t.fonts?.[0] || fontFamily)
                    }}
                    className={`px-3 py-2 border rounded text-sm ${selectedTemplate?.id === t.id ? 'border-blue-600' : 'border-border'}`}
                  >
                    {t.name}
                  </button>
                ))}
                {selectedTemplate && (
                  <>
                    <select 
                      className="border rounded px-2 py-1 text-sm" 
                      value={fontFamily} 
                      onChange={(e)=>setFontFamily(e.target.value)}
                    >
                      {selectedTemplate.fonts.map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                    <select 
                      className="border rounded px-2 py-1 text-sm" 
                      value={accentColor} 
                      onChange={(e)=>setAccentColor(e.target.value)}
                    >
                      {selectedTemplate.colors.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </>
                )}
              </div>

              <div 
                id="pdf-preview" 
                ref={previewRef} 
                className="border border-border rounded-lg p-6 space-y-5 bg-white" 
                style={{ 
                  fontFamily, 
                  borderColor: accentColor, 
                  width: '794px', 
                  margin: '0 auto', 
                  backgroundColor: '#ffffff' 
                }}
              >
                <div className="mb-2">
                  <input
                    className="font-extrabold text-3xl tracking-wide outline-none w-full uppercase"
                    style={{ color: accentColor }}
                    value={lastAnalysis?.name || ''}
                    onChange={(e)=> setLastAnalysis({ ...lastAnalysis, name: e.target.value })}
                    placeholder="FULL NAME"
                  />
                  <div className="mt-1 grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] text-muted-foreground uppercase">
                    <input
                      className="outline-none w-full"
                      value={(lastAnalysis as any)?.headlineLeft || ''}
                      onChange={(e)=> setLastAnalysis({ ...lastAnalysis, headlineLeft: e.target.value })}
                      placeholder="ROLE OR TITLE HERE"
                    />
                    <input
                      className="outline-none w-full"
                      value={(lastAnalysis as any)?.headlineRight || ''}
                      onChange={(e)=> setLastAnalysis({ ...lastAnalysis, headlineRight: e.target.value })}
                      placeholder="SECONDARY ROLE | DEPT"
                    />
                  </div>
                </div>

                {!hiddenSections['contact'] && (
                  <div>
                    <div className="flex items-center justify-between">
                      <div 
                        className="font-semibold text-xs tracking-wider px-3 py-1 border" 
                        style={{ borderColor: accentColor, color: accentColor }}
                      >
                        CONTACT INFORMATION
                      </div>
                      <Button size="sm" variant="ghost" onClick={()=>toggleSection('contact')}>
                        Hide
                      </Button>
                    </div>
                    <div className="bg-gray-50 p-3 border-b border-l border-r" style={{ borderColor: accentColor }}>
                      <ul className="list-disc pl-5 space-y-1 text-sm">
                        <li>
                          <span className="font-semibold">Phone: </span>
                          <input 
                            className="outline-none" 
                            placeholder="Phone" 
                            value={lastAnalysis?.phone || ''} 
                            onChange={(e)=> setLastAnalysis({ ...lastAnalysis, phone: e.target.value })} 
                          />
                        </li>
                        <li>
                          <span className="font-semibold">Email: </span>
                          <input 
                            className="outline-none" 
                            placeholder="Email" 
                            value={lastAnalysis?.email || ''} 
                            onChange={(e)=> setLastAnalysis({ ...lastAnalysis, email: e.target.value })} 
                          />
                        </li>
                        <li>
                          <span className="font-semibold">Address: </span>
                          <input 
                            className="outline-none w-3/4" 
                            placeholder="Address" 
                            value={lastAnalysis?.address || ''} 
                            onChange={(e)=> setLastAnalysis({ ...lastAnalysis, address: e.target.value })} 
                          />
                        </li>
                        <li>
                          <span className="font-semibold">LinkedIn: </span>
                          <input 
                            className="outline-none w-3/4" 
                            placeholder="LinkedIn" 
                            value={lastAnalysis?.linkedin || ''} 
                            onChange={(e)=> setLastAnalysis({ ...lastAnalysis, linkedin: e.target.value })} 
                          />
                        </li>
                      </ul>
                    </div>
                  </div>
                )}

                {!hiddenSections['summary'] && (
                  <div>
                    <div className="flex items-center justify-between">
                      <div 
                        className="font-semibold text-xs tracking-wider px-3 py-1 border" 
                        style={{ borderColor: accentColor, color: accentColor }}
                      >
                        {enhancedData?.sectionTitles?.summary || 'PROFESSIONAL SUMMARY'}
                      </div>
                      <Button size="sm" variant="ghost" onClick={()=>toggleSection('summary')}>
                        Hide
                      </Button>
                    </div>
                    <textarea
                      className="w-full bg-gray-50 rounded-b p-3 text-sm outline-none border-b border-l border-r"
                      style={{ borderColor: accentColor }}
                      value={enhancedData?.summary || ''}
                      onChange={(e)=> setEnhancedData({ ...enhancedData, summary: e.target.value })}
                      placeholder="Professional summary"
                      rows={4}
                    />
                  </div>
                )}

                {!hiddenSections['experience'] && (
                  <div>
                    <div className="flex items-center justify-between">
                      <div 
                        className="font-semibold text-xs tracking-wider px-3 py-1 border" 
                        style={{ borderColor: accentColor, color: accentColor }}
                      >
                        {enhancedData?.sectionTitles?.experience || 'PROFESSIONAL EXPERIENCE'}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={()=>{
                            const next = [...(enhancedData?.experienceEntries||[]), { 
                              company:'', 
                              title:'', 
                              period:'', 
                              location:'', 
                              bullets:[] 
                            }]
                            setEnhancedData({ ...enhancedData, experienceEntries: next })
                          }}
                        >
                          Add Experience
                        </Button>
                        <Button size="sm" variant="ghost" onClick={()=>toggleSection('experience')}>
                          Hide
                        </Button>
                      </div>
                    </div>
                    <div 
                      className="space-y-4 border-b border-l border-r rounded-b p-3" 
                      style={{ borderColor: accentColor }}
                    >
                      {(enhancedData?.experienceEntries || []).map((exp: any, idx: number) => (
                        <div key={idx} className="border rounded p-3 space-y-2">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            <input 
                              className="outline-none border rounded px-2 py-1" 
                              placeholder="Company" 
                              value={exp.company}
                              onChange={(e)=>{
                                const next = [...enhancedData.experienceEntries]
                                next[idx] = { ...exp, company: e.target.value }
                                setEnhancedData({ ...enhancedData, experienceEntries: next })
                              }} 
                            />
                            <input 
                              className="outline-none border rounded px-2 py-1" 
                              placeholder="Job Title" 
                              value={exp.title}
                              onChange={(e)=>{
                                const next = [...enhancedData.experienceEntries]
                                next[idx] = { ...exp, title: e.target.value }
                                setEnhancedData({ ...enhancedData, experienceEntries: next })
                              }} 
                            />
                            <input 
                              className="outline-none border rounded px-2 py-1" 
                              placeholder="Period (e.g., Jan 2024 – Present)" 
                              value={exp.period}
                              onChange={(e)=>{
                                const next = [...enhancedData.experienceEntries]
                                next[idx] = { ...exp, period: e.target.value }
                                setEnhancedData({ ...enhancedData, experienceEntries: next })
                              }} 
                            />
                            <input 
                              className="outline-none border rounded px-2 py-1" 
                              placeholder="Location" 
                              value={exp.location}
                              onChange={(e)=>{
                                const next = [...enhancedData.experienceEntries]
                                next[idx] = { ...exp, location: e.target.value }
                                setEnhancedData({ ...enhancedData, experienceEntries: next })
                              }} 
                            />
                          </div>
                          <div>
                            <div className="text-xs mb-1" style={{ color: accentColor }}>Bullets</div>
                            <ul className="list-disc pl-5 space-y-1">
                              {(exp.bullets||[]).map((b:string, bi:number)=>(
                                <li key={bi}>
                                  <input 
                                    className="w-full outline-none" 
                                    value={b} 
                                    onChange={(e)=>{
                                      const next = [...enhancedData.experienceEntries]
                                      const xb = [...(exp.bullets||[])]
                                      xb[bi] = e.target.value
                                      next[idx] = { ...exp, bullets: xb }
                                      setEnhancedData({ ...enhancedData, experienceEntries: next })
                                    }} 
                                  />
                                </li>
                              ))}
                            </ul>
                            <div className="flex gap-2 mt-2">
                              <Button 
                                size="sm" 
                                variant="secondary" 
                                onClick={()=>{
                                  const next = [...enhancedData.experienceEntries]
                                  next[idx] = { ...exp, bullets: [...(exp.bullets||[]), ""] }
                                  setEnhancedData({ ...enhancedData, experienceEntries: next })
                                }}
                              >
                                Add Bullet
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive" 
                                onClick={()=>{
                                  const next = enhancedData.experienceEntries.filter((_:any,i:number)=>i!==idx)
                                  setEnhancedData({ ...enhancedData, experienceEntries: next })
                                }}
                              >
                                Remove Experience
                              </Button>
                            </div>
                          </div>
                          {(exp.company || exp.title) && (
                            <div className="mt-4 p-3 bg-gray-50 rounded border" style={{ borderColor: accentColor }}>
                              <div className="flex flex-col space-y-1">
                                {exp.company && (
                                  <div className="font-bold text-lg" style={{ color: accentColor }}>
                                    {exp.company}
                                  </div>
                                )}
                                {exp.title && (
                                  <div className="font-semibold text-base text-gray-800">
                                    {exp.title}
                                  </div>
                                )}
                                {(exp.period || exp.location) && (
                                  <div className="text-sm text-gray-600">
                                    {[exp.period, exp.location].filter(Boolean).join(' • ')}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {!hiddenSections['skills'] && (
                  <div>
                    <div className="flex items-center justify-between">
                      <div 
                        className="font-semibold text-xs tracking-wider px-3 py-1 border" 
                        style={{ borderColor: accentColor, color: accentColor }}
                      >
                        {enhancedData?.sectionTitles?.skills || 'SKILLS'}
                      </div>
                      <Button size="sm" variant="ghost" onClick={()=>toggleSection('skills')}>
                        Hide
                      </Button>
                    </div>
                    <div 
                      className="bg-gray-50 border-b border-l border-r rounded-b p-3" 
                      style={{ borderColor: accentColor }}
                    >
                      <ul className="list-disc pl-5 space-y-1">
                        {toArray(enhancedData?.skills).map((skill: string, idx: number) => (
                          <li key={idx}>
                            <input 
                              className="w-full outline-none bg-transparent" 
                              value={skill} 
                              onChange={(e)=>{
                                const skillsArray = toArray(enhancedData?.skills)
                                skillsArray[idx] = e.target.value
                                setEnhancedData({ ...enhancedData, skills: skillsArray.filter(Boolean) })
                              }}
                            />
                          </li>
                        ))}
                        <li>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={()=>{
                              const skillsArray = toArray(enhancedData?.skills)
                              skillsArray.push("")
                              setEnhancedData({ ...enhancedData, skills: skillsArray })
                            }}
                          >
                            Add Skill
                          </Button>
                        </li>
                      </ul>
                    </div>
                  </div>
                )}

                {!hiddenSections['languages'] && (
                  <div>
                    <div className="flex items-center justify-between">
                      <div 
                        className="font-semibold text-xs tracking-wider px-3 py-1 border" 
                        style={{ borderColor: accentColor, color: accentColor }}
                      >
                        {enhancedData?.sectionTitles?.languages || 'LANGUAGES'}
                      </div>
                      <Button size="sm" variant="ghost" onClick={()=>toggleSection('languages')}>
                        Hide
                      </Button>
                    </div>
                    <div 
                      className="bg-gray-50 border-b border-l border-r rounded-b p-3" 
                      style={{ borderColor: accentColor }}
                    >
                      <ul className="list-disc pl-5 space-y-1">
                        {toArray(enhancedData?.languages).map((lang: string, idx: number) => (
                          <li key={idx}>
                            <input 
                              className="w-full outline-none bg-transparent" 
                              value={lang} 
                              onChange={(e)=>{
                                const langsArray = toArray(enhancedData?.languages)
                                langsArray[idx] = e.target.value
                                setEnhancedData({ ...enhancedData, languages: langsArray.filter(Boolean) })
                              }}
                            />
                          </li>
                        ))}
                        <li>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={()=>{
                              const langsArray = toArray(enhancedData?.languages)
                              langsArray.push("")
                              setEnhancedData({ ...enhancedData, languages: langsArray })
                            }}
                          >
                            Add Language
                          </Button>
                        </li>
                      </ul>
                    </div>
                  </div>
                )}

                {!hiddenSections['education'] && (
                  <div>
                    <div className="flex items-center justify-between">
                      <div 
                        className="font-semibold text-xs tracking-wider px-3 py-1 border" 
                        style={{ borderColor: accentColor, color: accentColor }}
                      >
                        {enhancedData?.sectionTitles?.education || 'EDUCATION'}
                      </div>
                      <Button size="sm" variant="ghost" onClick={()=>toggleSection('education')}>
                        Hide
                      </Button>
                    </div>
                    <ul 
                      className="list-disc pl-5 mt-2 space-y-1 border-b border-l border-r rounded-b p-3 bg-white" 
                      style={{ borderColor: accentColor }}
                    >
                      {toArray(lastAnalysis?.education).map((eItem: string, idx: number) => (
                        <li key={idx}>
                          <input 
                            className="w-full outline-none" 
                            value={eItem}
                            onChange={(e)=>{
                              const arr = toArray(lastAnalysis?.education)
                              arr[idx] = e.target.value
                              setLastAnalysis({ ...lastAnalysis, education: arr })
                            }}
                          />
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {!hiddenSections['training'] && (
                  <div>
                    <div className="flex items-center justify-between">
                      <div 
                        className="font-semibold text-xs tracking-wider px-3 py-1 border" 
                        style={{ borderColor: accentColor, color: accentColor }}
                      >
                        {enhancedData?.sectionTitles?.training || 'CORPORATE TRAINING / CERTIFICATIONS'}
                      </div>
                      <Button size="sm" variant="ghost" onClick={()=>toggleSection('training')}>
                        Hide
                      </Button>
                    </div>
                    <ul 
                      className="list-disc pl-5 mt-2 space-y-1 border-b border-l border-r rounded-b p-3 bg-white" 
                      style={{ borderColor: accentColor }}
                    >
                      {toArray(lastAnalysis?.training || lastAnalysis?.certifications).map((tItem: string, idx: number) => (
                        <li key={idx}>
                          <input 
                            className="w-full outline-none" 
                            value={tItem}
                            onChange={(e)=>{
                              const arr = toArray(lastAnalysis?.training || lastAnalysis?.certifications)
                              arr[idx] = e.target.value
                              setLastAnalysis({ ...lastAnalysis, training: arr })
                            }}
                          />
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {customSections.map((sec, sidx) => (
                  <div key={sidx}>
                    <div className="flex items-center gap-2">
                      <input 
                        className="font-semibold text-xs tracking-wider px-3 py-1 border outline-none"
                        style={{ borderColor: accentColor, color: accentColor }}
                        value={sec.title}
                        placeholder="SECTION TITLE"
                        onChange={(e)=>{
                          const next = [...customSections]
                          next[sidx] = { ...sec, title: e.target.value }
                          setCustomSections(next)
                        }}
                      />
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={()=>{
                          setCustomSections(prev => prev.filter((_,i)=>i!==sidx))
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                    <textarea 
                      className="w-full outline-none bg-gray-50 rounded-b p-2 text-sm border-b border-l border-r mt-1"
                      style={{ borderColor: accentColor }}
                      value={(sec.items||[]).join('\n')}
                      onChange={(e)=>{
                        const next = [...customSections]
                        next[sidx] = { ...sec, items: e.target.value.split('\n').filter(Boolean) }
                        setCustomSections(next)
                      }}
                      rows={3}
                    />
                  </div>
                ))}
              </div>

              <div className="flex gap-4 mt-4">
                <Button 
                  onClick={handleDownload} 
                  className="flex-1 bg-accent hover:bg-accent/90"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Enhanced CV
                </Button>
                <Button 
                  onClick={() => setCustomSections(prev => [...prev, {title: 'CUSTOM SECTION', items: []}])} 
                  variant="secondary"
                >
                  Add Section
                </Button>
                <Button 
                  onClick={handleDownloadPdf} 
                  variant="outline" 
                  disabled={downloadingPdf}
                >
                  {downloadingPdf ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    'Download PDF'
                  )}
                </Button>
                <Button 
                  onClick={() => router.push("/dashboard")} 
                  variant="outline" 
                  className="flex-1"
                >
                  Back to Dashboard
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
