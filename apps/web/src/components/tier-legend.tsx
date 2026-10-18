const TIER_ORDER = ["D", "W", "L", "G"] as const;

const TIER_INFO: Record<(typeof TIER_ORDER)[number], { label: string; meaning: string; evidence: string }> = {
  D: {
    label: "Deep mastery",
    meaning: "Implement, diagnose, optimize, and defend it independently.",
    evidence: "Working code, tests, edge/failure analysis, a defended trade-off rationale.",
  },
  W: {
    label: "Working proficiency",
    meaning: "Deploy, integrate, operate, and diagnose a realistic system built on it.",
    evidence: "A running demo or environment, an operational test, failure/recovery notes.",
  },
  L: {
    label: "Architectural literacy",
    meaning: "Explain, compare, and review specialist systems you wouldn't build yourself.",
    evidence: "A comparative design memo or architecture review with risks and constraints.",
  },
  G: {
    label: "Leadership development",
    meaning: "Influence execution and improve engineering outcomes through others.",
    evidence: "A review packet, written decision, facilitation or coaching evidence.",
  },
};

export function TierLegend() {
  return (
    <details className="group rounded-lg border border-zinc-300 px-4 py-3 dark:border-zinc-700">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-2 text-sm font-medium text-zinc-700 marker:content-none dark:text-zinc-300">
        <span>What do these proficiency levels mean, and which to prioritize?</span>
        <span
          aria-hidden="true"
          className="shrink-0 text-zinc-400 transition-transform group-open:rotate-180 dark:text-zinc-500"
        >
          ▾
        </span>
      </summary>

      <dl className="mt-3 grid gap-4 sm:grid-cols-2">
        {TIER_ORDER.map((code) => {
          const info = TIER_INFO[code];
          return (
            <div key={code}>
              <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                {code} — {info.label}
              </dt>
              <dd className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">{info.meaning}</dd>
              <dd className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">
                Counts as done when you have: {info.evidence}
              </dd>
            </div>
          );
        })}
      </dl>

      <p className="mt-4 text-xs text-zinc-500 dark:text-zinc-500">
        This is <span className="font-medium">depth of mastery</span>, not difficulty or
        seniority — a topic can target Deep mastery and still be foundational. As a starting
        priority: get Deep mastery and Working proficiency topics solid first, since most
        Architectural literacy and Leadership topics assume those underlying systems are already
        familiar.
      </p>
    </details>
  );
}
