# Tetris — A DSA-Based Game Project

Build a complete Tetris puzzle game in **C++17**, integrating clean game-loop architecture with practical Data Structures & Algorithms (DSA).

## 1. Project Overview & Architecture

```
TetrisDSA/
├── CMakeLists.txt
├── README.md
├── assets/
│   ├── fonts/
│   ├── audio/
│   └── textures/
├── include/
│   ├── Game.hpp
│   ├── Board.hpp
│   ├── Piece.hpp
│   ├── PieceGenerator.hpp
│   ├── Collision.hpp
│   ├── Scoring.hpp
│   ├── Renderer.hpp
│   ├── InputHandler.hpp
│   └── dsa/
│       ├── ReplayStack.hpp
│       ├── MoveHistory.hpp
│       ├── Leaderboard.hpp
│       ├── BoardGraph.hpp
│       ├── TetrisAI.hpp
│       ├── BitBoard.hpp
│       ├── ScoreIndexBST.hpp
│       └── CommandTrie.hpp
├── src/
│   ├── main.cpp
│   ├── Game.cpp
│   ├── Board.cpp
│   ├── Piece.cpp
│   ├── PieceGenerator.cpp
│   ├── Collision.cpp
│   ├── Scoring.cpp
│   ├── Renderer.cpp
│   └── dsa/
│       ├── ReplayStack.cpp
│       ├── MoveHistory.cpp
│       ├── Leaderboard.cpp
│       ├── BoardGraph.cpp
│       ├── TetrisAI.cpp
│       └── BitBoard.cpp
└── tests/
    ├── board_tests.cpp
    ├── piece_tests.cpp
    ├── rotation_tests.cpp
    ├── line_clear_tests.cpp
    ├── generator_tests.cpp
    └── dsa_tests.cpp
```

## 2. Core Game Rules & Controls

- **Standard Board**: 10 columns × 20 visible rows (+ 4 hidden spawn rows above).
- **Tetrominoes**: I, O, T, S, Z, J, L with standard Super Rotation System (SRS) wall kicks.
- **Seven-Bag Randomizer**: Shuffles all 7 pieces before dealing; guarantees fair piece distribution.
- **Hold System**: Hold active piece for later, bounded to 1 swap per placed piece.
- **Ghost Piece**: Real-time projection showing drop landing destination.
- **Line Clearing & Scoring**: Single (100), Double (300), Triple (500), Tetris (800) multiplied by level, with combo and back-to-back bonuses.
- **Controls**:
  - `Left` / `Right`: Move horizontally
  - `Down`: Soft drop
  - `Up` / `X`: Rotate clockwise
  - `Z`: Rotate counter-clockwise
  - `Space`: Hard drop
  - `C` / `Left Shift`: Hold piece
  - `U`: Undo last move (Stack-based replay state)
  - `P` / `Escape`: Pause / Resume
  - `A`: Toggle AI Autoplay mode

## 3. Data Structures & Algorithms (DSA) Mapping

| DSA Concept | Gameplay / Engine Component | Implementation & Complexity |
| :--- | :--- | :--- |
| **2D Arrays (`std::vector<std::vector<int>>`)** | Game Board Grid | $O(1)$ cell lookup and write. |
| **3D Array Table** | Tetromino Rotation Offsets & SRS kicks | Precomputed $4 \times 4$ matrices for 4 rotation states. |
| **Queue (`std::deque<PieceType>`)** | Next-Piece Preview Sequence | $O(1)$ FIFO pop/push for upcoming tetromino queue. |
| **Stack (`std::vector<GameStateSnapshot>`)** | Move Undo System | $O(1)$ push/pop for state rollback and branching snapshots. |
| **Bit Manipulation & Bitset** | Fast BitBoard Collision & Row Clearing | 10-bit integer masks per row; row full check via `(mask == 0x3FF)`. |
| **Doubly Linked List** | Move History Lab (`MoveHistory`) | Demonstrates $O(1)$ bidirectional iteration vs vector cache locality. |
| **Sorting (Quicksort / Introsort)** | Leaderboard Ranking | $O(N \log N)$ sorting of score, level, and player records. |
| **Binary Search** | Leaderboard Search | $O(\log N)$ bisecting sorted high-score tables. |
| **Binary Search Tree (BST)** | Dynamic Score Index Lab (`ScoreIndexBST`) | $O(\log N)$ dynamic record insertion, deletion, and in-order traversal. |
| **Trie (Prefix Tree)** | Console Command & Player Name Search | $O(L)$ where $L$ is query length for auto-completion. |
| **Graph Modeling (BFS / DFS / Flood Fill)** | Board Cavity & Reachability Analysis (`BoardGraph`) | $O(V + E)$ connected-component search, enclosed hole detection. |
| **Greedy Search + Dynamic Programming** | Heuristic Tetris AI (`TetrisAI`) | Branch evaluation with heuristic cost function and memoized state lookup. |
| **Fisher-Yates Shuffle** | 7-Bag Piece Randomizer | $O(N)$ unbiased permutation generation using seeded PRNG. |
| **FNV-1a / Murmur Hashing** | Replay Determinism Fingerprinting | $O(K)$ hash verification of serialized action stream. |

## 4. Build & Run Instructions

### Prerequisites
- CMake $\ge 3.20$
- C++17 compliant compiler (Clang / GCC / MSVC)
- SFML 2.6 (included or linked via CMake)

### Building
```bash
mkdir build
cd build
cmake .. -G "MinGW Makefiles"
cmake --build .
```

### Running Tests
```bash
ctest --output-on-failure
# Or run individual test suites:
./tests/board_tests
./tests/dsa_tests
```

