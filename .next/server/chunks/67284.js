"use strict";exports.id=67284,exports.ids=[67284],exports.modules={19057:(a,b,c)=>{c.d(b,{A:()=>k});let d=["P","H","C","E","S","O"],e={Sunday:"S",Monday:"O",Tuesday:"C",Wednesday:"P",Thursday:"H",Friday:"E",Saturday:"E"},f={kiremt:"The heavy rains invite inward tending, rest, and connection.",tseday:"The blooming season invites creation, planting, and beginnings.",bega:"The dry season invites structure, clear decisions, and steady rhythm.",belg:"The small rains invite preparation, gathering, and renewal."},g={kiremt:{H:4,E:3,S:2},tseday:{C:5,H:3},bega:{O:4,P:3},belg:{P:5,C:3}},h={P:{core:"P",aspect:"P1",prompt:"Where did you feel your own strength today?",affirmation:"I am the spark."},H:{core:"H",aspect:"H1",prompt:"Who did you truly connect with today?",affirmation:"I am a bridge between hearts."},C:{core:"C",aspect:"C1",prompt:"What did you bring into being today?",affirmation:"I am creation."},E:{core:"E",aspect:"E1",prompt:"Where did you find peace today?",affirmation:"I am the still pool."},S:{core:"S",aspect:"S1",prompt:"What did you notice beyond your own thoughts?",affirmation:"I breathe with the world."},O:{core:"O",aspect:"O1",prompt:"What structure held you today?",affirmation:"I am the rhythm."}},i={P:[{practiceId:"p-ground",name:"Morning grounding",type:"movement",durationMin:10,soundHz:741,instruction:"Stand comfortably and notice your connection to the earth."}],H:[{practiceId:"h-bridge",name:"Bridge breath",type:"breath",durationMin:8,soundHz:396,instruction:"Breathe slowly and make room for a supportive connection."}],C:[{practiceId:"c-make",name:"Make something",type:"creation",durationMin:20,instruction:"Use your hands to cook, plant, draw, or build."}],E:[{practiceId:"e-still",name:"Stillness",type:"meditation",durationMin:15,soundHz:432,instruction:"Sit without fixing anything and notice your rhythm."}],S:[{practiceId:"s-source",name:"Source breath",type:"breath",durationMin:12,soundHz:963,instruction:"Breathe as if receiving and offering with each cycle."}],O:[{practiceId:"o-routine",name:"Routine setting",type:"ritual",durationMin:10,soundHz:852,instruction:"Choose three gentle anchors for the day."}]};function j(a,b,c){return(b.getTime()-new Date(a).getTime())/864e5<=c}class k{static compute(a){let b=a.now??new Date,c=function(a){let b=a.getMonth()+1;return b>=6&&b<=9?"kiremt":b>=10&&b<=11?"tseday":12===b||1===b?"bega":"belg"}(b),k=a.user.frequencies??{},l=Object.fromEntries(d.map(a=>[a,Math.max(0,Math.min(100,k[a]??50))]));for(let[a,b]of Object.entries(g[c]))l[a]+=b??0;for(let c of a.recentJournal??[])c.selectedCore&&j(c.entryDate,b,30)&&(l[c.selectedCore]+=c.practiceCompleted?.length?5:2);for(let c of a.recentBiometrics??[]){if(!j(c.createdAt,b,14)||!c.traditionalReading?.element)continue;let a={Fire:"P",Water:"H",Earth:"C",Aether:"E",Air:"S",Metal:"O"}[c.traditionalReading.element];a&&(l[a]+="depleted"===c.traditionalReading.status?8:2)}for(let a of d)l[a]=Math.max(0,Math.min(100,Math.round(l[a])));let m=[...d].sort((a,b)=>l[b]-l[a]),n=function(a,b){if(!a)return{stage:"unknown",core:"E"};let c=new Date(a),d=Math.floor((b.getTime()-c.getTime())/315576e5);return d<13?{stage:"Spark",core:"P"}:d<25?{stage:"Bridge",core:"H"}:d<37?{stage:"Seed",core:"C"}:d<49?{stage:"Root",core:"E"}:d<61?{stage:"Law",core:"O"}:{stage:"Wind",core:"S"}}(a.user.dateOfBirth,b),o=(a.recentBiometrics??[]).some(a=>a.referralRequired);return{activeCores:{primary:m[0],secondary:m[1],tertiary:m[2]},frequencies:l,temporal:{season:c,seasonGuidance:f[c],dayOfWeek:b.toLocaleDateString("en-US",{weekday:"long"}),dayOfWeekCore:e[b.toLocaleDateString("en-US",{weekday:"long"})],lifeStage:n.stage,lifeStageCore:n.core},todaysPractices:i[m[0]],journalPrompt:h[m[0]],soundHz:i[m[0]][0]?.soundHz??432,notices:{referralRequired:o,referralMessage:o?"A previous reading included a referral notice. Please seek qualified support rather than relying on reflection alone.":null}}}}},67284:(a,b,c)=>{c.d(b,{BE:()=>j,E8:()=>m,Yr:()=>n,oC:()=>l});var d=c(33427),e=c(23340),f=c(48689),g=c(74379);let h=globalThis;h.__hexacorePurchases||(h.__hexacorePurchases=new Map);let i=h.__hexacorePurchases;async function j(){try{let a=await d.db.select().from(e.cK).where((0,f.eq)(e.cK.isActive,!0));if(a&&a.length>0)return a}catch{}return e.vl}async function k(a){return(await j()).find(b=>"id"in b&&b.id===a||b.code===a)}async function l(a){let b=a.productCode||"natal_dossier",c=await k(a.productId||b)||e.vl[1],f=`EWP-HEX-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2,10).toUpperCase()}`,h=`pur-${Date.now()}-${Math.random().toString(36).substring(2,7)}`,j="number"==typeof c.priceEtb?c.priceEtb:parseFloat(String(c.priceEtb))||450,l="number"==typeof c.priceUsd?c.priceUsd:parseFloat(String(c.priceUsd))||14.99,m={clientName:a.clientName,motherName:a.motherName,birthDate:a.birthDate,birthTime:a.birthTime,birthLocation:a.birthLocation,focusQuestion:a.focusQuestion,notes:a.notes},n="free"===c.tier||0===j&&0===l,o="demo"===a.paymentMethod||n,p=null;o&&(p=(0,g.I)(m));let q={id:h,reference:f,userId:a.userId||null,clientEmail:a.clientEmail||null,clientName:a.clientName,clientPhone:a.clientPhone||null,productId:"id"in c&&c.id?String(c.id):h,productCode:c.code,productName:c.name,productNameAm:c.nameAm||c.name,amountPaidEtb:j,amountPaidUsd:l,paymentMethod:a.paymentMethod,paymentReference:o?`DEMO-AUTO-${f}`:null,status:o?"completed":"pending",clientIntake:m,unlockedPayload:p,notes:a.notes||null,createdAt:new Date().toISOString(),completedAt:o?new Date().toISOString():null};i.set(f,q),i.set(h,q);try{await d.db.insert(e.Q8).values({id:h,reference:f,userId:a.userId,clientEmail:a.clientEmail,clientName:a.clientName,clientPhone:a.clientPhone,productId:"id"in c&&c.id?c.id:h,bookingId:a.bookingId,amountPaidEtb:j.toFixed(2),amountPaidUsd:l.toFixed(2),paymentMethod:a.paymentMethod,paymentReference:q.paymentReference,status:q.status,clientIntake:q.clientIntake,unlockedPayload:q.unlockedPayload,notes:a.notes})}catch{}let r="USD"===(a.currency||"ETB")?`$${l.toFixed(2)} USD`:`${j.toFixed(2)} ETB`;return{purchase:q,paymentInstructions:"telebirr"===a.paymentMethod?{method:"telebirr",reference:f,amountFormatted:r,telebirrCode:"0911002233",instructionsEn:`Please send ${r} to Telebirr Merchant / Phone: 0911002233 (Ethiopian Wellness Platform). Use reference code "${f}" as the transaction note. Submit your transaction code below to unlock instantly.`,instructionsAm:`እባክዎ ${r} ወደ ቴሌብር ቁጥር 0911002233 ያስተላልፉ። በመልዕክት መስኩ ላይ "${f}" ያስገቡ። ክፍያውን እንዳጠናቀቁ የግብይት ቁጥሩን አስገብተው ወዲያውኑ ማህደርዎን ይክፈቱ።`}:"cbe_transfer"===a.paymentMethod?{method:"cbe_transfer",reference:f,amountFormatted:r,accountDetails:{bankName:"Commercial Bank of Ethiopia (CBE)",accountNumber:"1000234567891",accountHolder:"Ethiopian Wellness & Wisdom Platform"},instructionsEn:`Deposit or transfer ${r} to Commercial Bank of Ethiopia (CBE) Account: 1000234567891 (Ethiopian Wellness Platform). Use reference code "${f}" in the deposit remark.`,instructionsAm:`እባክዎ ${r} ወደ ንግድ ባንክ (CBE) ሂሳብ ቁጥር: 1000234567891 (Ethiopian Wellness Platform) ያስተላልፉ። በማስረከቢያው ላይ "${f}" የሚለውን መለያ ቁጥር ይጠቀሙ።`}:"chapa"===a.paymentMethod||"card"===a.paymentMethod?{method:"chapa",reference:f,amountFormatted:r,instructionsEn:`Proceed with online payment via Chapa gateway for ${r}. Use transaction reference "${f}" to verify and unlock your full 14-layer dossier.`,instructionsAm:`በቻፓ የክፍያ በር በኩል ${r} ይክፈሉ። ክፍያውን ሲያጠናቅቁ "${f}" የሚለውን መለያ በማረጋገጫነት ያስገቡ።`}:n?{method:"free",reference:f,amountFormatted:"0.00 ETB",instructionsEn:"Free Celestial Preview unlocked. Explore your active cores, archetypes, and seasonal guidance!",instructionsAm:"ነጻ እይታው ተከፍቷል፤ ዋና ማዕከላትን፣ ወቅታዊ መመሪያንና የሕይወት ቅኝትዎን ይቃኙ!"}:{method:a.paymentMethod,reference:f,amountFormatted:r,instructionsEn:"Complete your payment and submit your transaction reference code to unlock.",instructionsAm:"ክፍያውን አጠናቀው የግብይት ቁጥሩን በማስገባት ማህደርዎን ይክፈቱ።"}}}async function m(a){let b=i.get(a.referenceOrId)||Array.from(i.values()).find(b=>b.reference===a.referenceOrId||b.id===a.referenceOrId);if(!b)throw Error(`Purchase order with reference "${a.referenceOrId}" not found.`);if(!b.unlockedPayload){let a=b.clientIntake;b.unlockedPayload=(0,g.I)(a)}b.status="completed",b.completedAt=new Date().toISOString(),a.paymentReference&&(b.paymentReference=a.paymentReference),a.proofUrl&&(b.proofUrl=a.proofUrl),i.set(b.reference,b),i.set(b.id,b);try{await d.db.update(e.Q8).set({status:"completed",paymentReference:b.paymentReference,proofUrl:b.proofUrl,unlockedPayload:b.unlockedPayload,completedAt:new Date,updatedAt:new Date}).where((0,f.eq)(e.Q8.reference,b.reference))}catch{}return b}async function n(a){let b=i.get(a);if(b)return b;try{let[b]=await d.db.select().from(e.Q8).where((0,f.eq)(e.Q8.reference,a)).limit(1);if(b)return{id:b.id,reference:b.reference,userId:b.userId,clientEmail:b.clientEmail,clientName:b.clientName,clientPhone:b.clientPhone,productId:b.productId,productCode:"natal_dossier",productName:"Hexacore Dossier",amountPaidEtb:Number(b.amountPaidEtb),amountPaidUsd:Number(b.amountPaidUsd||0),paymentMethod:b.paymentMethod,paymentReference:b.paymentReference,status:b.status,clientIntake:b.clientIntake||{},unlockedPayload:b.unlockedPayload,proofUrl:b.proofUrl,notes:b.notes,createdAt:b.createdAt.toISOString(),completedAt:b.completedAt?.toISOString()}}catch{}return null}},74379:(a,b,c)=>{c.d(b,{B:()=>l,I:()=>k});var d=c(18830),e=c(19057),f=c(16566);let g={Power:"ኃይል (Power / እሳት)",Humanity:"ሰውነት (Humanity / ማኅበር)",Creation:"ፍጥረት (Creation / ምድር)",Peace:"ዕርቅ (Peace / ባሕር)",Spirit:"መንፈስ (Spirit / አየር)",Order:"ሥርዓት (Order / ሰማይ)"},h={Power:"P",Humanity:"H",Creation:"C",Peace:"E",Spirit:"S",Order:"O"},i={Sunday:{dayAm:"እሑድ",elementAm:"ብርሃን (Light)",themeAm:"መለኮታዊ ብርሃንና ንጋት"},Monday:{dayAm:"ሰኞ",elementAm:"ውሃና ጠፈር (Firmament)",themeAm:"ስፋትና የጠፈር ጥልቀት"},Tuesday:{dayAm:"ማክሰኞ",elementAm:"ዕፅዋትና ዘር (Flora & Seed)",themeAm:"ምድራዊ ፍሬና ማበብ"},Wednesday:{dayAm:"ረቡዕ",elementAm:"ፀሐይና ከዋክብት (Luminaries)",themeAm:"የጊዜ ሰዓታትና አቅጣጫ"},Thursday:{dayAm:"ሐሙስ",elementAm:"ሕያዋን ፍጥረታት (Creatures)",themeAm:"የውቅያኖስና የአየር እንቅስቃሴ"},Friday:{dayAm:"ዓርብ",elementAm:"የሰው ልጅና ማረፊያ (Soul of Man)",themeAm:"የማስተዋልና የሰውነት ክብር"},Saturday:{dayAm:"ቅዳሜ",elementAm:"ዕረፍትና ሰንበት (Sabbath Rest)",themeAm:"ፍጹም ዕረፍትና ማሰላሰል"}},j={Power:{gateAm:"የኃይልና የመንጻት ደጅ",trialAm:"ከቁጣና ከግል ፍላጎት የመንጻት ፈተና"},Humanity:{gateAm:"የድልድይና የርኅራኄ ደጅ",trialAm:"ጠላትን ይቅር የማለትና የመቀበል ጥረት"},Creation:{gateAm:"የዘርና የመታደስ ደጅ",trialAm:"ከጥፋት በኋላ አዲስ ነገር የመፍጠር ትዕግሥት"},Peace:{gateAm:"የዝምታና የዕርቅ ደጅ",trialAm:"በውዝግብ መካከል ውስጣዊ ሰላምን የመጠበቅ ፈተና"},Spirit:{gateAm:"የጥበብና የጠፈር ደጅ",trialAm:"ከቁሳዊ ዓለም ባሻገር ያለውን እውነት የማየት ጥረት"},Order:{gateAm:"የፍትሕና የሥርዓት ደጅ",trialAm:"በራስ ፍላጎት ሳይሆን በፍትሕ የመመራት ታማኝነት"}};function k(a){let b=`HEX-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2,10).toUpperCase()}`,c=new Date,k=(0,d.vX)(a.birthDate,!0,!0,a.clientName),l=(0,d.v_)(a.birthDate,a.clientName),m=h[k.dominantCore]||"P",n=h[k.secondaryCore]||"H",o=h[k.tertiaryCore]||"C",p=h[k.dormantCore]||"O",q={P:45,H:45,C:45,E:45,S:45,O:45};q[m]=92,q[n]=78,q[o]=64,q[p]=28;let r=e.A.compute({user:{dateOfBirth:a.birthDate,frequencies:q},now:c}),s=(0,f.L6)(k.dominantCore),t=(0,f.L6)(k.secondaryCore);t.length>0&&!s.find(a=>a.sku===t[0].sku)&&s.push(t[0]);let u=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Sunday"][new Date(`${a.birthDate}T00:00:00Z`).getUTCDay()]||"Thursday",v=d.B_.find(a=>a.day===u)??d.B_[4],w=i[u]||{dayAm:u,elementAm:"ብርሃን",themeAm:"ጥንተ ተፈጥሮ"},x=d.mC.find(a=>a.core===k.dominantCore)||d.mC[0],y=j[k.dominantCore]||{gateAm:"የጥበብ ደጅ",trialAm:"የልብ ንጽሕናን የመጠበቅ ፈተና"},z=d._M.find(a=>a.core===k.dominantCore)||d._M[0];return{reference:b,generatedAt:c.toISOString(),client:{...a,motherName:a.motherName||"የተፈጠረች እናት"},coreNumber:l.coreNumber,coreLetter:m,dominantCore:k.dominantCore,dominantCoreAm:g[k.dominantCore]||k.dominantCore,secondaryCore:k.secondaryCore,tertiaryCore:k.tertiaryCore,dormantCore:k.dormantCore,coreRadar:q,masterArchetype:k.archetype,masterArchetypeAm:`${l.masterTitle||"ጠቢብ"} (${k.archetype})`,creationDayAnchor:{day:u,dayAm:w.dayAm,element:v.creationAct,elementAm:w.elementAm,theme:v.relationalMeaning,themeAm:w.themeAm},solfeggioHz:k.correspondences.soundHz,solfeggioTitle:`${k.correspondences.soundHz} Hz Sacred Solfeggio Tone`,solfeggioDescription:`Acoustic frequency tuned to restore equilibrium to the ${k.dominantCore} center, clearing energetic stagnation and aligning bio-rhythms.`,initiationGate:{gate:x.gate,gateAm:y.gateAm,trial:x.trials[0]||"Integrity of will",trialAm:y.trialAm,reward:"Power"===k.dominantCore?"Courage & Right Action":"Harmonic Wisdom",level:"Adept Novitiate"},energeticBody:{body:`${k.dominantCore} Subtle Auric Field`,center:`${k.dominantCore} Heart / Solar Axis`,meridian:`${k.dominantCore} Harmonic Pathway`,soundHz:k.correspondences.soundHz},cosmologicalRealm:{realm:z.realm,ruler:z.ruler,age:"Age of Harmony & Balance",heaven:"Fourth Spherical Heaven"},layerSummary:k.layerSummary??{},botanicalPrescriptions:s,dailyPractices:r.todaysPractices,biorhythm:{season:r.temporal.season,seasonGuidance:r.temporal.seasonGuidance,lifeStage:r.temporal.lifeStage,dayOfWeek:r.temporal.dayOfWeek},safetyNotice:{reflectiveOnly:!0,disclaimerEn:"This dossier is rooted in Ethiopian traditional cosmology (Awde Negast) and cultural reflection. It is intended for self-inquiry, historical appreciation, and mindfulness. It is not a biomedical diagnosis, psychotherapy, or medical prescription.",disclaimerAm:"ይህ ሰነድ በኢትዮጵያ ባህላዊ የአውደ ነገሥት ፍልስፍና እና ባህላዊ አስተውሎት ላይ የተመሠረተ ነው። ለመንፈሳዊ ንቃት፣ ለራስ ምርመራና ለማሰላሰል የሚረዳ ሲሆን የሕክምና ወይም የስነ-ልቦና ምርመራና ማዘዣ አይደለም።"}}}function l(a,b={}){let c="am"===b.lang||"am"===a.client.languagePreference,d=a.botanicalPrescriptions.map(a=>`
    <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(212,175,55,0.25); border-radius: 12px; padding: 16px; margin-bottom: 12px;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
        <div>
          <span style="display: inline-block; font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.15em; color: #D4AF37; background: rgba(212,175,55,0.1); padding: 2px 8px; border-radius: 9999px;">
            ${c?a.coreAm:a.core}
          </span>
          <h4 style="margin: 4px 0 0 0; color: #FFFFFF; font-size: 15px; font-weight: 700;">
            ${c?a.productTitleAm:a.productTitleEn}
          </h4>
          <span style="font-size: 11px; color: #94A3B8; font-style: italic;">
            ${a.scientificName} \xb7 ${a.preparationType}
          </span>
        </div>
        <div style="text-align: right;">
          <span style="font-size: 16px; font-weight: 800; color: #10B981;">${a.priceEtb} ETB</span>
          <span style="display: block; font-size: 11px; color: #64748B;">($${a.priceUsd} USD)</span>
        </div>
      </div>
      <p style="margin: 6px 0; font-size: 12px; line-height: 1.5; color: #CBD5E1;">
        ${c?a.therapeuticSynergyAm:a.therapeuticSynergyEn}
      </p>
      <div style="margin-top: 8px; font-size: 11px; color: #D97706; background: rgba(217,119,6,0.08); padding: 6px 10px; border-radius: 6px;">
        <strong>${c?"ጥንቃቄ:":"Caution:"}</strong> ${c?a.safetyCautionAm:a.safetyCautionEn}
      </div>
      <div style="margin-top: 6px; font-size: 10px; color: #64748B; text-align: right;">
        ${c?"የተረጋገጠ አዘጋጅ:":"Verified Provider:"} <strong>${a.vendor.nameEn} (${a.vendor.region})</strong>
      </div>
    </div>
  `).join(""),e=a.dailyPractices.map(a=>`
    <div style="background: rgba(255,255,255,0.02); border-left: 3px solid #D4AF37; padding: 10px 14px; margin-bottom: 8px; border-radius: 0 8px 8px 0;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <strong style="color: #FFFFFF; font-size: 13px;">${a.name}</strong>
        <span style="font-size: 11px; color: #D4AF37; background: rgba(212,175,55,0.1); padding: 2px 6px; border-radius: 4px;">
          ${a.durationMin} min ${a.soundHz?`\xb7 ${a.soundHz} Hz`:""}
        </span>
      </div>
      <p style="margin: 4px 0 0 0; font-size: 12px; color: #94A3B8;">${a.instruction}</p>
    </div>
  `).join("");return`
<!DOCTYPE html>
<html lang="${c?"am":"en"}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Hexacore Natal Dossier - ${a.client.clientName}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;900&family=Noto+Sans+Ethiopic:wght@400;600;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    @page {
      size: A4;
      margin: 15mm 12mm 15mm 12mm;
    }
    * {
      box-sizing: border-box;
    }
    body {
      margin: 0;
      padding: 24px;
      background-color: #0B0F19;
      color: #E2E8F0;
      font-family: 'Inter', 'Noto Sans Ethiopic', sans-serif;
      font-size: 13px;
      line-height: 1.6;
    }
    .dossier-card {
      max-width: 840px;
      margin: 0 auto;
      background: radial-gradient(circle at top right, rgba(212, 175, 55, 0.08), transparent 40%), #0D1322;
      border: 1px solid rgba(212, 175, 55, 0.3);
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
      border-radius: 20px;
      padding: 36px;
      position: relative;
    }
    .gold-header {
      font-family: 'Cinzel', 'Noto Sans Ethiopic', serif;
      color: #D4AF37;
      letter-spacing: 0.15em;
      text-transform: uppercase;
    }
    .gold-accent {
      color: #D4AF37;
    }
    .badge-pill {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 9999px;
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.05em;
    }
    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }
    .grid-3 {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
    }
    .metric-box {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px;
      padding: 12px 14px;
      text-align: center;
    }
    .radar-bar {
      height: 8px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 4px;
      overflow: hidden;
      margin-top: 4px;
    }
    .radar-fill {
      height: 100%;
      background: linear-gradient(90deg, #D4AF37, #10B981);
      border-radius: 4px;
    }
    @media print {
      body {
        background-color: #FFFFFF;
        color: #0F172A;
        padding: 0;
      }
      .dossier-card {
        border: none;
        box-shadow: none;
        padding: 0;
        background: #FFFFFF;
      }
      .metric-box {
        border-color: #CBD5E1;
        background: #F8FAFC;
        color: #0F172A;
      }
      .gold-header, .gold-accent {
        color: #854D0E !important;
      }
      .no-print {
        display: none !important;
      }
    }
  </style>
</head>
<body>
  <div class="dossier-card">
    <!-- Header / Brand Seal -->
    <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px solid rgba(212,175,55,0.25); padding-bottom: 20px; margin-bottom: 24px;">
      <div>
        <span class="gold-header" style="font-size: 11px; font-weight: 700;">Awde Negast \xb7 14-Layer Ethiopian Traditional Arcana</span>
        <h1 class="gold-header" style="font-size: 26px; margin: 4px 0 0 0; color: #FFFFFF;">
          ${c?"የሄክሳኮር የተሟላ የልደት ሰነድ":"Hexacore Natal Dossier"}
        </h1>
        <p style="margin: 4px 0 0 0; color: #94A3B8; font-size: 12px;">
          ${c?"የተከበረ የማንነት፣ የዘመንና የዕፅዋት ቅኝት":"Exclusive 14-Layer Relational Blueprint & Botanical Prescription"}
        </p>
      </div>
      <div style="text-align: right;">
        <span class="badge-pill" style="background: rgba(212,175,55,0.15); border: 1px solid #D4AF37; color: #D4AF37;">
          ${a.reference}
        </span>
        <div style="font-size: 11px; color: #64748B; margin-top: 4px;">
          ${new Date(a.generatedAt).toLocaleDateString("en-US",{year:"numeric",month:"short",day:"numeric"})}
        </div>
      </div>
    </div>

    <!-- Client Bio Details -->
    <div class="grid-3" style="margin-bottom: 20px;">
      <div class="metric-box">
        <span style="font-size: 10px; color: #94A3B8; text-transform: uppercase;">${c?"የባለቤቱ ስም":"Seeker Name"}</span>
        <div style="font-size: 15px; font-weight: 700; color: #FFFFFF; margin-top: 2px;">${a.client.clientName}</div>
      </div>
      <div class="metric-box">
        <span style="font-size: 10px; color: #94A3B8; text-transform: uppercase;">${c?"የእናት ስም":"Mother's Lineage"}</span>
        <div style="font-size: 15px; font-weight: 700; color: #FFFFFF; margin-top: 2px;">${a.client.motherName||"የተፈጠረች እናት"}</div>
      </div>
      <div class="metric-box">
        <span style="font-size: 10px; color: #94A3B8; text-transform: uppercase;">${c?"የትውልድ ቀን":"Natal Horizon"}</span>
        <div style="font-size: 15px; font-weight: 700; color: #D4AF37; margin-top: 2px;">${a.client.birthDate}</div>
      </div>
    </div>

    <!-- Core Archetype & 6-Based Numerology Spotlight -->
    <div style="background: linear-gradient(135deg, rgba(212,175,55,0.12), rgba(16,185,129,0.06)); border: 1px solid rgba(212,175,55,0.4); border-radius: 16px; padding: 20px; margin-bottom: 24px;">
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
        <div>
          <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #D4AF37; letter-spacing: 0.1em;">
            ${c?"ዋናው የሕይወት ቅኝት":"Primary Relational Core & Archetype"}
          </span>
          <h2 style="margin: 2px 0 0 0; font-size: 22px; font-weight: 800; color: #FFFFFF;">
            ${c?a.dominantCoreAm:a.dominantCore} \xb7 ${c?a.masterArchetypeAm:a.masterArchetype}
          </h2>
          <p style="margin: 6px 0 0 0; font-size: 12px; color: #CBD5E1;">
            ${c?"የፍጥረት ቀን መልህቅ:":"Creation-Day Anchor:"} <strong>${c?a.creationDayAnchor.dayAm:a.creationDayAnchor.day} (${c?a.creationDayAnchor.elementAm:a.creationDayAnchor.element})</strong> \xb7 ${c?a.creationDayAnchor.themeAm:a.creationDayAnchor.theme}
          </p>
        </div>
        <div style="text-align: right; background: rgba(0,0,0,0.3); border: 1px solid rgba(212,175,55,0.3); border-radius: 12px; padding: 10px 18px;">
          <span style="font-size: 10px; color: #D4AF37; text-transform: uppercase; font-weight: bold;">6-Based Core Number</span>
          <div style="font-size: 28px; font-weight: 900; color: #FFFFFF;">#${a.coreNumber}</div>
        </div>
      </div>
    </div>

    <!-- 6-Core Radar Spectrum -->
    <div style="margin-bottom: 24px;">
      <h3 class="gold-header" style="font-size: 13px; margin-bottom: 12px;">
        ${c?"የስድስቱ ማዕከላት ሚዛን (6-Core Energetic Spectrum)":"6-Core Energetic Resonance Spectrum"}
      </h3>
      <div class="grid-2">
        <div>
          <div style="display: flex; justify-content: space-between; font-size: 11px;">
            <span>Power (ኃይል / እሳት)</span>
            <strong style="color: #FF6347;">${a.coreRadar.P}%</strong>
          </div>
          <div class="radar-bar"><div class="radar-fill" style="width: ${a.coreRadar.P}%; background: #FF6347;"></div></div>

          <div style="display: flex; justify-content: space-between; font-size: 11px; margin-top: 10px;">
            <span>Humanity (ሰውነት / ማኅበር)</span>
            <strong style="color: #4169E1;">${a.coreRadar.H}%</strong>
          </div>
          <div class="radar-bar"><div class="radar-fill" style="width: ${a.coreRadar.H}%; background: #4169E1;"></div></div>

          <div style="display: flex; justify-content: space-between; font-size: 11px; margin-top: 10px;">
            <span>Creation (ፍጥረት / ምድር)</span>
            <strong style="color: #32CD32;">${a.coreRadar.C}%</strong>
          </div>
          <div class="radar-bar"><div class="radar-fill" style="width: ${a.coreRadar.C}%; background: #32CD32;"></div></div>
        </div>
        <div>
          <div style="display: flex; justify-content: space-between; font-size: 11px;">
            <span>Peace (ዕርቅ / ባሕር)</span>
            <strong style="color: #DAA520;">${a.coreRadar.E}%</strong>
          </div>
          <div class="radar-bar"><div class="radar-fill" style="width: ${a.coreRadar.E}%; background: #DAA520;"></div></div>

          <div style="display: flex; justify-content: space-between; font-size: 11px; margin-top: 10px;">
            <span>Spirit (መንፈስ / አየር)</span>
            <strong style="color: #9370DB;">${a.coreRadar.S}%</strong>
          </div>
          <div class="radar-bar"><div class="radar-fill" style="width: ${a.coreRadar.S}%; background: #9370DB;"></div></div>

          <div style="display: flex; justify-content: space-between; font-size: 11px; margin-top: 10px;">
            <span>Order (ሥርዓት / ሰማይ)</span>
            <strong style="color: #00CED1;">${a.coreRadar.O}%</strong>
          </div>
          <div class="radar-bar"><div class="radar-fill" style="width: ${a.coreRadar.O}%; background: #00CED1;"></div></div>
        </div>
      </div>
    </div>

    <!-- Initiation Gate & Acoustic Key -->
    <div class="grid-2" style="margin-bottom: 24px;">
      <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 16px;">
        <span class="gold-accent" style="font-size: 10px; font-weight: bold; text-transform: uppercase;">
          ${c?"የመነሻ ፈተናና ደጅ (Layer 11)":"Initiation Trial & Gate"}
        </span>
        <h4 style="margin: 4px 0 0 0; color: #FFFFFF; font-size: 14px;">
          ${c?a.initiationGate.gateAm:a.initiationGate.gate}
        </h4>
        <p style="margin: 6px 0 0 0; font-size: 12px; color: #94A3B8;">
          <strong>${c?"ፈተና:":"Trial:"}</strong> ${c?a.initiationGate.trialAm:a.initiationGate.trial}
        </p>
        <div style="margin-top: 8px; font-size: 11px; color: #10B981;">
          <strong>${c?"ፍሬ:":"Reward:"}</strong> ${a.initiationGate.reward}
        </div>
      </div>

      <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 16px;">
        <span class="gold-accent" style="font-size: 10px; font-weight: bold; text-transform: uppercase;">
          ${c?"የድምፅ ቅኝት (Acoustic Solfeggio)":"Harmonic Solfeggio Frequency"}
        </span>
        <h4 style="margin: 4px 0 0 0; color: #FFFFFF; font-size: 14px;">
          ${a.solfeggioTitle}
        </h4>
        <p style="margin: 6px 0 0 0; font-size: 12px; color: #94A3B8;">
          ${a.solfeggioDescription}
        </p>
        <div style="margin-top: 8px; font-size: 11px; color: #60A5FA;">
          ${c?"የወቅቱ መመሪያ:":"Seasonal Guidance:"} ${a.biorhythm.seasonGuidance}
        </div>
      </div>
    </div>

    <!-- Daily Alignment Practices -->
    <div style="margin-bottom: 24px;">
      <h3 class="gold-header" style="font-size: 13px; margin-bottom: 12px;">
        ${c?"የዕለት ተግባርና ማሰላሰል":"Prescribed Daily Alignment Practices"}
      </h3>
      ${e}
    </div>

    <!-- Certified Botanical Pharmacopeia Cross-Sell -->
    <div style="margin-bottom: 24px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
        <h3 class="gold-header" style="font-size: 13px; margin: 0;">
          ${c?"የተረጋገጡ የባህል መድኃኒትና ዕፅዋት ቀመሮች":"Certified Botanical Correspondence Formulations"}
        </h3>
        <span style="font-size: 11px; color: #10B981; font-weight: 600;">
          ${c?"ከታመኑ የባህል ፈዋሾች የተዘጋጁ":"Ethically Sourced & Verified"}
        </span>
      </div>
      ${d}
    </div>

    <!-- Ethical Guardrail & Non-Diagnostic Disclaimer -->
    <div style="border-top: 1px solid rgba(212,175,55,0.25); padding-top: 16px; font-size: 11px; line-height: 1.6; color: #94A3B8;">
      <strong style="color: #D4AF37;">${c?"ባህላዊና ስነ-ምግባራዊ ማሳሰቢያ:":"Ethical Boundary & Disclaimer:"}</strong>
      ${c?a.safetyNotice.disclaimerAm:a.safetyNotice.disclaimerEn}
      <div style="margin-top: 8px; font-size: 10px; color: #64748B;">
        Generated by Ethiopian Wisdom & Wellness Platform \xb7 Hexacore Arcana Commercial Engine \xb7 Ref: ${a.reference}
      </div>
    </div>
  </div>
</body>
</html>
  `.trim()}}};