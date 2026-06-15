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
    <div className="my-6 fade-in glass-rose overflow-hidden">
      {img && (
        <div className="h-52 overflow-hidden" style={{ borderRadius: "1.5rem 1.5rem 0 0" }}>
          <img src={img} alt={result.country}
            className="w-full h-full object-cover opacity-80" />
        </div>
      )}
      <div className="p-8 text-center">
        <div className="text-6xl mb-3">{result.flag}</div>
        <h3 className="font-display text-3xl text-dn-rose mb-2">
          You&apos;re going to {result.country}!
        </h3>
        <p className="text-dn-muted">{result.description}</p>
      </div>
    </div>
  );
}
