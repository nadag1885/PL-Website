// Tiny registry so any component can trigger the site's branded "Ask" page
// transition (the orange curtain sweep to /ask). That transition is owned by
// AskCampaignPopup, which is mounted globally in the root layout and persists
// across the route change. The popup registers its transition on mount; callers
// invoke runAskTransition(). Returns false when nothing is registered so the
// caller can fall back to a plain navigation.
let handler = null;

export function registerAskTransition(fn) {
  handler = fn;
  return () => {
    if (handler === fn) handler = null;
  };
}

export function runAskTransition() {
  if (typeof handler === "function") {
    handler();
    return true;
  }
  return false;
}
