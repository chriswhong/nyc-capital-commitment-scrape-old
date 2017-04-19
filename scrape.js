const extract = require('pdf-text-extract');
const fs = require('fs-extra');


const inputPath = process.argv[2];
const outputPath = process.argv[3];

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
  'costdescription',
  'citycost',
  'noncitycost',
  'plancommdate',
];

output.write(`${csvHeaders.join(',')}\n`);

function parseLine(line) {
  // new budget line
  if (/BUDGET LINE/.test(line)) {
    budgetLine = line.match(/BUDGET LINE:(.*)FMS/)[1].trim();
    fmsNumber = line.match(/FMS #:(.{1,10}).*/)[1].trim();
    console.log(`Setting new budget line: ${budgetLine}, ${fmsNumber}`);
  } else if (/^\d{3}(.{1,10})/.test(line)) { // projects
    managingAgency = line.match(/^\d{3}/)[0];
    projectid = line.match(/^\d{3}(.{1,10})/)[1].trim();
    projectDescription = `"${line.match(/^\d{3}.{1,10}(.{1,62})/)[1].replace(/"/g, '').replace(/ +(?= )/g, '').trim()}"`;
    console.log(`Setting new capital project: ${managingAgency}${projectid}`);
  } else if (/\s[A-Z]{4}\s.{2,5}\s\d{3}\s/.test(line)) { // commitments
    const code = line.match(/\s[A-Z]{4}\s/)[0].trim();
    // var costNumber = line.match(/\s\d{3}\s/)[0];
    const rightSegment = line.substring(49, line.length);
    let costDescription = rightSegment.match(/[()A-Z\s./-]+/)[0];
    const chunks = rightSegment.split(costDescription)[1].split(/\s+/);
    costDescription = `"${costDescription.replace(/"/g, '').trim()}"`;

    if (chunks[0] === '') chunks.shift();

    if (chunks.length > 3) throw new Error('rightSegment has more than 3 elements');

    const cityCost = parseInt(chunks[0].replace(/,/g, ''), 10);
    const nonCityCost = parseInt(chunks[1].replace(/,/g, ''), 10);
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

extract(inputPath, {}, (err, pages) => {
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
