import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('https://www.bbc.co.uk');
  await page.screenshot({ path: 'bcc-news.png' });

  await browser.close();
})();