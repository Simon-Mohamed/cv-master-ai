"use client"

import { useCV } from "@/contexts/CVContext"

export default function ResumePreview() {
  const { cvData } = useCV()

  return (
    <div
      className="shadow-lg h-full p-8 border-t-[15px] 
                 sm:p-6 md:p-8 lg:p-10 
                 w-full max-w-[900px] mx-auto 
                 bg-white text-[10.5pt]
                 rounded-lg overflow-hidden
                 print:p-0 print:shadow-none
                 print:min-h-[1123px]"
      style={{
        borderColor: cvData.themeColor,
      }}
    >
      <style>
        {`
          @media print {
            @page {
              size: A4;
              margin: 5mm 5mm;
              marks: none;
              @top-left { content: none; }
              @top-right { content: none; }
              @bottom-left { content: none; }
              @bottom-right { content: none; }
            }
            body {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .avoid-break {
              break-inside: avoid-page;
            }
          }
        `}
      </style>

      <div className="print:mx-4 print:my-0 print:pt-1">
        {/* Header */}
        <div className="mb-4 avoid-break">
          <div className="flex justify-between items-start border-b-2 pb-3" style={{ borderColor: cvData.themeColor }}>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {cvData.personalInfo.firstName} {cvData.personalInfo.lastName}
              </h1>
              <p className="text-lg font-medium mt-1" style={{ color: cvData.themeColor }}>
                {cvData.personalInfo.jobTitle}
              </p>
            </div>
            <div className="text-right text-sm text-gray-600">
              {cvData.personalInfo.email && <p>{cvData.personalInfo.email}</p>}
              {cvData.personalInfo.phone && <p>{cvData.personalInfo.phone}</p>}
              {cvData.personalInfo.address && <p>{cvData.personalInfo.address}</p>}
              {cvData.personalInfo.linkedin && <p>{cvData.personalInfo.linkedin}</p>}
            </div>
          </div>
        </div>

        {/* Summary */}
        {cvData.summary && (
          <div className="mb-4 avoid-break">
            <h2 className="text-lg font-bold mb-2" style={{ color: cvData.themeColor }}>
              Professional Summary
            </h2>
            <p className="text-sm text-gray-700 leading-relaxed">{cvData.summary}</p>
          </div>
        )}

        {/* Education */}
        {cvData.education.length > 0 && (
          <div className="mb-4 avoid-break">
            <h2 className="text-lg font-bold mb-3" style={{ color: cvData.themeColor }}>
              Education
            </h2>
            <div className="space-y-3">
              {cvData.education.map((edu) => (
                <div key={edu.id}>
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-gray-900">{edu.degree}</h3>
                    <p className="text-sm text-gray-600">{edu.graduationDate}</p>
                  </div>
                  <p className="text-sm font-medium" style={{ color: cvData.themeColor }}>
                    {edu.school}
                  </p>
                  {edu.field && (
                    <p className="text-sm text-gray-600">{edu.field}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Experience */}
        {cvData.experience.length > 0 && (
          <div className="mb-4 avoid-break">
            <h2 className="text-lg font-bold mb-3" style={{ color: cvData.themeColor }}>
              Work Experience
            </h2>
            <div className="space-y-4">
              {cvData.experience.map((exp) => (
                <div key={exp.id}>
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-gray-900 text-lg">{exp.position}</h3>
                    <p className="text-sm text-gray-600 whitespace-nowrap">
                      {exp.startDate} - {exp.endDate}
                    </p>
                  </div>
                  <p className="text-sm font-medium mb-1" style={{ color: cvData.themeColor }}>
                    {exp.company}
                  </p>
                  {exp.description && (
                    <p className="text-sm text-gray-700 leading-relaxed">{exp.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Projects */}
        {cvData.projects.length > 0 && (
          <div className="mb-4 avoid-break">
            <h2 className="text-lg font-bold mb-3" style={{ color: cvData.themeColor }}>
              Projects
            </h2>
            <div className="space-y-3">
              {cvData.projects.map((project) => (
                <div key={project.id}>
                  <h3 className="font-semibold text-gray-900">{project.name}</h3>
                  {project.technologies && (
                    <p className="text-sm font-medium mb-1" style={{ color: cvData.themeColor }}>
                      Technologies: {project.technologies}
                    </p>
                  )}
                  {project.description && (
                    <p className="text-sm text-gray-700 leading-relaxed">{project.description}</p>
                  )}
                  {project.url && (
                    <p className="text-sm text-blue-600 mt-1">{project.url}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Achievements */}
        {cvData.achievements.length > 0 && (
          <div className="mb-4 avoid-break">
            <h2 className="text-lg font-bold mb-3" style={{ color: cvData.themeColor }}>
              Achievements
            </h2>
            <div className="space-y-3">
              {cvData.achievements.map((achievement) => (
                <div key={achievement.id}>
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-gray-900">{achievement.title}</h3>
                    <p className="text-sm text-gray-600">{achievement.date}</p>
                  </div>
                  {achievement.description && (
                    <p className="text-sm text-gray-700 leading-relaxed">{achievement.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills */}
        {cvData.skills.length > 0 && (
          <div className="mb-4 avoid-break">
            <h2 className="text-lg font-bold mb-2" style={{ color: cvData.themeColor }}>
              Skills
            </h2>
            <div className="flex flex-wrap gap-2">
              {cvData.skills.map((skill, idx) => (
                <span
                  key={idx}
                  className="text-sm px-3 py-1 rounded-full"
                  style={{
                    backgroundColor: `${cvData.themeColor}20`,
                    color: cvData.themeColor,
                  }}
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
