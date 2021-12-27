const puppeteer = require('puppeteer');
require('dotenv').config();

(async () => {
	const browser = await puppeteer.launch();
	const page = await browser.newPage();
	// URL of desired snowboard on neversummer.com
	const url = process.env.URL;

	// Grab name of the board from URL for display
	const board = url.split('2022')[1].split('-')[1].toUpperCase();

	// Size of snowboard desired i.e. 154x - (Wide)
	// Should be formatted as seen on website
	const size = process.env.SIZE.replace(' ', '-').replace(/[()]/g, '').toLowerCase()

	console.log('WORKING...');

	// Go to Proto Slinger PDP
	await page.goto(url, { waitUntil: 'networkidle2' });

	console.log(`LOOKING AT URL: ${url.toUpperCase()}`);

	// Click body, fixes waited on selector not being found
	await page.click('body');

	// Wait for desired size option to be "attached"
	await page.waitForSelector(`#pa_size option[value="${size}"].attached`);

	console.log(`SIZE OPTION ${size.toUpperCase()} FOUND, CHECKING STOCK...`);

	const inStock = await page.evaluate((size) => {
		// Grab size option element
		const option = document.querySelector(`#pa_size option[value="${size}"]`);

		if (option) {
			// Return stock status
			return option.classList.contains('out-of-stock') ? 'OUT OF STOCK :\'(' : 'IN STOCK!!!';
		} else {
			// Element not found...
			return 'SIZE NOT FOUND...';
		}
	}, size);

	// Log stock status
	console.log('STATUS: ', board + ' ' + inStock);

	// Close browser...DONE
	await browser.close();
})();
