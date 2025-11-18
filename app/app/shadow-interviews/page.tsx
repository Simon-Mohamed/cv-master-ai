// "use client"

// import { useEffect, useState } from "react"
// import { useRouter } from "next/navigation"
// import DashboardNav from "@/components/dashboard-nav"
// import { Button } from "@/components/ui/button"

// interface User {
//   id: string
//   name: string
//   email: string
//   createdAt: string
// }

// interface Interview {
//   id: string
//   question: string
//   userAnswer: string
//   feedback: string
//   score: number
// }

// const MOCK_QUESTIONS = [
//   "Tell me about yourself and your professional background.",
//   "What are your greatest strengths and how do they apply to this role?",
//   "Describe a challenging project you worked on and how you overcame obstacles.",
//   "Why are you interested in this position and our company?",
//   "How do you handle stress and prioritize multiple tasks?",
//   "What are your career goals for the next 5 years?",
// ]

// export default function ShadowInterviewsPage() {
//   const router = useRouter()
//   const [user, setUser] = useState<User | null>(null)
//   const [loading, setLoading] = useState(true)
//   const [interviews, setInterviews] = useState<Interview[]>([])
//   const [currentQuestion, setCurrentQuestion] = useState(0)
//   const [userAnswer, setUserAnswer] = useState("")
//   const [showFeedback, setShowFeedback] = useState(false)
//   const [interviewStarted, setInterviewStarted] = useState(false)

//   useEffect(() => {
//     const userData = localStorage.getItem("cvmaster_user")
//     if (!userData) {
//       router.push("/login")
//       return
//     }
//     setUser(JSON.parse(userData))

//     const savedInterviews = localStorage.getItem("cvmaster_interviews")
//     if (savedInterviews) {
//       setInterviews(JSON.parse(savedInterviews))
//     }
//     setLoading(false)
//   }, [router])

//   const startInterview = () => {
//     setInterviews([])
//     setCurrentQuestion(0)
//     setUserAnswer("")
//     setShowFeedback(false)
//     setInterviewStarted(true)
//   }

//   const submitAnswer = () => {
//     if (!userAnswer.trim()) {
//       alert("Please provide an answer")
//       return
//     }

//     // Simulate AI feedback
//     const mockFeedback = [
//       "Great answer! You provided specific examples and demonstrated clear communication.",
//       "Good response. Consider adding more quantifiable results to strengthen your answer.",
//       "Solid answer. Try to be more concise while maintaining key details.",
//       "Excellent! You showed good understanding of the role and company.",
//       "Good effort. Consider practicing your delivery to sound more confident.",
//     ]

//     const mockScore = Math.floor(Math.random() * 40) + 60 // 60-100

//     const newInterview: Interview = {
//       id: Date.now().toString(),
//       question: MOCK_QUESTIONS[currentQuestion],
//       userAnswer,
//       feedback: mockFeedback[Math.floor(Math.random() * mockFeedback.length)],
//       score: mockScore,
//     }

//     setInterviews([...interviews, newInterview])
//     setShowFeedback(true)
//   }

//   const nextQuestion = () => {
//     if (currentQuestion < MOCK_QUESTIONS.length - 1) {
//       setCurrentQuestion(currentQuestion + 1)
//       setUserAnswer("")
//       setShowFeedback(false)
//     } else {
//       finishInterview()
//     }
//   }

//   const finishInterview = () => {
//     localStorage.setItem("cvmaster_interviews", JSON.stringify(interviews))
//     setInterviewStarted(false)
//   }

//   if (loading || !user) {
//     return <div className="flex items-center justify-center min-h-screen">Loading...</div>
//   }

//   return (
//     <div className="min-h-screen bg-background">
//       <DashboardNav user={user} />

//       <main className="max-w-4xl mx-auto px-4 py-12">
//         <div className="bg-white rounded-lg shadow-md p-8">
//           <h1 className="text-3xl font-bold text-primary mb-2">Shadow Interviews</h1>
//           <p className="text-muted-foreground mb-8">
//             Practice with realistic interview questions and get AI-powered feedback
//           </p>

