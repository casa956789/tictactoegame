
import { GoogleGenAI, Type } from "@google/genai";
import type { BoardState, Player } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function getAIMove(board: BoardState, player: Player): Promise<number> {
  const availableSpots = board
    .map((val, idx) => (val === null ? idx : null))
    .filter((val) => val !== null);

  const prompt = `
You are a Tic-Tac-Toe expert. It is player '${player}'s turn to move.
The current board is represented by a 9-element array. 'X' and 'O' are players, and 'null' represents an empty square.
The board indexes are from 0 to 8, left-to-right, top-to-bottom.
Board: [${board.map(v => v === null ? 'null' : `"${v}"`).join(', ')}]

Analyze the board and determine the best possible move to win or draw.
The available squares for your move (where the value is null) are at indices: [${availableSpots.join(', ')}].
You must choose one of these available indices.

Return a JSON object with your move.
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            move: {
              type: Type.INTEGER,
              description: "The board index (0-8) for your next move."
            },
            reasoning: {
              type: Type.STRING,
              description: "A brief explanation of why you chose this move."
            }
          },
          required: ["move", "reasoning"],
        },
        thinkingConfig: { thinkingBudget: 0 }
      },
    });

    const jsonText = response.text.trim();
    const result = JSON.parse(jsonText);
    const move = result.move;

    if (typeof move === 'number' && availableSpots.includes(move)) {
      return move;
    } else {
        console.warn(`Gemini suggested an invalid move: ${move}. Available: ${availableSpots}. Falling back to random.`);
        // Fallback to a random available spot if Gemini fails
        return availableSpots[Math.floor(Math.random() * availableSpots.length)] as number;
    }
  } catch (error) {
    console.error("Error getting AI move from Gemini:", error);
    // Fallback to a random available spot on API error
    return availableSpots[Math.floor(Math.random() * availableSpots.length)] as number;
  }
}
