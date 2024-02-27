const GetSpeakers = async (page) => {
    // open the speaker db page
  await page.goto("https://www.pintofscience.be/speakers");
   // delay for manual scrolling
  await new Promise(resolve => setTimeout(resolve, 10000));
  // Auto scroll the speaker table - doesn't work atm.
  //await autoScrollPage(page);
  //await autoScroll(page, ".mtQJtX");

  // Get table rows
  return await page.$$eval("tr", (tableRows) => {
    return tableRows.map((row) => {
      const cells = Array.from(row.querySelectorAll("td")).map((td) => {
        const div = td.querySelector(".ZTH0AF");
        let text = div ? div.innerText : td.innerText;
        // replace semicolon with commas
        text = text.replace(/;/g, ",");
        return text; // You need to return the text here
      });
      // Select specific td contents:
      const selectedCells = [cells[1], cells[2], cells[3], cells[4], cells[6]];

      // Get the URL of a link in the row
      const link = row.querySelector("a");
      // add link url to to the selected cells
      const url = link ? link.href : null;
      return { cells: selectedCells, url };
    });
  });
};

// open each link in the table and get the city
const OpenAndCloseLinks = async (browser, rows) => {
    //30 speakers in a single go
  for (let i = 0; i < rows.length; i += 30) {
    const chunk = rows.slice(i, i + 30);
    await Promise.all(
      chunk.map(async (row) => {
        if (row.url) {
          console.log(row.url);
          const newPage = await browser.newPage();
          await newPage.goto(row.url);
          const city = await newPage.evaluate(() => {
            // ID for the div that holds the preferred city for speaker
            const element = document.querySelector("#comp-jub924u9");
            return element ? element.innerText : "not set";
          });
          console.log(city);
          row.cells.push(city);
          await newPage.close();
        }
      })
    );
  }
};

const autoScroll = async (page, selector) => {
  try {
    await page.evaluate(async (selector) => {
      const scrollableSection = document.querySelector(selector);
      if (scrollableSection) {
        await new Promise((resolve, reject) => {
          let totalHeight = 0;
          const distance = 100;
          const timer = setInterval(() => {
            const scrollHeight = scrollableSection.scrollHeight;
            scrollableSection.scrollTop += distance;
            totalHeight += distance;

            if (totalHeight >= scrollHeight) {
              clearInterval(timer);
              resolve();
            }
          }, 100);
        });
      }
    }, selector);
  } catch (err) {
    console.error(err);
  }
};

const autoScrollPage = async (page) => {
    await page.evaluate(async () => {
      await new Promise((resolve, reject) => {
        let totalHeight = 0;
        const distance = 100;
        const timer = setInterval(() => {
          const scrollHeight = document.body.scrollHeight;
          window.scrollBy(0, distance);
          totalHeight += distance;
  
          if (totalHeight >= scrollHeight){
            clearInterval(timer);
            resolve();
          }
        }, 100);
      });
    });
  };

module.exports = { GetSpeakers, OpenAndCloseLinks };
