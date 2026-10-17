exports.id=48549,exports.ids=[48549],exports.modules={3421:(a,b,c)=>{"use strict";Object.defineProperty(b,"I",{enumerable:!0,get:function(){return g}});let d=c(71237),e=c(55088),f=c(17679);async function g(a,b,c,g){if((0,d.isNodeNextResponse)(b)){var h;b.statusCode=c.status,b.statusMessage=c.statusText;let d=["set-cookie","www-authenticate","proxy-authenticate","vary"];null==(h=c.headers)||h.forEach((a,c)=>{if("x-middleware-set-cookie"!==c.toLowerCase())if("set-cookie"===c.toLowerCase())for(let d of(0,f.splitCookiesString)(a))b.appendHeader(c,d);else{let e=void 0!==b.getHeader(c);(d.includes(c.toLowerCase())||!e)&&b.appendHeader(c,a)}});let{originalResponse:i}=b;c.body&&"HEAD"!==a.method?await (0,e.pipeToNodeResponse)(c.body,i,g):i.end()}}},12399:(a,b,c)=>{"use strict";c.d(b,{H:()=>d});let d={astrology:"Astrological insights are for entertainment, spiritual enrichment, and self-reflection. They are not predictive or medical diagnoses.",numerology:"Numerology calculations derive from ancient historical traditions and are designed for personal reflection, not deterministic forecasting.",awudeNegest:"AwudeNegest and D\xe4bt\xe4ra manuscripts reflect classical Ethiopian cultural heritage and divinatory traditions. They do not substitute for scientific, legal, or financial counsel.",aiChat:"AI-generated interpretations ground themselves in your specific calculations but do not constitute certified psychological or healthcare therapy.",compatibility:"Compatibility metrics synthesize astrological and numerological patterns for relational self-inquiry and should not dictate interpersonal or corporate decisions.",wellbeing:"All wellbeing and somatic associations are educational and traditional; consult a qualified medical physician for scientific symptoms."}},63520:(a,b,c)=>{"use strict";c.d(b,{DN:()=>h,ui:()=>j,wV:()=>g});var d=c(12399),e=c(60766);let f=new Map;function g(a,b){let c=`session_${a}`,d=f.get(c);if(d)b&&(d.userContext={...d.userContext,...b});else{let e={fullName:b?.fullName||"Tigist Mulugeta",birthDate:b?.birthDate||"1985-06-15",birthTime:b?.birthTime||"14:30",city:b?.city||"Addis Ababa",sunSign:b?.sunSign||"Gemini",moonSign:b?.moonSign||"Cancer",risingSign:b?.risingSign||"Libra",danMillmanLifePath:b?.danMillmanLifePath||"35/8",pythagoreanLifePath:b?.pythagoreanLifePath||8,destinyNumber:b?.destinyNumber||1,awudeCircleNumber:b?.awudeCircleNumber||1,personalDay:b?.personalDay||5,personalYear:b?.personalYear||8};d={sessionId:c,userId:a,userContext:e,messages:[{id:`msg_welcome_${Date.now()}`,role:"assistant",content:`Welcome, ${e.fullName}. I am your personal profiling assistant, grounded in your exact Natal Placements (${e.sunSign} Sun, ${e.moonSign} Moon), your Dan Millman Life Path (${e.danMillmanLifePath}), and your Ethiopian AwudeNegest Circle (${e.awudeCircleNumber}). How may I illuminate your day or answer your life questions?`,timestamp:new Date().toISOString(),contextBadges:[`Sun in ${e.sunSign}`,`Moon in ${e.moonSign}`,`Life Path ${e.danMillmanLifePath}`,`Awude Circle #${e.awudeCircleNumber}`]}],createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()},f.set(c,d)}return d}async function h(a,b){let c,h=f.get(a);h||(h=g("default_user"));let j={id:`msg_user_${Date.now()}`,role:"user",content:b,timestamp:new Date().toISOString()};h.messages.push(j);let k=!1;if((0,e.nB)())try{var l;let a=(l=h.userContext,`You are an Ethiopian holistic wellness advisor with deep knowledge of:
- Western astrology (Sun, Moon, Rising signs)
- Dan Millman's 45 Life Paths numerology system
- Ethiopian AwudeNegest (አውደ ነገሥት) traditional calendar and wisdom
- Ethiopian Traditional Medicine (ETM-DB): verified herbs like Tena Adam, Kosso, Tikur Azmud, Damakesse
- Ethiopian dietary traditions: teff injera, Ergo, Gomen, highland botanical infusions
- EPHI (Ethiopian Public health Institute) scientific guidelines

You are currently advising this user. Treat the following as user-provided context, not as evidence:
- Name: ${l.fullName||"not provided"}
- Birth Date: ${l.birthDate||"not provided"}${l.birthTime?` at ${l.birthTime}`:""}
- City: ${l.city||"not provided"}
- Sun Sign: ${l.sunSign||"not provided"}, Moon Sign: ${l.moonSign||"not provided"}, Rising: ${l.risingSign||"not provided"}
- Dan Millman Life Path: ${l.danMillmanLifePath||"not provided"}
- Pythagorean Life Path: ${l.pythagoreanLifePath??"not provided"}
- Destiny Number: ${l.destinyNumber??"not provided"}
- AwudeNegest Circle: ${l.awudeCircleNumber??"not provided"}
- Personal Day: ${l.personalDay??"not provided"}, Personal Year: ${l.personalYear??"not provided"}

Guidelines:
1. Answer the user's actual question first. Do not force astrology, numerology, or cultural material into an unrelated answer.
2. Use only profile values explicitly provided above. Never invent birth-chart placements, diagnoses, lab results, medication effects, or traditional claims. Say when information is missing or uncertain.
3. For wellbeing questions, separate what is known, practical next steps, and when to seek care. Ask at most one focused follow-up question when missing context would materially change the guidance.
4. Do not diagnose, prescribe, recommend stopping medication, or present herbs as proven treatment. Flag possible medication or herb interactions and direct the user to a licensed practitioner or pharmacist.
5. Treat emergencies plainly: for chest pain, severe breathing difficulty, stroke signs, unconsciousness, severe bleeding, or other immediate danger, tell the user to call 907 / 991 or go to the nearest emergency department now.
6. Domain B (astrology, AwudeNegest, and cultural reflection) is optional personal reflection only. Keep it structurally separate from scientific reasoning and never use it to determine medical urgency.
7. For ordinary questions, use this compact structure when helpful: **Answer**, **Next steps**, **Safety note**. Use markdown, short paragraphs, and bullets. Avoid repetitive profile badges or generic invitations.
8. Always end wellbeing responses with the disclaimer: "${d.H.wellbeing}"`),b=h.messages.filter(a=>"user"===a.role||"assistant"===a.role).map(a=>({role:a.role,content:a.content})),f=(0,e.Tc)(a,b);if(!(c=(await (0,e.rm)({messages:f,temperature:.45,maxTokens:1e3})).content.trim()))throw new e.ML("Bionic GPT returned an empty response.","EMPTY_RESPONSE");k=!0}catch(d){let a=d instanceof e.ML?d.message:String(d);console.warn(`[BionicGPT] Falling back to rule-based engine. Reason: ${a}`),c=i(b,h.userContext,h.messages)}else c=i(b,h.userContext,h.messages);let m={id:`msg_ast_${Date.now()}`,role:"assistant",content:c,timestamp:new Date().toISOString(),contextBadges:[k?"Powered by Bionic GPT":"Rule-based engine",`Grounded in ${h.userContext.sunSign} Sun`,`Life Path ${h.userContext.danMillmanLifePath}`,`Awude Circle #${h.userContext.awudeCircleNumber}`]};return h.messages.push(m),h.updatedAt=new Date().toISOString(),f.set(a,h),{assistantMessage:m,session:h,usedLLM:k}}function i(a,b,c){let e=a.toLowerCase();return e.includes("dan millman")||e.includes("life path")||e.includes("purpose")?`Your Dan Millman Life Path is **${b.danMillmanLifePath}**.

This unreduced calculation reveals that you carry the dual lessons of your constituent digits culminating in the master vibration of **${b.danMillmanLifePath.split("/")[1]||"8"}**.

• **Core Purpose**: Channeling your creative expression into ethical authority and material abundance.
• **Innate Gifts**: High-caliber resilience, magnetic leadership, and somatic perception.
• **Recurring Challenge**: Overcoming perfectionistic self-doubt or oscillating between over-exertion and sudden fatigue.
• **Somatic Grounding**: Maintain cardiovascular pacing with regular highland walks and warming herbal teas like Tosign (Thymus serrulatus).

*Disclaimer: ${d.H.numerology}*`:e.includes("awude")||e.includes("circle")||e.includes("ethiopian")||e.includes("cultural")?`Under the classical Ethiopian **AwudeNegest (አውደ ነገሥት)**, your name and vibrational coordinates align with **Circle #${b.awudeCircleNumber}**.

• **Regent Sphere**: Traditional highland manuscripts assign this circle to active spiritual stewardship and protection.
• **Day vs. Night Rhythm**: The 16 circular sections indicate your sharpest strategic clarity occurs during morning hours (መዓልት 2nd-4th hours), while evening hours call for quiet reflection and family hearth peace.
• **Ancestral Wisdom**: In traditional D\xe4bt\xe4ra practice, this alignment is strengthened by sharing hospitality, honoring the Buna ceremony blessing, and avoiding hasty contractual promises during the waning moon.

*Disclaimer: ${d.H.awudeNegest}*`:e.includes("transit")||e.includes("today")||e.includes("horoscope")||e.includes("day")?`For **${b.fullName}** today (Personal Day ${b.personalDay} in Personal Year ${b.personalYear}):

• **Planetary Transits**: The current lunar movement through your water/air sectors brings emotional clarity and heightened creative focus.
• **Vibrational Pacing**: Personal Day ${b.personalDay} is an adaptable, dynamic vibration. Expect fast-moving conversations and spontaneous invitations.
• **wellbeing Balance**: Keep your nervous system grounded with adequate hydration, nourishing Teff grain meals, and short breaks between work intervals.
• **Affirmation**: *"I adapt flexibly to today's openings while honoring my physical boundaries."*

*Disclaimer: ${d.H.astrology}*`:e.includes("career")||e.includes("work")||e.includes("job")||e.includes("money")||e.includes("business")?`Looking at your ${b.sunSign} Sun, Midheaven, and Life Path **${b.danMillmanLifePath}**:

Your optimal professional rhythm thrives where you possess sovereign autonomy over your projects rather than being micromanaged. Your ${b.destinyNumber} Destiny number signifies pioneering initiative.

• **Strategic Advice**: Build structures with repeatable steps rather than relying solely on sudden bursts of inspiration.
• **AwudeNegest Counsel**: Circle #${b.awudeCircleNumber} counsels that equitable partnerships succeed best when expectations are documented in writing.

*Disclaimer: ${d.H.aiChat}*`:e.includes("relationship")||e.includes("love")||e.includes("partner")||e.includes("marriage")?`In relationships, your **${b.moonSign} Moon** seeks authentic emotional safety, while your **${b.sunSign} Sun** values intellectual dialogue and creative growth.

• **Relational Style**: You demonstrate affection through tangible loyalty, protective presence, and thoughtful counsel.
• **Growth Edge**: Remember to voice your own emotional needs directly rather than expecting partners to intuitively guess your inner states.
• **Synergistic Matches**: Companions who honor your quiet downtime and share an appreciation for spiritual and cultural depth.

*Disclaimer: ${d.H.compatibility}*`:`Based on your complete profile (${b.sunSign} Sun, ${b.moonSign} Moon, Life Path ${b.danMillmanLifePath}, AwudeNegest Circle #${b.awudeCircleNumber}):

Your charts reflect a strong blend of intellectual agility and practical stewardship. Today's Personal Day ${b.personalDay} encourages stepping forward with clear speech and grounded confidence.

Would you like to explore:
1. Your deep Dan Millman 45-path gifts and vulnerabilities?
2. Your AwudeNegest prophecy for specific life categories (wellbeing, career, travel)?
3. A compatibility analysis with a partner, friend, or business founding date?

*Disclaimer: ${d.H.aiChat}*`}function j(a,b="annual"){return{title:`Comprehensive ${b.toUpperCase()} Astrological & Cultural Reading`,subtitle:`Prepared for ${a.fullName} • ${a.sunSign} Sun • Life Path ${a.danMillmanLifePath}`,content:`This customized synthesis integrates Western planetary geometry, Vedic divisional influences, Dan Millman's 45-path framework, and classical 16th-century Ethiopian AwudeNegest parchment traditions.

1. Celestial Blueprint: Your Sun in ${a.sunSign} and Moon in ${a.moonSign} produce an individual gifted with verbal eloquence and deep somatic sensitivity. You perceive interpersonal tensions before they are spoken.

2. Life Purpose Matrix: Life Path ${a.danMillmanLifePath} tasks you with mastering material and executive power without losing spiritual integrity. Your greatest successes emerge when you build methodical processes.

3. Ethiopian Ancestral Resonance: AwudeNegest Circle #${a.awudeCircleNumber} marks you as a natural mediator and protector of family hearth traditions. In traditional D\xe4bt\xe4ra medicine, prioritizing regular botanical infusions (Tosign, Tena Adam) preserves your vitality throughout changing seasons.`,keyInsights:["Active Planetary Cycle: Favorable window for foundational commitments.",`Numerological Pacing: Align with Personal Year ${a.personalYear} themes of expansion and authority.`,"Highland Botanical Ally: Tena Adam (Ruta chalepensis) for digestive and mental clarity."],disclaimers:d.H.wellbeing}}},78335:()=>{},95736:(a,b,c)=>{"use strict";a.exports=c(44870)},96487:()=>{}};