import { useState } from "react";
import { useSocketState } from "./socket.js";
import Login from "./components/Login.jsx";
import WaitingRoom from "./components/WaitingRoom.jsx";
import Lobby from "./components/Lobby.jsx";
import Stage1Cards from "./components/Stage1Cards.jsx";
import Stage2Quiz from "./components/Stage2Quiz.jsx";
import Stage3Yoga from "./components/Stage3Yoga.jsx";
import Stage4Goals from "./components/Stage4Goals.jsx";
import Celebration from "./components/Celebration.jsx";
import DevPanel from "./components/DevPanel.jsx";
import ReconnectOverlay from "./components/ReconnectOverlay.jsx";
import FloatingStatus from "./components/FloatingStatus.jsx";

const DEV = new URLSearchParams(location.search).get("dev") === "true";

export default function App() {
  const [me, setMe] = useState(null);
  const state = useSocketState();
  if (!me) return <Login onAuth={setMe} />;
  if (!state) return (
    <div className="min-h-screen flex items-center justify-center text-dn-muted">
      Connecting…
    </div>
  );

  const partnerId = me.id === "A" ? "B" : "A";
  const partnerName = me.id === "A" ? "User B" : "User A";
  const partnerOffline = !state.presence[partnerId].online &&
    !["waiting", "done"].includes(state.phase);

  const view = {
    waiting: <WaitingRoom me={me} state={state} />,
    lobby:   <Lobby me={me} state={state} />,
    stage1:  <Stage1Cards me={me} state={state} />,
    stage2:  <Stage2Quiz me={me} state={state} />,
    stage3:  <Stage3Yoga me={me} state={state} />,
    stage4:  <Stage4Goals me={me} state={state} />,
    done:    <Celebration me={me} state={state} />,
  }[state.phase];

  return (
    <div className="fade-in" key={state.phase}>
      {view}
      <FloatingStatus me={me} state={state} />
      {partnerOffline && <ReconnectOverlay partnerName={partnerName} />}
      {DEV && <DevPanel state={state} me={me} />}
    </div>
  );
}
