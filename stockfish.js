import { getFen } from './game.js?v=1752586932';

// Настройки уровней сложности для Lichess API
const SKILL_LEVELS = {
    1: { depth: 1, multiPv: 1 },   // 3-й разряд
    2: { depth: 2, multiPv: 1 },
    3: { depth: 3, multiPv: 1 },
    4: { depth: 4, multiPv: 1 },   // 2-й разряд
    5: { depth: 5, multiPv: 1 },
    6: { depth: 6, multiPv: 1 },
    7: { depth: 7, multiPv: 1 },   // 1-й разряд
    8: { depth: 8, multiPv: 1 },
    9: { depth: 9, multiPv: 1 },
    10: { depth: 10, multiPv: 1 },
    11: { depth: 11, multiPv: 1 }, // КМС
    12: { depth: 12, multiPv: 1 },
    13: { depth: 13, multiPv: 1 },
    14: { depth: 14, multiPv: 1 }, // Мастер
    15: { depth: 15, multiPv: 1 },
    16: { depth: 16, multiPv: 1 },
    17: { depth: 17, multiPv: 1 }, // Гроссмейстер
    18: { depth: 18, multiPv: 1 },
    19: { depth: 19, multiPv: 1 },
    20: { depth: 20, multiPv: 1 }
};

export async function getComputerMove(fen, skillLevel = 10, board = null) {
    console.log("🤖 ЗАПРОС ХОДА ОТ КОМПЬЮТЕРА");
    console.log("📊 Уровень сложности:", skillLevel);
    console.log("🎯 FEN позиция:", fen);
    
    try {
        const settings = SKILL_LEVELS[skillLevel] || SKILL_LEVELS[10];
        console.log("⚙️ Настройки Lichess API:", settings);
        
        // Используем Lichess Cloud Evaluation API
        const response = await fetch(`https://lichess.org/api/cloud-eval?fen=${encodeURIComponent(fen)}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });
        
        console.log("🌐 Статус ответа Lichess:", response.status);
        
        if (response.ok) {
            const data = await response.json();
            console.log("📨 Ответ Lichess:", data);
            
            // Проверяем, есть ли данные
            if (data && data.pvs && data.pvs.length > 0) {
                // Выбираем ход в зависимости от уровня сложности
                let selectedPv;
                
                if (skillLevel <= 5) {
                    // Для низких уровней иногда выбираем не лучший ход
                    const randomFactor = Math.random();
                    if (randomFactor < 0.3 && data.pvs.length > 1) {
                        selectedPv = data.pvs[1]; // Второй лучший ход
                    } else {
                        selectedPv = data.pvs[0]; // Лучший ход
                    }
                } else if (skillLevel <= 10) {
                    // Средний уровень - иногда не лучший ход
                    const randomFactor = Math.random();
                    if (randomFactor < 0.15 && data.pvs.length > 1) {
                        selectedPv = data.pvs[1];
                    } else {
                        selectedPv = data.pvs[0];
                    }
                } else {
                    // Высокий уровень - почти всегда лучший ход
                    selectedPv = data.pvs[0];
                }
                
                const bestMove = selectedPv.moves.split(' ')[0];
                console.log("🎯 Выбранный ход:", bestMove);
                
                // Конвертируем в наш формат
                const from = bestMove.substring(0, 2);
                const to = bestMove.substring(2, 4);
                
                const fromCol = from.charCodeAt(0) - 'a'.charCodeAt(0);
                const fromRow = 8 - parseInt(from[1]);
                const toCol = to.charCodeAt(0) - 'a'.charCodeAt(0);
                const toRow = 8 - parseInt(to[1]);
                
                const move = { fromRow, fromCol, toRow, toCol };
                console.log("✅ Конвертированный ход:", move);
                
                return move;
            } else {
                console.log("⚠️ Нет данных для этой позиции в cloud database");
            }
        } else {
            console.error("❌ Ошибка Lichess API:", response.status);
            if (response.status === 404) {
                console.log("⚠️ Позиция не найдена в cloud database");
            }
        }
        
    } catch (error) {
        console.error("❌ Ошибка при запросе к Lichess:", error);
    }
    
    // Fallback - НЕ ДЕЛАЕМ СЛУЧАЙНЫЙ ХОД!
    // Лучше вернуть null, чтобы game.js использовал правильный AI
    console.log("⚠️ Lichess API не работает, возвращаем null для использования правильного AI");
    return null;
}

