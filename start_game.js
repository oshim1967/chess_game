
import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.static(path.join(__dirname)));
const server = http.createServer(app);
const port = 8888;

server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
    console.log(`Open http://localhost:${port}/chess.html to play.`);
});
