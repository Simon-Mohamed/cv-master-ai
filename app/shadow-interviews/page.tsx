"use client";
import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Mic,
  MicOff,
  ChevronRight,
  Home,
  Video,
  VideoOff,
  Volume2,
  VolumeX,
  Play,
  Sparkles,
  AlertTriangle,
  Check,
  X,
  BarChart3,
  Loader2,
  Square,
  StopCircle,
  Reply as Replay,
  CheckCircle,
  AlertCircle,
  Pause,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

interface Feedback {
  clarity: number;
  confidence: number;
  structure: number;
  relevance: number;
  summary: string;
  tips: string[];
}

interface Answer {
  question: string;
  answer: string;
  feedback: Feedback | null;
  words: number;
}

export default function ShadowInterviewPage() {
  const params = useParams();
  const router = useRouter();
  const interviewId = params?.id as string;

  const [isStreaming, setIsStreaming] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [status, setStatus] = useState("Click 'Start Interview' to begin");
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [allQuestions, setAllQuestions] = useState<string[]>([]);
  const [wordCount, setWordCount] = useState(0);
  const [duration, setDuration] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [interviewComplete, setInterviewComplete] = useState(false);
  const [showVideo, setShowVideo] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isTTSMuted, setIsTTSMuted] = useState(false);
  const [questionsSource, setQuestionsSource] = useState<
    "ai" | "fallback" | "unknown"
  >("unknown");
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoadingNext, setIsLoadingNext] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const workletRef = useRef<AudioWorkletNode | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const transcriptEndRef = useRef<HTMLDivElement | null>(null);
  const speechFinishedRef = useRef<boolean>(false);
  const isProcessingRef = useRef<boolean>(false);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcript]);

  useEffect(() => {
    if (!interviewId) {
      setStatus("No interview ID provided");
      return;
    }
    loadInterview();
  }, [interviewId]);

  useEffect(() => {
    if (transcript) {
      const words = transcript
        .trim()
        .split(/\s+/)
        .filter((w) => w.length > 0);
      setWordCount(words.length);
    }
  }, [transcript]);

  useEffect(() => {
    if (isStreaming) {
      timerRef.current = setInterval(() => {
        setDuration((d) => d + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setDuration(0);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isStreaming]);

  useEffect(() => {
    if (
      currentQuestion &&
      currentQuestion !== "" &&
      audioEnabled &&
      hasStarted &&
      !isLoadingNext
    ) {
      speechFinishedRef.current = false;
      speakQuestion(currentQuestion);
    }
  }, [currentQuestion, audioEnabled, hasStarted, isLoadingNext]);

  useEffect(() => {
    if (mediaStreamRef.current) {
      const audioTrack = mediaStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !isMicMuted;
        console.log("🎤 Mic", isMicMuted ? "MUTED" : "UNMUTED");
      }
    }
  }, [isMicMuted]);

  const speakQuestion = (text: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();

      setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;

        utterance.onstart = () => {
          console.log("🔇 Muting mic during TTS");
          setIsTTSMuted(true);
          if (mediaStreamRef.current) {
            const audioTrack = mediaStreamRef.current.getAudioTracks()[0];
            if (audioTrack) {
              audioTrack.enabled = false;
            }
          }
        };

        utterance.onend = () => {
          console.log("✅ TTS finished");
          speechFinishedRef.current = true;
          setIsTTSMuted(false);

          if (!isMicMuted && mediaStreamRef.current) {
            console.log("🔊 Unmuting mic after TTS");
            const audioTrack = mediaStreamRef.current.getAudioTracks()[0];
            if (audioTrack) {
              audioTrack.enabled = true;
            }
          }
        };

        const voices = window.speechSynthesis.getVoices();
        const preferredVoice =
          voices.find((v) => v.name.includes("Female")) || voices[0];
        if (preferredVoice) utterance.voice = preferredVoice;

        console.log("🔊 Speaking question...");
        window.speechSynthesis.speak(utterance);
      }, 100);
    }
  };

  const stopSpeech = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      speechFinishedRef.current = true;
    }
  };

  const loadInterview = async () => {
    try {
      console.log("📞 Loading interview:", interviewId);
      const res = await fetch(`${API_BASE}/api/interviews/${interviewId}`);
      if (!res.ok) throw new Error("Failed to load interview");

      const data = await res.json();
      console.log("📥 Interview data:", data);

      setAllQuestions(data.question_set || []);

      const startIndex = data.current_question || 0;
      setCurrentQuestionIndex(startIndex);
      setCurrentQuestion(data.question_set[startIndex] || "");

      const firstQuestion = data.question_set[0] || "";
      if (
        firstQuestion.includes("Tell me about your experience with") ||
        firstQuestion.includes("What are your greatest strengths")
      ) {
        setQuestionsSource("fallback");
        console.warn("⚠️ Using FALLBACK questions");
      } else {
        setQuestionsSource("ai");
        console.log("✅ Using AI-GENERATED questions");
      }

      setStatus("Click 'Start Interview' to begin");
    } catch (e: any) {
      console.error("❌ Load interview error:", e);
      setStatus("Error loading interview: " + e.message);
    }
  };

  const loadNextQuestion = async () => {
    try {
      console.log("📞 Calling next-question API for interview:", interviewId);
      const res = await fetch(
        `${API_BASE}/api/interviews/${interviewId}/next-question`
      );

      if (!res.ok) {
        const text = await res.text();
        console.error("❌ Next question HTTP error:", res.status, text);
        throw new Error(`HTTP ${res.status}: ${text}`);
      }

      const data = await res.json();
      console.log("📥 Next question response:", data);

      if (data.done) {
        console.log("✅ Interview complete! All questions answered.");
        setInterviewComplete(true);
        await handleFinalize();
        return false;
      }

      console.log(
        `📝 Loading question ${data.index + 1}/${data.total}: "${
          data.question
        }"`
      );

      setCurrentQuestion(data.question);
      setCurrentQuestionIndex(data.index);

      return true;
    } catch (e: any) {
      console.error("❌ Error loading next question:", e);
      setStatus("Error loading next question: " + e.message);
      return false;
    }
  };

  async function startRecording(url: string) {
    try {
      setStatus("Requesting camera and microphone access...");

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: showVideo,
      });
      mediaStreamRef.current = stream;

      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !isMicMuted;
      }

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      setStatus("Connecting to server...");
      const ws = new WebSocket(url);
      ws.binaryType = "arraybuffer";
      wsRef.current = ws;

      ws.onopen = async () => {
        setStatus("Setting up audio processing...");
        const AudioCtx =
          (window as any).AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioCtx({ sampleRate: 16000 });
        audioCtxRef.current = ctx;

        if (ctx.state === "suspended") await ctx.resume();

        await ctx.audioWorklet.addModule("/worklet-processor.js");
        const src = ctx.createMediaStreamSource(stream);
        const worklet = new AudioWorkletNode(ctx, "pcm16-sender");
        workletRef.current = worklet;

        src.connect(worklet);

        try {
          ws.send(
            JSON.stringify({ type: "config", sampleRate: ctx.sampleRate })
          );
        } catch {}

        worklet.port.onmessage = (e: MessageEvent) => {
          const d = e.data as any;
          let ab: ArrayBuffer | null = null;

          if (d instanceof ArrayBuffer) {
            ab = d;
          } else if (ArrayBuffer.isView(d) && d.buffer instanceof ArrayBuffer) {
            ab =
              d.byteLength === d.buffer.byteLength
                ? d.buffer
                : d.buffer.slice(d.byteOffset, d.byteOffset + d.byteLength);
          } else if (d?.buffer instanceof ArrayBuffer) {
            ab = d.buffer;
          }

          if (ab && ws.readyState === WebSocket.OPEN && !isMicMuted) {
            ws.send(ab);
          }
        };

        setStatus("Recording... speak your answer");
      };

      ws.onmessage = (msg) => {
        try {
          const data = JSON.parse(msg.data as any);

          if (data.type === "transcript") {
            setTranscript((t) => t + data.delta);
            console.log("🎤 Real-time:", data.delta);
          } else if (data.type === "transcript_end") {
            setTranscript((t) => t + " ");
          }
        } catch {}
      };

      ws.onclose = () => {
        console.log("🔴 WebSocket closed");
        stopRecording();
      };

      ws.onerror = (err) => {
        console.error("❌ WebSocket error:", err);
        stopRecording();
      };
    } catch (err) {
      console.error("❌ Recording error:", err);
      setStatus("Error: " + (err as Error).message);
      stopRecording();
    }
  }

  async function stopRecording() {
    setIsStreaming(false);

    try {
      wsRef.current?.close();
    } catch {}

    try {
      mediaStreamRef.current?.getTracks().forEach((t) => t.stop());
    } catch {}

    try {
      workletRef.current?.disconnect();
    } catch {}

    try {
      if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
        await audioCtxRef.current.close();
      }
    } catch {}

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    mediaStreamRef.current = null;
  }

  async function handleStartOrNext() {
    if (isProcessingRef.current || isLoadingNext || isAnalyzing) {
      console.log("⏳ Already processing, ignoring click");
      return;
    }

    isProcessingRef.current = true;

    try {
      if (!hasStarted) {
        // Start interview
        console.log("🎬 Starting interview");
        await handleStartInterview();
      } else if (!isSubmitted) {
        // Submit answer
        console.log("📤 Submitting answer");
        await handleSubmitAnswer();
      } else {
        // Next question
        console.log("➡️ Next question");
        await handleNextQuestion();
      }
    } catch (error) {
      console.error("❌ Error in handleStartOrNext:", error);
      setStatus("An error occurred. Please try again.");
    } finally {
      isProcessingRef.current = false;
    }
  }

  async function handleStartInterview() {
    setHasStarted(true);
    setStatus("Listening to question...");

    await waitForTTS();

    console.log("🎙️ Starting recording...");
    await startRecordingSession();
  }

  async function handleSubmitAnswer() {
    if (!transcript.trim()) {
      setStatus("Please record an answer first");
      return;
    }

    if (isStreaming) {
      await stopRecording();
    }

    await submitAnswer();
    setIsSubmitted(true);
  }

  async function handleNextQuestion() {
    setIsLoadingNext(true);
    setShowFeedbackModal(false);
    setStatus("Loading next question...");

    if (isStreaming) {
      await stopRecording();
    }

    setTranscript("");
    setFeedback(null);
    setIsSubmitted(false);
    setWordCount(0);
    setIsPaused(false);

    const success = await loadNextQuestion();

    if (!success) {
      setIsLoadingNext(false);
      return;
    }

    await waitForTTS();

    console.log("🎙️ Starting recording for new question...");
    await startRecordingSession();

    setIsLoadingNext(false);
  }

  async function waitForTTS() {
    console.log("🔊 Waiting for TTS to finish...");
    await new Promise((resolve) => setTimeout(resolve, 2000));

    if (!speechFinishedRef.current) {
      for (let i = 0; i < 15; i++) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        if (speechFinishedRef.current) break;
      }
    }
    console.log("✅ TTS complete");
  }

  async function startRecordingSession() {
    try {
      const res = await fetch(
        `${API_BASE}/api/interviews/${interviewId}/rt/start`,
        { method: "POST" }
      );

      if (!res.ok) {
        throw new Error(`Failed to start recording session: ${res.status}`);
      }

      const data = await res.json();
      setSessionId(data.sessionId);

      await startRecording(data.node_ws_url);
      setIsStreaming(true);
    } catch (e: any) {
      console.error("❌ Start recording error:", e);
      setStatus("Failed to start recording: " + e.message);
      throw e;
    }
  }

  async function submitAnswer() {
    if (!transcript.trim()) {
      console.log("⚠️ No transcript to submit");
      return;
    }

    setIsAnalyzing(true);
    setStatus("Analyzing your answer...");

    try {
      console.log("📤 Submitting answer...");
      const res = await fetch(
        `${API_BASE}/api/interviews/${interviewId}/rt/submit-answer`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: sessionId,
            transcript: transcript,
            question_index: currentQuestionIndex,
          }),
        }
      );

      if (!res.ok) throw new Error("Failed to submit answer");

      const data = await res.json();
      const answerFeedback = data.feedback as Feedback;

      console.log("✅ Feedback received:", answerFeedback);
      setFeedback(answerFeedback);
      setAnswers((prev) => [
        ...prev,
        {
          question: currentQuestion,
          answer: transcript,
          feedback: answerFeedback,
          words: wordCount,
        },
      ]);

      setStatus("Answer analyzed! Click to go to next question");
    } catch (e: any) {
      console.error("❌ Submit answer error:", e);
      setStatus("Error analyzing answer: " + e.message);
    } finally {
      setIsAnalyzing(false);
    }
  }

  const handleFinalize = async () => {
    try {
      console.log("🏁 Finalizing interview...");
      stopSpeech();
      await stopRecording();

      const res = await fetch(
        `${API_BASE}/api/interviews/${interviewId}/finalize`,
        { method: "POST" }
      );
      const data = await res.json();
      console.log("📥 Finalize response:", data);

      router.push(`/interviews/${interviewId}/report`);
    } catch (e: any) {
      console.error("❌ Finalize error:", e);
      setStatus("Error finalizing interview: " + e.message);
    }
  };

  const handleExit = async () => {
    if (transcript.trim() && !feedback) {
      await submitAnswer();
    }
    await handleFinalize();
  };

  const toggleMicMute = () => {
    setIsMicMuted(!isMicMuted);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "excellent":
        return "text-green-500";
      case "good":
        return "text-blue-500";
      case "warning":
        return "text-yellow-500";
      case "poor":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  const getProgressColor = (status: string) => {
    switch (status) {
      case "excellent":
        return "bg-green-500";
      case "good":
        return "bg-blue-500";
      case "warning":
        return "bg-yellow-500";
      case "poor":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  useEffect(() => {
    return () => {
      stopRecording();
      stopSpeech();
      isProcessingRef.current = false;
    };
  }, []);

  if (!interviewId) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Card className="p-8">
          <p className="text-red-500">No interview ID provided</p>
          <Button
            onClick={() => router.push("/interview-setup")}
            className="mt-4"
          >
            Start New Interview
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full flex-col bg-background">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-border bg-card px-6 py-3 shrink-0">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-bold">AI Interview Practice</h1>
          <span className="text-sm text-muted-foreground">
            Question {currentQuestionIndex + 1} of {allQuestions.length}
          </span>

          {questionsSource === "ai" && (
            <span className="flex items-center gap-1 text-xs bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-2 py-1 rounded">
              <Sparkles size={12} />
              AI Questions
            </span>
          )}
          {questionsSource === "fallback" && (
            <span className="flex items-center gap-1 text-xs bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 px-2 py-1 rounded">
              <AlertTriangle size={12} />
              Fallback Questions
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExit}
            disabled={isLoadingNext}
          >
            <Home className="mr-2 h-4 w-4" />
            Exit & View Report
          </Button>
          <Button
            onClick={handleStartOrNext}
            disabled={isAnalyzing || interviewComplete || isLoadingNext}
            size="sm"
          >
            {isLoadingNext ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Loading...
              </>
            ) : !hasStarted ? (
              <>
                <Play className="mr-2 h-4 w-4" />
                Start Interview
              </>
            ) : !isSubmitted ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Submit Answer
              </>
            ) : (
              <>
                <ChevronRight className="mr-2 h-4 w-4" />
                Next Question
              </>
            )}
          </Button>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-blue-500"></div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Main Content */}
        <main className="flex-1 p-8 grid grid-cols-3 gap-8">
          {/* Video Section */}
          <div className="col-span-2 flex flex-col h-full">
            {/* Question Display */}
            <Card className="mb-4 p-4 shrink-0">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-lg">Question:</h3>
                <span className="bg-primary/10 text-primary px-3 py-1 rounded text-sm font-medium">
                  {currentQuestionIndex + 1}/{allQuestions.length}
                </span>
              </div>
              <p className="text-foreground text-base font-medium">
                {currentQuestion || "Loading..."}
              </p>
            </Card>

            <div className="bg-gray-900 rounded-xl flex flex-col justify-center items-center relative overflow-hidden h-[500px] shrink-0">
              {/* Progress Bar */}
              <div className="absolute top-0 left-0 w-full h-2 bg-gray-700">
                <div
                  className="h-full bg-accent"
                  style={{
                    width: `${
                      ((currentQuestionIndex + 1) / allQuestions.length) * 100
                    }%`,
                  }}
                ></div>
              </div>

              {/* Video */}
              {showVideo ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white/50">
                  <VideoOff size={64} />
                </div>
              )}

              {/* Controls */}
              <div className="absolute bottom-6 flex items-center gap-6">
                <button
                  onClick={toggleMicMute}
                  className="bg-white/20 hover:bg-white/30 backdrop-blur-sm p-3 rounded-full text-white transition"
                  disabled={!isStreaming || isLoadingNext}
                >
                  {isMicMuted ? <MicOff size={24} /> : <Mic size={24} />}
                </button>
                <button
                  onClick={handleStartOrNext}
                  disabled={isAnalyzing || interviewComplete || isLoadingNext}
                  className={`p-4 rounded-full text-white transition ${
                    isStreaming
                      ? "bg-red-500 hover:bg-red-600"
                      : "bg-red-500 hover:bg-red-600"
                  }`}
                >
                  {isLoadingNext ? (
                    <Loader2 size={24} className="animate-spin" />
                  ) : !hasStarted ? (
                    <Play size={24} />
                  ) : !isSubmitted ? (
                    <Square size={24} />
                  ) : (
                    <ChevronRight size={24} />
                  )}
                </button>
                <button
                  onClick={() => setShowVideo(!showVideo)}
                  className="bg-white/20 hover:bg-white/30 backdrop-blur-sm p-3 rounded-full text-white transition"
                  disabled={isLoadingNext}
                >
                  {showVideo ? <Video size={24} /> : <VideoOff size={24} />}
                </button>
              </div>

              {/* Top Right Controls */}
              <div className="absolute top-6 right-6 flex flex-col gap-3">
                <button
                  onClick={() =>
                    currentQuestion && speakQuestion(currentQuestion)
                  }
                  className="bg-white/20 hover:bg-white/30 backdrop-blur-sm p-2 rounded-lg text-white text-sm flex items-center gap-2 transition"
                  disabled={isLoadingNext}
                >
                  <Replay size={16} /> Replay Question
                </button>
              </div>

              {/* Status Indicator */}
              <div className="absolute top-6 left-6">
                <div className="bg-black/70 backdrop-blur-sm px-3 py-2 rounded-lg">
                  {isStreaming ? (
                    <div className="flex items-center gap-2 text-white text-sm">
                      <span className="flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-red-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                      </span>
                      <span className="font-medium">
                        {isPaused ? "Paused" : "Recording"}
                      </span>
                      <span className="text-white/70">
                        • {formatTime(duration)}
                      </span>
                      {isTTSMuted && (
                        <span className="text-yellow-400">• Listening...</span>
                      )}
                      {isMicMuted && (
                        <span className="text-red-400">• MUTED</span>
                      )}
                    </div>
                  ) : isLoadingNext ? (
                    <div className="flex items-center gap-2 text-white text-sm">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      <span>Loading next question...</span>
                    </div>
                  ) : (
                    <span className="text-white/70 text-sm">{status}</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Feedback Panel */}
          <aside className="bg-card rounded-xl p-6 flex flex-col">
            <h3 className="text-lg font-bold mb-4">Real-Time Feedback</h3>
            <div className="space-y-5 flex-1 overflow-y-auto">
              {/* Transcript */}
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  Your Answer
                </p>
                <div className="bg-muted p-3 rounded-lg max-h-[300px] overflow-y-auto">
                  {transcript ? (
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {transcript}
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">
                      {hasStarted
                        ? isTTSMuted
                          ? "🔊 Listening to question..."
                          : isMicMuted
                          ? "Microphone muted"
                          : isLoadingNext
                          ? "Loading next question..."
                          : "Listening... start speaking"
                        : "Click the record button to begin"}
                    </p>
                  )}
                  <div ref={transcriptEndRef} />
                </div>
                {transcript && (
                  <div className="mt-2 text-xs text-muted-foreground flex justify-between">
                    <span>{wordCount} words</span>
                    {isStreaming && <span>{formatTime(duration)}</span>}
                  </div>
                )}
              </div>

              {/* Performance Metrics */}
              {feedback && (
                <>
                  {[
                    {
                      label: "Clarity",
                      value: feedback.clarity,
                      status:
                        feedback.clarity >= 80
                          ? "excellent"
                          : feedback.clarity >= 60
                          ? "good"
                          : "warning",
                    },
                    {
                      label: "Confidence",
                      value: feedback.confidence,
                      status:
                        feedback.confidence >= 80
                          ? "excellent"
                          : feedback.confidence >= 60
                          ? "good"
                          : "warning",
                    },
                  ].map((metric, idx) => (
                    <div key={idx}>
                      <div className="flex justify-between items-center mb-1">
                        <p className="text-sm font-medium text-muted-foreground">
                          {metric.label}
                        </p>
                        <p
                          className={`text-sm font-bold ${getStatusColor(
                            metric.status
                          )}`}
                        >
                          {metric.status.charAt(0).toUpperCase() +
                            metric.status.slice(1)}
                        </p>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${getProgressColor(
                            metric.status
                          )}`}
                          style={{ width: `${metric.value}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}

                  {/* Summary */}
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">
                      Summary
                    </p>
                    <div className="bg-green-100 dark:bg-green-900/50 p-3 rounded-lg">
                      <p className="text-sm text-green-800 dark:text-green-300">
                        {feedback.summary}
                      </p>
                    </div>
                  </div>

                  {/* Tips */}
                  {feedback.tips && feedback.tips.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-2">
                        Quick Tips
                      </p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <CheckCircle size={16} className="text-green-500" />
                        <span>{feedback.tips[0]}</span>
                      </div>
                      {feedback.tips[1] && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <AlertCircle size={16} className="text-yellow-500" />
                          <span>{feedback.tips[1]}</span>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}

              {feedback && (
                <Button
                  onClick={() => setShowFeedbackModal(true)}
                  variant="outline"
                  className="w-full mt-auto"
                >
                  View Full Report
                </Button>
              )}
            </div>
          </aside>
        </main>
      </div>

      {/* Feedback Modal */}
      {showFeedbackModal && feedback && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="p-6 border-b border-border flex justify-between items-center sticky top-0 bg-card">
              <h3 className="text-xl font-bold">Feedback Summary</h3>
              <button
                onClick={() => setShowFeedbackModal(false)}
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
                  <h4 className="text-lg font-semibold mb-3">
                    Overall Performance
                  </h4>
                  <div className="bg-green-100 dark:bg-green-900/50 p-4 rounded-lg">
                    <p className="text-green-800 dark:text-green-300 font-semibold">
                      {feedback.summary}
                    </p>
                  </div>
                </div>

                {/* Performance Metrics */}
                <div>
                  <h4 className="text-lg font-semibold mb-3">
                    Performance Metrics
                  </h4>
                  <div className="space-y-3">
                    {[
                      { label: "Clarity", value: feedback.clarity },
                      { label: "Confidence", value: feedback.confidence },
                      { label: "Structure", value: feedback.structure },
                      { label: "Relevance", value: feedback.relevance },
                    ].map((metric, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between"
                      >
                        <span className="text-sm">{metric.label}</span>
                        <div className="w-3/5 bg-muted rounded-full h-2.5">
                          <div
                            className={`${getScoreBgColor(
                              metric.value
                            )} h-2.5 rounded-full`}
                            style={{ width: `${metric.value}%` }}
                          ></div>
                        </div>
                        <span
                          className={`text-sm font-bold ${getScoreColor(
                            metric.value
                          )}`}
                        >
                          {metric.value}/100
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Tips */}
              {feedback.tips && feedback.tips.length > 0 && (
                <div className="mb-8">
                  <h4 className="text-lg font-semibold mb-3">
                    Tips for Improvement
                  </h4>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    {feedback.tips.map((tip, idx) => (
                      <li key={idx}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Transcript */}
              <div>
                <h4 className="text-lg font-semibold mb-3">Transcript</h4>
                <p className="text-sm text-muted-foreground bg-muted p-4 rounded-lg leading-relaxed">
                  {transcript}
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 bg-muted border-t border-border flex justify-end gap-3 sticky bottom-0">
              <Button
                variant="outline"
                onClick={() => setShowFeedbackModal(false)}
              >
                Close
              </Button>
              <Button
                className="bg-accent text-white"
                onClick={async () => {
                  setShowFeedbackModal(false);
                  if (isSubmitted) {
                    await handleNextQuestion();
                  }
                }}
                disabled={isLoadingNext || !isSubmitted}
              >
                Next Question
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
