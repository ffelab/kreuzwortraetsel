/* ===================== CONFIG ===================== */

const { puzzleId, SIZE, BLACK_FIELDS, NUMBER_FIELDS, CLUES } = puzzleData;

/* ===================== STATE ===================== */

const state = {
	current: { row: 0, col: 0 },
	direction: "horizontal",
	currentClueIndex: 0,
};

/* ===================== DOM ===================== */

const containerEl = document.getElementById("rätsel-container");
const toggleBtn = document.getElementById("Switch");
const track = document.getElementById("hinweis-track");
const letterBtns = document.querySelectorAll(".letter-button");
const backspaceBtn = document.querySelector(".backspace-button");

/* ===================== GRID ===================== */

const grid = [];

function isBlackField(r, c) {
	return BLACK_FIELDS.some(([br, bc]) => br === r && bc === c);
}

function isNumberField(r, c) {
	return NUMBER_FIELDS.some(([br, bc]) => br === r && bc === c);
}

function buildGrid() {
	let questionNumber = 1;

	for (let r = 0; r < SIZE; r++) {
		grid[r] = [];

		for (let c = 0; c < SIZE; c++) {
			const cell = document.createElement("div");
			cell.className = "box";
			cell.dataset.row = r;
			cell.dataset.col = c;

			if (isBlackField(r, c)) cell.classList.add("black");

			if (isNumberField(r, c)) {
				const num = document.createElement("div");
				num.className = "question-number";
				num.textContent = questionNumber++;
				cell.appendChild(num);
			}

			const letterEl = document.createElement("div");
			letterEl.className = "letter";
			cell.appendChild(letterEl);

			containerEl.appendChild(cell);
			grid[r][c] = { el: cell, letter: "", letterEl };
		}
	}
}

/* ===================== HELPERS ===================== */

function isBlack(r, c) {
	return grid[r][c].el.classList.contains("black");
}

/* ===================== CLUES ===================== */

function buildClueList() {
	const list = [];

	for (const dir of ["WAAGERECHT", "SENKRECHT"]) {
		for (const number in CLUES[dir]) {
			list.push({
				number,
				direction: dir,
				...CLUES[dir][number],
			});
		}
	}

	return list.sort((a, b) => Number(a.number) - Number(b.number));
}

const clueList = buildClueList();

/* ===================== ACTIVE CELL ===================== */

function clearHighlight() {
	document
		.querySelectorAll(".box")
		.forEach((el) => el.classList.remove("active", "word"));
}

function highlightWord(r, c) {
	const horiz = state.direction === "horizontal";

	let i = horiz ? c : r;

	while (i > 0 && !isBlack(horiz ? r : i - 1, horiz ? i - 1 : c)) {
		i--;
	}

	const startR = horiz ? r : i;
	const startC = horiz ? i : c;

	grid[startR][startC].el.classList.add("word");

	let j = (horiz ? c : r) + 1;

	while (j < SIZE && !isBlack(horiz ? r : j, horiz ? j : c)) {
		grid[horiz ? r : j][horiz ? j : c].el.classList.add("word");
		j++;
	}
}

function setActive(r, c) {
	clearHighlight();
	if (isBlack(r, c)) return;

	state.current = { row: r, col: c };
	grid[r][c].el.classList.add("active");

	highlightWord(r, c);

	syncFromGrid();
}

/* ===================== CLUE LOOKUP ===================== */

function getWordStart(dir) {
	const horiz = dir === "horizontal";
	let r = state.current.row;
	let c = state.current.col;

	while (horiz ? c > 0 && !isBlack(r, c - 1) : r > 0 && !isBlack(r - 1, c)) {
		horiz ? c-- : r--;
	}

	const numEl = grid[r][c].el.querySelector(".question-number");
	if (!numEl) return null;

	const key = horiz ? "WAAGERECHT" : "SENKRECHT";

	return CLUES[key]?.[numEl.textContent]
		? { number: numEl.textContent, direction: key }
		: null;
}

/* ===================== SYNC CORE ===================== */

function syncFromGrid() {
	const clue = getWordStart(state.direction);

	if (!clue) {
		state.direction =
			state.direction === "horizontal" ? "vertical" : "horizontal";
	}

	const index = clueList.findIndex(
		(c) => c.number == clue?.number && c.direction === clue?.direction,
	);

	if (index !== -1) {
		syncFromIndex(index);
	}
}

/* ===================== MASTER SYNC ===================== */

function syncFromIndex(index) {
	state.currentClueIndex = index;

	const entry = clueList[index];
	if (!entry) return;

	const start = findClueStartCell(entry.number);
	if (!start) return;

	state.direction =
		entry.direction === "WAAGERECHT" ? "horizontal" : "vertical";

	setActive(start.row, start.col);

	renderClues();
}

/* ===================== FIND CELL ===================== */

function findClueStartCell(number) {
	for (let r = 0; r < SIZE; r++) {
		for (let c = 0; c < SIZE; c++) {
			const el = grid[r][c].el.querySelector(".question-number");
			if (el?.textContent == number) {
				return { row: r, col: c };
			}
		}
	}
	return null;
}

/* ===================== CAROUSEL RENDER ===================== */

function renderClues() {
	const i = state.currentClueIndex;

	const prev = clueList[i - 1];
	const curr = clueList[i];
	const next = clueList[i + 1];

	track.children[0].textContent = prev ? `${prev.c} (${prev.l})` : "";
	track.children[1].textContent = curr ? `${curr.c} (${curr.l})` : "";
	track.children[2].textContent = next ? `${next.c} (${next.l})` : "";

	track.style.transform = "translateX(-100%)";
}

/* ===================== SWIPE ===================== */

let startX = 0;
let isDragging = false;

track.addEventListener("touchstart", (e) => {
	isDragging = true;
	startX = e.touches[0].clientX;
	track.style.transition = "none";
});

track.addEventListener("touchmove", (e) => {
	if (!isDragging) return;

	const dx = e.touches[0].clientX - startX;
	const percent = -100 + (dx / window.innerWidth) * 100;

	track.style.transform = `translateX(${percent}%)`;
});

track.addEventListener("touchend", (e) => {
	isDragging = false;

	const dx = e.changedTouches[0].clientX - startX;
	const threshold = 80;

	track.style.transition = "transform 0.3s ease";

	if (dx < -threshold && state.currentClueIndex < clueList.length - 1) {
		syncFromIndex(state.currentClueIndex + 1);
	} else if (dx > threshold && state.currentClueIndex > 0) {
		syncFromIndex(state.currentClueIndex - 1);
	} else {
		renderClues();
	}
});

/* ===================== INIT ===================== */

buildGrid();
renderClues();
