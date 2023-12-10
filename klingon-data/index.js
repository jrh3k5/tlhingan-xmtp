/**
 * Determines if the given table repesents a noun.
 * @param {*} table The table to be evaluated.
 * @returns true if the given noun represents a table; false if not.
 */
export function isNoun(table) {
    const speechPart = getPartOfSpeech(table);
    return speechPart === "n" || speechPart.startsWith("n:");
}

/**
 * Gets the English text from the given table entry, if available.
 * @param {*} table The table data read from the given Klingon data.
 * @returns null if no English data can be resolved; otherwise, the Klingon text in the given table.
 */
export function getEnglish(table) {
    return getColumnValue(table, "definition");
}

/**
 * Gets the Klingon text from the given table entry, if available.
 * @param {*} table The table data read from the given Klingon data.
 * @returns null if no Klingon data can be resolved; otherwise, the Klingon text in the given table.
 */
export function getKlingon(table) {
    return getColumnValue(table, "entry_name");
}

function getColumn(table, columnName) {
    return table.column.filter(c => c["$"].name === columnName)[0];
}

function getColumnValue(table, columnName) {
    const column = getColumn(table, columnName);
    if (!column) {
        return null;
    }

    return column["_"];
}

function getPartOfSpeech(table) {
    return getColumnValue(table, "part_of_speech");
}