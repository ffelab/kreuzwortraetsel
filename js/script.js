const container = document.getElementById("rätsel-container");
const toggleBtn = document.getElementById("Switch");
const buttons = document.querySelectorAll(".letter-button");
const backspace = document.querySelector(".backspace-button");

const display = document.getElementById("hinweis");

const size = 11;
let current = { row: 0, col: 0 };
let direction = "horizontal";

const grid = [];

const blackFields = [
	[0, 10],

	[1, 1],
	[1, 3],
	[1, 5],
	[1, 7],
	[1, 9],

	[2, 5],

	[3, 1],
	[3, 3],
	[3, 5],
	[3, 7],
	[3, 9],

	[4, 0],
	[4, 6],

	[5, 1],
	[5, 3],
	[5, 5],
	[5, 7],
	[5, 9],

	[6, 4],
	[6, 10],

	[7, 1],
	[7, 3],
	[7, 5],
	[7, 7],
	[7, 9],

	[8, 5],

	[9, 1],
	[9, 3],
	[9, 5],
	[9, 7],
	[9, 9],

	[10, 0],
];

const numberFields = [
	[0, 0],
	[0, 2],
	[0, 4],
	[0, 6],
	[0, 8],

	[1, 10],

	[2, 0],
	[2, 6],

	[4, 1],
	[4, 7],

	[5, 0],
	[5, 6],

	[6, 0],
	[6, 5],

	[7, 4],
	[7, 10],

	[8, 0],
	[8, 6],

	[10, 1],
];

const clues = {
	WAAGERECHT: {
		1: { c: "", l: "10", s: "NEWSLETTER" },

		7: { c: "", l: "5", s: "TONNE" },
		8: { c: "", l: "5", s: "FEDER" },

		9: { c: "", l: "5", s: "BESEN" },
		10: { c: "", l: "4", s: "BETA" },

		13: { c: "", l: "4", s: "RAKI" },
		14: { c: "", l: "5", s: "REPRO" },

		17: { c: "", l: "5", s: "GARDE" },
		18: { c: "", l: "5", s: "TOENE" },

		19: { c: "", l: "10", s: "REGENRADAR" },
	},
	SENKRECHT: {
		1: { c: "", l: "4", s: "NOTE" },
		2: { c: "", l: "11", s: "WANDERKARTE" },
		3: { c: "", l: "6", s: "LIEDER" },
		4: { c: "", l: "4", s: "TIFF" },
		5: { c: "", l: "11", s: "ERDBEERFELD" },

		6: { c: "", l: "5", s: "TRIAL" },

		11: { c: "", l: "5", s: "DROGE" },
		12: { c: "", l: "6", s: "VEKTOR" },

		15: { c: "", l: "4", s: "MEME" },
		16: { c: "", l: "4", s: "LEER" },
	},
};

let questionNumber = 1;

/* GRID ERSTELLEN */
for (let r = 0; r < size; r++) {
	grid[r] = [];

	for (let c = 0; c < size; c++) {
		const div = document.createElement("div");
		div.className = "box";
		div.dataset.row = r;
		div.dataset.col = c;

		/* Nummern */
		const numberEl = document.createElement("div");
		numberEl.className = "question-number";
		if (blackFields.some(([br, bc]) => br === r && bc === c)) {
			div.classList.add("black");
		}
		if (numberFields.some(([br, bc]) => br === r && bc === c)) {
			numberEl.textContent = questionNumber++;
			div.appendChild(numberEl);
		}

		/* Buchstaben */ const letterEl = document.createElement("div");
		letterEl.className = "letter";
		div.appendChild(letterEl);
		div.addEventListener("click", () => {
			display.style.color = "white";
			const clickedSameCell = current.row === r && current.col === c;
			if (clickedSameCell) {
				toggleDirection();
				return;
			}
			setActive(r, c);
		});
		container.appendChild(div);
		grid[r][c] = { el: div, letter: "", letterEl: letterEl };
	}
}

loadPuzzle();

function loadPuzzle() {
	const saved = localStorage.getItem("puzzle");
	if (!saved) return;

	const state = JSON.parse(saved);

	for (let r = 0; r < size; r++) {
		for (let c = 0; c < size; c++) {
			const value = state?.[r]?.[c];
			if (!value) continue;

			grid[r][c].letter = value;
			grid[r][c].letterEl.textContent = value;
		}
	}
}

/* Aktives Feld */
function setActive(r, c) {
	const alreadyActive = current.row === r && current.col === c;

	clearHighlight();

	const cell = grid[r][c];
	if (cell.el.classList.contains("black")) return;

	current = { row: r, col: c };

	highlightWord(r, c);
	cell.el.classList.add("active");

	const clue = getCurrentClue();

	showClue();
}

