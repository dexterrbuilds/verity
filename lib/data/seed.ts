import type { Category, Forecast, Forecaster, Insight, Market, ProbabilityPoint, Protocol } from "@/types";

export const categories: Category[] = [
  { id: "cat-sol", name: "Solana", slug: "solana", description: "Markets about Solana ecosystem growth and network activity." },
  { id: "cat-ai", name: "AI", slug: "ai", description: "AI products, agents, chips, and crypto AI adoption." },
  { id: "cat-defi", name: "DeFi", slug: "defi", description: "Liquidity, lending, derivatives, stablecoins, and yield markets." },
  { id: "cat-gov", name: "Governance", slug: "governance", description: "Protocol governance and coordination outcomes." },
  { id: "cat-macro", name: "Macro", slug: "macro", description: "Rates, liquidity, regulation, and broad market conditions." },
  { id: "cat-crypto", name: "Crypto", slug: "crypto", description: "Cross-chain adoption and major crypto ecosystem outcomes." },
  { id: "cat-infra", name: "Infrastructure", slug: "infrastructure", description: "Validators, data, wallets, payments, and developer tooling." }
];

export const protocols: Protocol[] = [
  { id: "proto-drift", name: "Drift Signals", slug: "drift-signals", logoUrl: "/protocols/drift.svg", websiteUrl: "https://example.com/drift-signals", description: "Demo-labelled venue for Solana and DeFi probability markets." },
  { id: "proto-meta", name: "MetaDAO Watch", slug: "metadao-watch", logoUrl: "/protocols/metadao.svg", websiteUrl: "https://example.com/metadao-watch", description: "Demo-labelled futarchy and governance market source." },
  { id: "proto-squads", name: "Squads Intel", slug: "squads-intel", logoUrl: "/protocols/squads.svg", websiteUrl: "https://example.com/squads-intel", description: "Demo-labelled coordination and treasury decision tracker." },
  { id: "proto-helium", name: "Helium Forecasts", slug: "helium-forecasts", logoUrl: "/protocols/helium.svg", websiteUrl: "https://example.com/helium-forecasts", description: "Demo-labelled infrastructure and DePIN market source." },
  { id: "proto-open", name: "Open Market Log", slug: "open-market-log", logoUrl: "/protocols/open.svg", websiteUrl: "https://example.com/open-market-log", description: "Demo-labelled public market import log." }
];

