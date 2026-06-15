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

  const partnerId = me.id === "A" ? "B" : "A";
  const confirm = () => getSocket()?.emit("stage3:confirm");

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 fade-in">
      <h2 className="font-display text-4xl text-dn-text mb-2">Couples Yoga</h2>
      <p className="text-dn-muted text-sm mb-8 tracking-wide">
        play/pause synced between you both
      </p>

      <div className="glass p-3 mb-6 w-full max-w-2xl overflow-hidden">
        <div id="yt" className="rounded-xl overflow-hidden" />
      </div>

      <button onClick={confirm} disabled={state.stage3[`${me.id}_done`]}
        className="px-8 py-3 rounded-pill bg-dn-rose-bright text-dn-bg font-bold disabled:opacity-50 hover:opacity-90 transition mb-3">
        We finished ✓
      </button>
      <p className="text-sm text-dn-muted">
        You {state.stage3[`${me.id}_done`] ? "✓" : "…"} · Partner: {state.stage3[`${partnerId}_done`] ? "✓" : "waiting…"}
      </p>
    </div>
  );
}
