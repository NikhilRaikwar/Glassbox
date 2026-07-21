/**
 * Case 01 fixtures and model configuration.
 *
 * Everything in this file is fictional. These values are intentionally small
 * and inspectable so students can reproduce every result they see in Glassbox.
 */
export type Topic = "Robotics" | "Climate" | "Storytelling" | "Biology";
export type Availability = "Morning" | "Afternoon" | "Evening";
export type Skill = "Beginner" | "Growing" | "Advanced";
export type Collaboration = "Quiet" | "Collaborative" | "Independent";
export type CommuteZone = "A" | "B" | "C";
export type Accessibility = "Captions" | "Low-distraction" | "Standard";

export interface Profile {
  id: string;
  name: string;
  color: "coral" | "teal" | "cobalt" | "butter" | "lavender";
  topic: Topic;
  availability: Availability;
  skill: Skill;
  collab: Collaboration;
  zone: CommuteZone;
  a11y: Accessibility;
}

export const PROFILE_FIELDS = ["topic", "availability", "skill", "collab", "zone", "a11y"] as const;
export type ProfileField = (typeof PROFILE_FIELDS)[number];

export const FIELD_LABELS: Record<ProfileField, string> = {
  topic: "Topic interest",
  availability: "Availability",
  skill: "Skill level",
  collab: "Collaboration preference",
  zone: "Commute zone",
  a11y: "Accessibility setting",
};

export const FIELD_OPTIONS = {
  topic: ["Robotics", "Climate", "Storytelling", "Biology"] as const,
  availability: ["Morning", "Afternoon", "Evening"] as const,
  skill: ["Beginner", "Growing", "Advanced"] as const,
  collab: ["Quiet", "Collaborative", "Independent"] as const,
  zone: ["A", "B", "C"] as const,
  a11y: ["Captions", "Low-distraction", "Standard"] as const,
};

export const PROFILES: readonly Profile[] = [
  {
    id: "maya",
    name: "Maya",
    color: "coral",
    topic: "Robotics",
    availability: "Morning",
    skill: "Growing",
    collab: "Collaborative",
    zone: "A",
    a11y: "Standard",
  },
  {
    id: "isha",
    name: "Isha",
    color: "teal",
    topic: "Robotics",
    availability: "Morning",
    skill: "Growing",
    collab: "Collaborative",
    zone: "C",
    a11y: "Standard",
  },
  {
    id: "leo",
    name: "Leo",
    color: "cobalt",
    topic: "Climate",
    availability: "Afternoon",
    skill: "Advanced",
    collab: "Independent",
    zone: "B",
    a11y: "Low-distraction",
  },
  {
    id: "noor",
    name: "Noor",
    color: "butter",
    topic: "Storytelling",
    availability: "Evening",
    skill: "Beginner",
    collab: "Quiet",
    zone: "A",
    a11y: "Captions",
  },
  {
    id: "kai",
    name: "Kai",
    color: "lavender",
    topic: "Biology",
    availability: "Morning",
    skill: "Growing",
    collab: "Collaborative",
    zone: "B",
    a11y: "Standard",
  },
  {
    id: "priya",
    name: "Priya",
    color: "coral",
    topic: "Robotics",
    availability: "Evening",
    skill: "Advanced",
    collab: "Independent",
    zone: "C",
    a11y: "Low-distraction",
  },
  {
    id: "tomas",
    name: "Tomas",
    color: "teal",
    topic: "Climate",
    availability: "Afternoon",
    skill: "Growing",
    collab: "Collaborative",
    zone: "C",
    a11y: "Standard",
  },
  {
    id: "zuri",
    name: "Zuri",
    color: "cobalt",
    topic: "Storytelling",
    availability: "Morning",
    skill: "Advanced",
    collab: "Quiet",
    zone: "A",
    a11y: "Captions",
  },
] as const;

export const REFERENCE_PROFILE: Profile = PROFILES[0];
export const INITIAL_COMPARISON_PROFILE: Profile = PROFILES[1];

export type FactorId =
  | "topic-alignment"
  | "availability-fit"
  | "skill-fit"
  | "collaboration-fit"
  | "accessibility-fit"
  | "zone-penalty";

export type RepairSignalId = "topic-alignment" | "collaboration-fit";

export interface ModelFactor {
  id: FactorId;
  label: string;
  kind: "signal" | "proxy";
  description: string;
}

export interface ModelConfig {
  id: "study-match-v07" | "study-match-v08";
  version: "StudyMatch v0.7" | "StudyMatch v0.8";
  factors: readonly ModelFactor[];
  removedFactorIds: readonly FactorId[];
  addedFactorIds: readonly RepairSignalId[];
}

