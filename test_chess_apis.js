// Тестируем различные бесплатные шахматные API

const testFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

// 1. Lichess API
async function testLichessAPI() {
    console.log('=== Тестируем Lichess API ===');
    try {
        const response = await fetch('https://lichess.org/api/cloud-eval', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `fen=${encodeURIComponent(testFen)}`
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('Lichess response:', data);
            if (data.pvs && data.pvs.length > 0) {
                console.log('Лучший ход:', data.pvs[0].moves.split(' ')[0]);
                return true;
            }
        }
    } catch (error) {
        console.error('Lichess API error:', error);
    }
    return false;
}

// 2. Chess.com API
async function testChessComAPI() {
    console.log('=== Тестируем Chess.com API ===');
    try {
        const response = await fetch('https://api.chess.com/pub/puzzle', {
            method: 'GET'
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('Chess.com response:', data);
            return true;
        }
    } catch (error) {
        console.error('Chess.com API error:', error);
    }
    return false;
}

// 3. Stockfish Online (новый URL)
async function testStockfishOnline() {
    console.log('=== Тестируем Stockfish Online ===');
    try {
        const response = await fetch('https://stockfish-online.herokuapp.com/api', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                fen: testFen,
                depth: 10
            })
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('Stockfish Online response:', data);
            return true;
        }
    } catch (error) {
        console.error('Stockfish Online error:', error);
    }
    return false;
}

// 4. Другой Stockfish API
async function testAlternativeStockfish() {
    console.log('=== Тестируем альтернативный Stockfish ===');
    try {
        const response = await fetch('https://stockfish-api.herokuapp.com/api/stockfish', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                fen: testFen,
                depth: 10
            })
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('Alternative Stockfish response:', data);
            return true;
        }
    } catch (error) {
        console.error('Alternative Stockfish error:', error);
    }
    return false;
}

// 5. Шахматы через RapidAPI
async function testRapidAPI() {
    console.log('=== Тестируем шахматы через RapidAPI ===');
    try {
        const response = await fetch('https://chess-stockfish16-api.p.rapidapi.com/chess/api', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-RapidAPI-Key': 'DEMO_KEY', // Используем демо-ключ
                'X-RapidAPI-Host': 'chess-stockfish16-api.p.rapidapi.com'
            },
            body: JSON.stringify({
                fen: testFen,
                depth: 10
            })
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('RapidAPI response:', data);
            return true;
        }
    } catch (error) {
        console.error('RapidAPI error:', error);
    }
    return false;
}

// Запускаем все тесты
async function runAllTests() {
    console.log('Тестируем различные шахматные API...\n');
    
    const results = await Promise.allSettled([
        testLichessAPI(),
        testChessComAPI(),
        testStockfishOnline(),
        testAlternativeStockfish(),
        testRapidAPI()
    ]);
    
    console.log('\n=== Результаты тестов ===');
    results.forEach((result, index) => {
        const names = ['Lichess', 'Chess.com', 'Stockfish Online', 'Alternative Stockfish', 'RapidAPI'];
        console.log(`${names[index]}: ${result.status === 'fulfilled' && result.value ? 'РАБОТАЕТ' : 'НЕ РАБОТАЕТ'}`);
    });
}

runAllTests();