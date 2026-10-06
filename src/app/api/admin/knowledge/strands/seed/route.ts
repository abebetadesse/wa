import { NextResponse } from "next/server";
import { SYSTEM_KNOWLEDGE_STRANDS } from "@/lib/hexacore/HexacoreVisionEngine";
import { db } from "@/lib/db";
import { knowledgeStrands, knowledgeCategories } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { insertReturning } from "@/lib/db/write";

export async function POST() {
  try {
    const existing = await db.select().from(knowledgeStrands);
    const existingNames = new Set(existing.map((s) => s.name.toLowerCase()));

    const insertedStrands: any[] = [];

    for (let i = 0; i < SYSTEM_KNOWLEDGE_STRANDS.length; i++) {
      const strand = SYSTEM_KNOWLEDGE_STRANDS[i];
      if (!existingNames.has(strand.name.toLowerCase())) {
        const [newStrand] = await insertReturning(db, knowledgeStrands, {
            name: strand.name,
            description: `${strand.description} (${strand.descriptionAm})`,
            version: "1.0.0",
            displayOrder: i + 1,
            isActive: true,
          });

        insertedStrands.push(newStrand);

        // Seed default categories for this strand
        for (let j = 0; j < strand.categories.length; j++) {
          const catName = strand.categories[j];
          await db.insert(knowledgeCategories).values({
            strandId: newStrand.id,
            name: catName,
            description: `${catName} within ${strand.name}`,
            displayOrder: j + 1,
            isActive: true,
            schema: {
              fields: [
                { name: "title", label: "Title", type: "text", required: true },
                { name: "summary", label: "Summary", type: "textarea", required: true },
                { name: "findings", label: "Findings", type: "textarea" },
                { name: "domain", label: "Domain", type: "text", default: strand.domain },
                { name: "tier", label: "Epistemic Tier", type: "text", default: strand.tier },
              ],
            },
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Seeded ${insertedStrands.length} new knowledge strands and their categories.`,
      seededCount: insertedStrands.length,
      totalAvailable: SYSTEM_KNOWLEDGE_STRANDS.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to seed knowledge strands." },
      { status: 500 }
    );
  }
}
