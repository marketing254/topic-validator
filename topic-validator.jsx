import { useState } from "react";

// ─── Domain Keyword Banks ────────────────────────────────────────────────────
// Used to detect what "subject area" a topic or set of takeaways belongs to,
// so we can flag when topic domain ≠ takeaway domain (misleading topic).

const DOMAINS = {
  digitalMarketing: {
    label: "Digital Marketing / SEO",
    keywords: [
      // Technical SEO terms
      "seo","search engine","optimization","digital marketing","social media",
      "content marketing","email marketing","ppc","pay per click","paid ads",
      "organic","traffic","keywords","keyword","ranking","rankings","google",
      "facebook","instagram","linkedin","twitter","tiktok","website","backlinks",
      "link building","analytics","campaign","campaigns","conversion","funnel",
      "leads","lead generation","audience","impressions","clicks","ctr","cpc",
      "roas","ad spend","meta ads","google ads","blogging","blog","seo audit",
      "domain authority","page speed","serp","search results","on-page","off-page",
      "local seo","email list","open rate","landing page","a/b test",
      "engagement","reach","followers","subscribers","digital strategy","roadmap",
      "google business","google my business","gmb","yelp","directory","directories",
      "reviews","reputation","online reputation","star rating","citations",
      // Natural language / plain-English SEO phrases
      "get found","get found online","found online","found first","show up",
      "show up online","show up first","appear first","appear online",
      "stand out","stand out online","online visibility","visibility online",
      "online presence","be seen","be visible","attract clients online",
      "attract patients online","searchable","search","local search",
      "your city","your area","near me","nearby","local business",
      "local marketing","local visibility","local exposure","local audience",
      "online reviews","grow online","build online","digital presence",
      "be discovered","get discovered","found by","find you","find us",
      "more visible","more exposure","more traffic","more clicks",
      "marketing strategy","marketing roadmap","marketing plan","online strategy"
    ]
  },
  practiceBuilding: {
    label: "Practice Building / Business Growth",
    keywords: [
      "patient","patients","practice","clinic","referral","referrals","billing",
      "revenue","collections","insurance","reimbursement","compliance","hipaa",
      "staff","staffing","burnout","overhead","profitability","cash flow","coding",
      "denial","denials","prior authorization","credentialing","scheduling",
      "telehealth","ehr","emr","medicare","medicaid","malpractice","growth",
      "practice owner","doctor","physician","nurse","dental","dentist","therapy",
      "therapist","payer","payers","write-off","patient retention","patient satisfaction"
    ]
  },
  legalPractice: {
    label: "Legal Practice / Law Firm",
    keywords: [
      "legal","law","attorney","lawyer","lawyers","counsel","litigation","firm",
      "client","clients","billable","billable hours","contingency","retainer",
      "settlement","discovery","deposition","verdict","bar","ethics","case",
      "cases","contract","statute","malpractice","compliance","regulation",
      "liability","paralegal","partner","associate","docket","legaltech"
    ]
  },
  finance: {
    label: "Finance / Accounting",
    keywords: [
      "tax","taxes","accounting","bookkeeping","investment","portfolio","roi",
      "retirement","401k","wealth","financial planning","cash flow","payroll",
      "expense","expenses","deduction","deductions","irs","audit","balance sheet",
      "profit","loss","income","budget","budgeting","forecast","cpa","cfo"
    ]
  },
  hrOperations: {
    label: "HR / Operations",
    keywords: [
      "hiring","recruitment","onboarding","employee","employees","team","culture",
      "retention","turnover","performance review","hr","human resources","workflow",
      "process","efficiency","systems","automation","operations","policy","policies",
      "payroll","benefits","compensation","job description","interview","offboarding"
    ]
  },
  leadershipStrategy: {
    label: "Leadership / Strategy",
    keywords: [
      "leadership","strategy","vision","mission","goals","okr","kpi","executive",
      "management","decision making","culture","innovation","change management",
      "team building","communication","delegation","accountability","mentorship",
      "coaching","entrepreneur","founder","ceo","coo","cto","scaling"
    ]
  }
};

// ─── Other Keyword Banks ─────────────────────────────────────────────────────

