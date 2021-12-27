const puppeteer = require('puppeteer');

(async () => {
	const browser = await puppeteer.launch();
	const page = await browser.newPage();

	console.log('WORKING...FINDING STOCK STATUS OF PROTO SLINGER 154X');

	// Go to Proto Slinger PDP
	await page.goto('https://www.neversummer.com/shop/snowboards/mens-2022-protoslinger-snowboard/', { waitUntil: 'networkidle2' });

	// Click body, fixes waited on selector not being found
	await page.click('body');

	// Wait for desired size option to be "attached"
	await page.waitForSelector('#pa_size option[value="154x-wide"].attached');

	let inStock = await page.evaluate(() => {
		// Grab size option element
		const option = document.querySelector('#pa_size option[value="154x-wide"]');
		
		if (option) {
			// Return stock status
			return option.classList.contains('out-of-stock') ? 'OUT OF STOCK :\'(' : 'IN STOCK!!!';
		} else {
			// Element not found...
			return 'Attached size element not found...';
		}
	});

	// Log stock status
	console.log('STATUS: ', inStock);

	// Close browser...DONE
	await browser.close();
})();
