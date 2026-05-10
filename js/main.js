/* ===================== CONFIG & CONSTANTS ===================== */

const { PUZZLE_ID, SIZE, BLACK_FIELDS, NUMBER_FIELDS, CLUES } = puzzleData;

let schummelzaehler = 0;
let permissionGranted = false;

/* ===================== STATE ===================== */

const state = {
	current: { row: null, col: null },
	direction: "horizontal",
	currentClueIndex: 0,
};

/* ===================== DOM REFERENCES ===================== */

const containerEl = document.getElementById("rätsel-container");
const toggleBtn = document.getElementById("Switch");
const display = document.getElementById("hinweis");
const letterBtns = document.querySelectorAll(".letter-button");
const backspaceBtn = document.querySelector(".backspace-button");
const info = document.getElementById("info");
const checkButton = document.getElementById("cmd");

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

			if (isBlackField(r, c)) {
				cell.classList.add("black");
			}

			if (isNumberField(r, c)) {
				const numEl = document.createElement("div");
				numEl.className = "question-number";
				numEl.textContent = questionNumber++;
				cell.appendChild(numEl);
			}

			const letterEl = document.createElement("div");
			letterEl.className = "letter";
			cell.appendChild(letterEl);

			containerEl.appendChild(cell);
			grid[r][c] = { el: cell, letter: "", letterEl };
		}
	}
}

function isBlack(r, c) {
	if (state.current.row === null) return;
	return grid[r][c].el.classList.contains("black");
}

/* ===================== PERSISTENCE ===================== */

function savePuzzle() {
	const puzzleState = {
		grid: grid.map((row) => row.map((cell) => cell.letter || "")),
		schummelzaehler: schummelzaehler,
		permissionGranted: permissionGranted,
	};

	localStorage.setItem(`puzzle${PUZZLE_ID}`, JSON.stringify(puzzleState));
}

function loadPuzzle() {
	const saved = localStorage.getItem(`puzzle${PUZZLE_ID}`);
	if (!saved) return;

	const data = JSON.parse(saved);

	const puzzleState = data.grid;
	for (let r = 0; r < SIZE; r++) {
		for (let c = 0; c < SIZE; c++) {
			const value = puzzleState?.[r]?.[c];
			if (!value) continue;
			grid[r][c].letter = value;
			grid[r][c].letterEl.textContent = value;
		}
	}

	schummelzaehler = data.schummelzaehler || 0;

	motionEnabled = data.motionEnabled || false;

	if (motionEnabled) {
		btn_reqPermission.textContent = `Schummelzähler: ${schummelzaehler}`;
		btn_reqPermission.style.textDecoration = "none";
		setMotionListeners();
	}
}

/* ===================== HIGHLIGHT & NAVIGATION ===================== */

function clearHighlight() {
	document
		.querySelectorAll(".box", ".letter")
		.forEach((el) => el.classList.remove("active", "word"));
	display.textContent = "";
}

function highlightWord(r, c) {
	const horiz = state.direction === "horizontal";

	// Walk backward to start of word
	let primary = horiz ? c : r;
	while (
		primary > 0 &&
		!isBlack(horiz ? r : primary - 1, horiz ? primary - 1 : c)
	) {
		grid[horiz ? r : --primary][horiz ? primary-- : c].el.classList.add(
			"word",
		);
	}
	grid[horiz ? r : primary][horiz ? primary : c].el.classList.add("word");

	// Walk forward to end of word
	let fwd = (horiz ? c : r) + 1;
	while (fwd < SIZE && !isBlack(horiz ? r : fwd, horiz ? fwd : c)) {
		grid[horiz ? r : fwd][horiz ? fwd : c].el.classList.add("word");
		fwd++;
	}
}

function setActive(r, c) {
	clearHighlight();
	if (isBlack(r, c)) return;

	state.current = { row: r, col: c };
	grid[r][c].el.classList.add("active");
	highlightWord(r, c);
	showClue();
}

