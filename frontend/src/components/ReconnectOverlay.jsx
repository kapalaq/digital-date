export default function ReconnectOverlay({ partnerName }) {
  return (
    <div className="fixed inset-0 bg-navy/80 backdrop-blur flex flex-col items-center justify-center z-40">
      <div className="text-5xl mb-4 animate-spin">🔄</div>
      <p className="text-xl">{partnerName} disconnected — reconnecting…</p>
      <p className="text-rosegold text-sm mt-2">Your progress is safe.</p>
    </div>
  );
}
