const extract = require('pdf-text-extract');
const fs = require('fs-extra');


const inputDir = process.argv[2];
const outputPath = `csv/${inputDir}/commitments.csv`;

fs.ensureFileSync(outputPath);
const output = fs.createWriteStream(outputPath);

let budgetLine;
let fmsNumber;
let managingAgency;
let projectid;
let projectDescription;


const csvHeaders = [
  'budgetline',
  'fmsnumber',
  'managingagency',
  'projectid',
  'description',
  'commitmentcode',
  'commitmentdescription',
  'citycost',
  'noncitycost',
  'plancommdate',
];

output.write(`${csvHeaders.join(',')}\n`);

function parseLine(line) {
  // check for patterns of new budget line, new project, or commitment
  if (/BUDGET LINE/.test(line)) {   // new budget line
    budgetLine = line.match(/BUDGET LINE:(.*)FMS/)[1].trim();
    fmsNumber = line.match(/FMS #:(.{1,10}).*/)[1].trim();

    console.log(`Setting new budget line: ${budgetLine}, ${fmsNumber}`);
  } else if (/^\d{3}(.{1,10})/.test(line)) { // projects
    managingAgency = line.match(/^\d{3}/)[0];
    projectid = line.match(/^\d{3}(.{1,10})/)[1].trim();
    projectDescription = `"${line.match(/^\d{3}.{1,10}(.{1,62})/)[1].replace(/"/g, '').replace(/ +(?= )/g, '').trim()}"`;

    console.log(`Setting new capital project: ${managingAgency}${projectid} - ${projectDescription}`);
  } else if (projectid && /\s[A-Z]{4}\s.{2,5}\s\d{3}\s/.test(line)) { // commitments
    const code = line.match(/\s[A-Z]{4}\s/)[0].trim();

    const rightSegment = line.substring(49, line.length);
    let costDescription = rightSegment.match(/[()A-Z\s./-]+/)[0];
    const chunks = rightSegment.split(costDescription)[1].split(/\s+/);
    costDescription = `"${costDescription.replace(/"/g, '').trim()}"`;

    if (chunks[0] === '') chunks.shift();

    if (chunks.length > 3) throw new Error('rightSegment has more than 3 elements');

    // multiply cost integers by 1000
    const cityCost = parseInt(chunks[0].replace(/,/g, ''), 10) * 1000;
    const nonCityCost = parseInt(chunks[1].replace(/,/g, ''), 10) * 1000;
    const planCommDate = chunks[2];

    console.log(`Logging commitment: ${code} - ${costDescription} - ${cityCost} ${nonCityCost} ${planCommDate}`);

    const lineData = [
      budgetLine,
      fmsNumber,
      managingAgency,
      projectid,
      projectDescription,
      code,
      costDescription,
      cityCost,
      nonCityCost,
      planCommDate,
    ];

    return `${lineData.join(',')}\n`;
  }
  return null;
}

function parsePDF(path) {
  console.log(path);
  extract(path, {}, (err, pages) => {
    pages.forEach((page) => {
      const lines = page.split('\n');
      lines.forEach((line) => {
        try {
          const outputRow = parseLine(line);
          if (outputRow !== null) output.write(outputRow);
        } catch (e) {
          console.log(e);
        }
      });
    });
  });
}

const files = fs.readdirSync(`pdf/${inputDir}`);
files.forEach((file) => {
  if (file.includes('.pdf')) parsePDF(`pdf/${inputDir}/${file}`);
});
