import { useEffect, useRef } from "react";
import { getSocket } from "../socket.js";

const VIDEO_ID = "v7AYKMP6rOE"; // couples yoga session (hardcoded)

export default function Stage3Yoga({ me, state }) {
  const playerRef = useRef(null);
  const ready = useRef(false);
  const suppress = useRef(false);

  useEffect(() => {
    function init() {
      playerRef.current = new window.YT.Player("yt", {
        videoId: VIDEO_ID, height: "390", width: "640",
        // explicit origin + enablejsapi so postMessage play/pause control works
        // when served from nginx (localhost:8080), not just the vite dev server
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

  // apply remote video state
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
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <h2 className="text-3xl mb-4 text-rosegold">Couples Yoga 🧘‍♀️🧘‍♂️</h2>
      <div id="yt" className="rounded-xl overflow-hidden mb-4 max-w-full" />
      <p className="text-sm mb-3 text-cream/60">Play/pause is synced between you both.</p>
      <button onClick={confirm} disabled={state.stage3[`${me.id}_done`]}
        className="px-6 py-3 rounded-full bg-rosegold text-navy font-bold disabled:opacity-50 mb-2">We finished ✓</button>
      <p className="text-sm">You {state.stage3[`${me.id}_done`]?"✓":"…"} | Partner: {state.stage3[`${partnerId}_done`]?"✓":"waiting…"}</p>
    </div>
  );
}
