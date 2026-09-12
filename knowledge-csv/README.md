# Knowledge CSV Upload Pack

Each CSV is valid for the backend knowledge CSV importer. Upload one file at a time through the knowledge admin workspace or POST it to the CSV import endpoint.

Supported files:

- biochemical_knowledge.csv
- biological_knowledge.csv
- medication_knowledge.csv
- addiction_knowledge.csv
- ecological_knowledge.csv
- epidemiological_knowledge.csv
- psychological_knowledge.csv
- socioeconomic_knowledge.csv
- dietary_knowledge.csv
- cultural_knowledge.csv
- astrological_knowledge.csv

Required columns:

- strand: must match the filename strand ID.
- version: knowledge version, for example 1.0.0.
- description: document-level purpose.
- category_id: stable lowercase identifier; reuse it for more rows in the same category.
- category_name: display name.
- category_description: concise scope of the category.
- use_cases: pipe-separated use cases.
- item_json: one valid JSON object per row. Add intensive content as properties inside this object.

Important:

- Do not mix strand IDs in one file. The importer rejects mixed strands.
- Every category needs at least one data row.
- Keep category_id stable when adding rows.
- Escape CSV quotes by doubling them. JSON is already quoted in these examples.
- Replace the synthetic examples with reviewed, sourced content before production use.
- Include source_ref, evidence_level, population, region, contraindications, and safety_notes where relevant.
