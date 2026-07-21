import type { ModelConfig, Profile } from "./case-config";

export interface ScoreResult {
  score: number;
  recommended: boolean;
  contributions: Readonly<Record<string, number>>;
}

const V07_TOPIC = { Robotics: 6, Climate: 4, Storytelling: 3, Biology: 5 } as const;
const V07_AVAILABILITY = { Morning: 5, Afternoon: 3, Evening: 2 } as const;
const V07_SKILL = { Beginner: 3, Growing: 4, Advanced: 5 } as const;
const V07_COLLAB = { Quiet: 2, Collaborative: 3, Independent: 1 } as const;
const V07_A11Y = { Captions: 2, "Low-distraction": 2, Standard: 2 } as const;

const V08_AVAILABILITY = { Morning: 8, Afternoon: 6, Evening: 5 } as const;
const V08_SKILL = { Beginner: 6, Growing: 7, Advanced: 7 } as const;
const V08_A11Y = { Captions: 5, "Low-distraction": 5, Standard: 5 } as const;
const V08_TOPIC = { Robotics: 15, Climate: 13, Storytelling: 12, Biology: 14 } as const;
const V08_COLLAB = { Quiet: 9, Collaborative: 9, Independent: 8 } as const;

function clampScore(value: number) {
  return Math.max(0, Math.min(100, value));
}

/**
 * The source of truth for every score shown in Case 01.
 * v0.7 deliberately contains a Zone C proxy; v0.8 never reads `profile.zone`.
 */
export function scoreProfile(profile: Profile, model: ModelConfig): ScoreResult {
  if (model.id === "study-match-v07") {
    const contributions: Record<string, number> = {
      base: 66,
      "topic-alignment": V07_TOPIC[profile.topic],
      "availability-fit": V07_AVAILABILITY[profile.availability],
      "skill-fit": V07_SKILL[profile.skill],
      "collaboration-fit": V07_COLLAB[profile.collab],
      "accessibility-fit": V07_A11Y[profile.a11y],
      "zone-penalty": profile.zone === "C" ? -44 : 0,
    };
    const score = clampScore(
      Object.values(contributions).reduce((total, value) => total + value, 0),
    );
    return { score, recommended: score >= 60, contributions: Object.freeze(contributions) };
  }

  const contributions: Record<string, number> = {
    base: 50,
    "availability-fit": V08_AVAILABILITY[profile.availability],
    "skill-fit": V08_SKILL[profile.skill],
    "accessibility-fit": V08_A11Y[profile.a11y],
  };

  // These are real configuration choices: unselected factors contribute zero.
  if (model.addedFactorIds.includes("topic-alignment")) {
    contributions["topic-alignment"] = V08_TOPIC[profile.topic];
  }
  if (model.addedFactorIds.includes("collaboration-fit")) {
    contributions["collaboration-fit"] = V08_COLLAB[profile.collab];
  }

  const score = clampScore(Object.values(contributions).reduce((total, value) => total + value, 0));
  return { score, recommended: score >= 60, contributions: Object.freeze(contributions) };
}
