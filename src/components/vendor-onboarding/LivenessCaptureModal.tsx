import React, { useEffect, useRef, useState, useCallback } from "react";
import { 
    CameraIcon, 
    XMarkIcon, 
    CheckIcon, 
    ShieldCheckIcon,
    ArrowPathIcon,
    ExclamationTriangleIcon
} from "@heroicons/react/24/outline";

interface LivenessCaptureModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCapture: (file: File, previewUrl: string) => void;
}

type StepState = "idle" | "aligning" | "blink" | "turn" | "recenter" | "success" | "error" | "preview";

export default function LivenessCaptureModal({ isOpen, onClose, onCapture }: LivenessCaptureModalProps) {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const requestRef = useRef<number | null>(null);
    const landmarkerRef = useRef<any>(null);
    const lastVideoTimeRef = useRef<number>(-1);
    const lastFrameTimeRef = useRef<number>(-1);

    const [status, setStatus] = useState<StepState>("idle");
    const [progress, setProgress] = useState(0);
    const [errorMessage, setErrorMessage] = useState("");
    const [isLoadingLib, setIsLoadingLib] = useState(true);
    const [capturedPhoto, setCapturedPhoto] = useState<{ file: File; dataUrl: string } | null>(null);

    const statusRef = useRef<StepState>("idle");
    const progressRef = useRef(0);

    const hasBlinked = useRef(false);
    const isEyeClosed = useRef(false);
    const hasTurned = useRef(false);
    const startTurnRatio = useRef<number | null>(null);

    const updateStatus = useCallback((next: StepState) => {
        statusRef.current = next;
        setStatus(next);
    }, []);

    const updateProgress = useCallback((next: number) => {
        progressRef.current = next;
        setProgress(next);
    }, []);

    useEffect(() => {
        if (!isOpen) return;
        initLiveness();
        return () => {
            stopCamera();
        };
    }, [isOpen]);

    const playBeep = (freq = 800, duration = 0.15) => {
        try {
            const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(0.15, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
            osc.start();
            osc.stop(ctx.currentTime + duration);
        } catch (e) {
            console.error("Audio failed", e);
        }
    };

    const playShutterSound = () => {
        try {
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            if (!AudioContextClass) return;
            const ctx = new AudioContextClass();
            const now = ctx.currentTime;

            // 1. Blade snap click (quick frequency-modulated pop)
            const osc = ctx.createOscillator();
            const oscGain = ctx.createGain();
            osc.type = "triangle";
            osc.frequency.setValueAtTime(1000, now);
            osc.frequency.exponentialRampToValueAtTime(100, now + 0.05);
            
            oscGain.gain.setValueAtTime(0.45, now);
            oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
            
            osc.connect(oscGain);
            oscGain.connect(ctx.destination);
            
            // 2. Mechanical slide/whir (filtered white noise)
            const bufferSize = ctx.sampleRate * 0.12; // 120ms
            const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }
            const noise = ctx.createBufferSource();
            noise.buffer = buffer;
            
            const bandpass = ctx.createBiquadFilter();
            bandpass.type = "bandpass";
            bandpass.frequency.setValueAtTime(1200, now);
            bandpass.Q.setValueAtTime(3, now);
            
            const noiseGain = ctx.createGain();
            noiseGain.gain.setValueAtTime(0.35, now);
            noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
            
            noise.connect(bandpass);
            bandpass.connect(noiseGain);
            noiseGain.connect(ctx.destination);
            
            osc.start(now);
            osc.stop(now + 0.06);
            noise.start(now);
            noise.stop(now + 0.15);
        } catch (e) {
            console.error("Shutter audio failed", e);
        }
    };

    const stopCamera = () => {
        if (requestRef.current) {
            cancelAnimationFrame(requestRef.current);
            requestRef.current = null;
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
    };

    const initLiveness = async () => {
        setIsLoadingLib(true);
        updateStatus("idle");
        updateProgress(0);
        setErrorMessage("");
        setCapturedPhoto(null);
        hasBlinked.current = false;
        isEyeClosed.current = false;
        hasTurned.current = false;
        startTurnRatio.current = null;
        lastVideoTimeRef.current = -1;
        lastFrameTimeRef.current = -1;

        try {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error("Webcam access is restricted. Please ensure you are using a secure connection (HTTPS) or localhost, and that camera permissions are enabled.");
            }

            const stream = await navigator.mediaDevices.getUserMedia({
                video: { width: 640, height: 480, facingMode: "user" },
                audio: false
            });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.onloadedmetadata = () => {
                    videoRef.current?.play().catch(playErr => {
                        console.error("Webcam video playback failed:", playErr);
                    });
                };
            }

            if (!landmarkerRef.current) {
                const visionModuleUrl = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/vision_bundle.mjs";
                // @ts-ignore
                const visionModule = await import(/* webpackIgnore: true */ visionModuleUrl);
                const { FilesetResolver, FaceLandmarker } = visionModule;
                const vision = await FilesetResolver.forVisionTasks(
                    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm"
                );
                const landmarker = await FaceLandmarker.createFromOptions(vision, {
                    baseOptions: {
                        modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
                        delegate: "CPU"
                    },
                    outputFaceBlendshapes: false,
                    runningMode: "VIDEO",
                    numFaces: 1
                });
                landmarkerRef.current = landmarker;
            }

            setIsLoadingLib(false);
            updateStatus("aligning");
            playBeep(600, 0.2);

            requestRef.current = requestAnimationFrame(runDetectionLoop);
        } catch (err: any) {
            console.error("Failed to initialize camera or MediaPipe", err);
            setIsLoadingLib(false);
            updateStatus("error");
            setErrorMessage(err?.message || "Webcam access denied or failed to load facial landmarker module.");
        }
    };

    const runDetectionLoop = () => {
        try {
            const currentStatus = statusRef.current;

            if (currentStatus === "success" || currentStatus === "error") return;

            if (!videoRef.current || !canvasRef.current || !landmarkerRef.current) {
                requestRef.current = requestAnimationFrame(runDetectionLoop);
                return;
            }

            const video = videoRef.current;
            const canvas = canvasRef.current;
            const ctx = canvas.getContext("2d");

            if (video.readyState === video.HAVE_ENOUGH_DATA && ctx) {
                if (video.videoWidth === 0 || video.videoHeight === 0) {
                    requestRef.current = requestAnimationFrame(runDetectionLoop);
                    return;
                }

                if (video.currentTime === lastFrameTimeRef.current) {
                    requestRef.current = requestAnimationFrame(runDetectionLoop);
                    return;
                }
                lastFrameTimeRef.current = video.currentTime;

                if (canvas.width !== video.videoWidth) {
                    canvas.width = video.videoWidth;
                    canvas.height = video.videoHeight;
                }

                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

                let timestamp = performance.now();
                if (lastVideoTimeRef.current !== -1 && timestamp <= lastVideoTimeRef.current) {
                    timestamp = lastVideoTimeRef.current + 1;
                }
                lastVideoTimeRef.current = timestamp;

                const results = landmarkerRef.current.detectForVideo(video, timestamp);

                if (results && results.faceLandmarks && results.faceLandmarks.length > 0) {
                    const landmarks = results.faceLandmarks[0];

                    processLandmarks(landmarks, canvas.width, canvas.height);
                } else {
                    const s = statusRef.current;
                    if (s !== "aligning" && s !== "success" && s !== "error") {
                        updateStatus("aligning");
                        updateProgress(0);
                    }
                }
            }

            if (statusRef.current !== "success" && statusRef.current !== "error") {
                requestRef.current = requestAnimationFrame(runDetectionLoop);
            }
        } catch (err: any) {
            console.error("Error inside detection loop:", err);
            if (statusRef.current !== "success" && statusRef.current !== "error") {
                requestRef.current = requestAnimationFrame(runDetectionLoop);
            }
        }
    };

    const getDistance = (p1: any, p2: any) => {
        return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
    };

    const processLandmarks = (landmarks: any[], width: number, height: number) => {
        const currentStatus = statusRef.current;
        const nose = landmarks[4];
        const noseXPixel = nose.x * width;
        const noseYPixel = nose.y * height;
        const centerX = width / 2;
        const centerY = height / 2;

        const distanceToCenter = Math.sqrt(
            Math.pow(noseXPixel - centerX, 2) + Math.pow(noseYPixel - centerY, 2)
        );

        if (currentStatus === "aligning") {
            if (distanceToCenter < 90) {
                const next = progressRef.current + 4;
                if (next >= 100) {
                    playBeep(880, 0.15);
                    updateStatus("blink");
                    updateProgress(0);
                } else {
                    updateProgress(next);
                }
            } else {
                updateProgress(Math.max(0, progressRef.current - 8));
            }
        }

        if (currentStatus === "blink") {
            const leftEAR = getDistance(landmarks[386], landmarks[374]) / getDistance(landmarks[362], landmarks[263]);
            const rightEAR = getDistance(landmarks[159], landmarks[145]) / getDistance(landmarks[133], landmarks[33]);
            const avgEAR = (leftEAR + rightEAR) / 2;

            if (avgEAR < 0.16) {
                isEyeClosed.current = true;
                updateProgress(50);
            } else if (isEyeClosed.current && avgEAR > 0.22) {
                hasBlinked.current = true;
                updateProgress(100);
                playBeep(1000, 0.15);
                setTimeout(() => {
                    updateStatus("turn");
                    updateProgress(0);
                }, 400);
            }
        }

        if (currentStatus === "turn") {
            const leftDist = getDistance(landmarks[4], landmarks[234]);
            const rightDist = getDistance(landmarks[4], landmarks[454]);
            const currentRatio = leftDist / rightDist;

            if (startTurnRatio.current === null) {
                startTurnRatio.current = currentRatio;
            } else {
                const deviation = Math.abs(currentRatio - startTurnRatio.current);
                const pct = Math.min(100, Math.round((deviation / 0.18) * 100));
                updateProgress(pct);

                if (deviation > 0.18) {
                    hasTurned.current = true;
                    playBeep(1200, 0.15);
                    updateStatus("recenter");
                    updateProgress(0);
                }
            }
        }

        if (currentStatus === "recenter") {
            if (distanceToCenter < 90) {
                const next = progressRef.current + 6;
                if (next >= 100) {
                    playBeep(1400, 0.15);
                    updateStatus("success");
                    updateProgress(100);
                    setTimeout(() => {
                        captureFrame();
                    }, 500);
                } else {
                    updateProgress(next);
                }
            } else {
                updateProgress(Math.max(0, progressRef.current - 8));
            }
        }
    };

    const captureFrame = () => {
        if (!canvasRef.current || !videoRef.current) return;

        playShutterSound();
        const video = videoRef.current;

        const captureCanvas = document.createElement("canvas");
        captureCanvas.width = video.videoWidth;
        captureCanvas.height = video.videoHeight;
        const ctx = captureCanvas.getContext("2d");

        if (ctx) {
            ctx.drawImage(video, 0, 0);
            const dataUrl = captureCanvas.toDataURL("image/jpeg", 0.95);

            fetch(dataUrl)
                .then(res => res.blob())
                .then(blob => {
                    const file = new File([blob], `owner_photo_${Date.now()}.jpg`, { type: "image/jpeg" });
                    stopCamera();
                    setCapturedPhoto({ file, dataUrl });
                    updateStatus("preview");
                });
        }
    };

    const handleSubmitCapturedPhoto = () => {
        if (capturedPhoto) {
            onCapture(capturedPhoto.file, capturedPhoto.dataUrl);
            onClose();
        }
    };

    const isLocal = typeof window !== "undefined" && 
        (window.location.hostname === "localhost" || 
         window.location.hostname === "127.0.0.1" || 
         window.location.hostname.endsWith(".ngrok-free.dev"));

    const handleLocalBypass = () => {
        if (!canvasRef.current || !videoRef.current) return;
        
        playShutterSound();
        const video = videoRef.current;

        const captureCanvas = document.createElement("canvas");
        captureCanvas.width = video.videoWidth || 640;
        captureCanvas.height = video.videoHeight || 480;
        const ctx = captureCanvas.getContext("2d");

        if (ctx) {
            if (video.videoWidth > 0) {
                ctx.drawImage(video, 0, 0);
            } else {
                ctx.fillStyle = "#E2E8F0";
                ctx.fillRect(0, 0, captureCanvas.width, captureCanvas.height);
                ctx.fillStyle = "#10B981";
                ctx.font = "bold 24px sans-serif";
                ctx.textAlign = "center";
                ctx.fillText("DEV BYPASS CAPTURE", captureCanvas.width / 2, captureCanvas.height / 2);
            }

            const dataUrl = captureCanvas.toDataURL("image/jpeg", 0.95);
            fetch(dataUrl)
                .then(res => res.blob())
                .then(blob => {
                    const file = new File([blob], `owner_photo_${Date.now()}.jpg`, { type: "image/jpeg" });
                    stopCamera();
                    setCapturedPhoto({ file, dataUrl });
                    updateStatus("preview");
                });
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/90 backdrop-blur-sm p-4 md:p-6 overflow-y-auto">
            <div className="w-full max-w-lg bg-white rounded-3xl overflow-hidden shadow-2xl border border-gray-100 flex flex-col max-h-[90vh]">
                
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                    <div className="flex items-center gap-2">
                        <ShieldCheckIcon className="w-5 h-5 text-green-600" />
                        <span className="text-sm font-extrabold text-gray-800">Govigi Live Capture Verification</span>
                    </div>
                    <button 
                        onClick={() => { stopCamera(); onClose(); }}
                        className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>

                {/* Camera Viewport Body */}
                <div className="flex-1 p-6 flex flex-col items-center justify-center bg-gray-50/20 relative">
                    
                    {/* Circle Video Box */}
                    <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-full overflow-hidden border-[4px] border-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] bg-black shrink-0">
                        <video 
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className="absolute inset-0 w-full h-full object-cover -scale-x-100"
                        />
                        <canvas 
                            ref={canvasRef}
                            className="absolute inset-0 w-full h-full object-cover -scale-x-100 z-10 hidden"
                        />

                        {/* Image Preview Overlay */}
                        {status === "preview" && capturedPhoto && (
                            <img 
                                src={capturedPhoto.dataUrl} 
                                alt="Captured Preview"
                                className="absolute inset-0 w-full h-full object-cover -scale-x-100 z-30"
                            />
                        )}
                        
                        {/* Dynamic border ring color per step */}
                        {!isLoadingLib && status !== "success" && status !== "error" && (
                            <div className={`absolute inset-0 rounded-full pointer-events-none z-20 border-[3px] transition-colors duration-300 ${
                                status === "aligning" ? "border-white/50 animate-pulse" :
                                status === "blink" ? "border-amber-400/70 animate-pulse" :
                                status === "turn" ? "border-blue-400/70 animate-pulse" :
                                "border-green-400/70 animate-pulse"
                            }`} />
                        )}
                        {status === "success" && (
                            <div className="absolute inset-0 rounded-full pointer-events-none z-20 border-[3px] border-green-500" />
                        )}

                        {/* Step-specific icon overlay on camera */}
                        {!isLoadingLib && status === "aligning" && (
                            <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center">
                                <div className="w-16 h-16 rounded-full border-[3px] border-dashed border-white/60 flex items-center justify-center animate-pulse">
                                    <svg className="w-7 h-7 text-white/80" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                        <circle cx="12" cy="12" r="3" />
                                        <path d="M12 2v4M12 18v4M2 12h4M18 12h4" strokeLinecap="round" />
                                    </svg>
                                </div>
                            </div>
                        )}

                        {!isLoadingLib && status === "blink" && (
                            <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center">
                                <div className="flex flex-col items-center gap-1">
                                    <span className="text-5xl animate-bounce" style={{ animationDuration: '1.2s' }}>😉</span>
                                </div>
                            </div>
                        )}

                        {!isLoadingLib && status === "turn" && (
                            <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center">
                                <div className="flex items-center gap-6">
                                    <svg className="w-8 h-8 text-white/80 animate-[pulse_1s_infinite]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                        <path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    <span className="text-4xl">🙂</span>
                                    <svg className="w-8 h-8 text-white/80 animate-[pulse_1s_infinite]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                        <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                            </div>
                        )}

                        {!isLoadingLib && status === "recenter" && (
                            <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center">
                                <div className="flex flex-col items-center gap-1">
                                    <span className="text-5xl animate-pulse">😊</span>
                                    <svg className="w-6 h-6 text-white/80 animate-bounce" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                        <path d="M5 12h14M12 5v14" strokeLinecap="round" />
                                    </svg>
                                </div>
                            </div>
                        )}

                        {status === "success" && (
                            <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center bg-green-500/20">
                                <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center shadow-lg shadow-green-500/30">
                                    <CheckIcon className="w-9 h-9 text-white stroke-[3]" />
                                </div>
                            </div>
                        )}

                        {/* Loading Overlay */}
                        {isLoadingLib && (
                            <div className="absolute inset-0 bg-gray-900/80 z-30 flex flex-col items-center justify-center p-4 text-center">
                                <ArrowPathIcon className="w-8 h-8 text-green-500 animate-spin mb-3" />
                                <p className="text-xs font-bold text-white tracking-wide">Starting camera...</p>
                                <p className="text-[10px] text-gray-400 mt-1">Loading face detection models</p>
                            </div>
                        )}
                    </div>

                    {/* Progress bar below camera */}
                    {status !== "idle" && status !== "success" && status !== "error" && status !== "preview" && !isLoadingLib && (
                        <div className="mt-4 w-48">
                            <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                                <div 
                                    className={`h-full transition-all duration-150 rounded-full ${
                                        status === "aligning" ? "bg-white/80" :
                                        status === "blink" ? "bg-amber-400" :
                                        status === "turn" ? "bg-blue-400" :
                                        "bg-green-500"
                                    }`}
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>
                    )}

                    {/* Step indicator pills */}
                    {!isLoadingLib && status !== "idle" && status !== "error" && status !== "preview" && (
                        <div className="mt-4 flex items-center gap-2">
                            <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all ${
                                status === "aligning" ? "bg-gray-800 text-white" : "bg-green-100 text-green-700"
                            }`}>
                                {status !== "aligning" && <CheckIcon className="w-3 h-3 stroke-[3]" />}
                                Align
                            </div>
                            <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all ${
                                status === "blink" ? "bg-amber-500 text-white" : 
                                status === "aligning" ? "bg-gray-100 text-gray-400" : "bg-green-100 text-green-700"
                            }`}>
                                {["turn", "recenter", "success"].includes(status) && <CheckIcon className="w-3 h-3 stroke-[3]" />}
                                Blink
                            </div>
                            <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all ${
                                status === "turn" ? "bg-blue-500 text-white" : 
                                ["aligning", "blink"].includes(status) ? "bg-gray-100 text-gray-400" : "bg-green-100 text-green-700"
                            }`}>
                                {["recenter", "success"].includes(status) && <CheckIcon className="w-3 h-3 stroke-[3]" />}
                                Turn
                            </div>
                            <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all ${
                                status === "recenter" ? "bg-green-500 text-white" : 
                                status === "success" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400"
                            }`}>
                                {status === "success" && <CheckIcon className="w-3 h-3 stroke-[3]" />}
                                📸
                            </div>
                        </div>
                    )}

                    {/* Minimal status text */}
                    <div className="mt-3 text-center">
                        {isLoadingLib ? (
                            <span className="text-xs text-gray-400 font-semibold">Allow camera access if prompted</span>
                        ) : status === "aligning" ? (
                            <span className="text-xs font-bold text-gray-600">Center your face in the circle</span>
                        ) : status === "blink" ? (
                            <span className="text-xs font-bold text-amber-600">Blink your eyes</span>
                        ) : status === "turn" ? (
                            <span className="text-xs font-bold text-blue-600">Turn your head to either side</span>
                        ) : status === "recenter" ? (
                            <span className="text-xs font-bold text-green-600">Look straight at the camera</span>
                        ) : status === "preview" ? (
                            <span className="text-xs font-bold text-gray-700">Review your captured photo</span>
                        ) : status === "success" ? (
                            <span className="text-xs font-bold text-green-600">✓ Verified! Photo captured.</span>
                        ) : status === "error" ? (
                            <span className="text-xs font-bold text-red-500">{errorMessage}</span>
                        ) : null}
                    </div>
                </div>

                {/* Footer Controls */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-4 shrink-0">
                    <div className="flex items-center gap-1.5 text-gray-400">
                        <ShieldCheckIcon className="w-4 h-4" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Secure Sandbox KYC</span>
                    </div>

                    <div className="flex items-center gap-2">
                        {isLocal && status !== "preview" && (
                            <button
                                type="button"
                                onClick={handleLocalBypass}
                                className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold py-2.5 px-4 rounded-xl flex items-center gap-1.5 transition-all shadow-md shadow-amber-500/10 active:scale-98"
                            >
                                Skip Verification (Dev)
                            </button>
                        )}

                        {status === "preview" ? (
                            <>
                                <button
                                    type="button"
                                    onClick={initLiveness}
                                    className="text-xs font-bold text-gray-500 hover:text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 px-4 py-2.5 rounded-xl transition-all"
                                >
                                    Retake
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSubmitCapturedPhoto}
                                    className="bg-green-600 hover:bg-green-700 text-white text-xs font-bold py-2.5 px-4 rounded-xl flex items-center gap-1.5 shadow-md shadow-green-500/20 transition-all active:scale-98"
                                >
                                    <CheckIcon className="w-4 h-4 stroke-[3]" />
                                    Keep & Submit
                                </button>
                            </>
                        ) : status === "error" ? (
                            <button
                                onClick={initLiveness}
                                className="bg-green-600 hover:bg-green-700 text-white text-xs font-bold py-2.5 px-4 rounded-xl flex items-center gap-1.5 shadow-md shadow-green-100 transition-all active:scale-98"
                            >
                                <ArrowPathIcon className="w-4 h-4" />
                                Retry
                            </button>
                        ) : (
                            <button 
                                onClick={() => { stopCamera(); onClose(); }}
                                className="text-xs font-bold text-gray-500 hover:text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 px-4 py-2.5 rounded-xl transition-all"
                            >
                                Cancel
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
