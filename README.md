# nyc-capital-commitment-scrape

node.js scraping script for NYC OMB Capital Commitment Plans.  The NYC Capital Commitment Plan is a detailed budget document that complements the Capital Budget, showing detailed sub-project committed costs and expected commitment dates.  The Capital Commitment plan is [published as a 4-part PDF](http://www1.nyc.gov/site/omb/publications/finplan01-17.page), but machine-readable data at the commitment level is not published.

### Disclaimer
I have not thoroughly QC'd the output csv in this repo, and cannot vouch for its accuracy.  I recommend that you spot-check individual commitments with the source PDFs if you plan to use this dataset.  Please [open issues in this repo](https://github.com/chriswhong/nyc-capital-commitment-scrape/issues) if you find discrepencies, or submit a pull request if you can help with the scraping code.

## Get Data

[January 2017 Capital Commitment Plan](https://raw.githubusercontent.com/chriswhong/nyc-capital-commitment-scrape/master/csv/2017-Jan/commitments.csv) - 29,616 commitments, $99.6B

## How to Use

Install dependencies `npm install`

Run scrape.js with a directory of capital commitment plan pdfs as an argument

For example, if you have capital commitment plan pdfs in `/pdf/2017-Jan`, run `node scrape /pdf/2017-Jan`.

The script will create a directory of the same name in `/csv`, with a new file called `commitments.csv` containing the data.
