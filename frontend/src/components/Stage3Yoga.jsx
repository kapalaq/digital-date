// frontend/src/components/Stage3Yoga.jsx
import { useEffect, useRef } from "react";
import { getSocket } from "../socket.js";

const VIDEO_ID = "v7AYKMP6rOE";

export default function Stage3Yoga({ me, state }) {
  const playerRef = useRef(null);
  const ready     = useRef(false);
  const suppress  = useRef(false);

  useEffect(() => {
    function init() {
      playerRef.current = new window.YT.Player("yt", {
        videoId: VIDEO_ID,
        height: "360",
        width:  "640",
        playerVars: { origin: window.location.origin, enablejsapi: 1 },
        events: {
          onReady: () => { ready.current = true; },
          onStateChange: (e) => {
            if (suppress.current) return;
            const t = playerRef.current.getCurrentTime();
            if (e.data === window.YT.PlayerState.PLAYING) emit(true, t);
            if (e.data === window.YT.PlayerState.PAUSED)  emit(false, t);
          },
        },
      });
    }
    if (!window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(tag);
      window.onYouTubeIframeAPIReady = init;
    } else init();
  }, []);

  function emit(playing, time) { getSocket()?.emit("stage3:videoControl", { playing, time }); }

  useEffect(() => {
    const v = state.stage3.video;
    if (!ready.current || !playerRef.current || v.updatedBy === me.id) return;
    suppress.current = true;
    const p = playerRef.current;
    if (Math.abs(p.getCurrentTime() - v.time) > 1.5) p.seekTo(v.time, true);
    if (v.playing) p.playVideo(); else p.pauseVideo();
    setTimeout(() => { suppress.current = false; }, 400);
  }, [state.stage3.video]);

  const { ida, idb } = state.meta;
  const partnerId = me.id === ida ? idb : ida;
  const confirm = () => getSocket()?.emit("stage3:confirm");

  return (
    <div className="min-h-screen bg-inverse-surface text-inverse-on-surface flex flex-col fade-in">
      <header className="h-20 bg-[#4a485f] px-safe-margin md:px-xl flex items-center justify-center">
        <div className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-primary">
          Date Night
        </div>
      </header>

      <main className="flex-1 w-full max-w-[1200px] mx-auto px-safe-margin md:px-xl py-lg flex flex-col items-center gap-lg">
        <div className="text-center">
          <h2 className="font-headline-md-mobile md:font-headline-md text-headline-md-mobile md:text-headline-md text-[#6d5f95] mb-xs">
            Couples Vinyasa Flow
          </h2>
          <p className="text-[#cfaeb9]">Sync your breathing. Stage 3 of 5.</p>
        </div>

        <div className="flex items-center justify-center gap-md md:gap-xl w-full max-w-2xl">
          {[
            ["You", state.stage3[`${me.id}_done`], "primary", "person"],
            ["Partner", state.stage3[`${partnerId}_done`], "secondary", "person_outline"],
          ].map(([label, done, color, icon], index) => (
            <div key={label} className="contents">
              {index === 1 && (
                <div className="flex-1 relative h-8 flex items-center">
                  <div className="absolute inset-x-0 h-[2px] bg-[#cabeff]" />
                  <div className="mx-auto relative z-10 w-8 h-8 rounded-full bg-surface-container-high border border-white/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-tertiary text-[16px]">favorite</span>
                  </div>
                </div>
              )}
              <div className="flex flex-col items-center gap-xs min-w-[5.5rem]">
                <div className={`w-16 h-16 rounded-full bg-white/60 border flex items-center justify-center relative shadow-[0_0_24px_rgba(255,176,207,0.22)] ${color === "primary" ? "border-primary/50 text-primary" : "border-secondary/50 text-secondary"}`}>
                  <span className={`absolute top-1 right-1 w-3 h-3 rounded-full ${done ? (color === "primary" ? "bg-primary" : "bg-secondary") : "bg-tertiary animate-pip-pulse"}`} />
                  <span className="material-symbols-outlined text-[32px]">{icon}</span>
                </div>
                <span className="font-title-sm text-title-sm text-secondary-fixed">{label}</span>
                <span className={`font-label-caps text-label-caps ${color === "primary" ? "text-primary" : "text-secondary"}`}>
                  {done ? "Ready" : "In Flow"}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="w-full max-w-4xl rounded-xl overflow-hidden relative bg-[#222039] shadow-[0_24px_80px_rgba(16,16,46,0.28)] border border-white/50">
          <div className="absolute top-md left-md z-10 flex gap-sm">
            <span className="px-4 py-1 rounded-full bg-surface-container/50 border border-secondary/30 text-white font-label-caps text-label-caps">Vinyasa</span>
            <span className="px-4 py-1 rounded-full bg-surface-container/50 border border-secondary/30 text-white font-label-caps text-label-caps">15 Min</span>
          </div>
          <div id="yt" />
        </div>

        <div className="w-full max-w-3xl flex flex-col gap-sm">
          <div className="flex justify-between font-label-caps text-label-caps text-[#cfaeb9]">
            <span>Stage Progress</span>
            <span>{state.stage3[`${me.id}_done`] && state.stage3[`${partnerId}_done`] ? "100% Synced" : "60% Synced"}</span>
          </div>
          <div className="h-2 rounded-full bg-[#eadfea] overflow-hidden">
            <div className="h-full w-3/5 rounded-full bg-tertiary shadow-[0_0_18px_rgba(255,185,81,0.7)]" />
          </div>
        </div>

        <button onClick={confirm} disabled={state.stage3[`${me.id}_done`]}
          className="px-8 py-3 rounded-full bg-white text-[#111] font-title-sm text-title-sm disabled:opacity-50 hover:bg-primary-fixed transition flex items-center gap-sm">
          <span className="material-symbols-outlined">check_circle</span>
          {state.stage3[`${me.id}_done`] ? "Waiting for partner" : "We Finished"}
        </button>
      </main>
    </div>
  );
}
