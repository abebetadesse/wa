import { NextRequest, NextResponse } from "next/server";
import { evaluateSpiritualCrisis } from "@/lib/case-workflow/spiritualQuestionEngine";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userText = "", gematriaContext = {}, priorAnswers = {} } = body;

    // Crisis screening
    const crisisCheck = evaluateSpiritualCrisis(userText, priorAnswers);
    if (crisisCheck.isCrisis) {
      return NextResponse.json({
        success: true,
        data: {
          questions: [],
          crisis_flag: true,
          crisisContent: crisisCheck.crisisContent,
        },
      });
    }

    const textLower = userText.toLowerCase();
    const questions = [];

    // Contextual adaptive follow-up questions
    if (textLower.includes("work") || textLower.includes("job") || textLower.includes("boss") || textLower.includes("career")) {
      questions.push({
        id: "followup_career_alignment",
        text: "When you reflect on this work situation, does it feel like a temporary trial or a call to change direction entirely?",
        textAmharic: "ይህንን የሥራ ሁኔታ ሲያስቡት ጊዜያዊ ፈተና ይመስላል ወይስ ሙሉ በሙሉ አቅጣጫ ለመቀየር ጥሪ ነው?",
        type: "textarea",
        required: false,
      });
    } else if (textLower.includes("family") || textLower.includes("parent") || textLower.includes("mother") || textLower.includes("father")) {
      questions.push({
        id: "followup_family_lineage",
        text: "What ancestral value or blessing from your elders do you feel called to honor in resolving this?",
        textAmharic: "ይህንን ለመፍታት ከቀደምት አባቶችዎ ወይም ከቤተሰብዎ የትኛውን መልካም እሴት መከተል ይፈልጋሉ?",
        type: "textarea",
        required: false,
      });
    } else {
      questions.push({
        id: "followup_reflection",
        text: `In light of your name's resonance with ${gematriaContext.zodiac || "your sign"}, what inner truth has been hardest to speak openly?`,
        textAmharic: "ከልብዎ ውስጥ በግልጽ ለመናገር በጣም የከበደዎት እውነት ምንድን ነው?",
        type: "textarea",
        required: false,
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        questions,
        crisis_flag: false,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to generate follow-ups" },
      { status: 500 }
    );
  }
}
