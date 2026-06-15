// frontend/src/components/ReconnectOverlay.jsx
export default function ReconnectOverlay({ partnerName }) {
  return (
    <div className="fixed inset-0 z-40 flex flex-col items-center justify-center"
      style={{ background: "rgba(10,10,46,0.85)", backdropFilter: "blur(8px)" }}>
      <div className="glass p-10 max-w-sm w-full text-center"
        style={{ borderColor: "rgba(255,176,207,0.35)" }}>
        <div className="text-5xl mb-4 animate-spin">🔄</div>
        <p className="text-dn-text text-xl mb-2">{partnerName} disconnected</p>
        <p className="text-dn-rose text-sm">Your progress is safe.</p>
      </div>
    </div>
  );
}
