/**
 * How each of the eleven knowledge strands reads the life side of a case — sleep, worry, mood,
 * money, work, conflict, family, loneliness, loss, substances, faith and direction — so that every
 * case type, not only a health complaint, is read through every strand (clinicalLexicon.ts holds
 * the readings for bodily symptoms; clinical.ts combines both).
 *
 * `reviewer` is working guidance; `person` is the wording a report may use and names no condition
 * the person did not raise. "any" applies whenever the request has at least one theme.
 */
import type { KnowledgeStrandType } from "@/lib/knowledge/types";
import type { StrandLens } from "./clinicalLexicon";

const MIND = ["sleep", "anxiety", "low_mood", "grief", "isolation"];

export const LIFE_LENSES: Record<KnowledgeStrandType, StrandLens[]> = {
  biological: [
    { when: MIND, reviewer: "Sustained stress keeps cortisol and adrenaline high: shallow sleep, tense muscles, stomach upset and lowered immunity follow; the body's signs are part of the picture, not separate from it.", person: "Long stress and short sleep tire the body as well as the mind; a regular wake-up time and some daylight activity each day help both." },
    { when: ["substance", "caffeine"], reviewer: "Stimulants (khat, coffee) delay sleep onset and raise heart rate; alcohol fragments the second half of the night." },
  ],
  biochemical: [
    { when: ["low_mood", "fatigue", "sleep"], reviewer: "Iron, vitamin B12, folate, vitamin D and protein gaps can mimic or deepen low mood and tiredness, especially after long plant-only fasts; a blood count is a reasonable first check if it persists.", person: "If tiredness or low mood lasts for weeks, a simple blood test can check iron and other nutrients that affect energy and mood." },
    { when: ["anxiety", "caffeine"], reviewer: "High caffeine intake and low blood sugar between irregular meals both produce shakiness and anxiety-like symptoms." },
  ],
  medication: [
    { when: ["sleep", "anxiety", "low_mood", "substance"], reviewer: "Ask about sleeping tablets, tramadol, diazepam and herbal sedatives bought without prescription; combining them with alcohol is dangerous.", person: "If you take anything to sleep or to calm down, including herbs, tell a health worker before combining it with alcohol or other medicines.", ask: "Do you take anything to help you sleep or calm down, including herbs or tablets bought at a shop?" },
  ],
  addiction: [
    { when: ["substance"], reviewer: "Map the use cycle: khat in the afternoon, alcohol at night to come down, poor sleep, low mood and irritability next day, then use again; the cycle, not willpower, is what to interrupt.", person: "Khat and alcohol can feel like relief, but over time they usually make sleep, worry, money and arguments worse; cutting down step by step is easier than stopping at once.", ask: "How often do you chew khat or drink, and has that changed since the difficulty began?" },
    { when: ["money", "conflict", "sleep", "anxiety"], reviewer: "Ask about khat, alcohol and gambling even when not mentioned: they commonly sit behind money strain, night-time arguments and poor sleep." },
  ],
  ecological: [
    { when: ["sleep", "low_mood", "fatigue"], reviewer: "Season shapes energy: Kiremt's cold, damp and short days lower activity and mood; daylight exposure in the morning steadies the body clock.", person: "Daylight, time outdoors and the season (the cold, damp rains especially) affect energy and mood; a short walk in morning daylight helps." },
    { when: ["money", "work"], reviewer: "Rain-fed livelihoods follow the season: Kiremt is the lean, cash-short time, while harvest income arrives in Tsedey and Bega." },
  ],
  epidemiological: [
    { when: ["anxiety", "low_mood", "sleep"], reviewer: "Depression and anxiety are among the commonest health problems in Ethiopia; under the mhGAP programme health centres can screen and treat them.", person: "Worry and low mood are very common and treatable; many health centres now offer counselling and care under the national mental-health programme." },
    { when: ["grief", "isolation"], reviewer: "Bereavement and isolation raise the risk of depression, especially in older adults; follow up after the first months, not only at the time of loss." },
  ],
  psychological: [
    { when: ["anxiety"], reviewer: "Name the specific fears behind the general worry; separate what can be acted on this week from what cannot, and schedule a short daily calming practice the person already trusts.", person: "Writing down the two or three specific worries, and what you can do about each this week, usually makes them smaller." },
    { when: ["low_mood", "isolation"], reviewer: "Behavioural activation: small, scheduled, valued activities and one regular contact work against the withdrawal that keeps mood low.", person: "One small activity you value each day, and one regular contact with someone you trust, are among the most reliable ways to lift low mood." },
    { when: ["conflict", "family"], reviewer: "Look for the repeating pattern: the usual trigger, time and escalation; agreeing a calm time and one topic changes more than winning one argument.", person: "Agreeing a calm time to talk about one topic only, with each person describing their own experience, usually goes further than arguing in the moment." },
    { when: ["grief"], reviewer: "Acknowledge the loss directly; waves of sadness, poor sleep and loss of interest are expected in grief and are not by themselves a disorder.", person: "Waves of sadness, poor sleep and less interest in things are a normal part of grief; sharing them with someone you trust helps." },
  ],
  socioeconomic: [
    { when: ["money", "work"], reviewer: "Make obligations concrete: this month's fixed costs and income, written down with the household; then check eligibility for iddir, equb, kebele or woreda support and PSNP.", person: "Writing this month's costs and income down together, and asking the iddir, equb or kebele office about support, turns a general fear into a gap that can be planned for.", ask: "What are the most urgent costs this month, and who else in the household contributes?" },
    { when: ["family", "conflict", "legal"], reviewer: "Household roles, contributions and inheritance expectations are frequent hidden drivers of conflict; ask who decides about money and land." },
  ],
  dietary: [
    { when: ["low_mood", "anxiety", "sleep", "fatigue"], reviewer: "Regular meals with protein and the last coffee before midday steady energy and sleep; long fasts need planned legume, oilseed and grain combinations.", person: "Regular meals, some protein each day (such as shiro, lentils or eggs) and the last cup of coffee before midday help steady energy, mood and sleep." },
    { when: ["money"], reviewer: "Low-cost, nutrient-dense staples: shiro, misir, kik, gomen, kolo and teff; buying legumes and grain in bulk through a cooperative lowers cost.", person: "Shiro, lentils, split peas, greens, roasted grains and teff are affordable and nourishing staples when money is tight." },
  ],
  cultural: [
    { when: ["conflict", "family", "legal"], reviewer: "Elders' mediation (shimgilina) and a spiritual father are the customary routes; use them only where there is no violence and both sides are willing.", person: "Where both sides are willing and there is no violence, a respected elder or spiritual father can help a difficult conversation stay calm." },
    { when: ["grief", "isolation"], reviewer: "Mourning practices (lekso, the 40th-day and annual remembrances) and iddir membership are real supports; ask what could still be observed.", person: "Shared mourning and remembrance, and community groups such as iddir or mahber, exist because they help; joining one gathering is a gentle first step." },
    { when: ["spiritual", "purpose"], reviewer: "Respect the person's own framing; offer reflection alongside, never instead of, practical and health support.", person: "Prayer, holy water and your faith community can accompany the practical steps here; they work best together." },
  ],
  astrological: [
    { when: ["any"], reviewer: "Domain B only: the profile's reading and the healing calendar can frame the timing of reflection, prayer or a new routine; never a decision, a deadline or a delay of care.", person: "If you keep a traditional or spiritual calendar, it can help you choose a good moment for reflection or a new routine; it does not decide anything for you." },
  ],
};
