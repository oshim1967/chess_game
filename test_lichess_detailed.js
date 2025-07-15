// Детальное тестирование Lichess API

const testFen = 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1'; // После 1.e4

async function testLichessCloudEval() {
    console.log('=== Тестируем Lichess Cloud Eval ===');
    
    try {
        // Пробуем GET запрос
        const url = `https://lichess.org/api/cloud-eval?fen=${encodeURIComponent(testFen)}`;
        console.log('URL:', url);
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });
        
        console.log('Status:', response.status);
        console.log('Headers:', Object.fromEntries(response.headers.entries()));
        
        if (response.ok) {
            const data = await response.json();
            console.log('Response:', JSON.stringify(data, null, 2));
            
            if (data.pvs && data.pvs.length > 0) {
                const bestMove = data.pvs[0].moves.split(' ')[0];
                console.log('Лучший ход:', bestMove);
                return bestMove;
            }
        } else {
            const text = await response.text();
            console.log('Error response:', text);
        }
        
    } catch (error) {
        console.error('Error:', error);
    }
    
    return null;
}

async function testLichessAnalysis() {
    console.log('\n=== Тестируем Lichess Analysis ===');
    
    try {
        const response = await fetch('https://lichess.org/api/analysis', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                fen: testFen,
                multiPv: 1
            })
        });
        
        console.log('Status:', response.status);
        
        if (response.ok) {
            const data = await response.json();
            console.log('Response:', JSON.stringify(data, null, 2));
        } else {
            const text = await response.text();
            console.log('Error response:', text);
        }
        
    } catch (error) {
        console.error('Error:', error);
    }
}

async function testSimpleStockfish() {
    console.log('\n=== Тестируем простой Stockfish API ===');
    
    try {
        const response = await fetch('https://chess-stockfish.herokuapp.com/api', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                fen: testFen,
                depth: 12
            })
        });
        
        console.log('Status:', response.status);
        
        if (response.ok) {
            const data = await response.json();
            console.log('Response:', JSON.stringify(data, null, 2));
            
            if (data.bestmove) {
                console.log('Лучший ход:', data.bestmove);
                return data.bestmove;
            }
        } else {
            const text = await response.text();
            console.log('Error response:', text);
        }
        
    } catch (error) {
        console.error('Error:', error);
    }
    
    return null;
}

async function runTests() {
    console.log('Тестируем FEN:', testFen);
    console.log('Ожидаемые ходы: e7e5, b8c6, g8f6, d7d6, etc.\n');
    
    await testLichessCloudEval();
    await testLichessAnalysis();
    await testSimpleStockfish();
}

runTests();