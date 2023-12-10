import run from "@xmtp/bot-starter";
import dotenv from 'dotenv';
import fs from 'fs';
import xml2js from 'xml2js';
import MiniSearch from 'minisearch'
import path from 'path';

dotenv.config();

console.log("Reading in Klingon data");

const documents = [];
const dataDir = path.join(process.cwd(), 'klingon-assistant-data')
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

    const fileXML = fs.readFileSync(path.join(dataDir, file));
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
                klingon: entryName
            });
        })
    })
});

console.log("Klingon data loading complete");

console.log("Building search index");

const searchIndex = new MiniSearch({
    fields: ["en", "klingon"],
    storeFields: ["en", "klingon"]
})
searchIndex.addAll(documents);

console.log("Search index construction complete");

run(async (context) => {
    const messageBody = context.message.content;
    const normalizedBody = messageBody.toLowerCase();

    let response;
    if (normalizedBody.startsWith("en ")) {
        const englishWord = normalizedBody.substring(3)
        const results = searchIndex.search(englishWord, { fields: ["en" ]});

        console.log(results);

        if (results.length > 5) {
            response = `Your search returned ${results.length} results; here are the first five:`;
        } else {
            response = `Your search returned ${results.length} results:`
        }

        response += "\n\n";

        for (let i = 0; i < results.length && i < 5; i++) {
            response += `* ${results[i].klingon}: ${results[i].en}\n`
        }
    } else {
        response = "Sorry, I don't understand. Try entering a search of 'en <English word>'"
    }

    await context.reply(response);
});