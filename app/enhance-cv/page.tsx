"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import DashboardNav from "@/components/dashboard-nav"
import { Button } from "@/components/ui/button"

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

  const API_URL = process.env.NEXT_PUBLIC_ENHANCE_API || "http://127.0.0.1:5006"

  // Templates state
  const [templates, setTemplates] = useState<Array<{id:string;name:string;colors:string[];fonts:string[]}>>([])
  const [selectedTemplate, setSelectedTemplate] = useState<{id:string;name:string;colors:string[];fonts:string[]}|null>(null)
  const [accentColor, setAccentColor] = useState<string>("#1f3a8a")
  const [fontFamily, setFontFamily] = useState<string>("Inter")

  const toggleSection = (key: string) => {
    setHiddenSections(prev => ({ ...prev, [key]: !prev[key] }))
  }

  useEffect(() => {
    const userData = localStorage.getItem("cvmaster_user")
    if (!userData) {
      router.push("/login")
      return
    }
    setUser(JSON.parse(userData))
    setLoading(false)
  }, [router])

  useEffect(() => {
    // fetch templates
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

    // Find the experience section
    const expKeywords = ['experience', 'work history', 'employment', 'professional experience', 'career history']
    let expStartIdx = -1
    
    for (let i = 0; i < lines.length; i++) {
      const lineLower = lines[i].toLowerCase()
      if (expKeywords.some(k => lineLower === k || lineLower.includes(k))) {
        expStartIdx = i + 1
        break
      }
    }

    // If no explicit section found, start from beginning
    if (expStartIdx === -1) expStartIdx = 0

    let currentExp: any = null
    let endSections = ['education', 'skills', 'languages', 'certifications', 'training', 'projects', 'awards']

    for (let i = expStartIdx; i < lines.length; i++) {
      const line = lines[i]
      const lineLower = line.toLowerCase()

      // Stop if we hit another major section
      if (endSections.some(s => lineLower === s || (lineLower.startsWith(s) && line.length < 30))) {
        break
      }

      // Pattern 1: "Job Title at Company Name | Date Range"
      const pattern1 = line.match(/^(.+?)\s+(?:at|@|-|–)\s+(.+?)\s*[|•]\s*(.+)$/i)
      
      // Pattern 2: "Job Title - Company Name (Date Range)"
      const pattern2 = line.match(/^(.+?)\s*[-–]\s*(.+?)\s*\((.+?)\)$/i)
      
      // Pattern 3: Date range with company/title
      const datePattern = /(\d{1,2}\/\d{4}|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{4})\s*[-–—to]\s*(?:Present|Current|(\d{1,2}\/\d{4}|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{4}))/i
      
      // Pattern 4: "Duration: X - Y" on separate line
      const durationPattern = /^(?:Duration|Period|Date|Dates?):\s*(.+)$/i
      
      // Check if line contains a date range
      const hasDate = datePattern.test(line)
      
      // Check for duration line (saves to current experience)
      const durationMatch = line.match(durationPattern)
      if (durationMatch && currentExp) {
        currentExp.period = durationMatch[1].trim()
        continue
      }

      // Match patterns
      if (pattern1) {
        // Save previous experience
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
        // This might be a company/title line with embedded date
        if (currentExp && (currentExp.company || currentExp.title)) {
          experiences.push(currentExp)
        }
        
        const dateMatch = line.match(datePattern)
        const period = dateMatch ? dateMatch[0] : ''
        const remainingText = line.replace(datePattern, '').trim()
        
        // Try to split remaining text into title and company
        const parts = remainingText.split(/[-–—|@]/).map(p => p.trim()).filter(Boolean)
        
        currentExp = {
          title: parts[0] || '',
          company: parts[1] || remainingText,
          period: period,
          location: '',
          bullets: []
        }
      } else if (currentExp && (line.startsWith('•') || line.startsWith('-') || line.startsWith('*') || line.match(/^\d+\./))) {
        // This is a bullet point
        const bullet = line.replace(/^[•\-*\d.]\s*/, '').trim()
        if (bullet.length > 5) {
          currentExp.bullets.push(bullet)
        }
      } else if (currentExp && line.length > 20 && !line.match(/^[A-Z\s]+$/) && currentExp.bullets.length > 0) {
        // Continuation of previous bullet or new bullet without marker
        if (line.match(/^[A-Z]/) && !line.endsWith('.')) {
          // Likely a new bullet
          currentExp.bullets.push(line.trim())
        } else {
          // Continuation of last bullet
          const lastIdx = currentExp.bullets.length - 1
          currentExp.bullets[lastIdx] += ' ' + line.trim()
        }
      } else if (!currentExp && line.length > 10 && line.length < 100) {
        // Might be a company or title line without clear pattern
        // Check next few lines for context
        const nextLine = lines[i + 1] || ''
        const nextNextLine = lines[i + 2] || ''
        
        if (nextLine.match(durationPattern) || nextLine.match(datePattern)) {
          currentExp = {
            title: '',
            company: line.trim(),
            period: '',
            location: '',
            bullets: []
          }
        } else if (nextLine.startsWith('•') || nextLine.startsWith('-')) {
          // Next line is bullets, this is likely title or company
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

    // Don't forget the last experience
    if (currentExp && (currentExp.company || currentExp.title)) {
      experiences.push(currentExp)
    }

    // Clean up and validate
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
    // Client-side fallback extraction in case backend misses fields
  const deriveFromText = (text: string) => {
    const lines = text.split(/\r?\n/).map(l=>l.trim()).filter(Boolean)
    const res: any = {}
    
    // name: first line with two words, no digits/@
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
    
    // education: look for degree keywords
    const eduKeywords = ['Bachelor', 'Master', 'PhD', 'Doctor', 'Bachelor\'s', 'Master\'s', 'BSc', 'MSc', 'MBA', 'BS', 'MS']
    for (const l of lines) {
      if (eduKeywords.some(k => l.includes(k))) {
        res.education = l
        break
      }
    }
    
    // languages: look for common language names
    const langs = []
    const langKeywords = ['English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 'Chinese', 'Japanese', 'Korean', 'Russian', 'Arabic', 'Hindi', 'Turkish', 'Dutch', 'Swedish', 'Norwegian', 'Danish', 'Finnish', 'Polish', 'Czech', 'Hungarian', 'Romanian', 'Bulgarian', 'Croatian', 'Serbian', 'Slovak', 'Slovenian', 'Estonian', 'Latvian', 'Lithuanian', 'Greek', 'Hebrew', 'Thai', 'Vietnamese', 'Indonesian', 'Malay', 'Tagalog', 'Urdu', 'Bengali', 'Tamil', 'Telugu', 'Marathi', 'Gujarati', 'Kannada', 'Malayalam', 'Punjabi', 'Nepali', 'Sinhala', 'Burmese', 'Khmer', 'Lao', 'Tibetan', 'Mongolian', 'Armenian', 'Georgian', 'Azerbaijani', 'Kazakh', 'Kyrgyz', 'Tajik', 'Turkmen', 'Uzbek', 'Uighur']
    for (const l of lines) {
      if (langKeywords.some(k => l.includes(k))) {
        langs.push(l)
      }
    }
    if (langs.length > 0) res.languages = langs
    
    // Use the new work experience extraction
    const experienceEntries = extractWorkExperience(text)
    if (experienceEntries.length > 0) {
      res.experienceEntries = experienceEntries
    }
    
    return res
  }

  const analyzeWithText = async (text: string) => {
    if (!text.trim()) {
      alert("Please paste your CV text")
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
      // Merge client-side fallbacks from text
      const local = deriveFromText(text)
      r = { ...local, ...r }
      setLastAnalysis(r)
      setStrengths(Array.isArray(r.strengths) ? r.strengths : [])
      setImprovements(Array.isArray(r.improvements) ? r.improvements : [])
      setAtsScore(typeof r.atsScore === "number" ? r.atsScore : null)
      setOverallScore(typeof r.overallScore === "number" ? r.overallScore : null)
    } catch (e: any) {
      alert(e.message || "Analyze request failed")
    } finally {
      setAnalyzing(false)
    }
  }

  const handleAnalyze = async () => {
    await analyzeWithText(cvText)
  }

  const handleEnhance = async () => {
    if (!cvText.trim()) {
      alert("Please paste your CV text")
      return
    }
    // Ensure we have analysis (for contact/education)
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
      // seed structured experience entries from any bullets the model produced
      const seededEntries = []
      const expBullets = toArray(ecv?.experience)
      if (expBullets.length > 0) {
        seededEntries.push({ company: '', title: '', period: '', location: '', bullets: expBullets })
      }
      
      // Merge client-side fallback from text
      const local = deriveFromText(cvText)
      
      // Use extracted experiences if available, otherwise use seeded entries
      const experienceEntries = local.experienceEntries || seededEntries
      
      setEnhancedData({ 
        ...ecv, 
        experienceEntries,
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
          // Prefer common keys from LLM outputs
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
      alert(e.message || "Enhance request failed")
    } finally {
      setEnhancing(false)
    }
  }

  const handleDownload = () => {
    const element = document.createElement("a")
    const file = new Blob([enhancedCV], { type: "text/plain" })
    element.href = URL.createObjectURL(file)
    element.download = "enhanced-cv.txt"
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  // PDF download (client-side) using html2pdf.js
  const previewRef = useRef<HTMLDivElement>(null)
  const ensureHtml2Pdf = async (): Promise<void> => {
    if (typeof window === 'undefined') return
    // quick happy-path
    // @ts-ignore
    if ((window as any).html2pdf || (window as any).html2pdf?.default) return
    const sources = [
      '/vendor/html2pdf.bundle.min.js',
      'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js',
      'https://unpkg.com/html2pdf.js@0.10.1/dist/html2pdf.bundle.min.js',
      'https://cdn.jsdelivr.net/npm/html2pdf.js@0.10.1/dist/html2pdf.bundle.min.js'
    ]
    let lastErr: any = null
    for (const src of sources) {
      try {
        console.log('[PDF] Attempting to load', src)
        await new Promise<void>((resolve, reject) => {
          const s = document.createElement('script')
          s.src = src
          s.async = true
          s.crossOrigin = 'anonymous'
          s.onload = () => { console.log('[PDF] Loaded', src); resolve() }
          s.onerror = () => { console.error('[PDF] Failed to load', src); reject(new Error('Failed to load ' + src)) }
          document.head.appendChild(s)
        })
        // wait a tick for global to attach
        await new Promise(r=>setTimeout(r, 0))
        // @ts-ignore
        if ((window as any).html2pdf || (window as any).html2pdf?.default) { console.log('[PDF] html2pdf available after', src); return }
      } catch (e) {
        lastErr = e
      }
    }
    // After attempting all sources, ensure it's actually available
    // @ts-ignore
    if ((window as any).html2pdf) return
    if (lastErr) throw lastErr
    throw new Error('html2pdf library failed to load')
  }
  const handleDownloadPdf = async () => {
    let originalWarn: typeof console.warn = console.warn
    try {
      console.log('[PDF] Download clicked')
      setDownloadingPdf(true)
      console.warn = (...args: any[]) => {
        try {
          if (args && args.length && typeof args[0] === 'string' && args[0].includes('oklch')) {
            return
          }
        } catch {}
        return originalWarn.apply(console, args as any)
      }
      await ensureHtml2Pdf()
      // @ts-ignore
      const g = (window as any).html2pdf?.default || (window as any).html2pdf
      console.log('[PDF] html2pdf type:', typeof g)
      console.log('[PDF] previewRef set:', !!previewRef.current)
      if (!previewRef.current) throw new Error('Nothing to export yet')
      if (document && (document as any).fonts && typeof (document as any).fonts.ready?.then === 'function') {
        await (document as any).fonts.ready
      }
      await new Promise(r=>setTimeout(r,50))
      // @ts-ignore resolve global or default export
      const h2p = (window as any).html2pdf?.default || (window as any).html2pdf
      if (!h2p || typeof h2p !== 'function') {
        throw new Error('PDF generator not available (html2pdf not loaded)')
      }
      console.log('[PDF] Starting html2pdf toPdf pipeline')
      await new Promise<void>((resolve, reject) => {
        try {
          h2p()
            .set({
              margin: 0,
              filename: 'cv.pdf',
              image: { type: 'jpeg', quality: 0.98 },
              html2canvas: { 
                scale: 2, 
                useCORS: true, 
                backgroundColor: '#ffffff', 
                scrollX: 0, 
                scrollY: 0,
                logging: false,
                onclone: (clonedDoc: Document) => {
                  try {
                    const root = clonedDoc.getElementById('pdf-preview')
                    if (!root) return
                    const win = clonedDoc.defaultView
                    if (!win) return
                    const props = [
                      'color', 'backgroundColor',
                      'borderTopColor','borderRightColor','borderBottomColor','borderLeftColor',
                      'outlineColor','textDecorationColor','columnRuleColor'
                    ]
                    const svgProps = ['fill','stroke']
                    const all = root.querySelectorAll<HTMLElement | SVGElement>('*')
                    all.forEach((el:any) => {
                      const cs = win.getComputedStyle(el as Element)
                      // Fix shorthands that may embed oklch in gradients or combined props
                      const bg = cs.background
                      if (bg && typeof bg === 'string' && bg.includes('oklch')) {
                        (el as HTMLElement).style.setProperty('background-image', 'none', 'important')
                        ;(el as HTMLElement).style.setProperty('background-color', '#fff', 'important')
                      }
                      const border = cs.border
                      if (border && typeof border === 'string' && border.includes('oklch')) {
                        ;(el as HTMLElement).style.setProperty('border-color', (accentColor || '#1f3a8a'), 'important')
                      }
                      const outline = cs.outline
                      if (outline && typeof outline === 'string' && outline.includes('oklch')) {
                        ;(el as HTMLElement).style.setProperty('outline-color', (accentColor || '#1f3a8a'), 'important')
                      }
                      const boxShadow = cs.boxShadow
                      if (boxShadow && typeof boxShadow === 'string' && boxShadow.includes('oklch')) {
                        ;(el as HTMLElement).style.setProperty('box-shadow', 'none', 'important')
                      }
                      props.forEach(p => {
                        const v = (cs as any)[p]
                        if (v && typeof v === 'string' && v.includes('oklch')) {
                          const cssName = p.replace(/[A-Z]/g, m=>'-'+m.toLowerCase())
                          let fallback: string = '#000'
                          if (p === 'backgroundColor') {
                            fallback = '#fff'
                          } else if (p.startsWith('border') || p === 'outlineColor' || p === 'textDecorationColor' || p === 'columnRuleColor') {
                            fallback = accentColor || '#1f3a8a'
                          }
                          (el as HTMLElement).style.setProperty(cssName, fallback, 'important')
                        }
                      })
                      svgProps.forEach(p => {
                        const v = (cs as any)[p as any]
                        if (v && typeof v === 'string' && v.includes('oklch')) {
                          const svgFallback: string = (p === 'fill' || p === 'stroke') ? (accentColor || '#1f3a8a') : '#000'
                          ;(el as HTMLElement).style.setProperty(p, svgFallback, 'important')
                        }
                      })
                    })
                  } catch (e) {
                    console.warn('[PDF] onclone sanitize failed', e)
                  }
                }
              },
              pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
              jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
            })
            .from(previewRef.current)
            .toPdf()
            .get('pdf')
            .then((pdf: any) => {
              console.log('[PDF] Got pdf instance, saving')
              pdf.save('cv.pdf')
              resolve()
            })
            .catch((err: any) => {
              console.warn('[PDF] toPdf/get pipeline failed, falling back:', err)
              reject(err)
            })
        } catch (err) {
          reject(err as any)
        }
      }).catch(async () => {
        // Fallback: output blob URL and manual download
        try {
          console.log('[PDF] Fallback: output blob url')
          const blobUrl = await h2p()
            .set({
              margin: 0,
              image: { type: 'jpeg', quality: 0.98 },
              html2canvas: { 
                scale: 2, 
                useCORS: true, 
                backgroundColor: '#ffffff', 
                scrollX: 0, 
                scrollY: 0,
                logging: false,
                onclone: (clonedDoc: Document) => {
                  try {
                    const root = clonedDoc.getElementById('pdf-preview')
                    if (!root) return
                    const win = clonedDoc.defaultView
                    if (!win) return
                    const props = [
                      'color', 'backgroundColor',
                      'borderTopColor','borderRightColor','borderBottomColor','borderLeftColor',
                      'outlineColor','textDecorationColor','columnRuleColor'
                    ]
                    const svgProps = ['fill','stroke']
                    const all = root.querySelectorAll<HTMLElement | SVGElement>('*')
                    all.forEach((el:any) => {
                      const cs = win.getComputedStyle(el as Element)
                      props.forEach(p => {
                        const v = (cs as any)[p]
                        if (v && typeof v === 'string' && v.includes('oklch')) {
                          const cssName = p.replace(/[A-Z]/g, m=>'-'+m.toLowerCase())
                          let fallback: string = '#000'
                          if (p === 'backgroundColor') {
                            fallback = '#fff'
                          } else if (p.startsWith('border') || p === 'outlineColor' || p === 'textDecorationColor' || p === 'columnRuleColor') {
                            fallback = accentColor || '#1f3a8a'
                          }
                          (el as HTMLElement).style.setProperty(cssName, fallback, 'important')
                        }
                      })
                      svgProps.forEach(p => {
                        const v = (cs as any)[p as any]
                        if (v && typeof v === 'string' && v.includes('oklch')) {
                          const svgFallback: string = (p === 'fill' || p === 'stroke') ? (accentColor || '#1f3a8a') : '#000'
                          ;(el as HTMLElement).style.setProperty(p, svgFallback, 'important')
                        }
                      })
                    })
                  } catch (e) {
                    console.warn('[PDF] onclone sanitize failed', e)
                  }
                }
              },
              pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
              jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
            })
            .from(previewRef.current)
            .outputPdf('bloburl')
          const a = document.createElement('a')
          a.href = blobUrl
          a.download = 'cv.pdf'
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
        } catch (err) {
          console.error('[PDF] Fallback failed:', err)
          throw err
        }
      })
    } catch (e:any) {
      console.error('[PDF] Export failed:', e)
      try {
        if (previewRef.current) {
          console.log('[PDF] Trying print() fallback')
          const style = document.createElement('style')
          style.setAttribute('data-pdf-print-style', 'true')
          style.media = 'print'
          style.innerHTML = `
            @page { size: A4 portrait; margin: 0; }
            html, body { background: #ffffff; }
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            body * { visibility: hidden !important; }
            #pdf-preview, #pdf-preview * { visibility: visible !important; }
            #pdf-preview { position: absolute; left: 0; top: 0; width: 794px; margin: 0 !important; }
          `
          document.head.appendChild(style)
          window.print()
          setTimeout(() => { try { style.remove() } catch {} }, 1000)
        }
      } catch (pfErr) {
        console.error('[PDF] Print fallback failed:', pfErr)
      }
      // No alert: avoid surfacing cosmetic warnings to users
    } finally {
      // restore console.warn
      try { console.warn = originalWarn } catch {}
      setDownloadingPdf(false)
    }
  }

  if (loading || !user) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
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
            {/* Input Section */}
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
                      // Auto-analyze right after upload to fill contact/education
                      if (text) {
                        await analyzeWithText(text)
                      }
                    } catch (err: any) {
                      alert(err.message || "Failed to extract text from file")
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
              <div className="grid grid-cols-2 gap-3">
                <Button onClick={handleAnalyze} disabled={analyzing} className="w-full bg-accent hover:bg-accent/90">
                  {analyzing ? "Analyzing..." : "Analyze"}
                </Button>
                <Button onClick={handleEnhance} disabled={enhancing} variant="secondary" className="w-full">
                  {enhancing ? "Enhancing..." : "Enhance CV"}
                </Button>
              </div>
            </div>

            {/* Suggestions Section */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-primary">AI Suggestions</h2>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-5 h-96 overflow-y-auto">
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

          {/* Enhanced CV Preview */}
          {enhancedCV && (
            <div className="mt-8 pt-8 border-t border-border">
              <h2 className="text-xl font-semibold text-primary mb-4">Template & Preview</h2>
              {/* Templates chooser */}
              <div className="flex flex-wrap gap-3 mb-4">
                {templates.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => { setSelectedTemplate(t); setAccentColor(t.colors?.[0] || accentColor); setFontFamily(t.fonts?.[0] || fontFamily) }}
                    className={`px-3 py-2 border rounded text-sm ${selectedTemplate?.id === t.id ? 'border-blue-600' : 'border-border'}`}
                  >{t.name}</button>
                ))}
                {selectedTemplate && (
                  <>
                    <select className="border rounded px-2 py-1 text-sm" value={fontFamily} onChange={(e)=>setFontFamily(e.target.value)}>
                      {selectedTemplate.fonts.map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                    <select className="border rounded px-2 py-1 text-sm" value={accentColor} onChange={(e)=>setAccentColor(e.target.value)}>
                      {selectedTemplate.colors.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </>
                )}
              </div>

              {/* Structured preview with inline editing */}
              <div id="pdf-preview" ref={previewRef} className="border border-border rounded-lg p-6 space-y-5 bg-white" style={{ fontFamily, borderColor: accentColor, width: '794px', margin: '0 auto', backgroundColor: '#ffffff' }}>
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

                {/* CONTACT INFORMATION */}
                {!hiddenSections['contact'] && (
                <div>
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-xs tracking-wider px-3 py-1 border" style={{ borderColor: accentColor, color: accentColor }}>CONTACT INFORMATION</div>
                    <Button size="sm" variant="ghost" onClick={()=>toggleSection('contact')}>Hide</Button>
                  </div>
                  <div className="bg-gray-50 p-3 border-b border-l border-r" style={{ borderColor: accentColor }}>
                    <ul className="list-disc pl-5 space-y-1 text-sm">
                      <li>
                        <span className="font-semibold">Phone: </span>
                        <input className="outline-none" placeholder="Phone" value={lastAnalysis?.phone || ''} onChange={(e)=> setLastAnalysis({ ...lastAnalysis, phone: e.target.value })} />
                      </li>
                      <li>
                        <span className="font-semibold">Email: </span>
                        <input className="outline-none" placeholder="Email" value={lastAnalysis?.email || ''} onChange={(e)=> setLastAnalysis({ ...lastAnalysis, email: e.target.value })} />
                      </li>
                      <li>
                        <span className="font-semibold">Address: </span>
                        <input className="outline-none w-3/4" placeholder="Address" value={lastAnalysis?.address || ''} onChange={(e)=> setLastAnalysis({ ...lastAnalysis, address: e.target.value })} />
                      </li>
                      <li>
                        <span className="font-semibold">LinkedIn: </span>
                        <input className="outline-none w-3/4" placeholder="LinkedIn" value={lastAnalysis?.linkedin || ''} onChange={(e)=> setLastAnalysis({ ...lastAnalysis, linkedin: e.target.value })} />
                      </li>
                    </ul>
                  </div>
                </div>
                )}

                {/* PROFESSIONAL SUMMARY */}
                {!hiddenSections['summary'] && (
                <div>
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-xs tracking-wider px-3 py-1 border" style={{ borderColor: accentColor, color: accentColor }}>{enhancedData?.sectionTitles?.summary || 'PROFESSIONAL SUMMARY'}</div>
                    <Button size="sm" variant="ghost" onClick={()=>toggleSection('summary')}>Hide</Button>
                  </div>
                  <textarea
                    className="w-full bg-gray-50 rounded-b p-3 text-sm outline-none border-b border-l border-r"
                    style={{ borderColor: accentColor }}
                    value={enhancedData?.summary || ''}
                    onChange={(e)=> setEnhancedData({ ...enhancedData, summary: e.target.value })}
                    placeholder="Professional summary"
                  />
                </div>
                )}

                {/* EXPERIENCE (structured, full width) */}
                {!hiddenSections['experience'] && (
                <div>
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-xs tracking-wider px-3 py-1 border" style={{ borderColor: accentColor, color: accentColor }}>{enhancedData?.sectionTitles?.experience || 'PROFESSIONAL EXPERIENCE'}</div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" onClick={()=>{
                        const next = [...(enhancedData?.experienceEntries||[]), { company:'', title:'', period:'', location:'', bullets:[] }]
                        setEnhancedData({ ...enhancedData, experienceEntries: next })
                      }}>Add Experience</Button>
                      <Button size="sm" variant="ghost" onClick={()=>toggleSection('experience')}>Hide</Button>
                    </div>
                  </div>
                  <div className="space-y-4 border-b border-l border-r rounded-b p-3" style={{ borderColor: accentColor }}>
                    {(enhancedData?.experienceEntries || []).map((exp: any, idx: number) => (
                      <div key={idx} className="border rounded p-3 space-y-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          <input className="outline-none border rounded px-2 py-1" placeholder="Company" value={exp.company}
                            onChange={(e)=>{
                              const next = [...enhancedData.experienceEntries]; next[idx] = { ...exp, company: e.target.value }; setEnhancedData({ ...enhancedData, experienceEntries: next })
                            }} />
                          <input className="outline-none border rounded px-2 py-1" placeholder="Job Title" value={exp.title}
                            onChange={(e)=>{
                              const next = [...enhancedData.experienceEntries]; next[idx] = { ...exp, title: e.target.value }; setEnhancedData({ ...enhancedData, experienceEntries: next })
                            }} />
                          <input className="outline-none border rounded px-2 py-1" placeholder="Period (e.g., Jan 2024 – Present)" value={exp.period}
                            onChange={(e)=>{
                              const next = [...enhancedData.experienceEntries]; next[idx] = { ...exp, period: e.target.value }; setEnhancedData({ ...enhancedData, experienceEntries: next })
                            }} />
                          <input className="outline-none border rounded px-2 py-1" placeholder="Location" value={exp.location}
                            onChange={(e)=>{
                              const next = [...enhancedData.experienceEntries]; next[idx] = { ...exp, location: e.target.value }; setEnhancedData({ ...enhancedData, experienceEntries: next })
                            }} />
                        </div>
                        <div>
                          <div className="text-xs mb-1" style={{ color: accentColor }}>Bullets</div>
                          <ul className="list-disc pl-5 space-y-1">
                            {(exp.bullets||[]).map((b:string, bi:number)=>(
                              <li key={bi}>
                                <input className="w-full outline-none" value={b} onChange={(e)=>{
                                  const next = [...enhancedData.experienceEntries];
                                  const xb = [...(exp.bullets||[])]; xb[bi] = e.target.value; next[idx] = { ...exp, bullets: xb };
                                  setEnhancedData({ ...enhancedData, experienceEntries: next })
                                }} />
                              </li>
                            ))}
                          </ul>
                          <div className="flex gap-2 mt-2">
                            <Button size="sm" variant="secondary" onClick={()=>{
                              const next = [...enhancedData.experienceEntries];
                              next[idx] = { ...exp, bullets: [...(exp.bullets||[]), ""] };
                              setEnhancedData({ ...enhancedData, experienceEntries: next })
                            }}>Add Bullet</Button>
                            <Button size="sm" variant="destructive" onClick={()=>{
                              const next = enhancedData.experienceEntries.filter((_:any,i:number)=>i!==idx)
                              setEnhancedData({ ...enhancedData, experienceEntries: next })
                            }}>Remove Experience</Button>
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground">{exp.company && exp.title ? `${exp.company} — ${exp.title}` : ''} {exp.period || exp.location ? `| ${[exp.period, exp.location].filter(Boolean).join(' | ')}` : ''}</div>
                      </div>
                    ))}
                  </div>
                </div>
                )}

                {/* SKILLS (full width below experience) */}
                {!hiddenSections['skills'] && (
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-xs tracking-wider px-3 py-1 border" style={{ borderColor: accentColor, color: accentColor }}>{enhancedData?.sectionTitles?.skills || 'SKILLS'}</div>
                      <Button size="sm" variant="ghost" onClick={()=>toggleSection('skills')}>Hide</Button>
                    </div>
                    <div className="bg-gray-50 border-b border-l border-r rounded-b p-3" style={{ borderColor: accentColor }}>
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

                {/* LANGUAGES */}
                {!hiddenSections['languages'] && (
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-xs tracking-wider px-3 py-1 border" style={{ borderColor: accentColor, color: accentColor }}>{enhancedData?.sectionTitles?.languages || 'LANGUAGES'}</div>
                      <Button size="sm" variant="ghost" onClick={()=>toggleSection('languages')}>Hide</Button>
                    </div>
                    <div className="bg-gray-50 border-b border-l border-r rounded-b p-3" style={{ borderColor: accentColor }}>
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

                {/* EDUCATION */}
                {!hiddenSections['education'] && (
                <div>
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-xs tracking-wider px-3 py-1 border" style={{ borderColor: accentColor, color: accentColor }}>{enhancedData?.sectionTitles?.education || 'EDUCATION'}</div>
                    <Button size="sm" variant="ghost" onClick={()=>toggleSection('education')}>Hide</Button>
                  </div>
                  <ul className="list-disc pl-5 mt-2 space-y-1 border-b border-l border-r rounded-b p-3 bg-white" style={{ borderColor: accentColor }}>
                    {toArray(lastAnalysis?.education).map((eItem: string, idx: number) => (
                      <li key={idx}>
                        <input className="w-full outline-none" value={eItem}
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

                {/* TRAINING / CERTIFICATIONS */}
                {!hiddenSections['training'] && (
                <div>
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-xs tracking-wider px-3 py-1 border" style={{ borderColor: accentColor, color: accentColor }}>{enhancedData?.sectionTitles?.training || 'CORPORATE TRAINING / CERTIFICATIONS'}</div>
                    <Button size="sm" variant="ghost" onClick={()=>toggleSection('training')}>Hide</Button>
                  </div>
                  <ul className="list-disc pl-5 mt-2 space-y-1 border-b border-l border-r rounded-b p-3 bg-white" style={{ borderColor: accentColor }}>
                    {toArray(lastAnalysis?.training || lastAnalysis?.certifications).map((tItem: string, idx: number) => (
                      <li key={idx}>
                        <input className="w-full outline-none" value={tItem}
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

                {/* CUSTOM SECTIONS */}
                {customSections.map((sec, sidx) => (
                  <div key={sidx}>
                    <div className="flex items-center gap-2">
                      <input className="font-semibold text-xs tracking-wider px-3 py-1 border outline-none"
                        style={{ borderColor: accentColor, color: accentColor }}
                        value={sec.title}
                        placeholder="SECTION TITLE"
                        onChange={(e)=>{
                          const next = [...customSections]
                          next[sidx] = { ...sec, title: e.target.value }
                          setCustomSections(next)
                        }}
                      />
                      <Button variant="outline" size="sm" onClick={()=>{
                        setCustomSections(prev => prev.filter((_,i)=>i!==sidx))
                      }}>Remove</Button>
                    </div>
                    <textarea className="w-full outline-none bg-gray-50 rounded-b p-2 text-sm border-b border-l border-r mt-1" rows={6}
                      style={{ borderColor: accentColor }}
                      value={(sec.items||[]).join('\n')}
                      onChange={(e)=>{
                        const next = [...customSections]
                        next[sidx] = { ...sec, items: e.target.value.split('\n').filter(Boolean) }
                        setCustomSections(next)
                      }}
                    />
                  </div>
                ))}
              </div>

              <div className="flex gap-4 mt-4">
                <Button onClick={handleDownload} className="flex-1 bg-accent hover:bg-accent/90">
                  Download Enhanced CV
                </Button>
                <Button onClick={() => setCustomSections(prev => [...prev, {title: 'CUSTOM SECTION', items: []}])} variant="secondary">
                  Add Section
                </Button>
                <Button onClick={handleDownloadPdf} variant="outline" disabled={downloadingPdf}>
                  {downloadingPdf ? 'Generating...' : 'Download PDF'}
                </Button>
                <Button onClick={() => router.push("/dashboard")} variant="outline" className="flex-1">
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