//           {!interviewStarted ? (
//             <div className="space-y-8">
//               {/* Interview History */}
//               {interviews.length > 0 && (
//                 <div className="border-t border-border pt-8">
//                   <h2 className="text-xl font-semibold text-primary mb-4">Previous Interviews</h2>
//                   <div className="space-y-4">
//                     {interviews.map((interview) => (
//                       <div key={interview.id} className="border border-border rounded-lg p-4">
//                         <div className="flex items-center justify-between mb-2">
//                           <h3 className="font-semibold text-foreground">{interview.question}</h3>
//                           <span className="bg-accent text-white px-3 py-1 rounded-full text-sm font-bold">
//                             {interview.score}%
//                           </span>
//                         </div>
//                         <p className="text-sm text-muted-foreground mb-2">
//                           <strong>Your Answer:</strong> {interview.userAnswer}
//                         </p>
//                         <p className="text-sm text-green-700 bg-green-50 p-2 rounded">
//                           <strong>Feedback:</strong> {interview.feedback}
//                         </p>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               )}

//               {/* Start Interview Button */}
//               <div className="flex gap-4">
//                 <Button onClick={startInterview} className="flex-1 bg-accent hover:bg-accent/90 py-6 text-lg">
//                   Start New Interview
//                 </Button>
//                 <Button onClick={() => router.push("/dashboard")} variant="outline" className="flex-1">
//                   Back to Dashboard
//                 </Button>
//               </div>
//             </div>
//           ) : (
//             <div className="space-y-6">
//               {/* Progress */}
//               <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
//                 <div className="flex items-center justify-between mb-2">
//                   <span className="font-semibold text-foreground">
//                     Question {currentQuestion + 1} of {MOCK_QUESTIONS.length}
//                   </span>
//                   <span className="text-sm text-muted-foreground">
//                     {Math.round(((currentQuestion + 1) / MOCK_QUESTIONS.length) * 100)}%
//                   </span>
//                 </div>
//                 <div className="w-full bg-gray-200 rounded-full h-2">
//                   <div
//                     className="bg-accent h-2 rounded-full transition-all"
//                     style={{
//                       width: `${((currentQuestion + 1) / MOCK_QUESTIONS.length) * 100}%`,
//                     }}
//                   />
//                 </div>
//               </div>

//               {/* Question */}
//               <div className="bg-primary text-white rounded-lg p-6">
//                 <h2 className="text-2xl font-semibold">{MOCK_QUESTIONS[currentQuestion]}</h2>
//               </div>

//               {/* Answer Input */}
//               <div className="space-y-4">
//                 <label className="block text-sm font-medium text-foreground">Your Answer</label>
//                 <textarea
//                   value={userAnswer}
//                   onChange={(e) => setUserAnswer(e.target.value)}
//                   disabled={showFeedback}
//                   className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent h-40 disabled:bg-muted"
//                   placeholder="Type your answer here..."
//                 />
//               </div>

//               {/* Feedback */}
//               {showFeedback && interviews.length > 0 && (
//                 <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
//                   <div className="flex items-center justify-between">
//                     <h3 className="font-semibold text-green-900">AI Feedback</h3>
//                     <span className="bg-accent text-white px-3 py-1 rounded-full text-sm font-bold">
//                       {interviews[interviews.length - 1].score}%
//                     </span>
//                   </div>
//                   <p className="text-green-800">{interviews[interviews.length - 1].feedback}</p>
//                 </div>
//               )}

//               {/* Buttons */}
//               <div className="flex gap-4">
//                 {!showFeedback ? (
//                   <Button onClick={submitAnswer} className="flex-1 bg-accent hover:bg-accent/90">
//                     Submit Answer
//                   </Button>
//                 ) : (
//                   <>
//                     <Button onClick={nextQuestion} className="flex-1 bg-accent hover:bg-accent/90">
//                       {currentQuestion === MOCK_QUESTIONS.length - 1 ? "Finish Interview" : "Next Question"}
//                     </Button>
//                   </>
//                 )}
//               </div>
//             </div>
//           )}
//         </div>
//       </main>
//     </div>
//   )
// }

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  X,
  Play,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Square,
  StopCircle,
  Reply as Replay,
  CheckCircle,
  AlertCircle,
} from "lucide-react"

