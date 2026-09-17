const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });

  console.log('Navigating to http://localhost:3000/collection...');
  await page.goto('http://localhost:3000/collection', { waitUntil: 'networkidle2' });

  const comingSoonButtons = await page.$$eval('button', buttons =>
    buttons.map(b => b.textContent.trim()).filter(text => text.toUpperCase().includes('COMING SOON'))
  );
  console.log('Found Coming Soon buttons:', comingSoonButtons);

  await browser.close();
})();
