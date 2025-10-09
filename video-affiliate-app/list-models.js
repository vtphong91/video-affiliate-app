const https = require('https');

const apiKey = 'AIzaSyATmQW41XWkt4s_D7y2Ld2QoplEHzgO8NQ';
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

https.get(url, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const response = JSON.parse(data);
    if (response.models) {
      console.log('Available models:');
      response.models.forEach(m => {
        if (m.supportedGenerationMethods && m.supportedGenerationMethods.includes('generateContent')) {
          console.log('  - ' + m.name);
        }
      });
    } else {
      console.log(data);
    }
  });
});
