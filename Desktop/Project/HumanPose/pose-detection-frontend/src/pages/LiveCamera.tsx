import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Suspense, useState, useEffect, useRef } from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import { Line } from "react-chartjs-2";
import "react-circular-progressbar/dist/styles.css";
import "chart.js/auto";

import PoseDetection from "../components/PoseDetection";
import Model3D from "../components/Model3D";
import { VideoCameraIcon } from "@heroicons/react/24/outline";
import LiveChatPanel from "../components/live/LiveChatPanel";

export default function LiveCameraPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isActive, setIsActive] = useState(false);
  const [currentScore, setCurrentScore] = useState<any>(null);
  const [recentFeedback, setRecentFeedback] = useState<any[]>([]);

  const [gender, setGender] = useState<"male" | "female">("female");
  const [accuracy, setAccuracy] = useState(60);
  const [isVoiceOn, setIsVoiceOn] = useState(false);
  const [exercise, setExercise] = useState("General Pose");
  const [listening, setListening] = useState(false);
  const [poseData, setPoseData] = useState<any>(null);
  const recognitionRef = useRef<any>(null);

  const modelUrl = gender === "male" ? "/models/xbot.glb" : "/models/ybot.glb";

  const joints = ["Head", "Shoulders", "Elbows", "Hips", "Knees", "Ankles"];
  const [history, setHistory] = useState([60, 65, 70, 72, 78, 85, 90, 95]);

  // Handle pose data from webcam
  const handlePose = (landmarks: any) => {
    setPoseData(landmarks);

    // Calculate posture accuracy
    const leftShoulder = landmarks[11];
    const rightShoulder = landmarks[12];
    const leftHip = landmarks[23];
    const rightHip = landmarks[24];

    if (leftShoulder && leftHip && rightShoulder && rightHip) {
      const shoulderDist = Math.abs(leftShoulder.y - rightShoulder.y);
      const hipDist = Math.abs(leftHip.y - rightHip.y);
      const imbalance = (shoulderDist + hipDist) * 100;

      const newAccuracy = Math.max(60, 100 - imbalance * 50);
      setAccuracy(Math.round(newAccuracy));

      if (isVoiceOn) {
        if (newAccuracy < 70) speak("Your posture is tilted. Try to straighten up.");
        else if (newAccuracy > 90) speak("Excellent alignment! Keep it up!");
      }
    }
  };

  // Update history
  useEffect(() => {
    const interval = setInterval(() => {
      setHistory((h) => [...h.slice(-7), accuracy]);
    }, 2000);
    return () => clearInterval(interval);
  }, [accuracy]);

  // Text-to-Speech
  const speak = (text: string) => {
    if (!isVoiceOn) return;
    const utter = new SpeechSynthesisUtterance(text);
    utter.pitch = 1.1;
    utter.rate = 1.0;
    speechSynthesis.speak(utter);
  };

  // Random voice feedback
  useEffect(() => {
    if (!isVoiceOn) return;
    const msgs = [
      "Straighten your back.",
      "Good job, keep going!",
      "Excellent form!",
      "Relax your shoulders.",
      "Perfect! Hold it there.",
    ];
    const interval = setInterval(() => {
      const msg = msgs[Math.floor(Math.random() * msgs.length)];
      speak(msg);
    }, 10000);
    return () => clearInterval(interval);
  }, [isVoiceOn]);

  // Speech-to-Text
  useEffect(() => {
    if (!("webkitSpeechRecognition" in window)) return;

    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.lang = "en-US";
    recognition.interimResults = false;

    recognition.onresult = (e: any) => {
      const transcript = e.results[e.results.length - 1][0].transcript.toLowerCase();
      console.log("🎙️ User:", transcript);
      if (transcript.includes("squat")) {
        setExercise("Squats");
        speak("Now doing squats.");
      } else if (transcript.includes("plank")) {
        setExercise("Plank");
        speak("Switching to plank position.");
      }
    };

    recognitionRef.current = recognition;
  }, []);

  const toggleListening = () => {
    const recognition = recognitionRef.current;
    if (!recognition) return;
    if (listening) {
      recognition.stop();
      setListening(false);
      speak("Stopped listening.");
    } else {
      recognition.start();
      setListening(true);
      speak("Listening activated.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4 flex items-center justify-center gap-3">
          <VideoCameraIcon className="w-10 h-10 text-red-500" />
          Live Pose Detection
        </h1>
        <p className="text-gray-400 text-lg">
          Real-time pose analysis with instant feedback
        </p>
      </div>

      {/* Your existing video/canvas components */}
      <div className="min-h-screen bg-gray-950 text-white flex flex-col lg:flex-row items-start justify-center p-6 gap-8">
        {/* LEFT PANEL — 3D Model + Controls */}
        <div className="flex flex-col items-center gap-6">
          <h1 className="text-4xl font-bold mb-2">🏋️ Live Pose Coach</h1>

          {/* Gender Selection */}
          <div className="flex gap-4">
            <button
              onClick={() => setGender("male")}
              className={`px-6 py-2 rounded-lg transition ${
                gender === "male" ? "bg-blue-600" : "bg-gray-700 hover:bg-gray-600"
              }`}
            >
              👨 Male
            </button>
            <button
              onClick={() => setGender("female")}
              className={`px-6 py-2 rounded-lg transition ${
                gender === "female" ? "bg-pink-600" : "bg-gray-700 hover:bg-gray-600"
              }`}
            >
              👩 Female
            </button>
          </div>

          {/* Voice Controls */}
          <div className="flex gap-4">
            <button
              onClick={() => setIsVoiceOn(!isVoiceOn)}
              className={`px-5 py-2 rounded-lg transition ${
                isVoiceOn ? "bg-green-600" : "bg-gray-700 hover:bg-gray-600"
              }`}
            >
              {isVoiceOn ? "🔊 Voice On" : "🔇 Voice Off"}
            </button>
            <button
              onClick={toggleListening}
              className={`px-5 py-2 rounded-lg transition ${
                listening ? "bg-yellow-500" : "bg-gray-700 hover:bg-gray-600"
              }`}
            >
              {listening ? "🎙️ Listening..." : "🎤 Voice Commands"}
            </button>
          </div>

          {/* 3D Canvas */}
          <div className="w-[500px] h-[500px] rounded-xl overflow-hidden border border-gray-700">
            <Canvas camera={{ position: [0, 4, 20], fov: 25 }} shadows>
              <color attach="background" args={["#1a1a1a"]} />
              <ambientLight intensity={1.2} />
              <directionalLight position={[5, 5, 5]} intensity={1.2} />
              <hemisphereLight intensity={0.6} />
              <gridHelper args={[15, 15, "#404040", "#202020"]} position={[0, -5, 0]} />
              <Suspense fallback={null}>
                <Model3D url={modelUrl} />
              </Suspense>
              <OrbitControls enablePan enableZoom enableRotate />
            </Canvas>
          </div>
        </div>

        {/* CENTER PANEL — Webcam */}
        <div className="flex flex-col gap-4">
          <h2 className="text-2xl font-bold text-center">📹 Live Camera Feed</h2>
          <PoseDetection onPose={handlePose} />
        </div>

        {/* RIGHT PANEL — Stats */}
        <div className="glass rounded-2xl p-6 w-[350px]">
          <h2 className="text-2xl font-semibold mb-4">📊 Training Dashboard</h2>

          {/* Exercise Info */}
          <div className="mb-4">
            <p className="text-gray-400 text-sm">Current Exercise</p>
            <p className="text-2xl font-bold text-blue-400">{exercise}</p>
          </div>

          {/* Accuracy Progress */}
          <div className="flex justify-center mb-6">
            <div className="w-32 h-32">
              <CircularProgressbar
                value={accuracy}
                text={`${accuracy}%`}
                styles={buildStyles({
                  textColor: "#fff",
                  pathColor: accuracy > 80 ? "#22c55e" : "#facc15",
                  trailColor: "#374151",
                })}
              />
            </div>
          </div>

          {/* Detected Joints */}
          <div className="mb-4">
            <p className="text-gray-400 text-sm mb-2">Detected Joints</p>
            <ul className="grid grid-cols-2 gap-2 text-sm">
              {joints.map((joint) => (
                <li
                  key={joint}
                  className="bg-gray-800 text-center py-2 rounded-md text-gray-200"
                >
                  {joint}
                </li>
              ))}
            </ul>
          </div>

          {/* History Chart */}
          <div className="mt-4">
            <p className="text-gray-400 text-sm mb-2">Improvement History</p>
            <Line
              data={{
                labels: Array(history.length).fill(""),
                datasets: [
                  {
                    label: "Accuracy",
                    data: history,
                    borderColor: "#3b82f6",
                    tension: 0.4,
                    fill: false,
                  },
                ],
              }}
              options={{
                plugins: { legend: { display: false } },
                scales: {
                  y: { min: 50, max: 100, ticks: { color: "#ccc" } },
                  x: { ticks: { display: false } },
                },
              }}
              height={120}
            />
          </div>
        </div>
      </div>

      {/* Add Live Chat Panel */}
      <LiveChatPanel
        currentScore={currentScore}
        recentFeedback={recentFeedback}
        isActive={isActive}
      />
    </div>
  );
}