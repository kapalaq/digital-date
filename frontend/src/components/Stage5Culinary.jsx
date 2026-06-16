import { useState } from "react";
import { getSocket } from "../socket.js";

const FOOD_ICONS = [
  "restaurant", "set_meal", "soup_kitchen", "bakery_dining", "egg_alt",
  "tapas", "local_bar", "cake", "ramen_dining", "rice_bowl",
];
function foodIcon(i) { return FOOD_ICONS[i % FOOD_ICONS.length]; }

function computeScore(s5, pid, partId) {
  const myList    = s5.lists[pid] || [];
  const theirAcks = s5.approvals[partId] || {};
  let hits = 0;
  myList.forEach((_, i) => { if (theirAcks[i] === true) hits++; });
  const extra = (s5.bonusItems[partId] || []).length;
  const total = hits + extra;
  const pct   = total > 0 ? Math.round(hits / total * 100) : 0;
  return { hits, extra, pct };
}

function sharedCount(lists) {
  const a = (lists.A || []).map(s => s.trim().toLowerCase());
  const b = (lists.B || []).map(s => s.trim().toLowerCase());
  return a.filter(x => x.length > 3 && b.some(y => y.length > 3 && x.slice(0, 5) === y.slice(0, 5))).length;
}

function PageHeader() {
  return (
    <header className="bg-surface/80 backdrop-blur-xl border-b border-white/15 fixed top-0 w-full z-50 shadow-[0_0_20px_rgba(255,176,207,0.2)]">
      <div className="flex items-center justify-center px-safe-margin h-16 max-w-[1200px] mx-auto">
        <h1 className="font-headline-md-mobile text-headline-md-mobile text-primary font-bold tracking-tight">Date Night</h1>
      </div>
    </header>
  );
}

