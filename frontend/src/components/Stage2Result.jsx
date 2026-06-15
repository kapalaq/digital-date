export default function Stage2Result({ result }) {
  return (
    <div className="text-center my-6 p-6 rounded-2xl bg-gradient-to-br from-rosegold/30 to-navy">
      <div className="text-7xl mb-2">{result.flag}</div>
      <h3 className="text-2xl text-rosegold">You're going to {result.country}!</h3>
      <p className="mt-2 text-cream/80">{result.description}</p>
    </div>
  );
}
