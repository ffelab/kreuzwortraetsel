// const CACHE_KEY = "userLocationCache";
// const CACHE_TIME = 1000 * 60 * 60 * 24; // 24h
// localStorage.removeItem(CACHE_KEY);

// // -------------------- CACHE --------------------
// function getCache() {
// 	const raw = localStorage.getItem(CACHE_KEY);
// 	if (!raw) return null;

// 	const data = JSON.parse(raw);

// 	if (Date.now() - data.timestamp > CACHE_TIME) {
// 		localStorage.removeItem(CACHE_KEY);
// 		return null;
// 	}

// 	return data.value;
// }

// function setCache(value) {
// 	localStorage.setItem(
// 		CACHE_KEY,
// 		JSON.stringify({
// 			value,
// 			timestamp: Date.now(),
// 		}),
// 	);
// }

// // -------------------- GPS --------------------
// function getGPSLocation() {
// 	return new Promise((resolve, reject) => {
// 		if (!navigator.geolocation) return reject("No geolocation");

// 		navigator.geolocation.getCurrentPosition(
// 			async (pos) => {
// 				const { latitude, longitude } = pos.coords;

// 				try {
// 					const res = await fetch(
// 						`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
// 					);

// 					const data = await res.json();

// 					const city =
// 						data.address.city ||
// 						data.address.town ||
// 						data.address.village;

// 					resolve(city);
// 				} catch (err) {
// 					reject(err);
// 				}
// 			},
// 			reject,
// 			{ enableHighAccuracy: true, timeout: 5000 },
// 		);
// 	});
// }

// // -------------------- IP FALLBACK --------------------
// async function getIPLocation() {
// 	const res = await fetch(
// 		"https://api.ipdata.co?api-key=2b4cb62ac6f29b072111dd7abcdef8c0f3cac6a88b2c9f3fb6519fd8",
// 	);
// 	const data = await res.json();
// 	return data.city;
// }

// // -------------------- MAIN PIPELINE --------------------
// async function getUserCity() {
// 	// 1. CACHE
// 	const cached = getCache();
// 	if (cached) {
// 		console.log("Cache:", cached);
// 		display.innerHTML = `Cache: ${cached}`;
// 		return cached;
// 	}

// 	// 2. GPS
// 	try {
// 		const gpsCity = await getGPSLocation();
// 		console.log("GPS:", gpsCity);
// 		display.innerHTML = `GPS: ${gpsCity}`;

// 		setCache(gpsCity);
// 		return gpsCity;
// 	} catch (e) {
// 		console.log("GPS failed, fallback to IP");
// 	}

// 	// 3. IP fallback
// 	try {
// 		const ipCity = await getIPLocation();
// 		console.log("IP:", ipCity);
// 		display.innerHTML = `IP: ${ipCity}`;

// 		setCache(ipCity);
// 		return ipCity;
// 	} catch (e) {
// 		console.log("All location methods failed");
// 		display.innerHTML = "All location methods failed";
// 		return null;
// 	}
// }

// document.getElementById("start").addEventListener("click", async () => {
// 	const city = await getUserCity();

// 	display.innerHTML = `User Location: ${city}`;
// 	document.getElementById("start-container").style.display = "none";
// });

/* ===================== CONFIG & CONSTANTS ===================== */

const { PUZZLE_ID, SIZE, MIN_WORD_LENGTH, BLACK_FIELDS, NUMBER_FIELDS, CLUES } =
	puzzleData;

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
const body = document.querySelector("body");

/* ===================== GRID ===================== */

const grid = [];

function isBlackField(r, c) {
	return BLACK_FIELDS.some(([br, bc]) => br === r && bc === c);
}

function buildGrid() {
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

			const letterEl = document.createElement("div");
			letterEl.className = "letter";
			cell.appendChild(letterEl);

			containerEl.appendChild(cell);
			grid[r][c] = { el: cell, letter: "", letterEl };
		}
	}
}

function isBlack(r, c) {
	if (state.current.row === null) return false;
	return grid[r][c].el.classList.contains("black");
}

