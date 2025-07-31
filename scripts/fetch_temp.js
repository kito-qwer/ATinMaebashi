const fs = require('fs');
const https = require('https');

const url = 'https://api.cultivationdata.net/past?no=47624';

https.get(url, (res) => {
	let data = '';
	res.on('data', chunk => data += chunk);
	res.on('end', () => {
		const json = JSON.parse(data);
		const cityData = json["前橋（群馬県)"];
		const date = Object.keys(cityData)[0];
		const avgTemp = cityData[date]["平均気温"];

		// 既存CSVの内容を取得
		let csv = fs.existsSync('data.csv') ? fs.readFileSync('data.csv', 'utf8').trim().split('\n') : ['date,temp'];

		// 末尾10行をチェック（重複防止）
		const recentLines = csv.slice(-10);
		const alreadyExists = recentLines.some(line => line.startsWith(date + ','));

		if (!alreadyExists) {
			fs.appendFileSync('data.csv', `${date},${avgTemp}\n`);
			console.log(`Appended: ${date}, ${avgTemp}`);
		} else {
			console.log(`No update: ${date} already exists`);
		}
	});
}).on('error', (err) => {
	console.error(err);
	process.exit(1);
});
