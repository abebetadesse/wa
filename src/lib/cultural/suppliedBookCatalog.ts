export interface SuppliedBook {
  id: string;
  title: string;
  titleAm: string;
  description: string;
  fileName: string;
  coverImage: string;
  sourceFileName: string;
  pages: number;
  sizeBytes: number;
  sha256: string;
  languages: string[];
  format: string;
  textStatus: string;
  author?: string;
  edition?: string;
  isbn?: string;
  metadataTitle?: string;
  pdfMetadata?: string[];
  sourceUrl?: string;
  subjects: string[];
}

export const SUPPLIED_BOOKS: SuppliedBook[] = [
  {
    id: "dirsan-michael-raphael",
    title: "Dirsan of Michael and Raphael",
    titleAm: "ድርሳነ ሚካኤል ወ ድርሳነ ሩፋኤል",
    description:
      "Ge’ez and Amharic devotional Dirsan scan. The source filename identifies the Michael and Raphael texts; this volume is hosted by My Orthodox Books.",
    fileName: "dirsan-michael-raphael-geez-amharic.pdf",
    coverImage: "/books/covers/dirsan-michael-raphael-geez-amharic.jpg",
    sourceFileName:
      "85.e18bb5e188ade188b3e18a90-e1889ae18aabe18aa4e1888d-e18bb5e188ade188b3e18a90-e188a9e18d8be18aa4e1888d-geezamharic.pdf",
    pages: 179,
    sizeBytes: 10065995,
    sha256: "db75d6390b2ebc234a324a0cda5ad43028f5ae0cf43b4a60bfeb5f9505fc2dbd",
    languages: ["Ge’ez", "Amharic"],
    format: "Scanned PDF",
    textStatus: "Image-only scan; no searchable text layer",
    pdfMetadata: ["Created by Online2PDF.com", "PDF creation date: 2020-07-10"],
    sourceUrl:
      "https://myorthodoxbooks.org/wp-content/uploads/2020/07/85.e18bb5e188ade188b3e18a90-e1889ae18aabe18aa4e1888d-e18bb5e188ade188b3e18a90-e188a9e18d8be18aa4e1888d-geezamharic.pdf",
    subjects: ["Ethiopian Orthodox", "Archangels", "Devotional text", "Prayer"],
  },
  {
    id: "dirsan-uriel",
    title: "Dirsan of the Archangel Uriel",
    titleAm: "ድርሳነ ዑራኤል",
    description:
      "Ge’ez and Amharic devotional text for Uriel. The scanned source is a 159-page PDF.",
    fileName: "dirsan-uriel-geez-amharic.pdf",
    coverImage: "/books/covers/dirsan-uriel-geez-amharic.jpg",
    sourceFileName: "9.e18bb5e188ade188b3e18a90-e18b91e188abe18aa4e1888d-geezamharic.pdf",
    pages: 159,
    sizeBytes: 91855765,
    sha256: "8e19c340a1a5c6177fbbff4a5d56eb8c2d78d1de5dad07e836dbfd7661a3094f",
    languages: ["Ge’ez", "Amharic"],
    format: "Scanned PDF",
    textStatus: "Image-only scan; no searchable text layer",
    pdfMetadata: ["Created by Online2PDF.com", "PDF creation date: 2020-07-09"],
    subjects: ["Ethiopian Orthodox", "Archangels", "Uriel", "Devotional text"],
  },
  {
    id: "untitled-geez-amharic-manuscript",
    title: "Untitled Ethiopian Orthodox manuscript",
    titleAm: "ርዕሱ ያልተረጋገጠ መጽሐፍ",
    description:
      "A 576-page scanned book. The source PDF metadata says “Year 01 Ungrouped” and the cover title is not confidently identified; the title is left provisional rather than guessed.",
    fileName: "untitled-geez-amharic-manuscript.pdf",
    coverImage: "/books/covers/untitled-geez-amharic-manuscript.jpg",
    sourceFileName: "e18898e18bb3e1888de18b8d.pdf",
    pages: 576,
    sizeBytes: 80651707,
    sha256: "1723bab0a4ed896f9260c72453d43984376c8fe480f4cf0f0634a9e26218bc4a",
    languages: ["Ge’ez", "Amharic"],
    format: "Scanned PDF",
    textStatus: "Scan with scanner watermark only; no searchable book text",
    metadataTitle: "Year 01 Ungrouped",
    author: "CamScanner (PDF metadata; not an identified author)",
    pdfMetadata: ["PDF author field: CamScanner", "Title on cover not confidently identified"],
    subjects: ["Ethiopian Orthodox", "Religious manuscript", "Title requires review"],
  },
  {
    id: "metshafe-saatat",
    title: "Book of the Hours",
    titleAm: "መጽሐፈ ሰዓታት",
    description:
      "A 392-page scanned Ge’ez/Amharic prayer-hours book. The title is taken from the supplied filename; PDF author metadata is not treated as an attribution.",
    fileName: "metshafe-saatat.pdf",
    coverImage: "/books/covers/metshafe-saatat.jpg",
    sourceFileName: "e18898e18cbde18890e18d88-e188b0e18b93e189b3e189b5.pdf",
    pages: 392,
    sizeBytes: 132800447,
    sha256: "c9f8e0253da67edf31be24f6a2b3de17e4bc9f860b40dbb15dec4ca11f48909b",
    languages: ["Ge’ez", "Amharic"],
    format: "Scanned PDF",
    textStatus: "Image-only scan; no searchable text layer",
    author: "Unverified; PDF metadata says Windows User",
    pdfMetadata: ["Created by Microsoft Word 2016", "PDF creation date: 2019-03-21", "PDF author field is unverified"],
    subjects: ["Ethiopian Orthodox", "Prayer", "Hours", "Liturgical text"],
  },
  {
    id: "geez-handwriting",
    title: "Ge’ez Handwriting Book",
    titleAm: "የግእዝ ጽሕፈት መጽሐፍ",
    description:
      "Second edition Ge’ez handwriting workbook. The cover identifies Deacon Meron Debas and ISBN 978-1-5136-4702-9.",
    fileName: "geez-handwriting-book.pdf",
    coverImage: "/books/covers/geez-handwriting-book.jpg",
    sourceFileName: "geezhandwriting.pdf",
    pages: 51,
    sizeBytes: 8903570,
    sha256: "451804d0bc1cbdc2975bbec0f9514e2e68971c6c1877e17b591d474dd6242261",
    languages: ["Ge’ez", "English", "Amharic"],
    format: "Scanned PDF",
    textStatus: "Image-only scan; no searchable text layer",
    author: "Deacon Meron Debas (cover attribution)",
    edition: "2nd Edition",
    isbn: "978-1-5136-4702-9",
    pdfMetadata: ["Created by Online2PDF.com", "PDF creation date: 2019-04-24"],
    subjects: ["Ge’ez", "Handwriting", "Language learning", "Workbook"],
  },
  {
    id: "metshafe-gitsawe",
    title: "Mets’hafe Gitsaw",
    titleAm: "መጽሐፈ ግጻዌ",
    description:
      "182-page Ethiopian Orthodox liturgical calendar and readings book. The supplied PDF is the same file fingerprint already listed in the manuscript-source catalog.",
    fileName: "metshafe-gitsawe.pdf",
    coverImage: "/books/covers/metshafe-gitsawe.jpg",
    sourceFileName: "metshafe-gitsawe.pdf",
    pages: 182,
    sizeBytes: 15110569,
    sha256: "195fd699ebd2e0fb9d8f6a152ba85ac68e69b73916be59621b6553e264a3240c",
    languages: ["Ge’ez", "Amharic"],
    format: "Scanned PDF",
    textStatus: "Limited text layer (source website watermark only); book text is not searchable",
    author: "PDF metadata credits Retta, Beidemariam; attribution unverified",
    pdfMetadata: ["Created by Adobe Acrobat Pro Extended 9.5.3", "PDF creation date: 2016-04-13"],
    sourceUrl: "https://www.ethiopianorthodox.org/",
    subjects: ["Ethiopian Orthodox", "Liturgy", "Calendar", "Readings", "Feasts"],
  },
];