/* ===================== PERSISTENCE ===================== */

function savePuzzle() {
	const puzzleState = {
		grid: grid.map((row) => row.map((cell) => cell.letter || "")),
		schummelzaehler: schummelzaehler,
		permissionGranted: permissionGranted,
	};

	localStorage.setItem(`kwr${PUZZLE_ID}`, JSON.stringify(puzzleState));
}

function loadPuzzle() {
	const saved = localStorage.getItem(`kwr${PUZZLE_ID}`);
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

	// GO backward to start of word
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

	// GO forward to end of word
	let fwd = (horiz ? c : r) + 1;
	while (fwd < SIZE && !isBlack(horiz ? r : fwd, horiz ? fwd : c)) {
		grid[horiz ? r : fwd][horiz ? fwd : c].el.classList.add("word");
		fwd++;
	}
}

function setActive(r, c) {
	if (isBlack(r, c)) {
		return;
	}
	clearHighlight();

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

function checkAllSolved() {
	for (const dir of ["WAAGERECHT", "SENKREcht".toUpperCase()]) {
		for (const number in CLUES[dir]) {
			const entry = CLUES[dir][number];
			const solution = entry.s;

			// find start cell
			let start = null;

			for (let r = 0; r < SIZE; r++) {
				for (let c = 0; c < SIZE; c++) {
					const numEl =
						grid[r][c].el.querySelector(".question-number");
					if (numEl?.textContent == number) {
						start = { r, c };
						break;
					}
				}
				if (start) break;
			}

			if (!start) continue;

			// compare letters
			let r = start.r;
			let c = start.c;

			for (let i = 0; i < solution.length; i++) {
				const cell = grid[r][c];

				const current = cell.letter || "";
				const expected = solution[i];

				if (current !== expected) {
					return false;
				}

				if (dir === "WAAGERECHT") c++;
				else r++;
			}
		}
	}

	return true;
}

function getRandomColor() {
	const colors = [
		"#ff4d4d", // red
		"#4dd2ff", // blue
		"#4dff88", // green
		"#ffd24d", // yellow
		"#b84dff", // purple
		"#ff7ad9", // pink
	];

	return colors[Math.floor(Math.random() * colors.length)];
}
var audio = new Audio("./img/freesound_community-winsquare-6993.mp3");
function unlockAudio() {
	audio.pause().then(() => {
		audio.currentTime = 0;
	});

	document.removeEventListener("touchstart", unlockAudio);
	document.removeEventListener("click", unlockAudio);
}

document.addEventListener("touchstart", unlockAudio);
document.addEventListener("click", unlockAudio);

function triggerWinAnimation() {
	console.log("PUZZLE SOLVED!");
	clearHighlight();

	display.textContent = "🎉 Gelöst! 🎉";

	const centerCells = [
		{ r: SIZE / 2 - 1, c: SIZE / 2 - 1 },
		{ r: SIZE / 2 - 1, c: SIZE / 2 },
		{ r: SIZE / 2, c: SIZE / 2 - 1 },
		{ r: SIZE / 2, c: SIZE / 2 },
	];

	for (let r = 0; r < SIZE; r++) {
		for (let c = 0; c < SIZE; c++) {
			const cell = grid[r][c].el;

			if (cell.classList.contains("black")) continue;

			let dist = Infinity;

			for (const center of centerCells) {
				const d = Math.abs(r - center.r) + Math.abs(c - center.c);
				dist = Math.min(dist, d);
			}

			const delay = dist * 70;

			setTimeout(() => {
				audio.play();
				cell.style.setProperty("--win-color", getRandomColor());
				cell.classList.add("win-blink");
			}, delay);
		}
	}

	// cleanup
	setTimeout(() => {
		for (let r = 0; r < SIZE; r++) {
			for (let c = 0; c < SIZE; c++) {
				grid[r][c].el.classList.remove("win-blink");
			}
		}
	}, SIZE * 1000);
}

/* ===================== INPUT ===================== */

function writeCell(value) {
	if (state.current.row === null) return;
	const { row, col } = state.current;
	const cell = grid[row][col];
	cell.letter = value;
	cell.letterEl.textContent = value;
	savePuzzle();

	if (checkAllSolved()) {
		triggerWinAnimation();
	} else {
		moveNext();
	}
}

function moveNext() {
	let { row, col } = state.current;
	if (state.direction === "horizontal") col++;
	else row++;

	if (row < SIZE && col < SIZE && !isBlack(row, col)) {
		setActive(row, col);
		if (grid[row][col].letter !== "" && !isBlack(row, col)) moveNext();
	} else {
		clearHighlight();
		state.current = { row: null, col: null };
		display.textContent = "Wähle das nächste Feld aus";
		display.style.color = "var(--primary-bg-color)";
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

function addNumberField() {
	let questionNumber = 1;

	for (let r = 0; r < SIZE; r++) {
		for (let c = 0; c < SIZE; c++) {
			const cell = grid[r][c];

			if (NUMBER_FIELDS) {
				function isNumberField(r, c) {
					return NUMBER_FIELDS.some(
						([br, bc]) => br === r && bc === c,
					);
				}
				if (isNumberField(r, c)) {
					const numEl = document.createElement("div");
					numEl.className = "question-number";
					numEl.textContent = questionNumber++;
					cell.el.appendChild(numEl);
				}
			} else {
				if (cell.el.classList.contains("black")) continue;
				let right2 = null;
				let bottom2 = null;
				const left = grid[r][c - 1];
				const right = grid[r][c + 1];
				const top = grid[r - 1]?.[c];
				const bottom = grid[r + 1]?.[c];
				if (MIN_WORD_LENGTH > 2) {
					right2 = grid[r][c + 2];
					bottom2 = grid[r + 2]?.[c];
				} else {
					right2 = grid[r][c + 1];
					bottom2 = grid[r + 1]?.[c];
				}

				const isHorizontalStart =
					(!left || left.el.classList.contains("black")) &&
					right &&
					!right.el.classList.contains("black") &&
					right2 &&
					!right2.el.classList.contains("black");

				const isVerticalStart =
					(!top || top.el.classList.contains("black")) &&
					bottom &&
					!bottom.el.classList.contains("black") &&
					bottom2 &&
					!bottom2.el.classList.contains("black");

				if (isHorizontalStart || isVerticalStart) {
					const numEl = document.createElement("div");
					numEl.className = "question-number";
					numEl.textContent = questionNumber++;

					cell.el.appendChild(numEl);
				}
			}
		}
	}
}

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
		toggleDirection(); //UN-UNCOMMENT AFTER EDITING!!!!
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
	display.style.color = "var(--primary-text-color)";
}

function renderClue(index) {
	const entry = clueList[index];
	if (!entry) return;
	display.textContent = `${entry.c}`;
	// display.textContent = `${entry.c}  (${entry.l})`;
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
	body.classList.add("dark");
}
function closeInfo() {
	clearHighlight();
	state.current = { row: null, col: null };
	display.textContent = "Wähle das nächste Feld aus";
	display.style.color = "var(--primary-bg-color)";
	info.classList.add("hidden");
	info.classList.remove("flex");
	body.classList.remove("dark");
}

/* ===================== SWIPE ===================== */

const swipe = { startX: 0, currentX: 0, active: false };

display.addEventListener("touchstart", (e) => {
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

	display.style.color = "var(--primary-text-color)";

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

	const SHAKE_THRESHOLD = 50;
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

// let userCity;

// async function getCity() {
// 	const res = await fetch("http://ip-api.com/json/?fields=61439");
// 	const data = await res.json();

// 	showCity(data.city); // pass it forward
// }

// function showCity(city) {
// 	console.log("City is:", city);
// 	// display.innerHTML = city;
// }

// getCity();

buildGrid();
loadPuzzle();
addNumberField();

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
	schummelzaehler++;
}

if (display.textContent === "")
	display.textContent =
		"Click auf ein Feld für den Rätselhinweis. Click nochmal\num die Richtung zu ändern";