const HEALTHCARE_DOMAIN = new Set([
  "patient","patients","practice","clinical","billing","revenue","compliance",
  "hipaa","ehr","medical","healthcare","health","physician","doctor","nurse",
  "staff","insurance","reimbursement","malpractice","medicare","medicaid",
  "telehealth","telemedicine","burnout","administration","regulations","audit",
  "collections","coding","icd","cpt","growth","profitability","overhead",
  "staffing","recruitment","outcomes","quality","clinic","hospital","dental",
  "dentist","therapy","therapist","care","provider","providers","referral",
  "referrals","payer","payers","denial","denials","credentialing","scheduling"
]);

const LAW_DOMAIN = new Set([
  "legal","law","attorney","lawyers","lawyer","counsel","litigation","firm",
  "practice","client","clients","case","cases","billing","billable","contingency",
  "retainer","compliance","regulation","liability","malpractice","discovery",
  "deposition","settlement","verdict","bar","ethics","revenue","profitability",
  "growth","efficiency","technology","automation","workflow","marketing",
  "referrals","contract","jurisdiction","statute","partner","associate",
  "paralegal","docket","legaltech"
]);

const HEALTHCARE_PAIN_POINTS = [
  "revenue","billing","collections","denial","denials","overhead","burnout",
  "compliance","hipaa","regulations","insurance","reimbursement","patient retention",
  "growth","profitability","efficiency","telehealth","documentation","staffing",
  "hiring","audit","malpractice","cash flow","coding","prior authorization",
  "credentialing","patient satisfaction","scheduling","no-show","payer","write-off"
];

const LAW_PAIN_POINTS = [
  "billing","collections","client","revenue","profitability","efficiency",
  "technology","automation","marketing","referrals","compliance","liability",
  "staffing","overhead","growth","billable hours","case management","retainer",
  "malpractice","client intake","business development","legal tech","fee","fees",
  "write-off","trust accounting","conflicts","client communication"
];

const POWER_WORDS = [
  "maximize","boost","transform","reduce","increase","protect","save","grow",
  "avoid","eliminate","unlock","master","discover","proven","essential",
  "critical","ultimate","complete","stop","start","recover","retain","attract",
  "win","fix","solve","double","triple","launch","accelerate","simplify"
];

const VAGUE_WORDS = [
  "things","stuff","various","general","overview","introduction","basics",
  "aspects","areas","issues","topics","discussion","talk","presentation","concepts"
];

const ACTION_VERBS = [
  "learn","discover","understand","implement","apply","identify","avoid","build",
  "create","develop","use","leverage","maximize","reduce","improve","achieve",
  "gain","master","unlock","find","calculate","measure","track","navigate",
  "design","establish","prevent","protect","grow","attract","retain","recover",
  "streamline","optimize","automate","evaluate","assess","deploy","launch"
];

// ─── Utility ──────────────────────────────────────────────────────────────────

function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[''""]/g, "")
    .split(/[\s,.\-?!;:()/\n]+/)
    .filter(w => w.length > 2);
}

// Detect the primary "domain" of a block of text using the DOMAINS keyword banks.
// Returns { domain: key, label: string, score: number } for top match.
function detectDomain(text) {
  const lower = text.toLowerCase();
  let best = { domain: "general", label: "General / Unspecified", score: 0 };
  for (const [key, { label, keywords }] of Object.entries(DOMAINS)) {
    const hits = keywords.filter(kw => lower.includes(kw)).length;
    if (hits > best.score) {
      best = { domain: key, label, score: hits };
    }
  }
  return best;
}

// ─── Analysis Functions ───────────────────────────────────────────────────────

