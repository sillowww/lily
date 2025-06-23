/**
 * ansi colour codes and terminal styling utilities.
 */

/**
 * ansi escape codes for terminal colours and styles.
 */
export const COLOURS = {
	RESET: "\x1b[0m",

	// styles
	BRIGHT: "\x1b[1m",
	DIM: "\x1b[2m",
	ITALIC: "\x1b[3m",
	UNDERSCORE: "\x1b[4m",
	BLINK: "\x1b[5m",
	REVERSE: "\x1b[7m",
	HIDDEN: "\x1b[8m",
	STRIKETHROUGH: "\x1b[9m",

	// fg colours
	FG_BLACK: "\x1b[30m",
	FG_RED: "\x1b[31m",
	FG_GREEN: "\x1b[32m",
	FG_YELLOW: "\x1b[33m",
	FG_BLUE: "\x1b[34m",
	FG_MAGENTA: "\x1b[35m",
	FG_CYAN: "\x1b[36m",
	FG_WHITE: "\x1b[37m",
	FG_GRAY: "\x1b[90m",

	// bg colours
	BG_BLACK: "\x1b[40m",
	BG_RED: "\x1b[41m",
	BG_GREEN: "\x1b[42m",
	BG_YELLOW: "\x1b[43m",
	BG_BLUE: "\x1b[44m",
	BG_MAGENTA: "\x1b[45m",
	BG_CYAN: "\x1b[46m",
	BG_WHITE: "\x1b[47m",

	// bright fg colours
	FG_BRIGHT_BLACK: "\x1b[90m",
	FG_BRIGHT_RED: "\x1b[91m",
	FG_BRIGHT_GREEN: "\x1b[92m",
	FG_BRIGHT_YELLOW: "\x1b[93m",
	FG_BRIGHT_BLUE: "\x1b[94m",
	FG_BRIGHT_MAGENTA: "\x1b[95m",
	FG_BRIGHT_CYAN: "\x1b[96m",
	FG_BRIGHT_WHITE: "\x1b[97m",
} as const;

/**
 * predefined colour palette for scope colourization.
 * these colours are cycled through when assigning colours to different scopes.
 */
export const SCOPE_COLOURS = [
	COLOURS.FG_RED,
	COLOURS.FG_GREEN,
	COLOURS.FG_YELLOW,
	COLOURS.FG_BLUE,
	COLOURS.FG_MAGENTA,
	COLOURS.FG_CYAN,
	COLOURS.FG_BRIGHT_RED,
	COLOURS.FG_BRIGHT_GREEN,
	COLOURS.FG_BRIGHT_YELLOW,
	COLOURS.FG_BRIGHT_BLUE,
	COLOURS.FG_BRIGHT_MAGENTA,
	COLOURS.FG_BRIGHT_CYAN,
] as const;

/**
 * wraps text with ansi colour codes and automatically resets at the end.
 *
 * @param text - the text to colourize
 * @param colour - the ansi colour code to apply
 * @returns the colourized text with reset code appended
 *
 * @example
 * ```ts
 * const redText = colourize('error', COLOURS.FG_RED);
 * console.log(redText); // prints "error" in red
 * ```
 */
export function colourize(text: string, colour: string): string {
	return `${colour}${text}${COLOURS.RESET}`;
}

/**
 * removes all ansi colour codes from a string.
 *
 * @param text - the text to strip colours from
 * @returns the text with all ansi escape sequences removed
 *
 * @example
 * ```ts
 * const plainText = stripColours('\x1b[31mred text\x1b[0m');
 * console.log(plainText); // "red text"
 * ```
 */
export function stripColours(text: string): string {
	const ansiEscape = String.fromCharCode(27);
	return text.replace(new RegExp(`${ansiEscape}\\[[0-9;]*m`, "g"), "");
}
