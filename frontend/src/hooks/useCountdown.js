import { useEffect, useState } from "react";
// next 18:00 GMT+5 == 13:00 UTC
function nextTarget() {
  const t = new Date(); t.setUTCHours(13,0,0,0);
  if (Date.now() >= t.getTime()) t.setUTCDate(t.getUTCDate()+1);
  return t;
}
export function useCountdown() {
  const [target] = useState(nextTarget);
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const i = setInterval(()=>setNow(Date.now()),1000); return ()=>clearInterval(i); }, []);
  const ms = Math.max(0, target.getTime() - now);
  const h = String(Math.floor(ms/3.6e6)).padStart(2,"0");
  const m = String(Math.floor(ms%3.6e6/6e4)).padStart(2,"0");
  const s = String(Math.floor(ms%6e4/1000)).padStart(2,"0");
  return { label: `${h}:${m}:${s}`, done: ms === 0 };
}
