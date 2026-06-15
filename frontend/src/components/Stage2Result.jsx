// frontend/src/components/Stage2Result.jsx
import { useState, useEffect } from "react";

export default function Stage2Result({ result }) {
  const [img, setImg] = useState(null);

  useEffect(() => {
    fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(result.country)}`)
      .then(r => r.json())
      .then(d => { if (d.thumbnail?.source) setImg(d.thumbnail.source); })
      .catch(() => {});
  }, [result.country]);

  return (
    <section className="fade-in glass-panel rounded-xl overflow-hidden glow-active">
      {img && (
        <div className="h-56 md:h-72 overflow-hidden relative">
          <img src={img} alt={result.country}
            className="w-full h-full object-cover opacity-75" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
        </div>
      )}
      <div className="p-md md:p-lg text-center">
        <div className="text-6xl mb-sm">{result.flag}</div>
        <p className="font-label-caps text-label-caps text-secondary mb-xs">The Verdict is In</p>
        <h3 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-primary mb-sm">
          {result.country}
        </h3>
        <p className="text-on-surface-variant max-w-2xl mx-auto">{result.description}</p>
      </div>
    </section>
  );
}
