const http = require('http');
const fs = require('fs').promises; // Використовуємо проміси для зручності
const path = require('path');

const port = process.argv[2];

const server = http.createServer(async (req, res) => {
  if (req.method === 'GET' && req.url === '/data') {
    try {
      // Визначаємо шлях до файлу (у тій же папці, що і скрипт)
      const filePath = path.join(process.cwd(), 'data.json');
      
      // Читаємо вміст файлу
      const content = await fs.readFile(filePath, 'utf-8');
      
      // Пробуємо розпарсити вміст, щоб перевірити, чи це валідний JSON
      const jsonData = JSON.parse(content);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(jsonData));

    } catch (error) {
      // Якщо файл не знайдено, або помилка парсингу JSON
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: "Internal Server Error or Invalid JSON" }));
    }
  } else {
    res.writeHead(404);
    res.end();
  }
});

server.listen(port);
