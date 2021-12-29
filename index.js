const puppeteer = require('puppeteer');
const nodemailer = require('nodemailer');
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
		const subject = `${board} IS ${inStock}`
		const message = `${ inStock.includes('OUT OF STOCK') ? 'Bad news... the ' + board + ' IS ' + inStock : 'The ' + board + ' IS  ' + inStock }`
		let html = false;

		if (inStock.includes('OUT OF STOCK')) {
			html = `<a href="${url}" target="_blank">${board}</a>`;
		}

		await sendMessage('bradyjbridges@gmail.com', subject, message, html, board, inStock, url);
	} catch(e) {
		console.log('Error sending email...');
		console.log(e.message);
	}

	// Close browser...DONE
	await browser.close();
})();

async function sendMessage (recipient, subject, text, html, board, inStock, url) {
	const testAccount = await createTestSmtpAccount();
	console.log('account: ', testAccount);

	const transporter = nodemailer.createTransport(testAccount);

	const emailResponse = await transporter.sendMail({
		from: 'Never Summer Stock Checker',
		to: recipient,
		subject,
		text,
		html: `<h4>${text}</h4><a href="${url}" target="_blank">${board} page</a>`,
	});

	console.log(`Message sent to ${recipient}`);
	console.log('Message details: ', emailResponse.messageId);
	console.log('Preview URL: ', nodemailer.getTestMessageUrl(emailResponse));
}

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
