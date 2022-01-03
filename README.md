# never-summer-inventory-bot V1.0.0
Retrieves stock status of snowboard(s) on neversummer.com. Send email notification of inventory status.

## Setup
1. Install dependencies `npm install`
2. Create .env file to store variables.

In the .env file there are 5 expected variables. 
  1. URL (url of the never summer snowboard)
  2. SIZE (desired size of snowboard)
  3. EMAIL (Gmail account to send email from)
  4. PASSWORD (Password for Gmail account)
  5. RECEIVER (Email address to send notification to)

Run the application with Node, `node index.js`

Helpful error messages and bot status messages will be printed to the console.

Add to a cron job or something to get daily status updates on your greatly desired snowboard stock status.