function toggleDirection() {
	state.direction =
		state.direction === "horizontal" ? "vertical" : "horizontal";
	setActive(state.current.row, state.current.col);
}

/* ===================== INPUT ===================== */

function writeCell(value) {
	if (state.current.row === null) return;
	const { row, col } = state.current;
	const cell = grid[row][col];
	cell.letter = value;
	cell.letterEl.textContent = value;
	savePuzzle();
	moveNext();
}

function moveNext() {
	let { row, col } = state.current;
	if (state.direction === "horizontal") col++;
	else row++;

	if (row < SIZE && col < SIZE && !isBlack(row, col)) {
		setActive(row, col);
	} else {
		clearHighlight();
		state.current = { row: null, col: null };
	}
}

function handleBackspace() {
	let { row, col } = state.current;
	const cell = grid[row][col];

	if (cell.letter !== "") {
		cell.letter = "";
		cell.letterEl.textContent = "";
		savePuzzle();
		return;
	}

	if (state.direction === "horizontal") col--;
	else row--;

	while (row >= 0 && col >= 0 && isBlack(row, col)) {
		if (state.direction === "horizontal") col--;
		else row--;
	}

	if (row < 0 || col < 0) return;

	setActive(row, col);
	grid[row][col].letter = "";
	grid[row][col].letterEl.textContent = "";
	savePuzzle();
}

/* ===================== CLUES ===================== */

function buildClueList() {
	const list = [];

	for (const dir of ["WAAGERECHT", "SENKRECHT"]) {
		for (const number in CLUES[dir]) {
			list.push({ number, direction: dir, ...CLUES[dir][number] });
		}
	}

	return list.sort((a, b) => Number(a.number) - Number(b.number));
}

const clueList = buildClueList();

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
	const number = numEl.textContent;

	return CLUES[key]?.[number] ? { number, direction: key } : null;
}

function getCurrentClue() {
	let clue = getWordStart(state.direction);

	if (!clue) {
		toggleDirection();
		clue = getWordStart(state.direction);
	}

	return clue;
}

function showClue() {
	const clue = getCurrentClue();
	if (!clue) return;

	const index = clueList.findIndex(
		(entry) =>
			entry.number == clue.number && entry.direction === clue.direction,
	);

	if (index !== -1) state.currentClueIndex = index;

	renderClue(state.currentClueIndex);
}

function renderClue(index) {
	const entry = clueList[index];
	if (!entry) return;
	display.textContent = `${entry.c}  (${entry.l})`;
}

function goToClue(index) {
	const entry = clueList[index];
	if (!entry) return;

	state.direction =
		entry.direction === "WAAGERECHT" ? "horizontal" : "vertical";

	// Find the cell that has the matching question number
	for (let r = 0; r < SIZE; r++) {
		for (let c = 0; c < SIZE; c++) {
			const numEl = grid[r][c].el.querySelector(".question-number");
			if (numEl?.textContent == entry.number) {
				setActive(r, c);
				return;
			}
		}
	}
}

function openInfo() {
	info.classList.remove("hidden");
	info.classList.add("flex");
}
function closeInfo() {
	info.classList.add("hidden");
	info.classList.remove("flex");
}

function checkSolution() {
	for (const dir of ["WAAGERECHT", "SENKRECHT"]) {
		for (const number in CLUES[dir]) {
			const entry = CLUES[dir][number];
			const solution = entry.s;

			if (!solution) continue;

			// find start cell
			let start = null;

			for (let r = 0; r < SIZE; r++) {
				for (let c = 0; c < SIZE; c++) {
					const numEl =
						grid[r][c].el.querySelector(".question-number");
					if (numEl?.textContent == number) {
						start = { row: r, col: c };
						break;
					}
				}
				if (start) break;
			}

			if (!start) continue;

			// fill letters
			let r = start.row;
			let c = start.col;

			for (let i = 0; i < solution.length; i++) {
				if (r >= SIZE || c >= SIZE || isBlack(r, c)) break;
				grid[r][c].letterEl.style.color = "black";
				const letter = solution[i];

				console.log(grid[r][c].letter);
				// grid[r][c].letter = letter;
				if (grid[r][c].letterEl.textContent !== letter) {
					if (grid[r][c].letterEl.textContent !== "") {
						grid[r][c].letterEl.style.color = "red";
					}
				}

				if (dir === "WAAGERECHT") c++;
				else r++;
			}
		}
	}
}

