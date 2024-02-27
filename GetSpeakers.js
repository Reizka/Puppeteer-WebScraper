const GetSpeakers = async (page) => {
  await page.goto("https://www.pintofscience.be/speakers");
  await new Promise(resolve => setTimeout(resolve, 10000));
  //await autoScrollPage(page);
  //await autoScroll(page, ".mtQJtX");
  //put console feed to terminal
  // Select all table rows
  return await page.$$eval("tr", (tableRows) => {
    return tableRows.map((row) => {
      const cells = Array.from(row.querySelectorAll("td")).map((td) => {
        const div = td.querySelector(".ZTH0AF");
        let text = div ? div.innerText : td.innerText;
        // Remove semicolons (and optionally commas) without adding spaces
        text = text.replace(/;/g, ",");
        return text; // You need to return the text here
      });
      // Select specific td contents:
      const selectedCells = [cells[1], cells[2], cells[3], cells[4], cells[6]];

      // Get the URL of a link in the row
      const link = row.querySelector("a");
      const url = link ? link.href : null;
      return { cells: selectedCells, url };
    });
  });
};

const OpenAndCloseLinks = async (browser, rows) => {
  for (let i = 0; i < rows.length; i += 30) {
    const chunk = rows.slice(i, i + 30);
    await Promise.all(
      chunk.map(async (row) => {
        if (row.url) {
          console.log(row.url);
          const newPage = await browser.newPage();
          await newPage.goto(row.url);
          const city = await newPage.evaluate(() => {
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
