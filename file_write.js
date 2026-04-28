const http = require('http');
const fs = require('fs');
const path = require('path');

const port = process.argv[2];

const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/data') {
    let body = '';

    // Збираємо дані з потоку
    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      try {
        // Перевіряємо, чи прийшов валідний JSON
        JSON.parse(body);

        // Шлях до файлу
        const filePath = path.join(process.cwd(), 'data.json');

        // Записуємо дані у файл синхронно
        fs.writeFileSync(filePath, body, 'utf8');

        // Відповідаємо 200 OK
        res.writeHead(200);
        res.end();
      } catch (err) {
        // Якщо JSON невалідний
        res.writeHead(400);
        res.end(JSON.stringify({ error: "Invalid JSON" }));
      }
    });
  } else {
    res.writeHead(404);
    res.end();
  }
});

server.listen(port);
