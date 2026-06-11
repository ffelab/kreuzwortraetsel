const puzzleData = {
	PUZZLE_ID: "02",
	SIZE: 10,
	MIN_WORD_LENGTH: 3,
	BLACK_FIELDS: [
		[0, 1],
		[0, 2],
		[0, 3],
		[0, 4],
		[0, 5],
		[0, 6],
		[0, 7],
		[0, 8],

		[1, 4],
		[1, 5],

		[2, 1],
		[2, 2],
		[2, 4],
		[2, 5],
		[2, 7],
		[2, 8],

		[4, 1],
		[4, 2],
		[4, 4],
		[4, 5],
		[4, 7],
		[4, 8],

		[5, 0],
		[5, 1],
		[5, 2],
		[5, 4],
		[5, 5],
		[5, 7],
		[5, 8],
		[5, 9],

		[6, 0],
		[6, 9],

		[7, 0],
		[7, 2],
		[7, 4],
		[7, 5],
		[7, 7],
		[7, 9],

		[8, 0],
		[8, 2],
		[8, 4],
		[8, 5],
		[8, 7],
		[8, 9],

		[9, 0],

		[9, 9],
	],
	CLUES: {
		WAAGERECHT: {
			3: { c: "", l: "4", s: "CODE" },
			5: {
				c: "Browseranleitung: Haufenweise Text musste lesen",
				l: "4",
				s: "HTML",
			},
			6: {
				c: "Objekt der Cartoon-Koyoten-Begierde: Der absolute Renner",
				l: "10",
				s: "ROADRUNNER",
			},
			7: { c: "", l: "8", s: "DAEMPFER" },
			9: { c: "", l: "8", s: "MONITORE" },
		},
		SENKRECHT: {
			1: { c: "", l: "5", s: "ACCRA" },
			2: { c: "", l: "5", s: "FLORA" },
			4: { c: "", l: "9", s: "ERDBEEREN" },
			5: { c: "", l: "9", s: "HANDYFOTO" },
			5: { c: "", l: "4", s: "DARM" },
			6: { c: "", l: "4", s: "REBE" },
		},
	},
};
