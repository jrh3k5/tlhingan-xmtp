import run from "@xmtp/bot-starter";
import dotenv from 'dotenv';
import fs from 'fs';
import xml2js from 'xml2js';
import MiniSearch from 'minisearch'

dotenv.config();

console.log("Reading in Klingon data");

const documents = [];
const dataDir = "./klingon-assistant-data"
fs.readdirSync(dataDir).forEach(file => {
    // skip anything that isn't data 
    if (!file.match(/^mem\-[0-9]+\-[a-zA-Z]+\.xml$/)) {
        return
    }

    // skip extra content
    if (file.match(/^.*\-header.xml$/) ||
        file.match(/^.*\-suffixes.xml$/) ||
        file.match(/^.*\-extra.xml$/) ||
        file.match(/^.*\-examples.xml$/) ||
        file.match(/^.*-footer.xml$/)) {
        return
    }

    const fileXML = fs.readFileSync(dataDir + "/" + file);
    const embeddedXML = `<tables>${fileXML}</tables>`;
    xml2js.parseString(embeddedXML, (err, obj) => {
        if (err) {
            console.error(`Failed to read file ${file}`, err);
            return
        }

        obj.tables.table.forEach((table, tableIndex) => {
            const entryNameCol = table.column.filter(c => c["$"].name === "entry_name")[0];
            if (!entryNameCol) {
                console.log(`No entry_name found for table in ${file} at table index ${tableIndex}; skipping it`);
            }
            const entryName = entryNameCol["_"];

            const definitionCol = table.column.filter(c => c["$"].name === "definition")[0];
            if (!definitionCol) {
                console.log(`No definition found for table in ${file} at table index ${tableIndex}; skipping it`);
            }
            const definition = definitionCol["_"];

            documents.push({
                id: `${entryName}-${tableIndex}`,
                en: definition,
                tlh: entryName
            });
        })
    })
});

console.log("Klingon data loading complete");

console.log("Building search index");

const searchIndex = new MiniSearch({
    fields: ["en", "tlh"],
    storeFields: ["en", "tlh"]
})
searchIndex.addAll(documents);

console.log("Search index construction complete");

run(async (context) => {
    const messageBody = context.message.content;
    await context.reply(`ECHO: ${messageBody}`);
});