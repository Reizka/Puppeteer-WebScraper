const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");
require("dotenv").config();
const {GetSpeakers, OpenAndCloseLinks} = require("./GetSpeakers");
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

  //delayt to scroll by hand


  // Go throug the speaker table
  const rows = await GetSpeakers(page)
  await OpenAndCloseLinks(browser,rows);

  console.log("creating CSV file...");
  // Prepare CSV content
  let csvContent =
    "name;area of expertise;topic;keywords;date;preferred city\n"; // CSV header
  rows.forEach((row) => {
    if (row[0] != "") {
      csvContent += row.cells.join(";") + "\n"; // Join each row's columns and add a new line
    }
  });

  // Define CSV file path (adjust the filename as needed)
  const csvFilePath = path.resolve(__dirname, "tableData.csv");

  // Write the CSV content to a file
  fs.writeFileSync(csvFilePath, csvContent);

  console.log(`CSV file has been saved to ${csvFilePath}`);

  await browser.close();


})();