function analyzeTopicClarity(topic) {
  const words = topic.trim().split(/\s+/);
  const lower = topic.toLowerCase();
  let score = 55;
  const feedback = [];

  if (words.length < 3) {
    score -= 20;
    feedback.push("Topic is too short — add more specificity so attendees know exactly what they'll get.");
  } else if (words.length <= 10) {
    score += 12;
    feedback.push("Good length — concise and focused.");
  } else if (words.length <= 14) {
    score += 5;
  } else {
    score -= 8;
    feedback.push("Topic is quite long — consider tightening it to under 12 words for impact.");
  }

  const foundPower = POWER_WORDS.filter(w => lower.includes(w));
  if (foundPower.length > 0) {
    score += 15;
    feedback.push(`Strong action language ("${foundPower[0]}") — builds urgency and appeal.`);
  } else {
    feedback.push("Consider adding a power word (e.g. Reduce, Recover, Protect, Maximize) to sharpen the hook.");
  }

  const foundVague = VAGUE_WORDS.filter(w => lower.includes(w));
  if (foundVague.length > 0) {
    score -= foundVague.length * 8;
    feedback.push(`"${foundVague[0]}" is vague — replace with something concrete and specific.`);
  }

  if (/\d/.test(topic)) {
    score += 10;
    feedback.push("Including a number (e.g. '3 ways to...') adds clarity and sets expectations.");
  }

  if (topic.includes("?")) {
    score += 5;
    feedback.push("Question-style topics spark curiosity — effective for drawing in audiences.");
  }

  if (topic.includes(":") || topic.includes(" — ") || topic.includes(" - ")) {
    score += 5;
    feedback.push("Two-part structure (Main Title: Subtitle) gives both hook and clarity.");
  }

  return { score: Math.min(100, Math.max(5, score)), feedback };
}

function analyzeAlignment(topic, takeaways) {
  let score = 30;
  const feedback = [];
  const isMisleading = { detected: false, topicDomain: null, takeawayDomain: null };

  if (takeaways.length === 0) {
    return { score: 0, feedback: ["No takeaways entered — add at least 3 to evaluate alignment."], isMisleading };
  }

  // ── Domain mismatch detection ─────────────────────────────────────────────
  const topicDomain = detectDomain(topic);
  const allTakeawayText = takeaways.join(" ");
  const takeawayDomain = detectDomain(allTakeawayText);

  const differentDomains =
    topicDomain.domain !== "general" &&
    takeawayDomain.domain !== "general" &&
    topicDomain.domain !== takeawayDomain.domain;

  if (differentDomains) {
    score -= 35;
    isMisleading.detected = true;
    isMisleading.topicDomain = topicDomain.label;
    isMisleading.takeawayDomain = takeawayDomain.label;
    feedback.push(
      `⚠️ Domain mismatch: your topic is categorised as "${topicDomain.label}" but your takeaways read as "${takeawayDomain.label}". Attendees registering for the topic will feel misled by the content.`
    );
  } else if (topicDomain.domain !== "general" && topicDomain.domain === takeawayDomain.domain) {
    score += 15;
    feedback.push(`Topic and takeaways are in the same domain (${topicDomain.label}) — good thematic consistency.`);
  }

  // ── Keyword overlap ───────────────────────────────────────────────────────
  const topicTokens = new Set(tokenize(topic).filter(t => t.length > 3));
  const takeawayTokens = tokenize(allTakeawayText);

  const overlapping = [...topicTokens].filter(t => takeawayTokens.includes(t));
  const overlapRatio = topicTokens.size > 0 ? overlapping.length / topicTokens.size : 0;

  if (overlapRatio >= 0.4) {
    score += 22;
    feedback.push("Takeaways closely mirror the topic's language — attendees won't feel misled.");
  } else if (overlapRatio >= 0.2) {
    score += 10;
    feedback.push("Moderate word overlap — the connection is there but could be stronger.");
  } else if (overlapRatio >= 0.05) {
    score -= 10;
    feedback.push("Low word overlap between topic and takeaways — the content may not deliver what the title promises.");
  } else {
    score -= 25;
    if (!differentDomains) {
      // Only add this if domain mismatch didn't already flag it
      feedback.push("⚠️ Near-zero keyword overlap — the takeaways appear disconnected from the topic title. This is a misleading topic signal.");
      isMisleading.detected = true;
    }
  }

  // ── Takeaway count ────────────────────────────────────────────────────────
  if (takeaways.length < 3) {
    score -= 10;
    feedback.push("Add at least 3 takeaways — too few makes the session feel lightweight.");
  } else if (takeaways.length <= 7) {
    score += 12;
  } else {
    score -= 5;
    feedback.push("More than 7 takeaways can dilute focus — consider trimming.");
  }

  // ── Action verbs ──────────────────────────────────────────────────────────
  const withAction = takeaways.filter(t =>
    ACTION_VERBS.some(v =>
      t.toLowerCase().startsWith(v) || new RegExp(`\\b${v}\\b`).test(t.toLowerCase())
    )
  ).length;

  if (withAction >= Math.ceil(takeaways.length * 0.6)) {
    score += 10;
    feedback.push("Most takeaways use action verbs — attendees will clearly see the value.");
  } else if (withAction > 0) {
    score += 4;
    feedback.push(`${withAction} of ${takeaways.length} takeaways use action verbs — try starting each with one (e.g. "Learn...", "Identify...", "Avoid...").`);
  } else {
    feedback.push("None of the takeaways use action verbs — add them to make the value clear.");
  }

  // ── Specificity ───────────────────────────────────────────────────────────
  const specificCount = takeaways.filter(t => /\d/.test(t) || /[A-Z][a-z]/.test(t)).length;
  if (specificCount >= 2) {
    score += 6;
    feedback.push("Some takeaways include specific details or numbers — this builds credibility.");
  }

  return {
    score: Math.min(100, Math.max(5, score)),
    feedback,
    isMisleading
  };
}