/* ===================== SWIPE ===================== */

const swipe = { startX: 0, currentX: 0, active: false };

display.addEventListener("touchstart", (e) => {
	display.style.color = "white";
	swipe.active = true;
	swipe.startX = swipe.currentX = e.touches[0].clientX;
	display.style.transition = "none";
});

display.addEventListener("touchmove", (e) => {
	if (!swipe.active) return;
	swipe.currentX = e.touches[0].clientX;
	display.style.transform = `translateX(${swipe.currentX - swipe.startX}px)`;
});

display.addEventListener("touchend", () => {
	if (!swipe.active) return;
	swipe.active = false;

	const delta = swipe.currentX - swipe.startX;
	const THRESHOLD = 80;

	display.style.transition = "transform 0.3s ease, opacity 0.3s ease";

	if (delta < -THRESHOLD && state.currentClueIndex < clueList.length - 1) {
		animateClueTransition("left");
	} else if (delta > THRESHOLD && state.currentClueIndex > 0) {
		animateClueTransition("right");
	} else {
		display.style.transform = "translateX(0)";
		display.style.opacity = "1";
	}
});

function animateClueTransition(swipeDir) {
	display.style.transform = `translateX(${swipeDir === "left" ? "-100%" : "100%"})`;
	display.style.opacity = "0";

	setTimeout(() => {
		state.currentClueIndex += swipeDir === "left" ? 1 : -1;
		goToClue(state.currentClueIndex);

		display.style.transition = "none";
		display.style.transform = `translateX(${swipeDir === "left" ? "100%" : "-100%"})`;

		requestAnimationFrame(() => {
			display.style.transition = "transform 0.3s ease, opacity 0.3s ease";
			display.style.transform = "translateX(0)";
			display.style.opacity = "1";
		});
	}, 200);
}

/* ===================== EVENT LISTENERS ===================== */

containerEl.addEventListener("click", (e) => {
	const cellEl = e.target.closest(".box");
	if (!cellEl) return;

	const r = Number(cellEl.dataset.row);
	const c = Number(cellEl.dataset.col);
	const clickedSameCell = state.current.row === r && state.current.col === c;

	display.style.color = "white";

	if (clickedSameCell) toggleDirection();
	else setActive(r, c);
});

letterBtns.forEach((btn) => {
	btn.addEventListener("click", () => {
		writeCell(String(btn.id));
	});
});

backspaceBtn.addEventListener("click", handleBackspace);

toggleBtn.addEventListener("click", () => {
	state.current = { row: null, col: null };
	clearHighlight();
	openInfo();
});
const infoButtons = info.querySelectorAll(".close-button");
infoButtons.forEach((btn) => {
	btn.addEventListener("click", closeInfo);
});

// toggleBtn.addEventListener("click", checkSolution);

document.addEventListener("keydown", (e) => {
	const { row, col } = state.current;
	if (isBlack(row, col)) {
		clearHighlight();
		return;
	}

	if (/^[a-zA-Z]$/.test(e.key)) {
		writeCell(e.key.toUpperCase());
	} else if (e.key === "Backspace") {
		handleBackspace();
	}
});

//=================== SHAKE MECHANIK =====================//

const btn_reqPermission = document.getElementById("btn_reqPermission");

btn_reqPermission.addEventListener("click", () => {
	checkMotionPermission();
});

