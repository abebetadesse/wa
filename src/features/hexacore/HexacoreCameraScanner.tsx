"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Camera,
  RotateCcw,
  FlipHorizontal,
  Upload,
  Download,
  Eye,
  Layers,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Activity,
  Heart,
  Brain,
  ShieldAlert,
  HelpCircle,
  Maximize2,
  RefreshCw,
  Sliders,
  ChevronRight,
  Info,
  ExternalLink,
  Copy,
  Check,
} from "lucide-react";
import {
  analyzeTongueImage,
  analyzePalmImage,
  sampleCanvasRegion,
  SYSTEM_KNOWLEDGE_STRANDS,
  getAvailableStrands,
  type BodyScanType,
  type VisionAnalysisResult,
  type OverlayZone,
  type FeaturePin,
  type LineTrace,
} from "@/lib/hexacore/HexacoreVisionEngine";

interface HexacoreCameraScannerProps {
  initialType?: BodyScanType;
  onAnalysisComplete?: (result: VisionAnalysisResult) => void;
  className?: string;
  lang?: "en" | "am";
}

export default function HexacoreCameraScanner({
  initialType = "tongue",
  onAnalysisComplete,
  className = "",
  lang: initialLang = "en",
}: HexacoreCameraScannerProps) {
  const [scanType, setScanType] = useState<BodyScanType>(initialType);
  const [lang, setLang] = useState<"en" | "am">(initialLang);

  // Camera & Image state
  const [isStreaming, setIsStreaming] = useState(false);
  const [cameraFacing, setCameraFacing] = useState<"user" | "environment">("user");
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<VisionAnalysisResult | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Overlay visualization toggles
  const [overlayMode, setOverlayMode] = useState<"all" | "zones" | "lines" | "pins" | "raw">("all");
  const [activePin, setActivePin] = useState<FeaturePin | null>(null);
  const [activeZone, setActiveZone] = useState<OverlayZone | null>(null);
  const [activeTab, setActiveTab] = useState<"findings" | "radar" | "botanical" | "practices" | "strands">("findings");
  const [copiedPayload, setCopiedPayload] = useState(false);

  // DOM Refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // ── Camera Stream Management ────────────────────────────────────────────────
  const stopCameraStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsStreaming(false);
  }, []);

  const startCameraStream = useCallback(async (facing: "user" | "environment") => {
    stopCameraStream();
    setCameraError(null);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error(
          lang === "en"
            ? "Camera access is not supported by your browser or requires HTTPS."
            : "የካሜራ አገልግሎት በአሳሽዎ አይደገፍም ወይም የደህንነት (HTTPS) ማረጋገጫ ይፈልጋል።"
        );
      }

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: facing },
          width: { ideal: 1280 },
          height: { ideal: 1280 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setIsStreaming(true);
      }
    } catch (err: any) {
      console.warn("Camera init error:", err);
      setCameraError(
        err.message ||
          (lang === "en"
            ? "Could not start camera. Please verify camera permissions or upload an image."
            : "ካሜራውን መክፈት አልተቻለም። እባክዎ የካሜራ ፈቃድ ይስጡ ወይም ፎቶ ይጫኑ።")
      );
      setIsStreaming(false);
    }
  }, [lang, stopCameraStream]);

  // Clean up stream on unmount
  useEffect(() => {
    return () => {
      stopCameraStream();
    };
  }, [stopCameraStream]);

  // Auto-start camera when scanner mounted
  useEffect(() => {
    if (!capturedImage) {
      startCameraStream(cameraFacing);
    }
  }, [cameraFacing, capturedImage, startCameraStream]);

  // ── Capture Snapshot ────────────────────────────────────────────────────────
  const handleCaptureSnapshot = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;

    const width = video.videoWidth || 640;
    const height = video.videoHeight || 640;

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Flip horizontally if front camera for natural selfie view
    if (cameraFacing === "user") {
      ctx.translate(width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0, width, height);

    const dataUrl = canvas.toDataURL("image/jpeg", 0.95);
    stopCameraStream();
    setCapturedImage(dataUrl);
    processImageAnalysis(canvas);
  };

  // ── File Upload Fallback ─────────────────────────────────────────────────────
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (!dataUrl) return;

      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth || 640;
        canvas.height = img.naturalHeight || 640;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          stopCameraStream();
          setCapturedImage(dataUrl);
          processImageAnalysis(canvas);
        }
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  // ── Run Computer Vision & Somatic Extraction ─────────────────────────────────
  const processImageAnalysis = (canvas: HTMLCanvasElement) => {
    setAnalyzing(true);
    setAnalysisResult(null);
    setActivePin(null);
    setActiveZone(null);

    // Give visual breathing room for processing feel
    setTimeout(() => {
      try {
        const ctx = canvas.getContext("2d");
        const stats = ctx
          ? sampleCanvasRegion(ctx, {
              x: canvas.width * 0.25,
              y: canvas.height * 0.25,
              width: canvas.width * 0.5,
              height: canvas.height * 0.5,
            })
          : undefined;

        const result =
          scanType === "tongue"
            ? analyzeTongueImage(stats, canvas.width, canvas.height)
            : analyzePalmImage(stats, canvas.width, canvas.height);

        setAnalysisResult(result);
        if (result.pins.length > 0) {
          setActivePin(result.pins[0]);
        }
        if (onAnalysisComplete) {
          onAnalysisComplete(result);
        }
      } catch (err) {
        console.error("Analysis error:", err);
      } finally {
        setAnalyzing(false);
      }
    }, 450);
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setAnalysisResult(null);
    setActivePin(null);
    setActiveZone(null);
    startCameraStream(cameraFacing);
  };

  const toggleCameraFacing = () => {
    const nextFacing = cameraFacing === "user" ? "environment" : "user";
    setCameraFacing(nextFacing);
    startCameraStream(nextFacing);
  };

  // ── Export High-Resolution Annotated Image ──────────────────────────────────
  const handleDownloadAnnotatedImage = () => {
    if (!capturedImage || !analysisResult) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const exportCanvas = document.createElement("canvas");
      const w = img.naturalWidth || 800;
      const h = img.naturalHeight || 800;
      exportCanvas.width = w;
      exportCanvas.height = h;
      const ctx = exportCanvas.getContext("2d");
      if (!ctx) return;

      // 1. Draw raw photo
      ctx.drawImage(img, 0, 0, w, h);

      // 2. Draw subtle dark tint for HUD readability
      ctx.fillStyle = "rgba(10, 15, 28, 0.25)";
      ctx.fillRect(0, 0, w, h);

      // 3. Draw Zones
      if (overlayMode === "all" || overlayMode === "zones") {
        analysisResult.zones.forEach((zone) => {
          ctx.beginPath();
          zone.points.forEach((pt, idx) => {
            const px = (pt.x / 100) * w;
            const py = (pt.y / 100) * h;
            if (idx === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          });
          ctx.closePath();
          ctx.fillStyle = zone.color.startsWith("#") ? `${zone.color}33` : "rgba(212,175,55,0.18)";
          ctx.fill();
          ctx.strokeStyle = zone.color;
          ctx.lineWidth = Math.max(2, Math.round(w * 0.003));
          ctx.stroke();
        });
      }

      // 4. Draw Lines (for palm)
      if ((overlayMode === "all" || overlayMode === "lines") && analysisResult.lines) {
        analysisResult.lines.forEach((line) => {
          ctx.beginPath();
          line.path.forEach((pt, idx) => {
            const px = (pt.x / 100) * w;
            const py = (pt.y / 100) * h;
            if (idx === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          });
          ctx.strokeStyle = line.color;
          ctx.lineWidth = Math.max(3, Math.round(w * 0.005));
          ctx.shadowColor = line.color;
          ctx.shadowBlur = 10;
          ctx.stroke();
          ctx.shadowBlur = 0;
        });
      }

      // 5. Draw Pins
      if (overlayMode === "all" || overlayMode === "pins") {
        analysisResult.pins.forEach((pin) => {
          const px = (pin.position.x / 100) * w;
          const py = (pin.position.y / 100) * h;

          // Outer glowing ring
          ctx.beginPath();
          ctx.arc(px, py, w * 0.025, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(212, 175, 55, 0.35)";
          ctx.fill();
          ctx.strokeStyle = "#D4AF37";
          ctx.lineWidth = 2;
          ctx.stroke();

          // Center solid dot
          ctx.beginPath();
          ctx.arc(px, py, w * 0.01, 0, Math.PI * 2);
          ctx.fillStyle = "#FFFFFF";
          ctx.fill();

          // Text badge
          ctx.font = `bold ${Math.round(w * 0.018)}px sans-serif`;
          ctx.fillStyle = "rgba(13, 19, 34, 0.85)";
          const text = pin.titleEn;
          const textW = ctx.measureText(text).width;
          ctx.fillRect(px + 12, py - 14, textW + 14, 22);
          ctx.strokeStyle = "rgba(212, 175, 55, 0.6)";
          ctx.strokeRect(px + 12, py - 14, textW + 14, 22);

          ctx.fillStyle = "#FFD700";
          ctx.fillText(text, px + 18, py + 2);
        });
      }

      // 6. Draw HUD Watermark & Metrics Header
      ctx.fillStyle = "rgba(13, 19, 34, 0.88)";
      ctx.fillRect(16, 16, Math.min(w - 32, 420), 86);
      ctx.strokeStyle = "rgba(212, 175, 55, 0.5)";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(16, 16, Math.min(w - 32, 420), 86);

      ctx.font = `bold ${Math.round(w * 0.022)}px serif`;
      ctx.fillStyle = "#D4AF37";
      ctx.fillText(
        `HEXACORE BIO-VISION • ${scanType.toUpperCase()} READING`,
        30,
        44
      );

      ctx.font = `${Math.round(w * 0.016)}px sans-serif`;
      ctx.fillStyle = "#E2E8F0";
      ctx.fillText(
        `Vitality: ${analysisResult.hud.vitalityScore}% | Heat/Cold: ${analysisResult.hud.heatColdBalance > 0 ? "+" : ""}${analysisResult.hud.heatColdBalance} | Core: ${analysisResult.hud.dominantCore}`,
        30,
        68
      );
      ctx.fillStyle = "#94A3B8";
      ctx.fillText(`Timestamp: ${new Date().toISOString().slice(0, 16)} • Domain A Reflective`, 30, 88);

      // Trigger download
      const a = document.createElement("a");
      a.download = `hexacore-${scanType}-annotated-${Date.now()}.png`;
      a.href = exportCanvas.toDataURL("image/png");
      a.click();
    };
    img.src = capturedImage;
  };

  return (
    <div
      className={`rounded-3xl border border-amber-500/30 overflow-hidden shadow-2xl ${className}`}
      style={{
        background: "radial-gradient(circle at top right, rgba(212,175,55,0.08), transparent 60%), #0A0F1D",
      }}
    >
      {/* ── TOP CONTROL HEADER ───────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b border-white/10 bg-black/40 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-amber-500/40 bg-amber-500/10 text-amber-300 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5" />
            <span>{lang === "en" ? "Somatic Bio-Vision" : "የሰውነት ባዮ-ራዕይ"}</span>
          </div>

          {/* Scan Type Selector */}
          <div className="flex items-center rounded-xl border border-white/15 bg-white/[0.04] p-1">
            <button
              onClick={() => {
                setScanType("tongue");
                setCapturedImage(null);
                setAnalysisResult(null);
              }}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                scanType === "tongue"
                  ? "bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {lang === "en" ? "👅 Tongue Reading" : "👅 የአንደበት ቅኝት"}
            </button>
            <button
              onClick={() => {
                setScanType("palm");
                setCapturedImage(null);
                setAnalysisResult(null);
              }}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                scanType === "palm"
                  ? "bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {lang === "en" ? "✋ Palm Reading" : "✋ የመዳፍ ቅኝት"}
            </button>
          </div>
        </div>

        {/* Action Controls & Language */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setLang(lang === "en" ? "am" : "en")}
            className="rounded-lg px-2.5 py-1 text-xs font-bold border border-amber-500/30 text-amber-300 hover:bg-amber-500/10 transition"
          >
            {lang === "en" ? "አማርኛ" : "English"}
          </button>

          {capturedImage && (
            <button
              onClick={handleRetake}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-semibold bg-white/10 text-white hover:bg-white/20 transition"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>{lang === "en" ? "New Scan" : "አዲስ ቅኝት"}</span>
            </button>
          )}
        </div>
      </div>

      {/* ── MAIN WORKSPACE: CAMERA / ANNOTATED IMAGE ──────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
        {/* Left Column: Visual Canvas Area (7 cols on lg) */}
        <div className="lg:col-span-7 relative bg-black/60 min-h-[420px] flex items-center justify-center overflow-hidden border-b lg:border-b-0 lg:border-r border-white/10">
          {/* A. Live Video Stream */}
          {!capturedImage && (
            <div className="relative w-full h-full min-h-[440px] flex items-center justify-center bg-black">
              {isStreaming ? (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover max-h-[540px]"
                    style={{ transform: cameraFacing === "user" ? "scaleX(-1)" : "none" }}
                  />

                  {/* Anatomical Targeting Guide Overlay */}
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    {scanType === "tongue" ? (
                      /* Tongue oval guide */
                      <div className="relative w-56 h-72 rounded-[45%] border-2 border-dashed border-amber-400/70 shadow-[0_0_25px_rgba(212,175,55,0.4)] flex flex-col items-center justify-between p-3 animate-pulse">
                        <span className="text-[10px] font-bold text-amber-300 bg-black/70 px-2 py-0.5 rounded-full mt-2">
                          {lang === "en" ? "Align Tongue Apex Here" : "የአንደበትን ጫፍ እዚህ አመሳስሉ"}
                        </span>
                        <div className="w-12 h-0.5 bg-amber-400/60" />
                        <span className="text-[10px] font-bold text-amber-300 bg-black/70 px-2 py-0.5 rounded-full mb-2">
                          {lang === "en" ? "Root Zone" : "የሥር ክፍል"}
                        </span>
                      </div>
                    ) : (
                      /* Palm hand guide */
                      <div className="relative w-64 h-80 rounded-3xl border-2 border-dashed border-cyan-400/70 shadow-[0_0_25px_rgba(6,182,212,0.4)] flex flex-col items-center justify-between p-3 animate-pulse">
                        <span className="text-[10px] font-bold text-cyan-300 bg-black/70 px-2 py-0.5 rounded-full mt-2">
                          {lang === "en" ? "Fingers Extended Top" : "ጣቶችዎን ወደ ላይ ዘርጉ"}
                        </span>
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
                          <span className="text-[10px] font-bold text-cyan-200">
                            {lang === "en" ? "Keep Flat & Illuminated" : "መዳፍዎን በብርሃን ያሳዩ"}
                          </span>
                        </div>
                        <span className="text-[10px] font-bold text-cyan-300 bg-black/70 px-2 py-0.5 rounded-full mb-2">
                          {lang === "en" ? "Wrist Base" : "የእጅ አንጓ"}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Live Stream Floating Controls */}
                  <div className="absolute bottom-5 inset-x-0 flex items-center justify-center gap-4 z-20 px-4">
                    <button
                      onClick={toggleCameraFacing}
                      className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition border border-white/15"
                      title={lang === "en" ? "Flip camera" : "ካሜራ ቀይር"}
                    >
                      <FlipHorizontal className="h-5 w-5" />
                    </button>

                    <button
                      onClick={handleCaptureSnapshot}
                      className="flex items-center gap-2 px-6 py-3.5 rounded-full font-black text-sm text-black shadow-xl transition transform active:scale-95"
                      style={{ background: "linear-gradient(135deg, #D4AF37, #10B981)" }}
                    >
                      <Camera className="h-5 w-5" />
                      <span>{lang === "en" ? "Capture & Analyze" : "ቅረጽና ተንትን"}</span>
                    </button>

                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition border border-white/15"
                      title={lang === "en" ? "Upload from device" : "ፎቶ ይጫኑ"}
                    >
                      <Upload className="h-5 w-5" />
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                  </div>
                </>
              ) : (
                /* Camera Error / Standby Screen */
                <div className="p-8 text-center max-w-sm space-y-4">
                  <div className="mx-auto w-14 h-14 rounded-full border border-amber-500/40 bg-amber-500/10 flex items-center justify-center text-amber-400">
                    <Camera className="h-7 w-7" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-base">
                      {lang === "en" ? "Camera Ready" : "ካሜራ ዝግጁ ነው"}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      {cameraError ||
                        (lang === "en"
                          ? "Activate your device camera or upload a clear, well-lit photo of your tongue or palm."
                          : "የመሳሪያዎን ካሜራ ያስጀምሩ ወይም ጥርት ያለ የአንደበት ወይም የመዳፍ ፎቶ ይጫኑ።")}
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
                    <button
                      onClick={() => startCameraStream(cameraFacing)}
                      className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold text-black bg-amber-400 hover:bg-amber-300 transition"
                    >
                      {lang === "en" ? "Enable Camera" : "ካሜራ አስጀምር"}
                    </button>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-semibold text-white bg-white/10 hover:bg-white/20 transition"
                    >
                      {lang === "en" ? "Upload Photo" : "ፎቶ ጫን"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* B. Captured Image & Direct On-Image Augmented Canvas */}
          {capturedImage && (
            <div className="relative w-full h-full flex flex-col items-center justify-center p-2">
              {analyzing ? (
                <div className="p-12 text-center space-y-3">
                  <RefreshCw className="h-10 w-10 text-amber-400 animate-spin mx-auto" />
                  <p className="text-sm font-bold text-amber-300 animate-pulse">
                    {lang === "en"
                      ? "Analyzing chromatic spectrum & biometric contours..."
                      : "የቀለም ስፔክትረምና የባዮሜትሪክ መስመሮችን እያጠናን ነው..."}
                  </p>
                </div>
              ) : (
                <div className="relative w-full max-w-[560px] aspect-square rounded-2xl overflow-hidden shadow-2xl border border-white/20 group">
                  {/* Base Photo */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={capturedImage}
                    alt="Captured Scan"
                    className="w-full h-full object-cover select-none"
                  />

                  {/* SVG Augmented Overlay Vector Engine */}
                  {analysisResult && (
                    <svg
                      className="absolute inset-0 w-full h-full pointer-events-none"
                      viewBox="0 0 100 100"
                      preserveAspectRatio="none"
                    >
                      {/* 1. Biological Zones */}
                      {(overlayMode === "all" || overlayMode === "zones") &&
                        analysisResult.zones.map((zone) => {
                          const ptsStr = zone.points.map((p) => `${p.x},${p.y}`).join(" ");
                          const isSelected = activeZone?.id === zone.id;
                          return (
                            <polygon
                              key={zone.id}
                              points={ptsStr}
                              fill={isSelected ? `${zone.color}55` : `${zone.color}25`}
                              stroke={zone.color}
                              strokeWidth={isSelected ? "1" : "0.5"}
                              strokeDasharray={isSelected ? "1,1" : "none"}
                              className="transition-all duration-300"
                            />
                          );
                        })}

                      {/* 2. Palm Lines Tracing */}
                      {(overlayMode === "all" || overlayMode === "lines") &&
                        analysisResult.lines?.map((line) => {
                          const pathStr = line.path
                            .map((pt, i) => `${i === 0 ? "M" : "L"} ${pt.x} ${pt.y}`)
                            .join(" ");
                          return (
                            <g key={line.id}>
                              <path
                                d={pathStr}
                                fill="none"
                                stroke={line.color}
                                strokeWidth="1.2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                style={{ filter: `drop-shadow(0 0 2px ${line.color})` }}
                              />
                            </g>
                          );
                        })}
                    </svg>
                  )}

                  {/* 3. Interactive Pins Layer (Clickable / Tap-friendly) */}
                  {analysisResult &&
                    (overlayMode === "all" || overlayMode === "pins") &&
                    analysisResult.pins.map((pin) => {
                      const isSelected = activePin?.id === pin.id;
                      return (
                        <div
                          key={pin.id}
                          onClick={() => setActivePin(pin)}
                          style={{
                            left: `${pin.position.x}%`,
                            top: `${pin.position.y}%`,
                            transform: "translate(-50%, -50%)",
                          }}
                          className="absolute z-20 cursor-pointer pointer-events-auto group/pin"
                        >
                          <div className="relative flex items-center justify-center">
                            {/* Pulsing ring */}
                            <span
                              className={`absolute w-8 h-8 rounded-full animate-ping opacity-75 ${
                                isSelected ? "bg-amber-400" : "bg-cyan-400"
                              }`}
                            />
                            {/* Inner circle */}
                            <div
                              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center text-[10px] font-black shadow-lg transition-transform ${
                                isSelected
                                  ? "bg-amber-400 border-white text-black scale-125"
                                  : "bg-slate-900 border-amber-400 text-amber-300 hover:scale-110"
                              }`}
                            >
                              !
                            </div>
                          </div>

                          {/* Hover / Active Pin Label */}
                          <div
                            className={`absolute left-6 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-lg px-2.5 py-1 text-[11px] font-bold shadow-xl border backdrop-blur-md transition-all ${
                              isSelected
                                ? "bg-black/90 border-amber-400 text-amber-300 opacity-100 scale-100 z-30"
                                : "bg-black/75 border-white/20 text-white opacity-0 group-hover/pin:opacity-100 scale-95 group-hover/pin:scale-100"
                            }`}
                          >
                            <span>{lang === "en" ? pin.titleEn : pin.titleAm}</span>
                          </div>
                        </div>
                      );
                    })}

                  {/* 4. On-Image Digital HUD Watermark */}
                  {analysisResult && (
                    <div className="absolute top-3 left-3 z-10 rounded-xl border border-white/20 bg-black/75 backdrop-blur-md px-3 py-2 text-left pointer-events-none">
                      <div className="flex items-center gap-2">
                        <Activity className="h-3.5 w-3.5 text-amber-400" />
                        <span className="text-[10px] font-black uppercase tracking-wider text-amber-300">
                          {lang === "en" ? "Vitality Matrix" : "የሕይወት ማትሪክስ"}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs">
                        <span className="text-white font-bold">
                          {analysisResult.hud.vitalityScore}% {lang === "en" ? "Vitality" : "ጽናት"}
                        </span>
                        <span className="text-slate-400">|</span>
                        <span
                          className={`font-semibold ${
                            analysisResult.hud.heatColdBalance > 15
                              ? "text-red-400"
                              : analysisResult.hud.heatColdBalance < -15
                              ? "text-sky-400"
                              : "text-emerald-400"
                          }`}
                        >
                          {analysisResult.hud.heatColdBalance > 0
                            ? `+${analysisResult.hud.heatColdBalance} Heat`
                            : `${analysisResult.hud.heatColdBalance} Cold`}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* 5. On-Image Bottom Overlay Toolbar */}
                  <div className="absolute bottom-3 inset-x-3 z-20 flex flex-wrap items-center justify-between gap-2 p-2 rounded-xl bg-black/80 backdrop-blur-md border border-white/15">
                    {/* Mode Toggles */}
                    <div className="flex items-center gap-1">
                      {(
                        [
                          { id: "all", label: lang === "en" ? "All" : "ሁሉም" },
                          { id: "zones", label: lang === "en" ? "Zones" : "ክፍሎች" },
                          { id: "lines", label: lang === "en" ? "Lines" : "መስመሮች" },
                          { id: "pins", label: lang === "en" ? "Pins" : "ነጥቦች" },
                          { id: "raw", label: lang === "en" ? "Raw" : "ተፈጥሯዊ" },
                        ] as const
                      ).map((m) => (
                        <button
                          key={m.id}
                          onClick={() => setOverlayMode(m.id)}
                          className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition ${
                            overlayMode === m.id
                              ? "bg-amber-400 text-black shadow-sm"
                              : "text-slate-300 hover:bg-white/10"
                          }`}
                        >
                          {m.label}
                        </button>
                      ))}
                    </div>

                    {/* Download Annotated PNG */}
                    <button
                      onClick={handleDownloadAnnotatedImage}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold text-amber-300 border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 transition"
                      title={lang === "en" ? "Download image with all overlays" : "ምስሉን ከትንታኔው ጋር ያውርዱ"}
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">
                        {lang === "en" ? "Save Image" : "ምስል አውርድ"}
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: In-Depth Diagnostic Findings (5 cols on lg) */}
        <div className="lg:col-span-5 p-5 space-y-5 overflow-y-auto max-h-[580px] bg-white/[0.01]">
          {analysisResult ? (
            <>
              {/* Active Selected Pin / Zone Inspector Card */}
              {activePin && (
                <div className="rounded-2xl border border-amber-500/40 bg-amber-500/[0.08] p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                      {lang === "en" ? "Direct Feature Callout" : "የተለየ ምልክት ምርመራ"}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {activePin.core} Core
                    </span>
                  </div>
                  <h4 className="text-white font-bold text-sm">
                    {lang === "en" ? activePin.titleEn : activePin.titleAm}
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {lang === "en" ? activePin.descriptionEn : activePin.descriptionAm}
                  </p>
                  <div className="text-[11px] text-amber-300/90 pt-1 font-medium italic">
                    {lang === "en" ? activePin.traditionalSign : activePin.traditionalSignAm}
                  </div>
                </div>
              )}

              {/* Navigation Tabs for Detailed Results */}
              <div className="flex items-center gap-1 border-b border-white/10 pb-2">
                {(
                  [
                    { id: "findings", label: lang === "en" ? "Biometrics" : "ባዮሜትሪክስ" },
                    { id: "radar", label: lang === "en" ? "6-Cores" : "6ቱ ማዕከላት" },
                    { id: "botanical", label: lang === "en" ? "Botanical" : "ዕፅዋት" },
                    { id: "practices", label: lang === "en" ? "Practices" : "ልምምድ" },
                    { id: "strands", label: lang === "en" ? "Strands (11)" : "ዘርፎች (11)" },
                  ] as const
                ).map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id)}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition text-center ${
                      activeTab === t.id
                        ? "bg-white/10 text-amber-300 border border-amber-500/30"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* TAB 1: BIOMETRIC FINDINGS */}
              {activeTab === "findings" && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="p-3 rounded-xl border border-white/10 bg-white/[0.02]">
                      <div className="text-[10px] text-slate-400 uppercase tracking-wide">
                        {lang === "en" ? "Vitality Reserve" : "የሕይወት ጽናት"}
                      </div>
                      <div className="text-xl font-black text-amber-400 mt-0.5">
                        {analysisResult.hud.vitalityScore}%
                      </div>
                    </div>
                    <div className="p-3 rounded-xl border border-white/10 bg-white/[0.02]">
                      <div className="text-[10px] text-slate-400 uppercase tracking-wide">
                        {lang === "en" ? "Dominant Core" : "ቀዳሚ ማዕከል"}
                      </div>
                      <div className="text-sm font-bold text-emerald-400 mt-1">
                        {lang === "en" ? analysisResult.hud.dominantCore : analysisResult.hud.dominantCoreAm}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-xs font-bold text-slate-300">
                      {lang === "en" ? "Analyzed Somatic Zones" : "የተመረመሩ የአካል ክፍሎች"}
                    </div>
                    {analysisResult.zones.map((zone) => (
                      <div
                        key={zone.id}
                        onClick={() => setActiveZone(zone)}
                        className={`p-3 rounded-xl border transition cursor-pointer text-left ${
                          activeZone?.id === zone.id
                            ? "border-amber-400/80 bg-amber-500/10"
                            : "border-white/10 bg-white/[0.02] hover:bg-white/[0.04]"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-xs text-white">
                            {lang === "en" ? zone.name : zone.nameAm}
                          </span>
                          <span
                            className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase"
                            style={{
                              backgroundColor: `${zone.color}25`,
                              color: zone.color,
                            }}
                          >
                            {zone.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-300 leading-relaxed">
                          {lang === "en" ? zone.readingEn : zone.readingAm}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 2: 6-CORE RADAR IMPACT */}
              {activeTab === "radar" && (
                <div className="space-y-4">
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {lang === "en"
                      ? "Visual features directly calibrate your dynamic 6-core energetic resonance:"
                      : "የአካል ምልክቶቹ በቀጥታ የ6ቱን ማዕከላት ኃይል ሚዛን ያመለክታሉ፡"}
                  </p>

                  <div className="space-y-2.5">
                    {(
                      [
                        { key: "Power" as const, label: "Power (ኃይል)", color: "#EF4444" },
                        { key: "Humanity" as const, label: "Humanity (ሰውነት)", color: "#06B6D4" },
                        { key: "Creation" as const, label: "Creation (ፍጥረት)", color: "#EC4899" },
                        { key: "Peace" as const, label: "Peace (ዕርቅ)", color: "#6366F1" },
                        { key: "Spirit" as const, label: "Spirit (መንፈስ)", color: "#EAB308" },
                        { key: "Order" as const, label: "Order (ሥርዓት)", color: "#10B981" },
                      ] as const
                    ).map(({ key, label, color }) => {
                      const score = analysisResult.hexacoreRadar[key];
                      return (
                        <div key={key} className="space-y-1">
                          <div className="flex justify-between text-xs font-semibold">
                            <span className="text-slate-300">{label}</span>
                            <span className="font-bold" style={{ color }}>
                              {score}%
                            </span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-700"
                              style={{ width: `${score}%`, backgroundColor: color }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 3: BOTANICAL PRESCRIPTION */}
              {activeTab === "botanical" && (
                <div className="space-y-3">
                  <div className="p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/[0.06] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                        {lang === "en" ? "Custom Botanical Formulation" : "የባህላዊ ዕፅዋት ቀመር"}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-400">
                        {analysisResult.botanical.targetCore}
                      </span>
                    </div>

                    <h4 className="text-base font-black text-white">
                      {lang === "en"
                        ? analysisResult.botanical.primaryHerb
                        : analysisResult.botanical.primaryHerbAm}
                    </h4>
                    <p className="text-[11px] text-slate-400 italic">
                      {analysisResult.botanical.scientificName}
                    </p>

                    <div className="text-xs text-slate-300 pt-1 leading-relaxed">
                      <strong>{lang === "en" ? "Preparation: " : "አዘገጃጀት፡ "}</strong>
                      {lang === "en"
                        ? analysisResult.botanical.preparation
                        : analysisResult.botanical.preparationAm}
                    </div>

                    <div className="text-xs text-emerald-200/90 leading-relaxed">
                      <strong>{lang === "en" ? "Action: " : "ጥቅም፡ "}</strong>
                      {lang === "en"
                        ? analysisResult.botanical.actionEn
                        : analysisResult.botanical.actionAm}
                    </div>

                    <div className="text-[10px] text-amber-300/80 pt-1">
                      ⚠️ {analysisResult.botanical.safetyNote}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: PRACTICES & FREQUENCY */}
              {activeTab === "practices" && (
                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/[0.05] flex items-center justify-between">
                    <div>
                      <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wide">
                        {lang === "en" ? "Acoustic Tuning Frequency" : "የድምፅ ፍሪኩዌንሲ ቃና"}
                      </div>
                      <div className="text-sm font-bold text-white mt-0.5">
                        {analysisResult.solfeggioTitle}
                      </div>
                    </div>
                    <div className="text-xl font-black text-amber-300">
                      {analysisResult.solfeggioHz} Hz
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-xs font-bold text-slate-300">
                      {lang === "en" ? "Daily Somatic Practices" : "የዕለት ተዕለት ልምምዶች"}
                    </div>
                    {(lang === "en"
                      ? analysisResult.lifestyleGuidanceEn
                      : analysisResult.lifestyleGuidanceAm
                    ).map((guide, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2 p-2.5 rounded-xl border border-white/10 bg-white/[0.02] text-xs text-slate-300"
                      >
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{guide}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 5: KNOWLEDGE STRANDS & EXPORT TO ADMIN (PORT 5500) */}
              {activeTab === "strands" && (
                <div className="space-y-4">
                  {/* Knowledge Admin Portal Link & Fast Export Action Bar */}
                  <div className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/10 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-bold text-xs text-amber-200">
                        <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                        <span>
                          {lang === "en"
                            ? "Epistemic Knowledge Base Integration"
                            : "የእውቀት ማዕከል ግንኙነት"}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/40 border border-amber-400/30 text-amber-300">
                        http://localhost:5500/admin/knowledge
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      {lang === "en"
                        ? "Hexacore maps this somatic reading across 11 multidisciplinary knowledge strands. You can view, export, or ingest these findings directly into the local Knowledge Governance portal."
                        : "ይህ ስካነር ንባቡን በ11ቱ ዘርፎች (Domain A ባዮሜዲካል እና Domain B ባህላዊ አውደ ነገሥት) ያገናኛል።"}
                    </p>

                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <a
                        href="http://localhost:5500/admin/knowledge"
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1.5 rounded-lg border border-amber-400/40 bg-amber-400/20 hover:bg-amber-400/30 text-amber-100 text-xs font-bold transition flex items-center gap-1"
                      >
                        <ExternalLink className="h-3 w-3" />
                        <span>
                          {lang === "en"
                            ? "Open Knowledge Admin (5500)"
                            : "የእውቀት አስተዳዳሪ ክፈት (5500)"}
                        </span>
                      </a>

                      <a
                        href="/api/admin/knowledge/export/strands?download=true"
                        className="px-2.5 py-1.5 rounded-lg border border-emerald-500/40 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 text-xs font-bold transition flex items-center gap-1"
                      >
                        <Download className="h-3 w-3" />
                        <span>JSON</span>
                      </a>

                      <a
                        href="/api/admin/knowledge/export/strands?format=csv"
                        className="px-2.5 py-1.5 rounded-lg border border-sky-500/40 bg-sky-500/20 hover:bg-sky-500/30 text-sky-200 text-xs font-bold transition flex items-center gap-1"
                      >
                        <Download className="h-3 w-3" />
                        <span>CSV</span>
                      </a>

                      <button
                        onClick={() => {
                          if (analysisResult?.exportPayload) {
                            navigator.clipboard.writeText(
                              JSON.stringify(analysisResult.exportPayload, null, 2)
                            );
                            setCopiedPayload(true);
                            setTimeout(() => setCopiedPayload(false), 3000);
                          }
                        }}
                        className="px-2.5 py-1.5 rounded-lg border border-white/20 bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition flex items-center gap-1"
                      >
                        {copiedPayload ? (
                          <>
                            <Check className="h-3 w-3 text-emerald-400" />
                            <span className="text-emerald-300">
                              {lang === "en" ? "Copied JSON!" : "ኮፒ ተደርጓል!"}
                            </span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3" />
                            <span>
                              {lang === "en" ? "Copy Ingest JSON" : "ኮፒ አድርግ"}
                            </span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Strands List (11 Strands) */}
                  <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
                    {(analysisResult.availableStrands || SYSTEM_KNOWLEDGE_STRANDS).map((strand) => {
                      const isActive = (analysisResult.activeStrands || []).some(
                        (act) => act.key === strand.key
                      );
                      return (
                        <div
                          key={strand.key}
                          className={`p-3 rounded-xl border transition ${
                            isActive
                              ? "border-emerald-500/40 bg-emerald-950/20"
                              : "border-white/10 bg-white/[0.02]"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-bold text-white">
                                  {lang === "en" ? strand.name : strand.nameAm}
                                </span>
                                {isActive && (
                                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-semibold">
                                    {lang === "en" ? "Active in Scan" : "ተግባራዊ"}
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-300 mt-1 leading-snug">
                                {lang === "en" ? strand.description : strand.descriptionAm}
                              </p>
                            </div>

                            <div className="flex flex-col items-end gap-1 shrink-0">
                              <span
                                className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${
                                  strand.domain === "A"
                                    ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                                    : "bg-purple-500/10 text-purple-300 border-purple-500/30"
                                }`}
                              >
                                Domain {strand.domain}
                              </span>
                              <span className="text-[9px] uppercase tracking-wider text-slate-400">
                                {strand.tier}
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-1 mt-2">
                            {strand.categories.map((c, i) => (
                              <span
                                key={i}
                                className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 border border-white/5 text-slate-400"
                              >
                                {c}
                              </span>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Domain A / B Safety Notice */}
              <div className="p-3 rounded-xl border border-white/10 bg-black/40 text-[10px] text-slate-400 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-slate-300">
                  <ShieldAlert className="h-3.5 w-3.5 text-amber-400" />
                  <span>{lang === "en" ? "Domain A & B Safety Notice" : "የደህንነትና የሕግ ማስታወሻ"}</span>
                </div>
                <p>{lang === "en" ? analysisResult.disclaimer.en : analysisResult.disclaimer.am}</p>
              </div>
            </>
          ) : (
            /* Empty State Guide */
            <div className="p-8 text-center space-y-4 text-slate-400">
              <div className="w-12 h-12 rounded-2xl border border-white/15 bg-white/5 flex items-center justify-center mx-auto text-amber-400">
                <Sliders className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-white font-bold text-sm">
                  {lang === "en" ? "Ready for Image Capture" : "ፎቶ ለማንሳት ዝግጁ ነው"}
                </h4>
                <p className="text-xs mt-1 leading-relaxed">
                  {scanType === "tongue"
                    ? lang === "en"
                      ? "Align your tongue naturally in bright daylight. The scanner will identify coating hue, apex heat, lateral teeth impressions, and kidney root vitality."
                      : "አንደበትዎን በብርሃን አሳይተው ያንሱ። ስካነሩ ሽፋኑን፣ የጫፍ ሙቀትንና የኩላሊት ጽናትን ይተነትናል።"
                    : lang === "en"
                    ? "Hold your palm flat with fingers extended. The scanner will trace Heart, Head, Life, and Fate lines directly on your photo."
                    : "መዳፍዎን ዘርግተው በብርሃን ያንሱ። ስካነሩ የልብ፣ የአዕምሮ፣ የሕይወትና የዕጣ መስመሮችን በቀጥታ በፎቶው ላይ ያሰምራል።"}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