function analyzeEagerness(topic, takeaways, audience) {
  const allText = (topic + " " + takeaways.join(" ")).toLowerCase();
  const painPoints = audience === "healthcare" ? HEALTHCARE_PAIN_POINTS : LAW_PAIN_POINTS;
  const audienceLabel = audience === "healthcare"
    ? "healthcare practice owners"
    : "lawyers and law practice owners";

  let score = 20;
  const feedback = [];

  const matches = painPoints.filter(p => allText.includes(p.toLowerCase()));

  if (matches.length === 0) {
    feedback.push(`No core pain points for ${audienceLabel} detected. Try weaving in: ${painPoints.slice(0, 3).join(", ")}.`);
  } else if (matches.length === 1) {
    score += 20;
    feedback.push(`Touches on 1 key pain point (${matches[0]}) — hook is there but could be stronger.`);
  } else if (matches.length <= 3) {
    score += 40;
    feedback.push(`Addresses ${matches.length} pain points (${matches.join(", ")}) — this should resonate well.`);
  } else {
    score += 55;
    feedback.push(`Strong pain point coverage: ${matches.slice(0, 4).join(", ")}${matches.length > 4 ? " and more" : ""} — high audience enthusiasm likely.`);
  }

  const problemWords = ["challenge","problem","issue","struggle","risk","avoid","prevent","protect","mistake","pitfall","error","cost","costly","losing","penalty"];
  const solutionWords = ["how to","steps","strategy","strategies","tips","ways","guide","framework","system","approach","playbook","blueprint","formula","roadmap","plan"];

  const hasProblem = problemWords.some(w => allText.includes(w));
  const hasSolution = solutionWords.some(w => allText.includes(w));

  if (hasProblem && hasSolution) {
    score += 12;
    feedback.push("Problem + solution framing — your audience will feel understood AND hopeful.");
  } else if (hasSolution) {
    score += 6;
    feedback.push("Solution-focused framing is good. Adding a problem angle increases urgency.");
  } else if (hasProblem) {
    score += 6;
    feedback.push("Problem framing creates urgency. Make sure takeaways clearly position you as the solution.");
  } else {
    feedback.push("Frame around a problem your audience faces — it dramatically increases registration intent.");
  }

  const roiWords = ["revenue","profit","cost","fee","fees","income","savings","roi","return","money","financial","cash","billing","collection","pay","paid"];
  if (roiWords.some(w => allText.includes(w))) {
    score += 8;
    feedback.push("Financial framing (revenue, cost, billing) is a top motivator for practice and firm owners.");
  }

  return { score: Math.min(100, Math.max(5, score)), feedback };
}

function analyzeAudienceAlignment(topic, audience) {
  const tokens = tokenize(topic);
  const domainSet = audience === "healthcare" ? HEALTHCARE_DOMAIN : LAW_DOMAIN;
  const matches = tokens.filter(t => domainSet.has(t));

  if (matches.length === 0) {
    return {
      aligned: false,
      message: `No ${audience === "healthcare" ? "healthcare" : "legal"} industry terms found in the topic title. It reads as industry-agnostic — add a vertical-specific word to signal relevance immediately to your target audience.`
    };
  } else if (matches.length === 1) {
    return {
      aligned: true,
      message: `Weakly aligned — only 1 industry term detected ("${matches[0]}"). Making the ${audience === "healthcare" ? "practice/healthcare" : "law firm/legal"} angle more prominent will strengthen the draw.`
    };
  } else {
    return {
      aligned: true,
      message: `Well-aligned for ${audience === "healthcare" ? "healthcare practice owners" : "lawyers and law practice owners"} — the industry angle is clear from the title.`
    };
  }
}

