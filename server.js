import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Serve static files from the project root directory
app.use(express.static(__dirname));

// Explicitly serve chess.html for the root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'chess.html'));
});

const server = http.createServer(app);
const port = 8894; // Use a new, clean port

server.listen(port, () => {
    console.log(`====================================================`);
    console.log(`Chess server started on a new clean port.`);
    console.log(`Please open http://localhost:${port}/ to play.`);
    console.log(`====================================================`);
});
