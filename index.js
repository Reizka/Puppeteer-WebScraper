const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");
require("dotenv").config();
const username = process.env.USERNAME_P;
const password = process.env.PASSWORD;

(async () => {
  const browser = await puppeteer.launch({ headless: false });

  const page = await browser.newPage();

  await page.goto("https://www.pintofscience.be/members-area");

  // Selector using the data-testid of the div
  const selector = 'div[data-testid="switchToEmailLink"] button';

  // Wait for the button to be rendered
  await page.waitForSelector(selector);

  // Click the button
  await page.click(selector);

  // Wait for the email input field to be rendered
  await page.waitForSelector("#input_input_emailInput_SM_ROOT_COMP462");
  // Input email
  await page.type("#input_input_emailInput_SM_ROOT_COMP462", username);

  //Wait for the password input field to be rendered
  await page.waitForSelector("#input_input_passwordInput_SM_ROOT_COMP462");
  // Input password
  await page.type("#input_input_passwordInput_SM_ROOT_COMP462", password);

  // Click the login button
  await page.click('button[data-testid="buttonElement"]');

  //Wait for the page to load
  await page.waitForSelector("#comp-jsiwcnoq");

  await page.goto("https://www.pintofscience.be/speakers");

  // Select all table rows
  const rows = await page.$$eval("tr", (rows) => {
    return rows.map((row) => {
      const cells = Array.from(row.querySelectorAll("td")).map((td) => {
        const div = td.querySelector(".ZTH0AF");
        let text = div ? div.innerText : td.innerText;
        // Remove semicolons (and optionally commas) without adding spaces
        text = text.replace(/;/g, ",");
        return text;
      });
      // Select specific td contents: 2nd to 5th and 7th
      const selectedCells = [cells[1], cells[2], cells[3], cells[4], cells[6]];
      return selectedCells;
    });
  });

    // Get the first row's link
  const link = row.querySelector('a');
  await link.click();
  const prefCity = await page.evaluate('1 + 2');
  rows.push(prefCity);


  // Prepare CSV content
  let csvContent = "name;area of expertise;topic;keywords;date;preferred city\n"; // CSV header
  rows.forEach((row) => {
    csvContent += row.join(";") + "\n"; // Join each row's columns and add a new line
  });



  // Define CSV file path (adjust the filename as needed)
  const csvFilePath = path.resolve(__dirname, "tableData.csv");

  // Write the CSV content to a file
  fs.writeFileSync(csvFilePath, csvContent);

  console.log(`CSV file has been saved to ${csvFilePath}`);

  await browser.close();

  //await browser.close();
})();