async function checkMotionPermission() {
	if (typeof DeviceMotionEvent.requestPermission === "function") {
		try {
			const permission = await DeviceMotionEvent.requestPermission();

			if (permission === "granted") {
				permissionGranted = true;
				btn_reqPermission.textContent = `Schummelzähler: ${schummelzaehler}`;
				btn_reqPermission.style.textDecoration = "none";
				closeInfo();
				setMotionListeners();
				savePuzzle();
			}
		} catch (e) {
			console.log("Permission error:", e);
		}
	} else {
		permissionGranted = true;
		btn_reqPermission.textContent = `Schummelzähler: ${schummelzaehler}`;
		btn_reqPermission.style.textDecoration = "none";
		closeInfo();
		setMotionListeners();
		savePuzzle();
	}
}

function setMotionListeners() {
	let isShaking = false;
	let lastShakeTime = 0;

	const SHAKE_THRESHOLD = 15;
	const RESET_THRESHOLD = 2;
	const COOLDOWN = 1000;

	window.addEventListener("devicemotion", (event) => {
		const acc = event.acceleration;
		if (!acc) return;

		const max = Math.max(
			Math.abs(acc.x || 0),
			Math.abs(acc.y || 0),
			Math.abs(acc.z || 0),
		);

		const now = Date.now();

		// Trigger shake
		if (
			!isShaking &&
			max > SHAKE_THRESHOLD &&
			now - lastShakeTime > COOLDOWN
		) {
			if (state.current.row === null) {
				alert("Wähle ein Feld aus bevor du schüttelst!");
				return;
			}
			isShaking = true;
			lastShakeTime = now;

			schummelzaehler++;
			fillRandomField();
			btn_reqPermission.textContent = `Schummelzähler: ${schummelzaehler}`;
			display.textContent = "Schummeln aktiviert!";

			savePuzzle(); // persist
		}

		// Reset when device is calm again
		if (isShaking && max < RESET_THRESHOLD) {
			isShaking = false;
		}
	});
}

/* ===================== INIT ===================== */

buildGrid();
loadPuzzle();

let resetTouchStart = 0;
let resetTouches = 0;

document.addEventListener("touchstart", (e) => {
	resetTouches = e.touches.length;
	resetTouchStart = Date.now();
});

document.addEventListener("touchend", () => {
	const duration = Date.now() - resetTouchStart;

	if (resetTouches === 3 && duration > 1200) {
		console.log("DEV RESET TRIGGERED");

		localStorage.clear();
		location.reload();
	}
});

function fillRandomField() {
	let { row, col } = state.current;
	const freeFields = [];

	let startRow = row;
	let startCol = col;

	if (state.direction === "horizontal") {
		while (startCol > 0 && !isBlack(row, startCol - 1)) {
			startCol--;
		}
	} else {
		while (startRow > 0 && !isBlack(startRow - 1, col)) {
			startRow--;
		}
	}

	const numEl = grid[startRow][startCol].el.querySelector(".question-number");

	const clueNumber = numEl.textContent;
	const clueSet =
		state.direction === "horizontal"
			? CLUES["WAAGERECHT"]
			: CLUES["SENKRECHT"];

	const solution = clueSet[clueNumber]?.s;

	let index = 0;

	if (state.direction === "horizontal") {
		for (let c = startCol; c < SIZE; c++) {
			if (isBlack(row, c)) break;

			const correctLetter = solution[index];
			const currentLetter = grid[row][c].letter;

			if (currentLetter !== correctLetter) {
				freeFields.push({
					row: row,
					col: c,
					correctLetter: correctLetter,
				});
			}

			index++;
		}
	} else {
		for (let r = startRow; r < SIZE; r++) {
			if (isBlack(r, col)) break;

			const correctLetter = solution[index];
			const currentLetter = grid[r][col].letter;

			if (currentLetter !== correctLetter) {
				freeFields.push({
					row: r,
					col: col,
					correctLetter: correctLetter,
				});
			}

			index++;
		}
	}

	if (freeFields.length === 0) {
		return;
	}

	const randomIndex = Math.floor(Math.random() * freeFields.length);
	const chosen = freeFields[randomIndex];

	const { row: r, col: c, correctLetter } = chosen;

	const cell = grid[r][c];
	cell.letter = correctLetter;
	cell.letterEl.textContent = correctLetter;
}