export const forecasters: Forecaster[] = [
  { id: "f1", slug: "nova-validator", displayName: "Nova Validator", walletAddress: "7NoVa...9kQp", xHandle: "@nova_valid", avatarUrl: "NV", bio: "Validator operator focused on Solana throughput, MEV, and infra adoption.", joinedAt: "2025-01-12", isVerified: true, strongestDomain: "Solana" },
  { id: "f2", slug: "mira-quant", displayName: "Mira Quant", walletAddress: "3MirA...2pLs", xHandle: "@mira_quant", avatarUrl: "MQ", bio: "Systematic forecaster covering AI, liquidity, and high-beta crypto narratives.", joinedAt: "2025-02-03", isVerified: true, strongestDomain: "AI" },
  { id: "f3", slug: "jito-scribe", displayName: "Jito Scribe", walletAddress: "8JiTo...4rFx", xHandle: "@jitoscribe", avatarUrl: "JS", bio: "Research analyst tracking Solana infrastructure and validator economics.", joinedAt: "2025-02-22", isVerified: false, strongestDomain: "Infrastructure" },
  { id: "f4", slug: "liquidity-lena", displayName: "Liquidity Lena", walletAddress: "4LenA...1zVp", xHandle: "@liquiditylena", avatarUrl: "LL", bio: "DeFi market structure analyst with a focus on liquidity migration.", joinedAt: "2025-03-08", isVerified: true, strongestDomain: "DeFi" },
  { id: "f5", slug: "oracle-ash", displayName: "Oracle Ash", walletAddress: "6AshX...0qBe", xHandle: "@oracle_ash", avatarUrl: "OA", bio: "Prediction calibration nerd tracking consensus drift and source quality.", joinedAt: "2025-03-18", isVerified: false, strongestDomain: "Governance" },
  { id: "f6", slug: "delta-kai", displayName: "Delta Kai", walletAddress: "5Ka1D...8hRt", xHandle: "@deltakai", avatarUrl: "DK", bio: "Macro-aware crypto forecaster focused on rates, flows, and risk appetite.", joinedAt: "2025-04-02", isVerified: false, strongestDomain: "Macro" },
  { id: "f7", slug: "spline-capital", displayName: "Spline Capital", walletAddress: "9SpLn...3bYu", xHandle: "@splinecap", avatarUrl: "SC", bio: "Small research desk publishing ensemble forecasts across crypto categories.", joinedAt: "2025-04-21", isVerified: true, strongestDomain: "Crypto" },
  { id: "f8", slug: "anchor-eve", displayName: "Anchor Eve", walletAddress: "2EvE9...7pNc", xHandle: "@anchor_eve", avatarUrl: "AE", bio: "Builder-operator tracking wallets, payments, and consumer crypto adoption.", joinedAt: "2025-05-01", isVerified: true, strongestDomain: "Infrastructure" },
  { id: "f9", slug: "calldata-cam", displayName: "Calldata Cam", walletAddress: "1CaM...6vXx", xHandle: "@calldatacam", avatarUrl: "CC", bio: "Protocol analyst focused on governance participation and treasury proposals.", joinedAt: "2025-05-16", isVerified: false, strongestDomain: "Governance" },
  { id: "f10", slug: "basis-rowan", displayName: "Basis Rowan", walletAddress: "4RowN...5tMm", xHandle: "@basisrowan", avatarUrl: "BR", bio: "Derivatives and basis trader documenting market regime forecasts.", joinedAt: "2025-06-04", isVerified: true, strongestDomain: "DeFi" },
  { id: "f11", slug: "tensor-ivy", displayName: "Tensor Ivy", walletAddress: "6IvY...4mQx", xHandle: "@tensorivy", avatarUrl: "TI", bio: "AI adoption researcher watching agent wallets and inference markets.", joinedAt: "2025-06-20", isVerified: false, strongestDomain: "AI" },
  { id: "f12", slug: "epoch-ryu", displayName: "Epoch Ryu", walletAddress: "3RyU...9vJc", xHandle: "@epochryu", avatarUrl: "ER", bio: "Cycles analyst with a bias toward transparent priors and postmortems.", joinedAt: "2025-07-02", isVerified: false, strongestDomain: "Crypto" },
  { id: "f13", slug: "mesa-labs", displayName: "Mesa Labs", walletAddress: "5MesA...1nKt", xHandle: "@mesalabs", avatarUrl: "ML", bio: "Research collective tracking DePIN and Solana infrastructure milestones.", joinedAt: "2025-07-19", isVerified: true, strongestDomain: "Infrastructure" },
  { id: "f14", slug: "civic-noor", displayName: "Civic Noor", walletAddress: "7NooR...8pZs", xHandle: "@civicnoor", avatarUrl: "CN", bio: "Governance forecaster focused on protocol legitimacy and voter behavior.", joinedAt: "2025-08-10", isVerified: false, strongestDomain: "Governance" },
  { id: "f15", slug: "risk-halo", displayName: "Risk Halo", walletAddress: "2HaLo...6qFb", xHandle: "@riskhalo", avatarUrl: "RH", bio: "Risk analyst tracking liquidation dynamics, stablecoins, and bridge flows.", joinedAt: "2025-09-05", isVerified: true, strongestDomain: "DeFi" }
];

