# nyc-capital-commitment-scrape

node.js scraping script for NYC OMB Capital Commitment Plans

## Get Data

[January 2017 Capital Commitment Plan](https://raw.githubusercontent.com/chriswhong/nyc-capital-commitment-scrape/master/csv/2017-Jan/commitments.csv) - 29,616 commitments - $100.3B

## How to Use

Install dependencies `npm install`

Run scrape.js with a directory of capital commitment plan pdfs as an argument

For example, if you have capital commitment plan pdfs in `/pdf/2017-Jan`, run `node scrape /pdf/2017-Jan`.

The script will create a directory of the same name in `/csv`, with a new file called `commitments.csv` containing the data.
