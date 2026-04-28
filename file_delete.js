const http = require('http');
const fs = require('fs');
const path = require('path');

const port = process.argv[2];
const DATA_FILE = path.join(process.cwd(), 'data.json');

const server = http.createServer((req, res) => {
  // Витягуємо ID з URL (наприклад, /data/3)
  const match = req.url.match(/^\/data\/(\d+)$/);

  if (req.method === 'DELETE' && match) {
    const id = parseInt(match[1]);

    // 1. Перевірка наявності файлу (500)
    if (!fs.existsSync(DATA_FILE)) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: "File not found" }));
    }

    try {
      // 2. Читання файлу
      const fileContent = fs.readFileSync(DATA_FILE, 'utf8');
      const items = JSON.parse(fileContent);

      // 3. Пошук об'єкта
      const itemExists = items.some(item => item.id === id);

      if (!itemExists) {
        // Якщо ID не знайдено (404)
        res.writeHead(404, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: "Item not found" }));
      }

      // 4. Видалення (фільтруємо масив, залишаючи всі елементи, крім обраного)
      const filteredItems = items.filter(item => item.id !== id);

      // 5. Запис результату назад у файл
      fs.writeFileSync(DATA_FILE, JSON.stringify(filteredItems, null, 2), 'utf8');

      // Успішне видалення (200)
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: "Deleted successfully" }));

    } catch (err) {
      // Якщо JSON у файлі пошкоджений (400)
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: "Invalid JSON in file" }));
    }
  } else {
    res.writeHead(404);
    res.end();
  }
});

server.listen(port);
