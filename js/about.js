function loadPuzzleFromStorage(index) {
	const key = `kwr${String(index).padStart(2, "0")}`;
	const raw = localStorage.getItem(key);

	if (!raw) return [];

	const parsed = JSON.parse(raw);
	return gridToBlackFields(parsed.grid);
}

function gridToBlackFields(grid) {
	const result = [];

	for (let r = 0; r < grid.length; r++) {
		for (let c = 0; c < grid[r].length; c++) {
			if (grid[r][c] === "") {
				result.push([r, c]);
			}
		}
	}

	return result;
}

SIZE = 10;

const BLACK_FIELDS1 = [
	[0, 0],
	[0, 1],
	[0, 2],
	[0, 3],
	[1, 0],
	[1, 4],
	[2, 0],
	[2, 1],
	[2, 2],
	[2, 3],
	[3, 0],
	[3, 2],
	[4, 0],
	[4, 3],
	[4, 4],
];
const BLACK_FIELDS2 = [
	[0, 1],
	[0, 2],
	[0, 3],
	[1, 0],
	[1, 4],
	[2, 0],
	[2, 1],
	[2, 2],
	[2, 3],
	[2, 4],
	[3, 0],
	[3, 4],
	[4, 0],
	[4, 4],
];
const BLACK_FIELDS3 = [
	[0, 0],
	[0, 1],
	[0, 2],
	[0, 3],
	[0, 4],
	[1, 0],

	[2, 0],
	[2, 1],
	[2, 2],
	[2, 3],

	[3, 0],

	[4, 0],
	[4, 1],
	[4, 2],
	[4, 3],
	[4, 4],
];
const BLACK_FIELDS4 = [
	[0, 0],
	[0, 1],
	[0, 2],
	[0, 3],
	[0, 4],

	[1, 2],

	[2, 2],

	[3, 2],

	[4, 2],
];
const BLACK_FIELDS5 = [
	[0, 1],
	[0, 2],
	[0, 3],
	[0, 4],

	[1, 0],

	[2, 1],
	[2, 2],
	[2, 3],

	[3, 4],

	[4, 0],
	[4, 1],
	[4, 2],
	[4, 3],
];
const BLACK_FIELDS6 = [
	[0, 0],
	[0, 1],
	[0, 2],
	[0, 3],
	[0, 4],
	[1, 0],

	[2, 0],
	[2, 1],
	[2, 2],
	[2, 3],

	[3, 0],

	[4, 0],
	[4, 1],
	[4, 2],
	[4, 3],
	[4, 4],
];
const BLACK_FIELDS7 = [
	[0, 0],

	[1, 0],

	[2, 0],

	[3, 0],

	[4, 0],
	[4, 1],
	[4, 2],
	[4, 3],
	[4, 4],
];
const BLACK_FIELDS8 = [
	[0, 0],
	[0, 1],
	[0, 2],
	[0, 3],
	[0, 4],
	[1, 0],
	[1, 1],
	[1, 2],
	[1, 3],
	[1, 4],
	[2, 0],
	[2, 1],
	[2, 2],
	[2, 3],
	[2, 4],
	[3, 0],
	[3, 1],
	[3, 2],
	[3, 3],
	[3, 4],
	[4, 0],
	[4, 1],
	[4, 2],
	[4, 3],
	[4, 4],
];
const BLACK_FIELDS9 = [
	[0, 0],
	[0, 1],
	[0, 2],
	[0, 3],
	[1, 0],
	[1, 4],
	[2, 0],
	[2, 1],
	[2, 2],
	[2, 3],
	[3, 0],
	[3, 4],
	[4, 0],
	[4, 1],
	[4, 2],
	[4, 3],
];
const BLACK_FIELDS10 = [
	[0, 0],

	[1, 0],

	[2, 0],

	[3, 0],

	[4, 0],
	[4, 1],
	[4, 2],
	[4, 3],
	[4, 4],
];
const BLACK_FIELDS11 = [
	[0, 1],
	[0, 2],
	[0, 3],

	[1, 0],
	[1, 4],

	[2, 0],
	[2, 4],

	[3, 0],
	[3, 4],

	[4, 1],
	[4, 2],
	[4, 3],
];
const BLACK_FIELDS12 = [
	[0, 1],
	[0, 2],
	[0, 3],
	[0, 4],
	[1, 0],

	[2, 0],
	[2, 2],
	[2, 3],
	[2, 4],

	[3, 0],
	[3, 4],

	[4, 1],
	[4, 2],
	[4, 3],
];
const BLACK_FIELDS13 = [
	[0, 0],

	[0, 4],

	[1, 0],
	[1, 4],

	[2, 0],
	[2, 4],

	[3, 1],
	[3, 3],

	[4, 2],
];
const BLACK_FIELDS14 = [
	[0, 1],
	[0, 2],
	[0, 3],

	[1, 0],
	[1, 4],

	[2, 0],
	[2, 4],

	[3, 0],
	[3, 4],

	[4, 1],
	[4, 2],
	[4, 3],
];
const BLACK_FIELDS15 = [
	[0, 0],

	[1, 0],

	[2, 0],

	[3, 0],
	[4, 0],
	[4, 1],
	[4, 2],
	[4, 3],
	[4, 4],
];
const BLACK_FIELDS16 = [
	[0, 2],

	[1, 1],
	[1, 2],

	[2, 0],
	[2, 2],

	[3, 2],
	[4, 0],
	[4, 1],
	[4, 2],
	[4, 3],
	[4, 4],
];

