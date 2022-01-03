const puppeteer = require('puppeteer');
const nodemailer = require('nodemailer');
require('dotenv').config();

(async () => {
	// Initialize puppeteer
	const browser = await puppeteer.launch();
	const page = await browser.newPage();

	// Grab needed env variables
	const url = process.env.URL; // URL of desired snowboard

	// Grab name of the board from URL for display
	const board = url.split('2022')[1].split('-')[1].toUpperCase();

	// Size of snowboard desired i.e. 154x - (Wide)
	// Should be formatted as seen on website
	const size = process.env.SIZE.replace(' ', '-').replace(/[()]/g, '').toLowerCase()

	console.log('WORKING...');

	// Go to PDP
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

	// Send email to user letting them know of the stock status
	try {
		// Desired size was not found on PDP page, discontinue
		if (inStock.includes('SIZE NOT FOUND')) return;

		// Create necessary email fields
		const subject = `${board} IS ${inStock}`

		const message = `${ inStock.includes('OUT OF STOCK') ? 'BAD NEWS... THE ' + board + ' IS ' + inStock : 'THE ' + board + ' IS  ' + inStock }`

		let html = `
			<h1>${ inStock.includes('OUT OF STOCK') ?
			'BAD NEWS... THE ' + board + ' IS ' + inStock :
			'THE ' + board + ' IS ' + inStock}<h1></br>`;

		html += `<a href="${url}" target="_blank">LINK TO ${board}</a>`;

		// Send email to client
		await sendMessage(recipient, subject, message, html);
	} catch(e) {
		// Something went wrong, try to send message warning of bot failure
		const subject = 'Never Summer Bot Failed :/';
		const message = 'Something went wrong when checking if your snowboard is in stock...' + e.message;
		let html = '<h1>Something went wrong with your never summer inventory checker bud...<h1></br>';
		html += `Error: ${e.message}`;

		await sendMessage(recipient, subject, message, html);

		console.log(e.message);
	}

	// Close browser...DONE
	await browser.close();
})();

async function sendMessage (recipient, subject, text, html) {
	// Dummy account for local testing
	//const testAccount = await createTestSmtpAccount();
	//const transporter = nodemailer.createTransport(testAccount);

	const transporter = nodemailer.createTransport({
		host: 'smtp.gmail.com',
		port: 465,
		secure: true,
		auth: {
			user: process.env.EMAIL,
			pass: process.env.PASSWORD,
		}
	});

	const emailResponse = await transporter.sendMail({
			from: 'Never Summer Stock Checker',
			to: process.env.RECEIVER,
			subject,
			text,
			html,
	});

	console.log(`Message sent to ${recipient}`);
	//console.log('Message details: ', emailResponse.messageId);
	//console.log('Preview URL: ', nodemailer.getTestMessageUrl(emailResponse));
}

// Creates dummy email account for testing purposes
const createTestSmtpAccount = () => {
	return new Promise((resolve, reject) => {
		nodemailer.createTestAccount((error, account) => {
			if (error) {
				return reject(`Failed to create a testing account. Details: ${error.message}`);
			}

			return resolve({
				host: account.smtp.host,
				password: account.pass,
				port: account.smtp.port,
				secure: account.smtp.secure,
				auth: {
					user: account.user,
					pass: account.pass,
				}
			});
		});
	});
};
