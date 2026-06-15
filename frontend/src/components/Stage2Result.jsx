// frontend/src/components/Stage2Result.jsx
export default function Stage2Result({ result }) {
  return (
    <div className="text-center my-6 p-8 glass-rose fade-in">
      <div className="text-7xl mb-4">{result.flag}</div>
      <h3 className="font-display text-3xl text-dn-rose mb-2">
        You&apos;re going to {result.country}!
      </h3>
      <p className="text-dn-muted mt-2">{result.description}</p>
    </div>
  );
}