function WritingPhase({ me, state }) {
  const [draft, setDraft] = useState("");
  const sock       = getSocket();
  const s5         = state.stage5;
  const { ida, idb, nameA, nameB } = state.meta;
  const partnerId  = me.id === ida ? idb : ida;
  const myList     = s5.lists[me.id] || [];
  const iDone      = s5.writingDone[me.id];
  const partnerDone = s5.writingDone[partnerId];
  const partnerCount = (s5.lists[partnerId] || []).length;
  const myPartnerLabel = partnerId === ida ? nameA : nameB;
  const partnerName    = myPartnerLabel;

  const updateList = (next) => sock?.emit("stage5:list", { items: next });
  const add = () => {
    if (draft.trim() && !iDone) { updateList([...myList, draft.trim()]); setDraft(""); }
  };
  const remove = (i) => { if (!iDone) updateList(myList.filter((_, x) => x !== i)); };
  const finish = () => sock?.emit("stage5:writingDone");

  return (
    <div className="min-h-screen bg-background text-on-background">
      <PageHeader />
      <main className="pt-20 pb-xl px-safe-margin md:px-xl max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-lg items-start min-h-[calc(100vh-4rem)]">

        {/* My writing panel */}
        <div className="glass-card rounded-xl p-md md:p-lg flex flex-col relative overflow-hidden border-primary/20 shadow-[0_0_30px_rgba(255,176,207,0.1)]">
          <div className="absolute top-0 left-0 h-1 bg-surface-variant w-full">
            <div className="h-full bg-primary transition-all duration-500" style={{ width: `${Math.min(myList.length / 10 * 100, 100)}%` }} />
          </div>
          <div className="flex justify-between items-center mb-xs mt-sm">
            <h2 className="font-headline-md-mobile text-headline-md-mobile text-primary">
              What does {myPartnerLabel} cook?
            </h2>
            <div className="w-9 h-9 rounded-full bg-primary/20 border border-primary flex items-center justify-center text-primary font-bold text-sm">
              {myList.length}
            </div>
          </div>
          <p className="text-on-surface-variant font-body-md text-body-md mb-md">
            List everything you remember them cooking for you. The more specific, the better.
          </p>

          {!iDone && (
            <div className="relative mb-md">
              <input
                className="w-full bg-background/50 border border-primary/30 rounded-full py-3 pl-5 pr-12 text-on-surface placeholder:text-on-surface-variant/50 font-body-md focus:outline-none focus:border-primary focus:shadow-[0_0_15px_rgba(255,176,207,0.4)] transition-all"
                placeholder="e.g. Spicy Garlic Shrimp Pasta..."
                value={draft}
                onChange={e => setDraft(e.target.value)}
                onKeyDown={e => e.key === "Enter" && add()}
              />
              <button onClick={add}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-primary text-on-primary flex items-center justify-center hover:opacity-90 active:scale-95 transition-all shadow-md">
                <span className="material-symbols-outlined text-[20px]">add</span>
              </button>
            </div>
          )}

          <div className="flex flex-col gap-2 flex-1 overflow-y-auto max-h-[40vh]">
            {myList.length === 0 && (
              <p className="text-on-surface-variant text-sm text-center py-8 italic">Nothing added yet…</p>
            )}
            {myList.map((item, i) => (
              <div key={i} className="bg-surface/40 border border-white/10 rounded-lg px-4 py-3 flex items-center gap-3 group hover:bg-surface/60 transition-colors">
                <span className="material-symbols-outlined text-primary text-[20px]">{foodIcon(i)}</span>
                <span className="text-on-surface flex-1 font-body-md">{item}</span>
                {!iDone && (
                  <button onClick={() => remove(i)} className="opacity-0 group-hover:opacity-100 text-on-surface-variant hover:text-error transition-all">
                    <span className="material-symbols-outlined text-[18px]">close</span>
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="mt-md pt-md border-t border-white/10">
            <button onClick={finish} disabled={iDone || myList.length === 0}
              className="w-full py-4 rounded-full font-title-sm text-title-sm font-bold bg-gradient-to-r from-primary to-primary-container text-on-primary disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2">
              <span className="material-symbols-outlined">{iDone ? "check_circle" : "lock"}</span>
              {iDone ? "List Locked" : "Finish Writing Phase"}
            </button>
          </div>
        </div>

        {/* Partner status panel */}
        <div className="glass-card rounded-xl p-md md:p-lg flex flex-col relative overflow-hidden border-secondary/30">
          <div className="absolute top-0 right-0 h-1 bg-surface-variant w-full">
            <div className="h-full bg-secondary absolute right-0 transition-all duration-500" style={{ width: `${Math.min(partnerCount / 10 * 100, 100)}%` }} />
          </div>
          <div className="flex justify-between items-center mb-md mt-sm">
            <h2 className="font-title-sm text-title-sm text-secondary">{partnerName}'s Screen</h2>
            <div className="w-8 h-8 rounded-full bg-secondary/20 border border-secondary flex items-center justify-center text-secondary font-bold text-sm">
              {partnerCount}
            </div>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center text-center py-xl">
            <div className="w-20 h-20 rounded-full border-2 border-secondary/50 flex items-center justify-center mb-md relative shadow-[0_0_20px_rgba(202,190,255,0.2)]">
              <span className="material-symbols-outlined text-secondary text-[40px]">person</span>
              {!partnerDone && (
                <div className="absolute -bottom-2 -right-2 bg-surface-container-high rounded-full px-2 py-1 border border-secondary/50 flex gap-1 items-center">
                  {[0, 150, 300].map(d => (
                    <div key={d} className="w-1.5 h-1.5 rounded-full bg-secondary animate-bounce" style={{ animationDelay: `${d}ms` }} />
                  ))}
                </div>
              )}
            </div>
            {partnerDone ? (
              <>
                <h3 className="font-headline-md-mobile text-headline-md-mobile text-on-surface mb-xs">{partnerName} is ready!</h3>
                <p className="text-secondary/70 max-w-xs">They've locked in {partnerCount} item{partnerCount !== 1 ? "s" : ""}.</p>
              </>
            ) : (
              <>
                <h3 className="font-headline-md-mobile text-headline-md-mobile text-on-surface mb-xs">{partnerName} is typing…</h3>
                <p className="text-secondary/70 max-w-xs">They are currently listing the meals you've cooked for them.</p>
              </>
            )}
            <div className="mt-lg w-full flex items-center justify-center gap-4 opacity-50">
              <div className="h-px bg-gradient-to-r from-transparent to-primary w-20" />
              <span className="material-symbols-outlined text-tertiary">favorite</span>
              <div className="h-px bg-gradient-to-l from-transparent to-secondary w-20" />
            </div>
          </div>
          <div className="mt-auto pt-md border-t border-white/10 text-center min-h-[2rem]">
            {iDone && !partnerDone && <p className="text-sm text-secondary animate-pulse">Waiting for {partnerName} to finish…</p>}
            {!iDone && partnerDone && <p className="text-sm text-primary animate-pulse">{partnerName} is ready! Finish your list.</p>}
          </div>
        </div>
      </main>
    </div>
  );
}

function ReviewPhase({ me, state }) {
  const [bonusDraft, setBonusDraft] = useState("");
  const sock        = getSocket();
  const s5          = state.stage5;
  const { ida, idb, nameA, nameB } = state.meta;
  const partnerId   = me.id === ida ? idb : ida;
  const partnerName = partnerId === ida ? nameA : nameB;

  // I review what PARTNER wrote about MY cooking
  const listToReview     = s5.lists[partnerId] || [];
  const myApprovals      = s5.approvals[me.id] || {};
  const myBonusItems     = s5.bonusItems[me.id] || [];
  const iDone            = s5.reviewDone[me.id];
  const partnerDone      = s5.reviewDone[partnerId];
  const partnerApprovals = s5.approvals[partnerId] || {};
  const myListLength     = (s5.lists[me.id] || []).length;
  const partnerReviewed  = Object.keys(partnerApprovals).length;
  const partnerProgress  = myListLength > 0 ? Math.round(partnerReviewed / myListLength * 100) : 0;
  const reviewedCount    = Object.keys(myApprovals).length;

  const approve    = (i, val) => { if (!iDone) getSocket()?.emit("stage5:approve", { index: i, approved: val }); };
  const addBonus   = () => {
    if (bonusDraft.trim() && !iDone) {
      sock?.emit("stage5:bonus", { items: [...myBonusItems, bonusDraft.trim()] });
      setBonusDraft("");
    }
  };
  const removeBonus = (i) => { if (!iDone) sock?.emit("stage5:bonus", { items: myBonusItems.filter((_, x) => x !== i) }); };
  const lockReview  = () => sock?.emit("stage5:reviewDone");

  return (
    <div className="min-h-screen bg-background text-on-background">
      <PageHeader />
      <main className="pt-20 pb-xl px-safe-margin md:px-xl max-w-[1200px] mx-auto">

        <div className="mb-lg flex flex-col md:flex-row justify-between items-start md:items-end gap-md">
          <div>
            <h2 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-primary mb-xs">
              Stage 5: Review Phase
            </h2>
            <p className="text-on-surface-variant font-body-md">
              Review what your partner remembers from your cooking.
            </p>
          </div>
          <div className="glass-card rounded-lg px-md py-sm flex items-center gap-md">
            <div className="flex items-center gap-xs">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="font-label-caps text-label-caps text-primary">YOU REVIEWING</span>
            </div>
            <div className="w-px h-5 bg-white/20" />
            <div className="flex items-center gap-xs">
              <span className="font-label-caps text-label-caps text-secondary">PARTNER REVIEWING</span>
              <span className={`w-2 h-2 rounded-full ${partnerDone ? "bg-secondary" : "bg-secondary/40 animate-pulse"}`} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-md">

          {/* Review list */}
          <div className="lg:col-span-7 glass-card rounded-xl p-md md:p-lg flex flex-col">
            <h3 className="font-title-sm text-title-sm text-on-surface mb-md pb-sm border-b border-white/10">
              {partnerName}'s List for You
            </h3>
            <div className="flex flex-col gap-sm overflow-y-auto max-h-[45vh]">
              {listToReview.length === 0 && (
                <p className="text-on-surface-variant text-sm text-center py-8 italic">Partner wrote nothing…</p>
              )}
              {listToReview.map((item, i) => {
                const approved = myApprovals[i];
                return (
                  <div key={i}
                    className={`glass-card rounded-lg px-md py-sm flex items-center justify-between group transition-all duration-300
                      ${approved === true  ? "border-primary/30 bg-primary/5"
                      : approved === false ? "border-error/30 bg-error/5 opacity-60"
                      : "hover:bg-white/10"}`}>
                    <div className="flex items-center gap-md">
                      <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center flex-shrink-0">
                        <span className="material-symbols-outlined text-primary text-[18px]">{foodIcon(i)}</span>
                      </div>
                      <span className={`font-body-md text-on-surface ${approved === false ? "line-through opacity-60" : ""}`}>{item}</span>
                    </div>
                    {approved === true ? (
                      <div className="flex items-center gap-xs text-primary flex-shrink-0">
                        <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                        <span className="font-label-caps text-label-caps">APPROVED</span>
                      </div>
                    ) : approved === false ? (
                      <div className="flex items-center gap-xs text-error/70 flex-shrink-0">
                        <span className="material-symbols-outlined text-[18px]">cancel</span>
                        <span className="font-label-caps text-label-caps">REJECTED</span>
                      </div>
                    ) : !iDone ? (
                      <div className="flex gap-sm opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                        <button onClick={() => approve(i, false)}
                          className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center text-on-surface-variant hover:text-error hover:border-error/50 transition-all">
                          <span className="material-symbols-outlined text-[18px]">close</span>
                        </button>
                        <button onClick={() => approve(i, true)}
                          className="w-9 h-9 rounded-full border border-primary/50 bg-primary/10 flex items-center justify-center text-primary hover:bg-primary hover:text-on-primary transition-all">
                          <span className="material-symbols-outlined text-[18px]">check</span>
                        </button>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>

            {/* Bonus items */}
            <div className="mt-md pt-md border-t border-white/10">
              <label className="font-label-caps text-label-caps text-on-surface-variant mb-sm block">
                ADD WHAT THEY MISSED
              </label>
              {myBonusItems.map((item, i) => (
                <div key={i} className="flex items-center gap-sm mb-xs">
                  <span className="material-symbols-outlined text-tertiary text-[16px]">add_circle</span>
                  <span className="text-on-surface text-sm flex-1">{item}</span>
                  {!iDone && (
                    <button onClick={() => removeBonus(i)} className="text-on-surface-variant hover:text-error">
                      <span className="material-symbols-outlined text-[16px]">close</span>
                    </button>
                  )}
                </div>
              ))}
              {!iDone && (
                <div className="flex gap-sm relative mt-xs">
                  <input
                    className="w-full bg-surface/50 border border-white/20 rounded-full py-sm px-md text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all h-11"
                    placeholder="e.g. Chocolate Lava Cake"
                    value={bonusDraft}
                    onChange={e => setBonusDraft(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && addBonus()}
                  />
                  <button onClick={addBonus}
                    className="absolute right-1 top-1 w-9 h-9 rounded-full bg-primary/20 text-primary flex items-center justify-center hover:bg-primary hover:text-on-primary transition-all">
                    <span className="material-symbols-outlined text-[18px]">add</span>
                  </button>
                </div>
              )}
            </div>

            <button onClick={lockReview} disabled={iDone}
              className="mt-md w-full py-3 rounded-xl font-title-sm text-title-sm text-primary border border-primary/30 glass-card hover:bg-primary hover:text-on-primary disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-sm">
              <span>{iDone ? "Review Locked" : "Lock In Review"}</span>
              <span className="material-symbols-outlined">{iDone ? "check_circle" : "lock"}</span>
            </button>
          </div>

          {/* Partner progress sidebar */}
          <div className="lg:col-span-5 flex flex-col gap-md">
            <div className="glass-card rounded-xl p-md">
              <div className="flex items-center justify-between mb-md">
                <h3 className="font-title-sm text-title-sm text-on-surface">{partnerName}'s Progress</h3>
                <div className="flex items-center gap-xs text-secondary bg-secondary/10 px-sm py-xs rounded-full">
                  <span className="material-symbols-outlined text-[14px]">sync</span>
                  <span className="font-label-caps text-label-caps" style={{ fontSize: "10px" }}>LIVE</span>
                </div>
              </div>
              <div className="flex justify-between mb-xs">
                <span className="font-label-caps text-label-caps text-on-surface-variant">YOUR LIST REVIEWED</span>
                <span className="font-label-caps text-label-caps text-secondary">{partnerReviewed} / {myListLength}</span>
              </div>
              <div className="h-2 w-full bg-surface-container-high rounded-full overflow-hidden">
                <div className="h-full bg-secondary rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(202,190,255,0.6)]"
                  style={{ width: `${partnerProgress}%` }} />
              </div>
              {partnerDone && <p className="text-secondary text-sm mt-sm font-semibold">{partnerName} finished reviewing!</p>}
            </div>

            <div className="glass-card rounded-xl p-md flex-1 flex flex-col items-center justify-center text-center min-h-[200px]">
              <span className="material-symbols-outlined text-tertiary text-[48px] mb-md" style={{ fontVariationSettings: "'FILL' 1" }}>restaurant</span>
              <p className="font-label-caps text-label-caps text-on-surface-variant mb-xs">CULINARY RECALL</p>
              <p className="text-on-surface-variant text-sm">Approve correct items and add what they missed.</p>
              <div className="mt-md text-2xl font-bold text-primary">{reviewedCount} / {listToReview.length}</div>
              <p className="text-xs text-on-surface-variant">items reviewed</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function CircularProgress({ pct, colorClass }) {
  return (
    <div className="relative w-40 h-40 flex items-center justify-center">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
        <path
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          fill="none" stroke="currentColor" strokeWidth="3"
          className="text-surface-container-high" />
        <path
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"
          strokeDasharray={`${pct}, 100`}
          className={colorClass} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`font-bold text-3xl ${colorClass}`}>{pct}<span className="text-xl">%</span></span>
      </div>
    </div>
  );
}

function ResultsPhase({ me, state }) {
  const s5          = state.stage5;
  const { ida, idb, nameA, nameB } = state.meta;
  const partnerId   = me.id === ida ? idb : ida;
  const myName      = me.id === ida ? nameA : nameB;
  const partnerName = partnerId === ida ? nameA : nameB;

  const myScore      = computeScore(s5, me.id, partnerId);
  const partnerScore = computeScore(s5, partnerId, me.id);
  const shared       = sharedCount(s5.lists);
  const iComplete    = s5.complete?.[me.id];
  const partnerComplete = s5.complete?.[partnerId];

  const isWinner    = myScore.pct > partnerScore.pct;
  const isTie       = myScore.pct === partnerScore.pct;
  const winnerLabel = isTie ? "It's a Tie!" : isWinner ? `${myName} Wins! 👑` : `${partnerName} Wins! 👑`;
  const subtitle    = isTie
    ? "You both remembered equally well!"
    : isWinner
      ? "Your memory was sharp tonight! A true culinary genius."
      : `${partnerName}'s memory was sharp tonight! A true culinary genius.`;

  const complete = () => getSocket()?.emit("stage5:complete");

  return (
    <div className="min-h-screen bg-background text-on-background relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-secondary/10 blur-[120px]" />
      </div>

      <main className="relative z-10 flex flex-col items-center justify-center min-h-screen p-safe-margin md:p-xl max-w-[1000px] mx-auto">
        <div className="text-center mb-xl w-full max-w-[700px]">
          <span className="inline-block px-sm py-xs rounded-full bg-secondary/10 text-secondary font-label-caps text-label-caps border border-secondary/20 mb-md">
            STAGE 5: RESULTS
          </span>
          <h1 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-primary mb-xs">
            {winnerLabel}
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-[500px] mx-auto">{subtitle}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-md w-full mb-lg">
          {/* My score card */}
          <div className={`md:col-span-5 glass-card rounded-xl p-lg flex flex-col items-center relative ${isWinner || isTie ? "shadow-[0_0_30px_rgba(255,176,207,0.2)]" : ""}`}>
            {(isWinner || isTie) && (
              <span className="absolute top-md right-md material-symbols-outlined text-primary text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
            )}
            <h2 className="font-headline-md-mobile text-headline-md-mobile text-on-surface mb-xs">{myName} (You)</h2>
            <span className="font-label-caps text-label-caps text-primary/80 mb-md">RECALL VALUE</span>
            <CircularProgress pct={myScore.pct} colorClass="text-primary" />
            <div className="w-full space-y-sm mt-md">
              <div className="flex justify-between items-center border-b border-white/5 pb-xs">
                <span className="text-on-surface-variant flex items-center gap-xs text-sm">
                  <span className="material-symbols-outlined text-[16px]">check_circle</span> Hits
                </span>
                <span className="font-title-sm text-title-sm text-on-surface">{myScore.hits}</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/5 pb-xs">
                <span className="text-on-surface-variant flex items-center gap-xs text-sm">
                  <span className="material-symbols-outlined text-[16px]">add_circle</span> Extra Items
                </span>
                <span className="font-title-sm text-title-sm text-on-surface">{myScore.extra}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-on-surface-variant flex items-center gap-xs text-sm">
                  <span className="material-symbols-outlined text-[16px]">functions</span> Total
                </span>
                <span className="font-title-sm text-title-sm text-primary">{myScore.hits + myScore.extra}</span>
              </div>
            </div>
          </div>

          {/* VS divider */}
          <div className="hidden md:flex md:col-span-2 flex-col items-center justify-center relative">
            <div className="h-full w-px bg-gradient-to-b from-transparent via-white/20 to-transparent absolute" />
            <div className="glass-card rounded-full w-14 h-14 flex items-center justify-center z-10">
              <span className="font-headline-md-mobile text-headline-md-mobile text-on-surface-variant italic">vs</span>
            </div>
          </div>

          {/* Partner score card */}
          <div className={`md:col-span-5 glass-card rounded-xl p-lg flex flex-col items-center relative ${!isWinner && !isTie ? "shadow-[0_0_30px_rgba(202,190,255,0.2)]" : ""}`}>
            {(!isWinner && !isTie) && (
              <span className="absolute top-md right-md material-symbols-outlined text-secondary text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
            )}
            <h2 className="font-headline-md-mobile text-headline-md-mobile text-on-surface mb-xs">{partnerName}</h2>
            <span className="font-label-caps text-label-caps text-secondary/80 mb-md">RECALL VALUE</span>
            <CircularProgress pct={partnerScore.pct} colorClass="text-secondary" />
            <div className="w-full space-y-sm mt-md">
              <div className="flex justify-between items-center border-b border-white/5 pb-xs">
                <span className="text-on-surface-variant flex items-center gap-xs text-sm">
                  <span className="material-symbols-outlined text-[16px]">check_circle</span> Hits
                </span>
                <span className="font-title-sm text-title-sm text-on-surface">{partnerScore.hits}</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/5 pb-xs">
                <span className="text-on-surface-variant flex items-center gap-xs text-sm">
                  <span className="material-symbols-outlined text-[16px]">add_circle</span> Extra Items
                </span>
                <span className="font-title-sm text-title-sm text-on-surface">{partnerScore.extra}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-on-surface-variant flex items-center gap-xs text-sm">
                  <span className="material-symbols-outlined text-[16px]">functions</span> Total
                </span>
                <span className="font-title-sm text-title-sm text-secondary">{partnerScore.hits + partnerScore.extra}</span>
              </div>
            </div>
          </div>

          {/* Shared tastes row */}
          <div className="md:col-span-12 glass-card rounded-xl p-md flex items-center justify-between gap-md">
            <div className="flex items-center gap-md">
              <div className="w-12 h-12 rounded-full bg-tertiary/10 border border-tertiary/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-tertiary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
              </div>
              <div>
                <h3 className="font-title-sm text-title-sm text-on-surface">Shared Tastes Discovered</h3>
                <p className="text-on-surface-variant text-sm">You both independently remembered the same dishes.</p>
              </div>
            </div>
            <div className="text-right">
              <span className="font-bold text-3xl text-tertiary">{shared}</span>
              <span className="text-on-surface-variant text-sm block">Matches</span>
            </div>
          </div>
        </div>

        <button onClick={complete} disabled={iComplete}
          className="bg-gradient-to-r from-primary to-primary-container text-on-primary font-title-sm text-title-sm px-xl py-sm rounded-full shadow-[0_0_20px_rgba(255,176,207,0.4)] hover:shadow-[0_0_30px_rgba(255,176,207,0.6)] disabled:opacity-40 transition-all flex items-center gap-sm group">
          {iComplete ? `Waiting for ${partnerName}…` : "Next Stage"}
          {!iComplete && <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>}
        </button>
        {iComplete && !partnerComplete && (
          <p className="text-sm text-secondary mt-3 animate-pulse">{partnerName} is reviewing results…</p>
        )}
      </main>
    </div>
  );
}

export default function Stage5Culinary({ me, state }) {
  const s5 = state.stage5;
  const { ida, idb } = state.meta;
  const bothWritingDone = s5.writingDone[ida] && s5.writingDone[idb];
  const bothReviewDone  = s5.reviewDone[ida]  && s5.reviewDone[idb];
  if (bothReviewDone)  return <ResultsPhase  me={me} state={state} />;
  if (bothWritingDone) return <ReviewPhase   me={me} state={state} />;
  return <WritingPhase me={me} state={state} />;
}
