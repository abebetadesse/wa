import { NextResponse } from "next/server";

export async function GET() {
  const suggestions = [
    {
      category: "Febrile & Infectious",
      items: [
        { en: "High fever and severe headache after visiting Awash lowland", am: "ከአዋሽ ቆላ መልስ ከፍተኛ ትኩሳት እና ራስ ምታት", om: "Hoo'ina qaamaa fi mataa dhukkubbi booda Awash", ti: "ካብ ቆላ ኣዋሽ ምስ ተመለስኩ ረስንን ርእሲ ቃንዛን" },
        { en: "Persistent cough producing yellow phlegm for 3 weeks with night sweats", am: "ለ3 ሳምንታት የቆየ ሳል ከአክታ እና ከለሊት ላብ ጋር", om: "Qufaa walirraa hin cinne torban sadii fi dafqaan", ti: "ን3 ሳምንቲ ዝጸንሐ ሳዕሊ ምስ ናይ ለይቲ ረሃጽ" },
      ],
    },
    {
      category: "Digestive & Nutritional",
      items: [
        { en: "Severe epigastric heartburn after meals and during religious fasting", am: "ምግብ ከበላሁ በኋላ እና በጾም ወቅት የሚያቃጥል የጨጓራ ህመም", om: "Garaa gubaa erga nyaata nyaadhee fi yeroo soomaa", ti: "ድሕሪ ምግቢ ምብላዕን ብጾምን ዝስመዓኒ ናይ ከብዲ ምንዳድ" },
        { en: "Extreme exhaustion and pale conjunctiva despite eating injera daily", am: "በየቀኑ እንጀራ እየበላሁ ከፍተኛ ድካም እና የደም ማነስ ምልክቶች", om: "Dadhabbi guddaa guyyaa guyyaan injera nyaadhullee", ti: "መዓልታዊ እንጀራ እናበላዕኩ ከቢድ ድኻምን ምልክት ደም ምውሓድን" },
      ],
    },
    {
      category: "Herb-Drug Safety & Interactions",
      items: [
        { en: "I am taking Warfarin blood thinner and want to drink Tena Adam tea", am: "የደም ማቅጠኛ ዋርፋሪን እየወሰድኩ ተና አዳም ሻይ መጠጣት እችላለሁ?", om: "Qoricha dhiiga qallisu Warfarin fudhachaan jira, Tena Adam dhuguu danda'aa?", ti: "ዋርፋሪን ዝበሃል ናይ ደም መቕጠኒ እናወሰድኩ ሻሂ ተና ኣዳም ክሰቲ ይፍቀድ ድዩ?" },
        { en: "I take Metformin for diabetes and someone recommended Kosso purge", am: "የስኳር መድሃኒት ሜትፎርሚን እየወሰድኩ ኮሶ ለትል መውሰድ እችላለሁ?", om: "Qoricha sukkaaraa Metformin fudhachaan jira, Kosso fudhachuu danda'aa?", ti: "ናይ ሽኮር መድሃኒት ሜትፎርሚን እናወሰድኩ ኮሶ ክወስድ ይኽእል ድየ?" },
      ],
    },
    {
      category: "Lifestyle & Substance",
      items: [
        { en: "Heart palpitations, anxiety and insomnia after long khat chewing sessions", am: "ረጅም ሰዓት ጫት ከቃምኩ በኋላ የልብ ምት መጨመር እና እንቅልፍ ማጣት", om: "Dha'annaa onnee dabaluu fi hirriba dhabuu booda caatii", ti: "ንነዊሕ ሰዓታት ጫት ምስ ቃምኩ ትርግታ ልቢ ምውሳኽን ድቃስ ምስኣንን" },
      ],
    },
    {
      category: "Emergency Red Flags",
      items: [
        { en: "Crushing chest pain radiating to left arm with shortness of breath", am: "ወደ ግራ እጅ የሚሰራጭ ከባድ የደረት ህመም እና የመተንፈስ እጥረት", om: "Dhukkubbi qomaa gara harka bitaatti darbu fi hafuura dhabuu", ti: "ናብ ጸጋማይ ኢድ ዝዝርጋሕ ከቢድ ቃንዛ ኣፍልብን ሕጽረት ምስትንፋስን" },
      ],
    },
  ];

  return NextResponse.json({
    success: true,
    data: suggestions,
  });
}
