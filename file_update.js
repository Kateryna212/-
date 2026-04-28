const http = require('http');
const fs = require('fs');
const path = require('path');

const port = process.argv[2];
const DATA_FILE = path.join(process.cwd(), 'data.json');

const server = http.createServer((req, res) => {
  // Перевіряємо шлях за допомогою регулярного виразу, щоб дістати ID
  // Наприклад: /data/2 -> ID буде 2
  const match = req.url.match(/^\/data\/(\d+)$/);

  if (req.method === 'PUT' && match) {
    const id = parseInt(match[1]);
    let body = '';

    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      // 1. Перевірка наявності файлу
      if (!fs.existsSync(DATA_FILE)) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: "File not found" }));
      }

      try {
        // 2. Валідація вхідного JSON
        const updateData = JSON.parse(body);
        
        // 3. Читання та пошук об'єкта
        const fileContent = fs.readFileSync(DATA_FILE, 'utf8');
        let items = JSON.parse(fileContent);

        const index = items.findIndex(item => item.id === id);

        if (index === -1) {
          // Якщо ID не знайдено
          res.writeHead(404, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ error: "Item not found" }));
        }

        // 4. Оновлення об'єкта (зберігаємо старий ID, додаємо нові дані)
        items[index] = { ...items[index], ...updateData, id: id };

        // 5. Запис назад у файл
        fs.writeFileSync(DATA_FILE, JSON.stringify(items, null, 2), 'utf8');

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(items[index]));

      } catch (err) {
        // Якщо JSON у тілі запиту або файлі пошкоджений
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: "Invalid JSON" }));
      }
    });
  } else {
    res.writeHead(404);
    res.end();
  }
});

server.listen(port);
