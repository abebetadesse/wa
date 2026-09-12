import { KnowledgeDocument, KnowledgeSearchResult } from "./catalog";

export class KnowledgeService {
  constructor(private readonly baseUrl = "/api/knowledge") {}

  async loadStrand(document: KnowledgeDocument) {
    const response = await fetch(`${this.baseUrl}/load`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: document }),
    });
    return response.json();
  }

  async getStrand(strand: string, category?: string, query?: string) {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (query) params.set("query", query);
    const suffix = params.toString() ? `?${params.toString()}` : "";
    const response = await fetch(`${this.baseUrl}/strand/${encodeURIComponent(strand)}${suffix}`);
    return response.json();
  }

  async search(query: string, strands?: string[], limit = 20): Promise<{ results: KnowledgeSearchResult[]; total: number }> {
    const response = await fetch(`${this.baseUrl}/search`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, strands, limit }),
    });
    return response.json();
  }

  async getAllStrands() {
    const response = await fetch(`${this.baseUrl}/all`);
    return response.json();
  }

  async getMetadata() {
    const response = await fetch(`${this.baseUrl}/metadata`);
    return response.json();
  }

  async reload() {
    const response = await fetch(`${this.baseUrl}/reload`, { method: "POST" });
    return response.json();
  }
}