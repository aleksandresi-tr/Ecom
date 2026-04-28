const fs = require("fs");

const transcriptPath =
  "C:/Users/Aleksandresi/.cursor/projects/c-Users-Aleksandresi-source-repos-Ecom/agent-transcripts/0bccd9e7-9252-45bd-8a05-593faea530b5/0bccd9e7-9252-45bd-8a05-593faea530b5.jsonl";
const outputPath = "C:/Users/Aleksandresi/source/repos/Ecom/lib/city-street-titles.generated.ts";

const lines = fs.readFileSync(transcriptPath, "utf8").split(/\r?\n/);
const targetLine = lines.find((line) => line.includes("here is mappings"));
if (!targetLine) {
  throw new Error("Could not find mapping line in transcript.");
}

const text = JSON.parse(targetLine).message.content?.[0]?.text ?? "";
const headers = Array.from(
  text.matchAll(/(?:^|\n)\s*([^\n<]{2,40})\s*\n<div class="/g),
  (m) => ({ header: m[1].trim(), index: m.index }),
);

const wantedOrder = ["თბილისი", "ბათუმი", "ქუთაისი", "რუსთავი", "თელავი", "ბაკურიანი"];
const wantedBlocks = [];
for (const wanted of wantedOrder) {
  const block = headers.find((item) => item.header === wanted && !wantedBlocks.includes(item));
  if (!block) {
    throw new Error(`Missing block for city: ${wanted}`);
  }
  wantedBlocks.push(block);
}

function segmentForIndex(index) {
  const thisHeaderPos = headers.findIndex((h) => h.index === index);
  const nextHeader = headers[thisHeaderPos + 1];
  return text.slice(index, nextHeader ? nextHeader.index : text.length);
}

function extractTitles(segment) {
  return Array.from(segment.matchAll(/title="([^"]+)"/g), (m) => m[1]);
}

function keyFromCity(cityKa) {
  const map = {
    თბილისი: "TBILISI",
    ბათუმი: "BATUMI",
    ქუთაისი: "KUTAISI",
    რუსთავი: "RUSTAVI",
    თელავი: "TELAVI",
    ბაკურიანი: "BAKURIANI",
  };
  return map[cityKa];
}

const payload = {};
for (const block of wantedBlocks) {
  const titles = extractTitles(segmentForIndex(block.index));
  payload[keyFromCity(block.header)] = titles;
}

const fileContent =
  "// AUTO-GENERATED FROM USER-PROVIDED HTML MAPPINGS.\n" +
  "// Do not edit manually; regenerate via scripts/generate-city-streets.js.\n\n" +
  `export const CITY_STREET_TITLES = ${JSON.stringify(payload, null, 2)} as const;\n`;

fs.writeFileSync(outputPath, fileContent, "utf8");
console.log(`Generated ${outputPath}`);
for (const [city, titles] of Object.entries(payload)) {
  console.log(`${city}: ${titles.length}`);
}
