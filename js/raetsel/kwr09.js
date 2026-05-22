const puzzleData = {
	PUZZLE_ID: "09",
	SIZE: 10,
	MIN_WORD_LENGTH: 3,
	BLACK_FIELDS: [
		[0, 1],
		[0, 3],
		[0, 5],
		// [0, 7],

		[1, 7],
		[1, 9],

		[2, 1],
		[2, 3],
		[2, 5],

		[3, 0],
		[3, 7],
		[3, 9],

		[4, 0],
		[4, 1],

		[4, 3],

		[4, 5],

		[5, 4],

		[5, 6],

		[5, 8],
		[5, 9],

		[6, 0],
		[6, 2],
		[6, 9],

		[7, 4],
		[7, 6],
		[7, 8],

		[8, 0],
		[8, 2],

		[9, 4],
		[9, 6],
		[9, 8],
	],
	CLUES: {
		WAAGERECHT: {
			4: { c: "Panda, Punto oder 500", l: "4", s: "FIAT" },
			6: {
				c: "Einer sorgt für Abkühlung, einige füllen den Stundenplan",
				l: "7",
				s: "FAECHER",
			},
			7: { c: "Entertainment Genie ohne Talentlücke", l: "4", s: "EGOT" },
			8: {
				c: "Postfaschistin in Benitos Fußstapfen",
				l: "8",
				s: "MELONI",
			},
			9: {
				c: "Einerseits belastend störrisch, andererseits erträglich berauschend",
				l: "4",
				s: "ESEL",
			},
			11: {
				c: `Herzensangelegenheit: Bemisst die Schläge`,
				l: "4",
				s: "PULS",
			},
			15: {
				c: "Vorm niedlichen Außerirdischen wird's zur digitalen Außenwelt",
				l: "6",
				s: "INTERN",
			},
			16: { c: "Schon vorbei, glatt verpasst", l: "4", s: "EBEN" },
			18: { c: "Alle Kompasse führen dahin", l: "7", s: "NORDPOL" },
			19: {
				c: "Redaktionelle Dusselei (tierisch peinlich)",
				l: "4",
				s: "ENTE",
			},
		},
		SENKRECHT: {
			1: { c: "Gar nicht mal so selten", l: "3", s: "OFT" },
			2: {
				c: "Kommandeur*in und Informati-ker*in sind sich einig: Dem ... folgt unweigerlich die prompte Ausführung",
				l: "6",
				s: "BEFEHL",
			},
			3: { c: "Aggregatzustand vom Bcuhsetabnasalt", l: "5", s: "CHAOS" },
			4: { c: "Lieber vor Wahl als vor Wähler", l: "5", s: "FREIE" },
			5: {
				c: "Unverschämter Monopolist für Design-Software",
				l: "5",
				s: "ADOBE",
			},
			10: {
				c: "Mal künstlich handschriftlich, mal szenisch anweisend, mal ausführlich programmiert",
				l: "6",
				s: "SCRIPT",
			},
			12: { c: "Naturtalent kann es sich sparen", l: "5", s: "UEBEN" },
			13: {
				c: "Hat man fünf- oder siebenfach beisammen zu haben",
				l: "5",
				s: "SINNE",
			},
			14: { c: "Aller Anfang ist der", l: "5", s: "START" },
			17: {
				c: "Wer das ruft, hält sich für Champions, nicht nur in Madrid",
				l: "3",
				s: "OLE",
			},
		},
	},
};