// ─── Score Card Component ─────────────────────────────────────────────────────

function ScoreCard({ label, score, feedback, icon }) {
  const tier = score >= 75 ? "green" : score >= 50 ? "yellow" : "red";
  const styles = {
    green: { wrap: "bg-emerald-50 border-emerald-200", score: "text-emerald-600", bar: "bg-emerald-500", dot: "bg-emerald-400" },
    yellow: { wrap: "bg-amber-50 border-amber-200", score: "text-amber-600", bar: "bg-amber-400", dot: "bg-amber-400" },
    red: { wrap: "bg-red-50 border-red-200", score: "text-red-600", bar: "bg-red-400", dot: "bg-red-400" }
  }[tier];
  const label2 = score >= 75 ? "Strong" : score >= 50 ? "Moderate" : "Needs Work";

  return (
    <div className={`rounded-2xl border-2 ${styles.wrap} p-5`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{icon}</span>
          <div>
            <p className="text-sm font-bold text-gray-800">{label}</p>
            <p className={`text-xs font-semibold ${styles.score}`}>{label2}</p>
          </div>
        </div>
        <span className={`text-3xl font-black ${styles.score}`}>{score}</span>
      </div>
      <div className="w-full bg-white rounded-full h-2 mb-4 overflow-hidden border border-gray-100">
        <div className={`${styles.bar} h-2 rounded-full`} style={{ width: `${score}%`, transition: "width 0.8s ease" }} />
      </div>
      <ul className="space-y-2">
        {feedback.map((f, i) => (
          <li key={i} className="flex items-start gap-2 text-xs text-gray-600 leading-relaxed">
            <span className={`w-1.5 h-1.5 rounded-full ${styles.dot} mt-1.5 shrink-0`} />
            <span>{f}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────

export default function TopicValidator() {
  const [topic, setTopic] = useState("");
  const [takeawayInput, setTakeawayInput] = useState("");
  const [audience, setAudience] = useState("");
  const [result, setResult] = useState(null);

  const takeaways = takeawayInput.split("\n").map(t => t.trim()).filter(t => t.length > 0);
  const canAnalyze = topic.trim().length > 3 && takeaways.length > 0 && audience !== "";

  function analyze() {
    const clarity = analyzeTopicClarity(topic);
    const alignmentResult = analyzeAlignment(topic, takeaways);
    const eagerness = analyzeEagerness(topic, takeaways, audience);
    const audienceAlign = analyzeAudienceAlignment(topic, audience);
    const overall = Math.round((clarity.score + alignmentResult.score + eagerness.score) / 3);
    setResult({ clarity, alignment: alignmentResult, eagerness, audienceAlign, overall, topic, takeaways, audience });
  }

  function reset() {
    setTopic(""); setTakeawayInput(""); setAudience(""); setResult(null);
  }

  // ── RESULTS VIEW ──────────────────────────────────────────────────────────
  if (result) {
    const { overall, clarity, alignment, eagerness, audienceAlign } = result;
    const overallTier = overall >= 75 ? "green" : overall >= 50 ? "yellow" : "red";
    const overallLabel = overall >= 75 ? "Strong Topic" : overall >= 50 ? "Needs Refinement" : "Significant Issues";
    const overallGradient = {
      green: "from-emerald-500 to-teal-500",
      yellow: "from-amber-400 to-orange-400",
      red: "from-red-500 to-rose-500"
    }[overallTier];
    const audienceLabel = result.audience === "healthcare" ? "Healthcare Practice Owners" : "Lawyers & Law Practice Owners";

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 to-indigo-100 p-4 pb-16">
        <div className="max-w-xl mx-auto space-y-4 pt-6">

          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold">Topic Validator</p>
              <h1 className="text-lg font-black text-gray-900">Analysis Results</h1>
            </div>
            <button onClick={reset} className="text-xs text-indigo-600 font-semibold bg-white border border-indigo-200 px-3 py-1.5 rounded-full hover:bg-indigo-50 transition-all">
              ← New Topic
            </button>
          </div>

          {/* Overall Score */}
          <div className={`rounded-2xl bg-gradient-to-br ${overallGradient} p-6 text-white text-center shadow-md`}>
            <p className="text-sm font-medium opacity-80 mb-1">Overall Score</p>
            <p className="text-7xl font-black mb-1">{overall}</p>
            <p className="text-lg font-bold">{overallLabel}</p>
            <p className="text-xs opacity-70 mt-2">Clarity · Alignment · Audience Appeal</p>
          </div>

          {/* ⚠️ MISLEADING TOPIC BANNER — shown prominently when detected */}
          {alignment.isMisleading?.detected && (
            <div className="rounded-2xl border-2 border-red-300 bg-red-50 px-5 py-4 shadow-sm">
              <div className="flex items-start gap-3">
                <span className="text-2xl shrink-0">🚨</span>
                <div>
                  <p className="text-sm font-black text-red-800 mb-1">Misleading Topic Detected</p>
                  <p className="text-xs text-red-700 leading-relaxed">
                    Your topic signals <strong>{alignment.isMisleading.topicDomain}</strong> content, but your takeaways are about <strong>{alignment.isMisleading.takeawayDomain}</strong>. Attendees will register expecting one thing and receive another — this erodes trust and reduces return attendance.
                  </p>
                  <div className="mt-3 bg-white rounded-xl border border-red-200 px-3 py-2.5 space-y-1">
                    <p className="text-[11px] font-bold text-red-600 uppercase tracking-wide">How to fix this</p>
                    <p className="text-xs text-red-700">
                      Either <strong>rewrite the topic title</strong> to reflect what the takeaways actually cover, or <strong>rewrite the takeaways</strong> to deliver on what the topic promises.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Reviewed Topic */}
          <div className="bg-white rounded-2xl border border-gray-100 px-5 py-4 shadow-sm">
            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-1">Reviewed Topic</p>
            <p className="text-gray-900 font-bold text-sm leading-snug">"{result.topic}"</p>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className="inline-flex items-center gap-1 text-[11px] text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full font-medium">
                {result.audience === "healthcare" ? "🏥" : "⚖️"} {audienceLabel}
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] text-gray-500 bg-gray-50 px-2.5 py-1 rounded-full font-medium">
                📋 {result.takeaways.length} Takeaway{result.takeaways.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>

          {/* Audience Alignment Banner */}
          <div className={`rounded-2xl px-5 py-4 flex items-start gap-3 border-2 ${audienceAlign.aligned ? "bg-blue-50 border-blue-200" : "bg-orange-50 border-orange-200"}`}>
            <span className="text-2xl mt-0.5 shrink-0">{audienceAlign.aligned ? "✅" : "⚠️"}</span>
            <div>
              <p className={`text-sm font-bold ${audienceAlign.aligned ? "text-blue-800" : "text-orange-800"}`}>
                {audienceAlign.aligned ? "Audience Alignment Detected" : "Audience Alignment Concern"}
              </p>
              <p className={`text-xs mt-1 leading-relaxed ${audienceAlign.aligned ? "text-blue-600" : "text-orange-700"}`}>
                {audienceAlign.message}
              </p>
            </div>
          </div>

          {/* Score Cards */}
          <ScoreCard label="Topic Clarity" score={clarity.score} feedback={clarity.feedback} icon="🎯" />
          <ScoreCard label="Takeaway Alignment" score={alignment.score} feedback={alignment.feedback} icon="🔗" />
          <ScoreCard label="Audience Eagerness" score={eagerness.score} feedback={eagerness.feedback} icon="🔥" />

          {/* Takeaways Review */}
          <div className="bg-white rounded-2xl border border-gray-100 px-5 py-4 shadow-sm">
            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-3">Your Takeaways</p>
            <ol className="space-y-2">
              {result.takeaways.map((t, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-gray-700">
                  <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                  <span className="leading-snug">{t}</span>
                </li>
              ))}
            </ol>
          </div>

          <button onClick={reset} className="w-full py-3 rounded-2xl font-bold text-sm bg-white border-2 border-gray-200 text-gray-600 hover:bg-gray-50 transition-all shadow-sm">
            ← Analyze Another Topic
          </button>

        </div>
      </div>
    );
  }

  // ── INPUT VIEW ────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-indigo-100 p-4 pb-16">
      <div className="max-w-xl mx-auto pt-6">

        <div className="text-center mb-7">
          <div className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-1.5 rounded-full text-xs font-bold mb-4 shadow-sm">
            <span>📋</span> Event Topic Validator
          </div>
          <h1 className="text-3xl font-black text-gray-900 leading-tight mb-2">
            Is Your Topic<br />Actually Landing?
          </h1>
          <p className="text-gray-500 text-sm max-w-sm mx-auto leading-relaxed">
            Validate clarity, takeaway alignment, and audience appeal — before you promote your next event.
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 space-y-6">

          {/* Step 1 — Audience */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[11px] font-bold flex items-center justify-center">1</span>
              <p className="text-sm font-bold text-gray-800">Who is this event for?</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: "healthcare", label: "Healthcare Practice Owners", emoji: "🏥", desc: "Doctors, dentists, clinic owners" },
                { id: "law", label: "Lawyers & Law Practice Owners", emoji: "⚖️", desc: "Attorneys, partners, firm owners" }
              ].map(({ id, label, emoji, desc }) => (
                <button
                  key={id}
                  onClick={() => setAudience(id)}
                  className={`p-4 rounded-2xl border-2 text-left transition-all ${audience === id ? "border-indigo-500 bg-indigo-50 shadow-sm" : "border-gray-200 hover:border-indigo-300 bg-white hover:bg-indigo-50/30"}`}
                >
                  <div className="text-2xl mb-1.5">{emoji}</div>
                  <div className={`text-xs font-bold leading-snug ${audience === id ? "text-indigo-700" : "text-gray-700"}`}>{label}</div>
                  <div className="text-[11px] text-gray-400 mt-0.5">{desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Step 2 — Topic */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[11px] font-bold flex items-center justify-center">2</span>
              <div>
                <p className="text-sm font-bold text-gray-800">What is the event topic?</p>
                <p className="text-[11px] text-gray-400">Your session or webinar title</p>
              </div>
            </div>
            <input
              type="text"
              value={topic}
              onChange={e => setTopic(e.target.value)}
              placeholder={audience === "law" ? "e.g. How to Stop Leaving Money on the Table with Your Billing Process" : "e.g. How to Reduce Insurance Denials and Recover More Revenue"}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent transition-all"
            />
            {topic.trim().length > 0 && (
              <p className="text-[11px] text-gray-400 mt-1.5 ml-1">{topic.trim().split(/\s+/).length} words</p>
            )}
          </div>

          {/* Step 3 — Takeaways */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[11px] font-bold flex items-center justify-center">3</span>
              <div>
                <p className="text-sm font-bold text-gray-800">What are the key takeaways?</p>
                <p className="text-[11px] text-gray-400">One per line — aim for 3 to 7</p>
              </div>
            </div>
            <textarea
              value={takeawayInput}
              onChange={e => setTakeawayInput(e.target.value)}
              placeholder={audience === "law"
                ? "Identify the top billing mistakes law firms make\nLearn how to implement a collections follow-up system\nDiscover how to increase client retention"
                : "Identify the top 3 reasons claims get denied\nLearn how to implement a denial tracking system\nDiscover scripts for successful insurance appeals"}
              rows={6}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent resize-none transition-all leading-relaxed"
            />
            {takeaways.length > 0 && (
              <div className="flex items-center gap-1.5 mt-1.5 ml-1">
                {[...Array(Math.min(7, takeaways.length))].map((_, i) => (
                  <span key={i} className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                ))}
                {takeaways.length > 7 && <span className="text-[11px] text-orange-400 font-medium">+{takeaways.length - 7} more</span>}
                <span className="text-[11px] text-gray-400 ml-0.5">{takeaways.length} takeaway{takeaways.length !== 1 ? "s" : ""}</span>
              </div>
            )}
          </div>

          <button
            onClick={analyze}
            disabled={!canAnalyze}
            className={`w-full py-4 rounded-2xl font-black text-sm transition-all ${canAnalyze ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:shadow-lg active:scale-95" : "bg-gray-100 text-gray-400 cursor-not-allowed"}`}
          >
            {canAnalyze ? "Analyze Topic →" : "Complete all fields above to continue"}
          </button>
        </div>

        <p className="text-center text-[11px] text-gray-400 mt-5">Built for healthcare &amp; law event content teams</p>
      </div>
    </div>
  );
}
