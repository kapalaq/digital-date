import { useEffect, useRef, useState, useCallback } from "react";
import confetti from "canvas-confetti";
import { getSocket } from "../socket.js";

export default function Celebration({ state, me }) {
  useEffect(() => {
    const end = Date.now() + 4000;
    (function frame() {
      confetti({
        particleCount: 5,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#ffb0cf", "#cabeff", "#ffb951"],
      });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();
  }, []);

  const country = state.stage2.result?.country || "—";

  const s5 = state.stage5;
  const culinaryWinner = (() => {
    if (!s5) return "Culinary game";
    const aHits = Object.values(s5.approvals?.A || {}).filter(Boolean).length;
    const bHits = Object.values(s5.approvals?.B || {}).filter(Boolean).length;
    const aExtra = (s5.bonusItems?.B || []).length;
    const bExtra = (s5.bonusItems?.A || []).length;
    const aPct = (aHits + aExtra) > 0 ? Math.round(aHits / (aHits + aExtra) * 100) : 0;
    const bPct = (bHits + bExtra) > 0 ? Math.round(bHits / (bHits + bExtra) * 100) : 0;
    if (aPct === bPct) return "Tie!";
    return aPct > bPct ? `A wins (${aPct}% vs ${bPct}%)` : `B wins (${bPct}% vs ${aPct}%)`;
  })();

  const achievements = [
    ["sports_esports", "Game Picked", "Co-op game session"],
    ["public", "Trip Chosen", country],
    ["self_improvement", "Activity Completed", "Couples yoga"],
    ["auto_awesome", "Goals Saved", "100 goals list"],
    ["restaurant", "Culinary Recall", culinaryWinner],
  ];

  // camera state
  const [camStep, setCamStep] = useState("idle"); // idle | preview | captured | waiting | done | error
  const [capturedUrl, setCapturedUrl] = useState(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
  }, []);

  // socket listeners
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const onWaiting = () => setCamStep("waiting");
    const onReady = ({ [state.meta.ida]: photoA, [state.meta.idb]: photoB }) => {
      setCamStep("done");
      combinAndDownload(photoA, photoB, state.meta);
    };

    socket.on("memory:waiting", onWaiting);
    socket.on("memory:ready", onReady);
    return () => {
      socket.off("memory:waiting", onWaiting);
      socket.off("memory:ready", onReady);
    };
  }, [state.meta]);

  async function openCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false });
      streamRef.current = stream;
      setCamStep("preview");
      // attach after state update so videoRef.current is rendered
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      }, 50);
    } catch {
      setCamStep("error");
    }
  }

  function takePhoto() {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    setCapturedUrl(dataUrl);
    setCamStep("captured");
    stopStream();
  }

  function retake() {
    setCapturedUrl(null);
    setCamStep("idle");
  }

  function submitPhoto() {
    getSocket()?.emit("memory:photo", { dataUrl: capturedUrl });
    setCamStep("waiting");
  }

  return (
    <div className="min-h-screen dn-shell text-on-background flex flex-col items-center justify-center text-center p-safe-margin md:p-xl fade-in relative overflow-hidden">
      <main className="relative z-10 w-full max-w-[1200px] flex flex-col items-center">
        <header className="mb-xl">
          <span className="material-symbols-outlined text-tertiary text-6xl mb-md" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
          <h1 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-primary mb-sm">
            What a Night
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl mx-auto">
            Another beautiful memory added to your shared journey.
          </p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-md w-full mb-xl">
          {achievements.map(([icon, title, value], index) => (
            <div key={title} className={`glass-panel rounded-xl p-md text-left ${index === 1 ? "md:col-span-2" : ""}`}>
              <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center mb-md">
                <span className="material-symbols-outlined text-primary">{icon}</span>
              </div>
              <p className="font-label-caps text-label-caps text-secondary mb-xs">{title}</p>
              <p className="font-title-sm text-title-sm text-on-surface">{value}</p>
            </div>
          ))}
        </section>

        <div className="glass-panel rounded-xl p-md md:p-lg max-w-xl w-full glow-active">
          <h2 className="font-headline-md-mobile text-headline-md-mobile text-on-surface mb-sm">
            Date complete
          </h2>
          <p className="text-on-surface-variant mb-md">Both partners finished the full journey.</p>

          {camStep === "idle" && (
            <button onClick={openCamera} className="w-full py-3 rounded-full btn-primary-glow font-title-sm">
              Save This Memory
            </button>
          )}

          {camStep === "preview" && (
            <div className="flex flex-col items-center gap-md">
              <video ref={videoRef} className="w-full rounded-xl object-cover" style={{ maxHeight: 280 }} playsInline muted />
              <button onClick={takePhoto} className="w-full py-3 rounded-full btn-primary-glow font-title-sm">
                Take Photo
              </button>
            </div>
          )}

          {camStep === "captured" && capturedUrl && (
            <div className="flex flex-col items-center gap-md">
              <img src={capturedUrl} alt="Your photo" className="w-full rounded-xl object-cover" style={{ maxHeight: 280 }} />
              <div className="flex gap-sm w-full">
                <button onClick={retake} className="flex-1 py-3 rounded-full font-title-sm"
                  style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.2)", color: "#e8e8f0" }}>
                  Retake
                </button>
                <button onClick={submitPhoto} className="flex-1 py-3 rounded-full btn-primary-glow font-title-sm">
                  Looks Good
                </button>
              </div>
            </div>
          )}

          {camStep === "waiting" && (
            <div className="flex flex-col items-center gap-sm py-4">
              <span className="material-symbols-outlined text-primary text-4xl animate-pulse">favorite</span>
              <p className="text-on-surface-variant">Waiting for your partner's photo…</p>
            </div>
          )}

          {camStep === "done" && (
            <div className="flex flex-col items-center gap-sm py-4">
              <span className="material-symbols-outlined text-tertiary text-4xl">download_done</span>
              <p className="text-on-surface-variant">Memory saved! Check your downloads.</p>
            </div>
          )}

          {camStep === "error" && (
            <div className="flex flex-col items-center gap-sm py-4">
              <p className="text-error text-sm">Camera access denied.</p>
              <button onClick={() => setCamStep("idle")} className="text-primary text-sm underline">Try again</button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

async function combinAndDownload(photoA, photoB, meta) {
  const [imgA, imgB] = await Promise.all([loadImg(photoA), loadImg(photoB)]);

  const GAP = 16;
  const LABEL_H = 36;
  const PADDING = 24;
  const h = Math.max(imgA.height, imgB.height);
  const wA = Math.round(imgA.width * h / imgA.height);
  const wB = Math.round(imgB.width * h / imgB.height);
  const totalW = wA + wB + GAP + PADDING * 2;
  const totalH = h + LABEL_H + PADDING * 2 + 48; // 48 for top heart row

  const canvas = document.createElement("canvas");
  canvas.width = totalW;
  canvas.height = totalH;
  const ctx = canvas.getContext("2d");

  // background
  ctx.fillStyle = "#0d0d1a";
  ctx.fillRect(0, 0, totalW, totalH);

  // heart + date header
  ctx.fillStyle = "#ffb0cf";
  ctx.font = "bold 22px sans-serif";
  ctx.textAlign = "center";
  const dateStr = new Date().toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
  ctx.fillText(`♥  ${dateStr}  ♥`, totalW / 2, PADDING + 28);

  // photos
  const yPhoto = PADDING + 48;
  ctx.drawImage(imgA, PADDING, yPhoto, wA, h);
  ctx.drawImage(imgB, PADDING + wA + GAP, yPhoto, wB, h);

  // name labels
  ctx.fillStyle = "rgba(0,0,0,0.55)";
  ctx.fillRect(PADDING, yPhoto + h - LABEL_H, wA, LABEL_H);
  ctx.fillRect(PADDING + wA + GAP, yPhoto + h - LABEL_H, wB, LABEL_H);

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 16px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(meta.nameA, PADDING + wA / 2, yPhoto + h - LABEL_H / 2 + 6);
  ctx.fillText(meta.nameB, PADDING + wA + GAP + wB / 2, yPhoto + h - LABEL_H / 2 + 6);

  const link = document.createElement("a");
  link.href = canvas.toDataURL("image/jpeg", 0.92);
  link.download = `date-night-${Date.now()}.jpg`;
  link.click();
}

function loadImg(dataUrl) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = dataUrl;
  });
}
