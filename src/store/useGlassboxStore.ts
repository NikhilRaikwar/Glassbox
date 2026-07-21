import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  BASELINE_MODEL,
  INITIAL_COMPARISON_PROFILE,
  PROFILES,
  REFERENCE_PROFILE,
  createReceipt,
  type FactorId,
  type Profile,
  type RepairSignalId,
  type TestReceipt,
} from "@/features/case-engine";
import { mapFallbackCoach } from "@/features/evidence-coach/fallback";
import type { EvidenceCoachResponse } from "@/features/evidence-coach/types";

export interface HypothesisRecord {
  id: string;
  text: string;
  submittedAt: number;
  coach: EvidenceCoachResponse;
}

interface SessionState {
  credits: number;
  candidateA: Profile;
  candidateB: Profile;
  tests: readonly TestReceipt[];
  pinnedReceiptIds: string[];
  hypothesis: string;
  hypothesisAccepted: boolean;
  hypothesisHistory: HypothesisRecord[];
  latestCoachResponse: EvidenceCoachResponse | null;
  removedFactors: FactorId[];
  addedFactors: RepairSignalId[];
  repairRun: boolean;
  completed: boolean;
  onboarded: boolean;
  judgeDemo: boolean;
}

interface GlassboxActions {
  setCandidateB: (profile: Profile) => void;
  addTest: (receipt: TestReceipt) => void;
  pinReceipt: (id: string) => void;
  unpinReceipt: (id: string) => void;
  setHypothesis: (text: string) => void;
  recordCoachResponse: (response: EvidenceCoachResponse) => void;
  toggleRemove: (id: FactorId) => void;
  toggleAdd: (id: RepairSignalId) => void;
  markRepairRun: () => void;
  setOnboarded: (value: boolean) => void;
  loadJudgeDemo: () => void;
  resetDemo: () => void;
}

export type GlassboxState = SessionState & GlassboxActions;

function cloneProfile(profile: Profile): Profile {
  return { ...profile };
}

function initialSession(): SessionState {
  return {
    credits: 10,
    candidateA: cloneProfile(REFERENCE_PROFILE),
    candidateB: cloneProfile(INITIAL_COMPARISON_PROFILE),
    tests: [],
    pinnedReceiptIds: [],
    hypothesis: "",
    hypothesisAccepted: false,
    hypothesisHistory: [],
    latestCoachResponse: null,
    removedFactors: [],
    addedFactors: [],
    repairRun: false,
    completed: false,
    onboarded: false,
    judgeDemo: false,
  };
}

function coachReceipt(receipt: TestReceipt) {
  return {
    id: receipt.id,
    modelVersion: receipt.modelVersion,
    referenceScore: receipt.referenceScore,
    comparisonScore: receipt.comparisonScore,
    scoreDelta: receipt.scoreDelta,
    changedFields: [...receipt.changedFields],
    isControlled: receipt.isControlled,
  };
}

function buildJudgeDemoState(): SessionState {
  const now = Date.now();
  const maya = cloneProfile(REFERENCE_PROFILE);
  const mayaZoneC = { ...maya, id: "maya-zone-c", name: "Maya (Zone C)", zone: "C" as const };
  const climate = { ...PROFILES[2], id: "rae-zone-b", name: "Rae", zone: "B" as const };
  const climateZoneC = { ...climate, id: "rae-zone-c", name: "Rae (Zone C)", zone: "C" as const };
  const confounded = { ...mayaZoneC, id: "maya-zone-c-climate", topic: "Climate" as const };

  const receipts = [
    createReceipt({
      id: "demo-r01",
      createdAt: now - 180_000,
      reference: maya,
      comparison: mayaZoneC,
      model: BASELINE_MODEL,
    }),
    createReceipt({
      id: "demo-r02",
      createdAt: now - 120_000,
      reference: climate,
      comparison: climateZoneC,
      model: BASELINE_MODEL,
    }),
    createReceipt({
      id: "demo-r03",
      createdAt: now - 60_000,
      reference: maya,
      comparison: confounded,
      model: BASELINE_MODEL,
    }),
  ];
  const hypothesis =
    "StudyMatch treats students with a Zone C commute differently even when their learning profiles match.";
  const coach = {
    source: "fallback" as const,
    result: mapFallbackCoach({ receipts: receipts.slice(0, 2).map(coachReceipt), hypothesis }),
    notice: "Judge demo is preloaded with deterministic case evidence.",
  };

  return {
    credits: 10,
    candidateA: maya,
    candidateB: mayaZoneC,
    tests: receipts,
    pinnedReceiptIds: receipts.slice(0, 2).map((receipt) => receipt.id),
    hypothesis,
    hypothesisAccepted: true,
    hypothesisHistory: [
      { id: "demo-hypothesis", text: hypothesis, submittedAt: now - 30_000, coach },
    ],
    latestCoachResponse: coach,
    removedFactors: [],
    addedFactors: ["topic-alignment", "collaboration-fit"],
    repairRun: false,
    completed: false,
    onboarded: true,
    judgeDemo: true,
  };
}

export const useGlassboxStore = create<GlassboxState>()(
  persist(
    (set) => ({
      ...initialSession(),
      setCandidateB: (candidateB) => set({ candidateB }),
      addTest: (receipt) =>
        set((state) => ({
          tests: [...state.tests, receipt],
          credits: Math.max(0, state.credits - 1),
        })),
      pinReceipt: (id) =>
        set((state) =>
          state.pinnedReceiptIds.includes(id)
            ? state
            : { pinnedReceiptIds: [...state.pinnedReceiptIds, id] },
        ),
      unpinReceipt: (id) =>
        set((state) => ({
          pinnedReceiptIds: state.pinnedReceiptIds.filter((receiptId) => receiptId !== id),
        })),
      setHypothesis: (hypothesis) => set({ hypothesis }),
      recordCoachResponse: (coach) =>
        set((state) => ({
          latestCoachResponse: coach,
          hypothesisAccepted: coach.result.revealRepairAccess,
          hypothesisHistory: [
            ...state.hypothesisHistory,
            {
              id: `hyp-${Date.now().toString(36)}-${state.hypothesisHistory.length + 1}`,
              text: state.hypothesis,
              submittedAt: Date.now(),
              coach,
            },
          ],
        })),
      toggleRemove: (id) =>
        set((state) => ({
          removedFactors: state.removedFactors.includes(id)
            ? state.removedFactors.filter((factorId) => factorId !== id)
            : [...state.removedFactors, id],
        })),
      toggleAdd: (id) =>
        set((state) => ({
          addedFactors: state.addedFactors.includes(id)
            ? state.addedFactors.filter((factorId) => factorId !== id)
            : [...state.addedFactors, id],
        })),
      markRepairRun: () => set({ repairRun: true, completed: true }),
      setOnboarded: (onboarded) => set({ onboarded }),
      loadJudgeDemo: () => set(buildJudgeDemoState()),
      resetDemo: () => set(initialSession()),
    }),
    {
      name: "glassbox-case-01",
      version: 2,
      // The prior prototype persisted mutable mock records. A clean replay is safer
      // than trying to reinterpret an old score as an immutable engine receipt.
      migrate: () => initialSession(),
    },
  ),
);