interface FeedbackMetric {
  label: string
  value: number
  max: number
  status: "excellent" | "good" | "warning" | "poor"
}

export default function InterviewPractice() {
  const [showModal, setShowModal] = useState(false)
  const [isMicOn, setIsMicOn] = useState(true)
  const [isVideoOn, setIsVideoOn] = useState(true)
  const [isRecording, setIsRecording] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState("behavioral")

  const categories = [
    { id: "behavioral", label: "Behavioral", icon: "😊" },
    { id: "technical", label: "Technical", icon: "💻" },
    { id: "situational", label: "Situational", icon: "❓" },
  ]

  const commonQuestions = [
    "Tell me about yourself.",
    "What are your greatest strengths?",
    "Describe a challenging situation and how you handled it.",
  ]

  const feedbackMetrics: FeedbackMetric[] = [
    { label: "Clarity", value: 90, max: 100, status: "excellent" },
    { label: "Pace", value: 75, max: 100, status: "warning" },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "excellent":
        return "text-green-500"
      case "good":
        return "text-blue-500"
      case "warning":
        return "text-yellow-500"
      case "poor":
        return "text-red-500"
      default:
        return "text-gray-500"
    }
  }

  const getProgressColor = (status: string) => {
    switch (status) {
      case "excellent":
        return "bg-green-500"
      case "good":
        return "bg-blue-500"
      case "warning":
        return "bg-yellow-500"
      case "poor":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <div className="flex h-screen w-full flex-col bg-background">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-border bg-card px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="text-primary size-7">
            <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <g clipPath="url(#clip0_6_319)">
                <path
                  d="M8.57829 8.57829C5.52816 11.6284 3.451 15.5145 2.60947 19.7452C1.76794 23.9758 2.19984 28.361 3.85056 32.3462C5.50128 36.3314 8.29667 39.7376 11.8832 42.134C15.4698 44.5305 19.6865 45.8096 24 45.8096C28.3135 45.8096 32.5302 44.5305 36.1168 42.134C39.7033 39.7375 42.4987 36.3314 44.1494 32.3462C45.8002 28.361 46.2321 23.9758 45.3905 19.7452C44.549 15.5145 42.4718 11.6284 39.4217 8.57829L24 24L8.57829 8.57829Z"
                  fill="currentColor"
                ></path>
              </g>
              <defs>
                <clipPath id="clip0_6_319">
                  <rect fill="white" height="48" width="48"></rect>
                </clipPath>
              </defs>
            </svg>
          </div>
          <h1 className="text-lg font-bold tracking-tight">AI Interview Practice</h1>
        </div>
        <div className="flex items-center gap-6">
          <a href="/create-cv" className="text-sm font-medium text-muted-foreground hover:text-primary transition">
            CV Builder
          </a>
          <a href="/job-search" className="text-sm font-medium text-muted-foreground hover:text-primary transition">
            Job Search
          </a>
          <a
            href="/shadow-interviews"
            className="text-sm font-medium text-muted-foreground hover:text-primary transition"
          >
            Shadow Interviews
          </a>
          <Button className="bg-primary text-white">My Profile</Button>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-blue-500"></div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-1/4 min-w-[300px] border-r border-border bg-card p-6 flex flex-col justify-between">
          <div>
            {/* User Info */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-blue-500"></div>
              <div>
                <h2 className="text-base font-semibold">John Doe</h2>
                <p className="text-sm text-muted-foreground">Software Engineer</p>
              </div>
            </div>

            {/* Categories */}
            <h3 className="text-xs font-bold uppercase text-muted-foreground mb-3 tracking-wider">
              Question Categories
            </h3>
            <div className="flex flex-col gap-2 mb-8">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                    selectedCategory === cat.id ? "bg-accent/10 text-accent" : "hover:bg-muted text-muted-foreground"
                  }`}
                >
                  <span className="text-lg">{cat.icon}</span>
                  <p className="text-sm font-medium">{cat.label}</p>
                </button>
              ))}
            </div>

            {/* Common Questions */}
            <h3 className="text-xs font-bold uppercase text-muted-foreground mb-4 tracking-wider">Common Questions</h3>
            <div className="space-y-2">
              {commonQuestions.map((question, idx) => (
                <div key={idx} className="flex items-center justify-between gap-4 bg-muted p-3 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="text-accent flex items-center justify-center rounded-lg bg-accent/10 shrink-0 size-8">
                      <Play size={20} />
                    </div>
                    <p className="text-sm font-normal flex-1 truncate">{question}</p>
                  </div>
                  <button className="text-sm font-medium text-accent hover:underline">Start</button>
                </div>
              ))}
            </div>
          </div>

          <Button className="w-full bg-accent text-white">Upgrade to Premium</Button>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8 grid grid-cols-3 gap-8">
          {/* Video Section */}
          <div className="col-span-2 flex flex-col">
            <div className="bg-gray-900 rounded-xl flex-1 flex flex-col justify-center items-center relative overflow-hidden">
              {/* Progress Bar */}
              <div className="absolute top-0 left-0 w-full h-2 bg-gray-700">
                <div className="h-full bg-accent" style={{ width: "30%" }}></div>
              </div>

              {/* Video Placeholder */}
              <img src="/interview-video-placeholder.jpg" alt="Video placeholder" className="w-full h-full object-cover" />

              {/* Controls */}
              <div className="absolute bottom-6 flex items-center gap-6">
                <button
                  onClick={() => setIsMicOn(!isMicOn)}
                  className="bg-white/20 hover:bg-white/30 backdrop-blur-sm p-3 rounded-full text-white transition"
                >
                  {isMicOn ? <Mic size={24} /> : <MicOff size={24} />}
                </button>
                <button
                  onClick={() => setIsRecording(!isRecording)}
                  className={`p-4 rounded-full text-white transition ${
                    isRecording ? "bg-red-500 hover:bg-red-600 animate-pulse" : "bg-red-500 hover:bg-red-600"
                  }`}
                >
                  <Square size={24} />
                </button>
                <button
                  onClick={() => setIsVideoOn(!isVideoOn)}
                  className="bg-white/20 hover:bg-white/30 backdrop-blur-sm p-3 rounded-full text-white transition"
                >
                  {isVideoOn ? <Video size={24} /> : <VideoOff size={24} />}
                </button>
              </div>

              {/* Top Right Controls */}
              <div className="absolute top-6 right-6 flex flex-col gap-3">
                <button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm p-2 rounded-lg text-white text-sm flex items-center gap-2 transition">
                  <StopCircle size={16} /> Stop
                </button>
                <button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm p-2 rounded-lg text-white text-sm flex items-center gap-2 transition">
                  <Replay size={16} /> Re-record
                </button>
              </div>
            </div>

            {/* Question Display */}
            <Card className="mt-4 p-4">
              <h3 className="font-semibold text-lg mb-2">Question:</h3>
              <p className="text-muted-foreground">
                Tell me about a time you had to work with a difficult colleague. How did you handle the situation?
              </p>
            </Card>
          </div>

          {/* Feedback Panel */}
          <aside className="bg-card rounded-xl p-6 flex flex-col">
            <h3 className="text-lg font-bold mb-4">Real-Time Feedback</h3>
            <div className="space-y-5">
              {/* Metrics */}
              {feedbackMetrics.map((metric, idx) => (
                <div key={idx}>
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-sm font-medium text-muted-foreground">{metric.label}</p>
                    <p className={`text-sm font-bold ${getStatusColor(metric.status)}`}>
                      {metric.status.charAt(0).toUpperCase() + metric.status.slice(1)}
                    </p>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${getProgressColor(metric.status)}`}
                      style={{ width: `${metric.value}%` }}
                    ></div>
                  </div>
                </div>
              ))}

              {/* Filler Words */}
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Filler Words</p>
                <div className="flex flex-wrap gap-2">
                  <span className="bg-orange-100 dark:bg-orange-900/50 text-orange-600 dark:text-orange-400 text-xs font-medium px-2.5 py-1 rounded-full">
                    um (3)
                  </span>
                  <span className="bg-orange-100 dark:bg-orange-900/50 text-orange-600 dark:text-orange-400 text-xs font-medium px-2.5 py-1 rounded-full">
                    like (5)
                  </span>
                  <span className="bg-orange-100 dark:bg-orange-900/50 text-orange-600 dark:text-orange-400 text-xs font-medium px-2.5 py-1 rounded-full">
                    you know (2)
                  </span>
                </div>
              </div>

              {/* Body Language */}
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Body Language</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <CheckCircle size={16} className="text-green-500" />
                  <span>Good eye contact</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <AlertCircle size={16} className="text-yellow-500" />
                  <span>Slight fidgeting</span>
                </div>
              </div>

              <Button onClick={() => setShowModal(true)} variant="outline" className="w-full mt-auto">
                View Full Report
              </Button>
            </div>
          </aside>
        </main>
      </div>

      {/* Feedback Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="p-6 border-b border-border flex justify-between items-center sticky top-0 bg-card">
              <h3 className="text-xl font-bold">Feedback Summary</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-muted-foreground hover:text-foreground transition"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Overall Performance */}
                <div>
                  <h4 className="text-lg font-semibold mb-3">Overall Performance</h4>
                  <div className="bg-green-100 dark:bg-green-900/50 p-4 rounded-lg">
                    <p className="text-green-800 dark:text-green-300 font-semibold">
                      Great job! You communicated your points clearly and confidently.
                    </p>
                  </div>
                </div>

                {/* Performance Metrics */}
                <div>
                  <h4 className="text-lg font-semibold mb-3">Performance Metrics</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Clarity</span>
                      <div className="w-3/5 bg-muted rounded-full h-2.5">
                        <div className="bg-green-500 h-2.5 rounded-full" style={{ width: "90%" }}></div>
                      </div>
                      <span className="text-sm font-bold text-green-500">9/10</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Pace</span>
                      <div className="w-3/5 bg-muted rounded-full h-2.5">
                        <div className="bg-yellow-500 h-2.5 rounded-full" style={{ width: "75%" }}></div>
                      </div>
                      <span className="text-sm font-bold text-yellow-500">7.5/10</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Strengths */}
              <div className="mb-8">
                <h4 className="text-lg font-semibold mb-3">Strengths</h4>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Strong, confident opening.</li>
                  <li>Used the STAR method effectively to structure your answer.</li>
                  <li>Maintained good eye contact throughout.</li>
                </ul>
              </div>

              {/* Areas for Improvement */}
              <div className="mb-8">
                <h4 className="text-lg font-semibold mb-3">Areas for Improvement</h4>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>
                    Try to reduce the use of filler words like "um" and "like". Pause to gather your thoughts instead.
                  </li>
                  <li>Your speaking pace was slightly fast. Take a deep breath to maintain a more controlled pace.</li>
                </ul>
              </div>

              {/* Transcript */}
              <div>
                <h4 className="text-lg font-semibold mb-3">Transcript</h4>
                <p className="text-sm text-muted-foreground bg-muted p-4 rounded-lg leading-relaxed">
                  "Well, um, there was this one time, like, I had a project with a very tight deadline. My colleague,
                  you know, had a different approach... so what I did was, I scheduled a meeting to... um... discuss our
                  perspectives and find a common ground..."
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 bg-muted border-t border-border flex justify-end gap-3 sticky bottom-0">
              <Button variant="outline">Try Another Question</Button>
              <Button className="bg-accent text-white">Practice Again</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