const marketBlueprints = [
  ["firedancer-mainnet-q3", "Will Firedancer client adoption exceed 20% of Solana stake by Sep. 30, 2026?", "cat-sol", "proto-open", 64, 58, 1850000, 932, "2026-09-30", "active"],
  ["solana-daily-fees-10m", "Will Solana daily priority fees exceed $10M for three consecutive days in 2026?", "cat-sol", "proto-drift", 47, 41, 820000, 504, "2026-12-31", "active"],
  ["jito-stake-share-45", "Will Jito-connected validators represent more than 45% of active stake by year end?", "cat-infra", "proto-helium", 55, 61, 640000, 388, "2026-12-31", "active"],
  ["agent-wallets-1m", "Will AI agent-controlled wallets on Solana exceed 1M monthly active wallets?", "cat-ai", "proto-open", 39, 32, 760000, 441, "2026-11-30", "active"],
  ["depin-revenue-breakout", "Will a Solana DePIN protocol report over $25M quarterly real-world revenue?", "cat-infra", "proto-helium", 52, 48, 590000, 306, "2026-10-15", "active"],
  ["stablecoin-supply-20b", "Will Solana stablecoin supply exceed $20B before 2027?", "cat-defi", "proto-drift", 68, 63, 2100000, 1180, "2026-12-31", "active"],
  ["governance-turnout-30", "Will a major Solana governance vote exceed 30% eligible turnout in 2026?", "cat-gov", "proto-meta", 34, 37, 310000, 188, "2026-12-20", "active"],
  ["etf-flow-week", "Will crypto ETF net inflows exceed $5B in a single week before October?", "cat-macro", "proto-open", 44, 52, 1200000, 774, "2026-10-01", "active"],
  ["solana-mobile-250k", "Will Solana Mobile active device attestations exceed 250K by year end?", "cat-crypto", "proto-squads", 51, 45, 430000, 267, "2026-12-31", "active"],
  ["ai-inference-market", "Will an onchain AI inference market clear over $100M monthly volume?", "cat-ai", "proto-open", 29, 24, 360000, 211, "2026-12-31", "active"],
  ["defi-tvl-ath", "Will Solana DeFi TVL make a new cycle high before November 2026?", "cat-defi", "proto-drift", 72, 66, 1750000, 991, "2026-11-01", "active"],
  ["treasury-futarchy-pilot", "Will three Solana projects run public futarchy pilots in 2026?", "cat-gov", "proto-meta", 61, 54, 480000, 328, "2026-12-31", "active"],
  ["wallet-passkeys-majority", "Will passkey sign-in become the default for a top Solana wallet?", "cat-infra", "proto-squads", 57, 49, 520000, 350, "2026-09-15", "active"],
  ["memecoin-volume-share", "Will meme token DEX volume fall below 25% of Solana DEX volume for a full month?", "cat-crypto", "proto-drift", 36, 43, 680000, 529, "2026-12-31", "active"],
  ["fed-cut-two", "Will the Fed cut rates at least twice before Dec. 31, 2026?", "cat-macro", "proto-open", 58, 55, 1320000, 860, "2026-12-31", "active"],
  ["compressed-nft-revival", "Will compressed NFT mints exceed 50M in a single month?", "cat-sol", "proto-open", 42, 35, 270000, 198, "2026-11-30", "active"],
  ["solana-pay-retail", "Will a top-20 US retailer pilot Solana payments in 2026?", "cat-crypto", "proto-squads", 24, 19, 390000, 256, "2026-12-31", "active"],
  ["restaking-on-solana", "Will Solana restaking protocols exceed $3B TVL before 2027?", "cat-defi", "proto-drift", 49, 57, 880000, 603, "2026-12-31", "active"],
  ["validator-client-diversity", "Will non-Agave clients produce 30% of Solana blocks for a week?", "cat-infra", "proto-helium", 31, 26, 410000, 291, "2026-12-01", "active"],
  ["dao-treasury-swap", "Will a Solana DAO execute a treasury swap over $10M via tokenholder vote?", "cat-gov", "proto-meta", 46, 44, 240000, 159, "2026-10-30", "active"],
  ["resolved-blinks-q2", "Did Solana blinks exceed 5M weekly interactions by Jun. 30, 2026?", "cat-sol", "proto-open", 100, 62, 720000, 442, "2026-06-30", "resolved", "yes"],
  ["resolved-ai-hackathon", "Did a crypto AI hackathon draw more than 1,000 shipped projects in H1 2026?", "cat-ai", "proto-open", 0, 38, 260000, 184, "2026-06-30", "resolved", "no"],
  ["resolved-stablecoin-june", "Did Solana stablecoin transfer volume exceed $2T in June 2026?", "cat-defi", "proto-drift", 100, 71, 980000, 610, "2026-06-30", "resolved", "yes"],
  ["resolved-gov-quorum", "Did the spring governance quorum proposal pass?", "cat-gov", "proto-meta", 100, 64, 190000, 133, "2026-05-15", "resolved", "yes"],
  ["cancelled-bridge-market", "Will the demo bridge-risk market resolve from the original oracle source?", "cat-crypto", "proto-open", 50, 50, 120000, 88, "2026-04-18", "cancelled", null]
] as const;

export const markets: Market[] = marketBlueprints.map((item, index) => {
  const [slug, question, categoryId, protocolId, currentProbability, previousProbability, volume, participantCount, resolutionDate, resolutionStatus, outcome] = item;
  return {
    id: `m${index + 1}`,
    slug,
    question,
    categoryId,
    protocolId,
    currentProbability,
    previousProbability,
    volume,
    participantCount,
    resolutionDate,
    resolutionStatus,
    resolutionOutcome: outcome ?? null,
    description: `Demo-labelled market tracking whether: ${question.replace(/\?$/, ".")} Verity uses this market to evaluate forecaster direction, confidence, and calibration over time.`,
    sourceUrl: `https://example.com/markets/${slug}`,
    resolutionRules: "Resolves from the named source protocol or a documented public dataset. Cancelled markets are excluded from accuracy scoring.",
    createdAt: `2026-${String((index % 6) + 1).padStart(2, "0")}-08`,
    updatedAt: "2026-07-12"
  };
});

