"use client"

import { useCV } from "@/contexts/CVContext"
import { Button } from "@/components/ui/button"
import { Download, FileText } from "lucide-react"
import { useRef } from "react"

export default function PDFExport() {
  const { cvData } = useCV()
  const resumeRef = useRef<HTMLDivElement>(null)

  const handleDownloadPDF = () => {
    if (!resumeRef.current) return

    // Create a new window for printing
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    // Get the resume content
    const resumeContent = resumeRef.current.innerHTML
    
    // Create the HTML document for printing
    const printDocument = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>CV - ${cvData.personalInfo.firstName} ${cvData.personalInfo.lastName}</title>
          <style>
            @page {
              size: A4;
              margin: 0.5in;
            }
            body {
              font-family: Arial, sans-serif;
              line-height: 1.4;
              color: #333;
            }
            .resume-container {
              max-width: 100%;
              margin: 0 auto;
            }
            .header {
              border-bottom: 3px solid ${cvData.themeColor};
              padding-bottom: 15px;
              margin-bottom: 20px;
            }
            .name {
              font-size: 28px;
              font-weight: bold;
              margin-bottom: 5px;
            }
            .job-title {
              font-size: 18px;
              color: ${cvData.themeColor};
              margin-bottom: 10px;
            }
            .contact-info {
              text-align: right;
              font-size: 12px;
              color: #666;
            }
            .section {
              margin-bottom: 20px;
            }
            .section-title {
              font-size: 16px;
              font-weight: bold;
              color: ${cvData.themeColor};
              margin-bottom: 10px;
              border-bottom: 1px solid #eee;
              padding-bottom: 5px;
            }
            .experience-item, .education-item, .project-item, .achievement-item {
              margin-bottom: 15px;
            }
            .item-header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              margin-bottom: 5px;
            }
            .item-title {
              font-weight: bold;
              font-size: 14px;
            }
            .item-date {
              font-size: 12px;
              color: #666;
            }
            .item-company, .item-institution {
              font-size: 13px;
              color: ${cvData.themeColor};
              margin-bottom: 5px;
            }
            .item-description {
              font-size: 12px;
              color: #555;
              line-height: 1.4;
            }
            .skills-container {
              display: flex;
              flex-wrap: wrap;
              gap: 8px;
            }
            .skill-tag {
              background-color: ${cvData.themeColor}20;
              color: ${cvData.themeColor};
              padding: 4px 8px;
              border-radius: 12px;
              font-size: 11px;
            }
            .summary {
              font-size: 13px;
              line-height: 1.5;
              color: #555;
            }
            @media print {
              body { -webkit-print-color-adjust: exact; }
            }
          </style>
        </head>
        <body>
          <div class="resume-container">
            ${resumeContent}
          </div>
        </body>
      </html>
    `

    printWindow.document.write(printDocument)
    printWindow.document.close()
    
    // Wait for content to load then trigger print
    printWindow.onload = () => {
      printWindow.print()
      printWindow.close()
    }
  }

  return (
    <div className="flex gap-2">
      <Button
        onClick={handleDownloadPDF}
        className="gap-2 bg-green-600 hover:bg-green-700"
      >
        <Download className="w-4 h-4" />
        Download PDF
      </Button>
      
      {/* Hidden resume for PDF generation */}
      <div ref={resumeRef} className="hidden">
        <div className="header">
          <div className="name">
            {cvData.personalInfo.firstName} {cvData.personalInfo.lastName}
          </div>
          <div className="job-title">{cvData.personalInfo.jobTitle}</div>
          <div className="contact-info">
            {cvData.personalInfo.email && <div>{cvData.personalInfo.email}</div>}
            {cvData.personalInfo.phone && <div>{cvData.personalInfo.phone}</div>}
            {cvData.personalInfo.address && <div>{cvData.personalInfo.address}</div>}
            {cvData.personalInfo.linkedin && <div>{cvData.personalInfo.linkedin}</div>}
          </div>
        </div>

        {cvData.summary && (
          <div className="section">
            <div className="section-title">Professional Summary</div>
            <div className="summary">{cvData.summary}</div>
          </div>
        )}

        {cvData.education.length > 0 && (
          <div className="section">
            <div className="section-title">Education</div>
            {cvData.education.map((edu) => (
              <div key={edu.id} className="education-item">
                <div className="item-header">
                  <div className="item-title">{edu.degree}</div>
                  <div className="item-date">{edu.graduationDate}</div>
                </div>
                <div className="item-institution">{edu.school}</div>
                {edu.field && <div className="item-description">{edu.field}</div>}
              </div>
            ))}
          </div>
        )}

        {cvData.experience.length > 0 && (
          <div className="section">
            <div className="section-title">Work Experience</div>
            {cvData.experience.map((exp) => (
              <div key={exp.id} className="experience-item">
                <div className="item-header">
                  <div className="item-title">{exp.position}</div>
                  <div className="item-date">{exp.startDate} - {exp.endDate}</div>
                </div>
                <div className="item-company">{exp.company}</div>
                {exp.description && <div className="item-description">{exp.description}</div>}
              </div>
            ))}
          </div>
        )}

        {cvData.projects.length > 0 && (
          <div className="section">
            <div className="section-title">Projects</div>
            {cvData.projects.map((project) => (
              <div key={project.id} className="project-item">
                <div className="item-title">{project.name}</div>
                {project.technologies && <div className="item-company">Technologies: {project.technologies}</div>}
                {project.description && <div className="item-description">{project.description}</div>}
                {project.url && <div className="item-description">URL: {project.url}</div>}
              </div>
            ))}
          </div>
        )}

        {cvData.achievements.length > 0 && (
          <div className="section">
            <div className="section-title">Achievements</div>
            {cvData.achievements.map((achievement) => (
              <div key={achievement.id} className="achievement-item">
                <div className="item-header">
                  <div className="item-title">{achievement.title}</div>
                  <div className="item-date">{achievement.date}</div>
                </div>
                {achievement.description && <div className="item-description">{achievement.description}</div>}
              </div>
            ))}
          </div>
        )}

        {cvData.skills.length > 0 && (
          <div className="section">
            <div className="section-title">Skills</div>
            <div className="skills-container">
              {cvData.skills.map((skill, idx) => (
                <span key={idx} className="skill-tag">{skill}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
