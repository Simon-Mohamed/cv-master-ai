// Test the new extraction function
const testText = `
MOHAMED HASSAN ABDALELAH
Laboratory Chemist
Email: mohamed.hassan@example.com
Phone: +20 123 456 7890
Address: Cairo, Egypt

WORK EXPERIENCE

Laboratory Chemist at Egyptian Sugar & Integrated Industries Company
Duration: 01/09/2022 - Present
• Analyzing raw materials, in-process materials, and finished products using various analytical techniques (HPLC, GC, UV-Vis, AAS).
• Ensuring compliance with ISO 9001 and ISO 22000 standards through rigorous quality control procedures.
• Collaborating with production teams to troubleshoot quality issues and improve processes.

Medical Analysis Specialist at Al-Mokhtabar Laboratory
Duration: 15/03/2020 - 30/08/2022
• Performing complex medical tests on patient samples including blood, urine, and tissue analysis.
• Operating and maintaining sophisticated laboratory equipment such as automated analyzers and PCR machines.
• Providing accurate and timely test results to physicians and healthcare providers.

EDUCATION
Bachelor of Science in Chemistry - Cairo University (2016-2020)

SKILLS
• Analytical Techniques: HPLC, GC, UV-Vis, AAS
• Quality Management Systems
• Medical Laboratory Operations
• Problem Solving

LANGUAGES
English: Fluent
Arabic: Native
`

// Enhanced work experience extraction function
const extractWorkExperience = (text) => {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean)
  const experiences = []

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

  let currentExp = null
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

// Test the extraction
const result = extractWorkExperience(testText)
console.log('Extracted experiences:')
console.log(JSON.stringify(result, null, 2))