export const BASELINE_FACTORS: readonly ModelFactor[] = [
  {
    id: "topic-alignment",
    label: "Topic alignment",
    kind: "signal",
    description: "A stated learning interest.",
  },
  {
    id: "availability-fit",
    label: "Availability overlap",
    kind: "signal",
    description: "When a learner can meet.",
  },
  {
    id: "skill-fit",
    label: "Skill complement",
    kind: "signal",
    description: "A learning-level signal.",
  },
  {
    id: "zone-penalty",
    label: "Zone C penalty",
    kind: "proxy",
    description: "A location proxy unrelated to learning.",
  },
];

export const REPAIR_SIGNALS: readonly ModelFactor[] = [
  {
    id: "topic-alignment",
    label: "Stated topic alignment",
    kind: "signal",
    description: "A learner's actual study interest.",
  },
  {
    id: "collaboration-fit",
    label: "Requested collaboration style",
    kind: "signal",
    description: "How a learner prefers to work.",
  },
];

export const BASELINE_MODEL: ModelConfig = Object.freeze({
  id: "study-match-v07",
  version: "StudyMatch v0.7",
  factors: BASELINE_FACTORS,
  removedFactorIds: [],
  addedFactorIds: [],
});

/** Builds a new immutable configuration instead of mutating v0.7. */
export function createRepairedModel(addedFactorIds: readonly RepairSignalId[] = []): ModelConfig {
  const selected = REPAIR_SIGNALS.map((factor) => factor.id as RepairSignalId).filter((id) =>
    addedFactorIds.includes(id),
  );

  return Object.freeze({
    id: "study-match-v08",
    version: "StudyMatch v0.8",
    factors: Object.freeze([
      BASELINE_FACTORS[0],
      BASELINE_FACTORS[1],
      BASELINE_FACTORS[2],
      ...REPAIR_SIGNALS.filter((factor) => selected.includes(factor.id as RepairSignalId)),
    ]),
    removedFactorIds: Object.freeze(["zone-penalty"]),
    addedFactorIds: Object.freeze(selected),
  });
}

export interface EvaluationPair {
  id: string;
  left: Profile;
  right: Profile;
}

function pairedProfile(
  id: string,
  name: string,
  profile: Omit<Profile, "id" | "name" | "zone">,
  leftZone: CommuteZone,
  rightZone: CommuteZone,
): EvaluationPair {
  return {
    id,
    left: { ...profile, id: `${id}-left`, name, zone: leftZone },
    right: { ...profile, id: `${id}-right`, name: `${name} equivalent`, zone: rightZone },
  };
}

/** Eight equivalent-profile pairs make the repair check repeatable. */
export const EVALUATION_PAIRS: readonly EvaluationPair[] = [
  pairedProfile(
    "pair-01",
    "Maya",
    {
      color: "coral",
      topic: "Robotics",
      availability: "Morning",
      skill: "Growing",
      collab: "Collaborative",
      a11y: "Standard",
    },
    "A",
    "C",
  ),
  pairedProfile(
    "pair-02",
    "Rae",
    {
      color: "teal",
      topic: "Climate",
      availability: "Morning",
      skill: "Advanced",
      collab: "Quiet",
      a11y: "Captions",
    },
    "B",
    "C",
  ),
  pairedProfile(
    "pair-03",
    "Nia",
    {
      color: "cobalt",
      topic: "Storytelling",
      availability: "Afternoon",
      skill: "Beginner",
      collab: "Independent",
      a11y: "Low-distraction",
    },
    "A",
    "B",
  ),
  pairedProfile(
    "pair-04",
    "Omar",
    {
      color: "butter",
      topic: "Biology",
      availability: "Evening",
      skill: "Growing",
      collab: "Collaborative",
      a11y: "Standard",
    },
    "C",
    "A",
  ),
  pairedProfile(
    "pair-05",
    "Jules",
    {
      color: "lavender",
      topic: "Robotics",
      availability: "Morning",
      skill: "Advanced",
      collab: "Quiet",
      a11y: "Captions",
    },
    "B",
    "A",
  ),
  pairedProfile(
    "pair-06",
    "Sam",
    {
      color: "coral",
      topic: "Climate",
      availability: "Afternoon",
      skill: "Beginner",
      collab: "Independent",
      a11y: "Standard",
    },
    "C",
    "B",
  ),
  pairedProfile(
    "pair-07",
    "Ari",
    {
      color: "teal",
      topic: "Storytelling",
      availability: "Morning",
      skill: "Growing",
      collab: "Collaborative",
      a11y: "Low-distraction",
    },
    "A",
    "C",
  ),
  pairedProfile(
    "pair-08",
    "Bea",
    {
      color: "cobalt",
      topic: "Biology",
      availability: "Evening",
      skill: "Advanced",
      collab: "Quiet",
      a11y: "Captions",
    },
    "B",
    "A",
  ),
] as const;

export const PIP_HINTS = [
  "Change one thing at a time. Otherwise you cannot tell what caused the result.",
  "A confounded test can start a question, but it cannot isolate the cause.",
  "Pin receipts that let another detective repeat your comparison.",
] as const;
