container.addEventListener("click", (e) => {
	const cellEl = e.target.closest(".box");
	if (!cellEl) return;

	const r = Number(cellEl.dataset.row);
	const c = Number(cellEl.dataset.col);

	display.style.color = "white";

	const clickedSameCell = current.row === r && current.col === c;

	if (clickedSameCell) {
		toggleDirection();
		return;
	}

	setActive(r, c);
});
