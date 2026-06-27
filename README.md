# Jaque - Chess Engine
 
A playable chess engine **built from scratch**. The machine decides its moves using the **minimax** algorithm with **alpha-beta pruning**: it explores the tree of every possible move, evaluates each position and picks the best one.
 
**Play here:** [link]
 
---
 
## What does it do?
 
- **Full chess rules:** all piece movement, castling, en passant and promotion.
- **Check, checkmate and stalemate detection.**
- **AI powered by minimax + alpha-beta pruning** that looks several moves ahead.
- **Three difficulty levels** based on search depth (how many moves ahead it looks: 2, 3 or 4).
- **Telemetry panel** showing live how many positions the engine evaluates, scores and time spent thinking.
- **Choose your color** and the board flips to match.
- **All local:** no server, no database and no API keys. Everything runs from the browser.
---
 
## How does the machine decide?
 
The machine has no memorized moves - it thinks and looks at every possibility at every turn.
 
### 1. Minimax: thinking ahead
 
Chess is a zero-sum game: what's good for me is bad for my opponent. Minimax exploits this. The engine builds a tree of moves: "if I move here, my opponent will move there, and then I'll be able to...". It assumes the **opponent's best response**, and picks the move that guarantees the best outcome in the worst possible case.
 
### 2. Alpha-beta pruning: thinking faster
 
Minimax is correct but slow: the number of positions grows exponentially. Alpha-beta pruning **discards branches that can no longer change the decision**.
 
The idea: if, while analyzing a move, I discover the opponent has a response so strong that this move is already worse than another I've already analyzed, I **stop looking at the rest of that branch** - whatever is in there, I won't pick this move anyway.
 
The result is **identical** to plain minimax, but it evaluates far fewer positions.
 
---
 
## Tech stack
 
- **JavaScript** + **React** - interface and engine logic.
- No external dependencies: algorithm written by hand.
- Static deployment on **GitHub Pages**.
---
 
## Code structure
 
The engine is split into clear parts for easier work:
 
1. **Board representation** and constants (pieces, values, piece-square tables).
2. **Move generation** per piece (pawn, knight, bishop, rook, queen, king).
3. **Attack and check detection.**
4. **Applying a move** (includes castling, en passant, and promotion).
5. **Legal move generation** (filters out moves that leave the king in check).
6. **Position evaluation** function.
7. **The brain:** minimax with alpha-beta pruning.
8. **The React** interface.