const blackFieldsList = [
	BLACK_FIELDS1,
	BLACK_FIELDS2,
	BLACK_FIELDS3,
	BLACK_FIELDS4,
	BLACK_FIELDS5,
	BLACK_FIELDS6,
	BLACK_FIELDS7,
	BLACK_FIELDS8,
	BLACK_FIELDS9,
	BLACK_FIELDS10,
	BLACK_FIELDS11,
	BLACK_FIELDS12,
	BLACK_FIELDS13,
	BLACK_FIELDS14,
	BLACK_FIELDS15,
	BLACK_FIELDS16,
];

const savedPuzzlesList = Array.from({ length: 16 }, (_, i) =>
	loadPuzzleFromStorage(i),
);

const containers = Array.from({ length: 16 }, (_, i) =>
	document.getElementById(`titel-container${i + 1}`),
);

const raetsel = Array.from({ length: 16 }, (_, i) =>
	document.getElementById(`raetsel-container${i + 1}`),
);

function isBlackField(arr, r, c) {
	return arr.some(([br, bc]) => br === r && bc === c);
}

// function randomLetter() {
// 	const random = Math.floor(Math.random() * 26);
// 	const letter = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
// 	const randomLetter = letter[random];
// 	return randomLetter;
// }

function buildGrid(container, blackFields) {
	const grid = [];

	for (let r = 0; r < 5; r++) {
		grid[r] = [];

		for (let c = 0; c < 5; c++) {
			const cell = document.createElement("div");
			cell.className = "titel-box";
			cell.dataset.row = r;
			cell.dataset.col = c;

			if (isBlackField(blackFields, r, c)) {
				cell.classList.add("black");
			}

			const letterEl = document.createElement("div");
			letterEl.className = "letter";
			// const letter = randomLetter();
			// letterEl.textContent = letter;
			cell.appendChild(letterEl);

			container.appendChild(cell);
			grid[r][c] = { el: cell, letter: "", letterEl };
		}
	}

	return grid;
}

function buildPuzzle(container, blackFields) {
	const grid = [];

	for (let r = 0; r < SIZE; r++) {
		grid[r] = [];

		for (let c = 0; c < SIZE; c++) {
			const cell = document.createElement("div");
			cell.className = "titel-box";
			cell.dataset.row = r;
			cell.dataset.col = c;

			if (isBlackField(blackFields, r, c)) {
				cell.classList.add("black");
				container.style.border =
					"solid var(--primary-highlight-color) 2.5px";
				container.style.opacity = "1";
			}

			const letterEl = document.createElement("div");
			letterEl.className = "letter";
			// const letter = randomLetter();
			// letterEl.textContent = letter;
			cell.appendChild(letterEl);

			container.appendChild(cell);
			grid[r][c] = { el: cell, letter: "", letterEl };
		}
	}

	return grid;
}

const grids = containers.map((container, i) =>
	buildGrid(container, blackFieldsList[i]),
);

const raetselGrids = raetsel.map((container, i) => {
	buildPuzzle(container, savedPuzzlesList[i]);
});

function getRandomCoordinates() {
	const all = [];

	for (let r = 0; r < 5; r++) {
		for (let c = 0; c < 5; c++) {
			all.push([r, c]);
		}
	}

	return all.filter(() => Math.random() < 0.9);
}

const targetIndex = 7;
const targetContainer = containers[targetIndex];

setInterval(() => {
	targetContainer.innerHTML = "";

	const randomBlackFields = getRandomCoordinates();

	grids[targetIndex] = buildGrid(targetContainer, randomBlackFields);
}, 800);
