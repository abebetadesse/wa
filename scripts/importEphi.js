/*
  Simple import helper for EPHI ethnobotanical pages.
  - Run locally from the repo root: node scripts\importEphi.js
  - It fetches the EPHI URL, performs heuristic extraction of scientific names and vernacular names,
    and writes src/lib/knowledge/ethiopianMedicinalPlants.custom.ts with a generated array.

  WARNING: HTML parsing here is intentionally conservative and best-effort. Review generated output
  before committing/publishing. The script stores only basic fields and provenance (sourceUrl).
*/

const fs = require('fs');
const path = require('path');
const fetch = global.fetch ? global.fetch : require('node-fetch');

const EPHI_URL = 'https://ephi.gov.et/research/traditional-modern-medicine/an-ethnobotanical-study-of-medicinal-plants-by-wereda/';

function makeId(name){
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g,'');
}

async function fetchHtml(url){
  const res = await fetch(url);
  if(!res.ok) throw new Error(`Fetch failed: ${res.status}`);
  return res.text();
}

// Stricter extraction: focus on strict Latin binomial patterns (Genus species) and ignore common headings.
function extractPlantsFromHtml(html){
  const entries = [];
  const flat = html.replace(/\n/g,' ');

  const binomialRegex = /\b([A-Z][a-z]{2,})\s+([a-z]{3,}(?:-[a-z]{2,})?)(?:\b|\s*\()/g;
  const stopWords = new Set(['About','Contact','Services','Privacy','Terms','Home','News','Background','Introduction','Executive','Summary','Acknowledgement','References','References:','Methodology']);

  let match;
  while((match = binomialRegex.exec(flat))){
    const genus = match[1];
    const species = match[2];
    // filter out headings that accidentally match (e.g., "About us") by ensuring genus not a common heading
    if(stopWords.has(genus)) continue;
    const sci = `${genus} ${species}`;

    // attempt to capture vernacular nearby (parentheses after the binomial)
    const after = flat.slice(match.index, match.index + 200);
    const vernMatch = after.match(/\(([^)]+)\)/);
    const vern = vernMatch ? vernMatch[1].split(/[;,]/)[0].trim() : '';

    if(!entries.some(e=>e.scientificName===sci)){
      entries.push({ scientificName: sci, vernacularName: vern });
    }
  }

  return entries;
}

function buildMedicinalPlantRecord(entry){
  const id = makeId(entry.scientificName || entry.vernacularName || 'unknown');
  return {
    id: id,
    scientificName: entry.scientificName || '',
    vernacularName: entry.vernacularName || entry.localName || '',
    amharicName: entry.amharicName || undefined,
    growthForm: entry.growthForm || 'unknown',
    habitat: entry.habitat || 'not_reported',
    plantParts: entry.plantParts || [],
    traditionalUse: entry.traditionalUse || 'not_reported',
    diseasesTreated: entry.diseasesTreated || [],
    source: `EPHI ethnobotanical page - ${EPHI_URL}`,
    sourceUrl: EPHI_URL,
  };
}

(async ()=>{
  console.log('Fetching EPHI page...');
  try{
      const html = await fetchHtml(EPHI_URL);

      // Look for a linked PDF on the page and download it for manual review if present
      const pdfMatch = html.match(/href=["']([^"']+\.pdf)["']/i);
      if(pdfMatch){
        let pdfUrl = pdfMatch[1];
        // make absolute if needed
        if(!/^https?:\/\//i.test(pdfUrl)){
          const base = new URL(EPHI_URL);
          pdfUrl = new URL(pdfUrl, base).href;
        }
        console.log('Found linked PDF:', pdfUrl);
        try{
          const pdfRes = await fetch(pdfUrl);
          if(pdfRes.ok){
            const arr = await pdfRes.arrayBuffer();
            const outPdf = path.join(process.cwd(),'scripts','EPHI_source.pdf');
            fs.writeFileSync(outPdf, Buffer.from(arr));
            console.log('Downloaded PDF to', outPdf);
          }else{
            console.warn('Failed to download PDF, status', pdfRes.status);
          }
        }catch(err){
          console.warn('PDF download error:', err.message || err);
        }
      } else {
        console.log('No linked PDF found on the page (or link pattern differed).');
      }

      const raw = extractPlantsFromHtml(html);
      console.log(`Found ${raw.length} candidate entries (heuristic).`);

      const records = raw.map(buildMedicinalPlantRecord);

      const outPath = path.join(process.cwd(),'src','lib','knowledge','ethiopianMedicinalPlants.custom.ts');
      const fileContent = `import { MedicinalPlant } from './ethiopianMedicinalPlants';\n\n`+
        `export const ETHIOPIAN_MEDICINAL_PLANTS_CUSTOM: MedicinalPlant[] = ${JSON.stringify(records,null,2)};\n`;

      fs.writeFileSync(outPath, fileContent, 'utf8');
      console.log('Wrote', outPath);
      console.log('Please review the generated records before committing.');
  }catch(err){
    console.error('Error during import:', err);
    process.exit(1);
  }
})();