/* Aktives Wort */
function highlightWord(r, c) {
	if (direction === "horizontal") {
		let col = c;
		while (col >= 0 && !isBlack(r, col)) {
			grid[r][col].el.classList.add("word");
			col--;
		}
		col = c + 1;
		while (col < size && !isBlack(r, col)) {
			grid[r][col].el.classList.add("word");
			col++;
		}
	} else {
		let row = r;
		while (row >= 0 && !isBlack(row, c)) {
			grid[row][c].el.classList.add("word");
			row--;
		}
		row = r + 1;
		while (row < size && !isBlack(row, c)) {
			grid[row][c].el.classList.add("word");
			row++;
		}
	}
}

/* Ende bei Schwarzem Feld */
function isBlack(r, c) {
	return grid[r][c].el.classList.contains("black");
}
function clearHighlight() {
	document.querySelectorAll(".box").forEach((el) => {
		el.classList.remove("active", "word");
		display.textContent = "";
	});
}

/* Eingabe */
buttons.forEach((btn) => {
	btn.addEventListener("click", () => {
		const { row, col } = current;
		const cell = grid[row][col];
		value = String(btn.id);
		cell.letter = value;
		cell.letterEl.textContent = value;
		cell.letterEl.textContent = cell.letter;
		savePuzzle();
		moveNext();
	});
});
backspace.addEventListener("click", () => {
	savePuzzle();
	handleBackspace();
});
document.addEventListener("keydown", (e) => {
	const { row, col } = current;
	const cell = grid[row][col];
	if (isBlack(row, col)) return;
	/* Buchstaben */ if (/^[a-zA-Z]$/.test(e.key)) {
		cell.letter = e.key.toUpperCase();
		cell.letterEl.textContent = cell.letter;
		savePuzzle();
		moveNext();
	}
	/* Backspace */ if (e.key === "Backspace") {
		savePuzzle();
		handleBackspace();
	}
});

/* Weiter */ function moveNext() {
	let { row, col } = current;
	if (direction === "horizontal") col++;
	else row++;
	if (row < size && col < size && !isBlack(row, col)) {
		setActive(row, col);
	} else {
		clearHighlight();
	}
}

/* BACKSPACE */ function handleBackspace() {
	let { row, col } = current;
	const cell = grid[row][col];
	if (cell.letter !== "") {
		cell.letter = "";
		cell.letterEl.textContent = "";
		return;
	}
	if (direction === "horizontal") col--;
	else row--;
	while (row >= 0 && col >= 0 && isBlack(row, col)) {
		if (direction === "horizontal") col--;
		else row--;
	}
	if (row < 0 || col < 0) return;
	setActive(row, col);
	grid[row][col].letter = "";
	grid[row][col].letterEl.textContent = "";
}

/* RICHTUNG UMSCHALTEN */ function toggleDirection() {
	direction = direction === "horizontal" ? "vertical" : "horizontal";
	if (direction === "horizontal") toggleBtn.textContent = "↓";
	else toggleBtn.textContent = "→";
	const clue = getCurrentClue();
	setActive(current.row, current.col);
}
toggleBtn.addEventListener("click", toggleDirection);

/* Hinweis finden */
function getCurrentClue() {
	const { row, col } = current;

	const tryDir = (dir) => {
		let r = row,
			c = col;

		while (
			dir === "horizontal"
				? c > 0 && !isBlack(r, c - 1)
				: r > 0 && !isBlack(r - 1, c)
		) {
			dir === "horizontal" ? c-- : r--;
		}

		const number =
			grid[r][c].el.querySelector(".question-number")?.textContent;
		const key = dir === "horizontal" ? "WAAGERECHT" : "SENKRECHT";

		return number && clues[key]?.[number]
			? { number, direction: key }
			: null;
	};

	let result = tryDir(direction);

	if (!result) {
		toggleDirection();
		result = tryDir(direction);
	}

	return result;
}

function showClue() {
	const clue = getCurrentClue();
	if (clue && clues[clue.direction] && clues[clue.direction][clue.number]) {
		const entry = clues[clue.direction][clue.number];

		display.textContent = `${entry.c} (${entry.l})`;
	}
}

function savePuzzle() {
	const state = [];

	for (let r = 0; r < size; r++) {
		state[r] = [];

		for (let c = 0; c < size; c++) {
			state[r][c] = grid[r][c].letter || "";
		}
	}

	localStorage.setItem("puzzle", JSON.stringify(state));
}
