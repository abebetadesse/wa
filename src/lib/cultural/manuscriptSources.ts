export type ManuscriptExtractionStatus = "text_extracted" | "scanned_image_only" | "ocr_completed_needs_review";

export interface ManuscriptSource {
  id: string;
  title: string;
  titleAmharic: string;
  sourceFileName: string;
  sourceSha256: string;
  pageCount?: number;
  extractionStatus: ManuscriptExtractionStatus;
  ocrLanguage?: string;
  detectedTitleFromOcr?: string;
  filenameContentNote?: string;
  sourceType: "user_supplied_local_pdf" | "user_supplied_local_docx";
  mediaStatus?: "embedded_images_found" | "no_embedded_images_found" | "external_images_unresolved";
  componentCount?: number;
  themes: string[];
  safeIntegration: string[];
  restrictedUses: string[];
  reviewStatus: "needs_cultural_review";
}

export const ETHIOPIAN_MANUSCRIPT_SOURCES: ManuscriptSource[] = [
  {
    id: "metsehafe-fews-docx",
    title: "Metsehafe Fews",
    titleAmharic: "መጽሐፈ ፈውስ",
    sourceFileName: "Metsehafe Fews.docx",
    sourceSha256: "3E732122EEAC4170F0A7C5A791EA8FF5599202D359FF80F4D8A8551D42F16F3",
    extractionStatus: "text_extracted",
    detectedTitleFromOcr: "መጽሐፈ ፈውስ",
    filenameContentNote: "The supplied DOCX identifies itself as a 2000 E.C. work attributed to መሪራስ አማን በላይ. This is a source fingerprint and not an authorship or authenticity determination.",
    sourceType: "user_supplied_local_docx",
    mediaStatus: "no_embedded_images_found",
    componentCount: 38,
    themes: ["Ethiopian traditional plant knowledge", "religious and cultural healing history", "Ge'ez and Amharic manuscript terminology"],
    safeIntegration: ["Rights-aware table-of-contents navigation", "Cultural and historical source comparison", "Search and review metadata without publishing full text"],
    restrictedUses: ["No diagnosis, dosage, preparation, or treatment instructions", "No unsupervised use of plants or substances", "No reproduction of the full work without rights-holder permission"],
    reviewStatus: "needs_cultural_review",
  },
  {
    id: "metsehafe-fewus",
    title: "Mets'hafe Fewus",
    titleAmharic: "መጽሐፈ ፈውስ",
    sourceFileName: "መጽሐፈ ፈውስ.pdf",
    sourceSha256: "A36301822DFA97706A3694E9A1FF52082E665FD923D49332025567C43C026999",
    pageCount: 399,
    extractionStatus: "ocr_completed_needs_review",
    ocrLanguage: "amh+eng",
    detectedTitleFromOcr: "መጽሐፈ ግጻዌ",
    filenameContentNote: "The supplied filename appears to contain a Gitsaw title page; verify the file-to-title mapping with the rights holder.",
    sourceType: "user_supplied_local_pdf",
    themes: ["Ethiopian healing manuscript tradition", "spiritual and cultural care", "manuscript-based remedies and practices"],
    safeIntegration: ["Cultural reference and historical context", "Searchable source metadata after authorized OCR and review", "Domain B context kept separate from scientific recommendations"],
    restrictedUses: ["No diagnosis", "No medication or herbal dosing", "No replacement for emergency or professional care"],
    reviewStatus: "needs_cultural_review",
  },
  {
    id: "mets-hafe-gitsaw",
    title: "Mets'hafe Gitsaw",
    titleAmharic: "መጽሐፈ ግጻዌ",
    sourceFileName: "መጽሐፈ ግጻዌ.pdf",
    sourceSha256: "195FD699EBD2E0FB9D8F6A152BA85AC68E69B73916BE59621B6553E264A3240C",
    pageCount: 182,
    extractionStatus: "ocr_completed_needs_review",
    ocrLanguage: "amh+eng",
    detectedTitleFromOcr: "መጽሐፈ ፈውስ",
    filenameContentNote: "The supplied filename appears to contain a Fewus title page; verify the file-to-title mapping with the rights holder.",
    sourceType: "user_supplied_local_pdf",
    themes: ["Ethiopian Orthodox liturgical manuscript tradition", "calendar and feast context", "prayer and devotional heritage"],
    safeIntegration: ["Cultural calendar context", "Faith-sensitive language and library metadata", "Optional Domain B educational summaries after review"],
    restrictedUses: ["No scientific treatment claims", "No coercive or prescriptive religious guidance", "No reproduction of the full manuscript in public responses"],
    reviewStatus: "needs_cultural_review",
  },
  {
    id: "mets-hafe-asmat",
    title: "Mets'hafe Asmat",
    titleAmharic: "መጽሐፈ አስማት",
    sourceFileName: "መጽሐፈ አስማት.pdf",
    sourceSha256: "D5CC60C069706CEB1DB6BBFF5D921B192E6BDF190D70206916C3C937B6258719",
    pageCount: 25,
    extractionStatus: "text_extracted",
    ocrLanguage: "amh+eng",
    sourceType: "user_supplied_local_pdf",
    themes: ["Protective and remedial ritual traditions", "prayer formulas and manuscript practice", "Ethiopian esoteric heritage"],
    safeIntegration: ["Historical and anthropological description", "Non-operational topic summaries", "Domain B cultural literacy with safety notices"],
    restrictedUses: ["Do not provide ritual instructions as medical treatment", "Do not encourage ingestion, smoke exposure, burning, or unsafe substances", "Escalate crisis, poisoning, injury, or mental-wellbeing concerns to qualified services"],
    reviewStatus: "needs_cultural_review",
  },
];

export function getManuscriptSource(id: string) {
  return ETHIOPIAN_MANUSCRIPT_SOURCES.find((source) => source.id === id);
}
