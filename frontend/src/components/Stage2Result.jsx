// frontend/src/components/Stage2Result.jsx
import { useState } from "react";
import AnswerComparison from "./AnswerComparison.jsx";

export default function Stage2Result({ result, answersA, answersB, nameA, nameB }) {
  const [imgError, setImgError] = useState(false);
  const photoSrc = `/countries/${result.country.toLowerCase().replace(/ /g, "-")}.jpg`;

  return (
    <>
      <section className="fade-in glass-panel rounded-xl overflow-hidden glow-active">
        {!imgError && (
          <div className="h-56 md:h-72 overflow-hidden relative">
            <img
              src={photoSrc}
              alt={result.country}
              className="w-full h-full object-cover opacity-75"
              onError={() => setImgError(true)}
            />
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

      {answersA && answersB && (
        <AnswerComparison
          answersA={answersA}
          answersB={answersB}
          nameA={nameA}
          nameB={nameB}
        />
      )}
    </>
  );
}
