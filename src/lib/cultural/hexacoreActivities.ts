export interface HexacoreActivityGuide {
  kind: string;
  title: string;
  summary: string;
  session: string;
  preparation: string;
  imageGuidance?: string;
  boundaries: string;
  href: string;
}

export const HEXACORE_ACTIVITY_GUIDES: HexacoreActivityGuide[] = [
  {
    kind: "hexacore-reading",
    title: "Six-core reflection",
    summary: "A guided conversation using Power, Humanity, Creation, Peace, Spirit, and Order as prompts for personal reflection.",
    session: "Choose a theme, explore the related aspects and archetypes, and leave with a question or journaling practice you select with the practitioner.",
    preparation: "Bring a question or life theme you want to reflect on. A birth date or full legal name is not required for a guided session.",
    boundaries: "Core maps and numerology are symbolic cultural frameworks, not validated measures, predictions, or assessments of health or character.",
    href: "/hexacore",
  },
  {
    kind: "tongue-reading",
    title: "Tongue-sign traditions",
    summary: "Learn how tongue colour, coating, shape, and zones have been described in traditional body-sign systems.",
    session: "The practitioner can discuss the image you choose to share alongside cultural references. No automated image interpretation is performed.",
    preparation: "If you want an image reviewed, use neutral light, focus only on the tongue, avoid filters, and do not include other people or identifying details.",
    imageGuidance: "Optional tongue photo: use even natural light, a clean camera lens, and a relaxed tongue. Avoid flash, filters, or editing. Do not upload if the photo includes another person.",
    boundaries: "A tongue photo cannot identify a disease or establish organ function. Seek a qualified health professional for pain, sores, colour changes, or other health concerns.",
    href: "/body-reading/tongue",
  },
  {
    kind: "palm-reading",
    title: "Palm and hand-line traditions",
    summary: "Explore hand-line and hand-shape symbolism as a historical and reflective practice.",
    session: "You may discuss a palm image with the practitioner, compare it with the educational guide, and decide which interpretations feel useful to you.",
    preparation: "A palm photo is optional. If shared, use even light and frame only the hand; remove jewellery or identifying background details if you prefer.",
    imageGuidance: "Optional palm photo: photograph an open palm in even light, with the whole palm visible and the background clear of personal details.",
    boundaries: "Palm features do not predict lifespan, health, trustworthiness, or future events. Interpretations are symbolic prompts, not evidence-based assessments.",
    href: "/body-reading/palm",
  },
  {
    kind: "face-reading",
    title: "Face-reading history and ethics",
    summary: "Study the history and ethical limits of face-reading traditions without drawing conclusions about a person from appearance.",
    session: "The conversation focuses on cultural history and consent. No facial analysis, automated recognition, identity matching, or trait inference is provided.",
    preparation: "No photo is needed. Discuss the tradition without sharing an image, or choose to share a non-identifying example only if you are comfortable.",
    imageGuidance: "No face images are accepted or needed for this educational discussion. Shared images are visible to the booking's practitioner team.",
    boundaries: "Appearance must not be used to infer identity, health, personality, emotion, ethnicity, character, or trustworthiness.",
    href: "/body-reading/face",
  },
  {
    kind: "body-sign-reading",
    title: "Combined body-sign traditions",
    summary: "Compare tongue and palm traditions and discuss where face-reading claims must stop.",
    session: "Choose one or more educational guides. Optional tongue or palm images are reviewed only as context for discussion, never to assess health.",
    preparation: "Text-only discussion is welcome. If sharing an image, follow the relevant tongue or palm guide. Face photos are not accepted.",
    imageGuidance: "Optional tongue or palm images only. Do not upload face photos. Images are shared privately with the practitioner team for this booking and are not analyzed automatically.",
    boundaries: "These traditions are cultural material, not diagnosis, treatment, prediction, or a substitute for qualified medical care.",
    href: "/body-reading/tongue",
  },
];

export function hexacoreActivityForService(kind: string | null | undefined) {
  return HEXACORE_ACTIVITY_GUIDES.find((guide) => guide.kind === kind) ?? null;
}
