// Попробуем разные варианты API
const STOCKFISH_API_V2_URL = 'https://stockfish.online/api/v2/';

async function testStockfishV2() {
    const testFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    const depth = 5;
    
    console.log('Тестируем Stockfish API v2...');
    
    try {
        const response = await fetch(STOCKFISH_API_V2_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                fen: testFen,
                depth: depth,
                mode: 'bestmove'
            })
        });
        
        console.log('Response status:', response.status);
        console.log('Response ok:', response.ok);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('Response JSON:', result);
        
        if (result.success && result.data) {
            console.log('Найден ход:', result.data);
        }
        
    } catch (error) {
        console.error('Ошибка v2:', error);
    }
}

async function testAlternativeAPI() {
    console.log('Тестируем альтернативный API...');
    
    try {
        // Попробуем chess.com API или другой сервис
        const response = await fetch('https://chess-api.com/v1/analysis', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
                depth: 5
            })
        });
        
        console.log('Alternative API status:', response.status);
        if (response.ok) {
            const result = await response.json();
            console.log('Alternative API response:', result);
        }
        
    } catch (error) {
        console.error('Альтернативный API недоступен:', error);
    }
}

async function runTests() {
    await testStockfishV2();
    await testAlternativeAPI();
}

runTests();