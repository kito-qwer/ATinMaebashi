const fs = require('fs');
const https = require('https');

const url = 'https://www.jma.go.jp/bosai/forecast/data/forecast/100000.json';

https.get(url, (res) => {
	let data = '';
	res.on('data', chunk => data += chunk);
	res.on('end', () => {
		const json = JSON.parse(data);

		// 前橋の予報データを取得
		const timeSeries = json[1].timeSeries[1];
		const timeDefines = timeSeries.timeDefines;
		const areas = timeSeries.areas;

		// 「前橋」エリアを探す
		const maebashi = areas.find(area => area.area.name === '前橋');
		if (!maebashi) {
			console.error('前橋のデータが見つかりません');
			process.exit(1);
		}

		const tempsMin = maebashi.tempsMin;
		const tempsMax = maebashi.tempsMax;

		let output = 'date,temp\n'; // ヘッダー追加

		for (let i = 0; i < timeDefines.length; i++) {
			// ISO 8601 から日付のみ抽出
			const date = new Date(timeDefines[i]).toISOString().split('T')[0];
			const min = parseFloat(tempsMin[i]);
			const max = parseFloat(tempsMax[i]);

			if (!isNaN(min) && !isNaN(max)) {
				const avgTemp = ((min + max) / 2).toFixed(1);
				output += `${date},${avgTemp}\n`;
			}
		}

		// 上書きでファイル出力
		fs.writeFileSync('data_forecast.csv', output, 'utf8');
	});
}).on('error', (err) => {
	console.error(err);
	process.exit(1);
});