const reasons = [
  "Consensus is rising, but the base rate still argues for a moderated probability.",
  "Builder activity and liquidity depth make the upside case stronger than headline odds imply.",
  "The market is pricing narrative momentum more aggressively than verifiable adoption data.",
  "Recent public milestones increased confidence, though timing risk remains material.",
  "Comparable ecosystem rollouts suggest the current probability is slightly underpriced.",
  "Participation looks broad enough to matter, but resolution criteria remain strict."
];

function hash(input: string) {
  return Array.from(input).reduce((sum, char) => sum + char.charCodeAt(0), 0);
}

export const forecasts: Forecast[] = markets.flatMap((market, marketIndex) => {
  const category = categories.find((item) => item.id === market.categoryId)?.name ?? "Crypto";
  return forecasters.slice(0, 5 + (marketIndex % 4)).map((forecaster, forecasterIndex) => {
    const signal = hash(`${market.id}-${forecaster.id}`);
    const bias = forecaster.strongestDomain === category ? 8 : forecasterIndex % 2 === 0 ? 3 : -4;
    const predictedProbability = Math.max(7, Math.min(93, market.previousProbability + ((signal % 23) - 11) + bias));
    const confidence = Math.max(45, Math.min(94, 58 + (signal % 31) + (forecaster.strongestDomain === category ? 6 : 0)));
    const position = predictedProbability > 55 ? "yes" : predictedProbability < 45 ? "no" : "neutral";
    const isResolved = market.resolutionStatus === "resolved";
    const wasCorrect = isResolved ? (market.resolutionOutcome === "yes" ? predictedProbability >= 50 : predictedProbability < 50) : null;
    const generatedDate = `2026-${String(((marketIndex + forecasterIndex) % 6) + 1).padStart(2, "0")}-${String(((signal % 20) + 5)).padStart(2, "0")}`;
    const safeForecastDate = isResolved
      ? new Date(new Date(market.resolutionDate).getTime() - (30 + forecasterIndex) * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
      : generatedDate;
    return {
      id: `fc-${market.id}-${forecaster.id}`,
      forecasterId: forecaster.id,
      marketId: market.id,
      predictedProbability,
      confidence,
      position,
      reasoning: reasons[signal % reasons.length],
      forecastedAt: safeForecastDate,
      isResolved,
      wasCorrect,
      scoreImpact: isResolved ? (wasCorrect ? 1 + (confidence - 50) / 40 : -1 - (confidence - 50) / 45) : 0
    };
  });
});

export const probabilityHistory: ProbabilityPoint[] = markets
  .filter((market) => market.resolutionStatus !== "cancelled")
  .flatMap((market, marketIndex) =>
    Array.from({ length: 8 }).map((_, pointIndex) => {
      const progress = pointIndex / 7;
      const base = market.previousProbability + (market.currentProbability - market.previousProbability) * progress;
      const wave = Math.sin(pointIndex + marketIndex) * 3;
      return {
        id: `ph-${market.id}-${pointIndex}`,
        marketId: market.id,
        probability: Math.max(1, Math.min(99, Math.round(base + wave))),
        recordedAt: `2026-0${Math.min(7, pointIndex + 1)}-10`
      };
    })
  );

export const insights: Insight[] = [
  { id: "i1", title: "AI market conviction increased this week", body: "Tracked forecasters moved their weighted AI probability basket up by 6 points across active markets.", category: "AI", isFeatured: true, publishedAt: "2026-07-12" },
  { id: "i2", title: "Solana infrastructure has the highest participation", body: "Infrastructure markets average the largest tracked forecaster set in the current seed universe.", category: "Infrastructure", isFeatured: true, publishedAt: "2026-07-11" },
  { id: "i3", title: "Top-ranked forecasters are split on restaking", body: "High-score forecasters disagree on whether Solana restaking TVL clears the $3B threshold this year.", category: "DeFi", isFeatured: true, publishedAt: "2026-07-10" },
  { id: "i4", title: "Governance markets remain lower confidence", body: "Forecasters show wider dispersion on turnout and quorum questions than on infrastructure milestones.", category: "Governance", isFeatured: false, publishedAt: "2026-07-09" },
  { id: "i5", title: "Resolved calls improved calibration scores", body: "Recent resolved markets added enough sample size to dampen one-off lucky streaks.", category: "Methodology", isFeatured: false, publishedAt: "2026-07-08" }
];
