const inquirer = require("inquirer");
const htmlToImage = require("node-html-to-image");
const fs = require("fs");

let defaultConfigContents = {
    user: "databaseUser",
    password: "databasePassword",
    database: "databaseName",
    pw: "databaseUserPassword"
}

if(!fs.existsSync("config.json")) {
    fs.writeFileSync("config.json", JSON.stringify(defaultConfigContents));
}

if(!fs.existsSync("cards.json")) {
    fs.writeFileSync("cards.json", JSON.stringify([]));
}

if(!fs.existsSync("cards")) {
    fs.mkdirSync("cards");
}

inquirer.prompt([
    {
        type: "list",
        name: "action",
        message: "What do you want to do?",
        choices: ["DEV: Export Trading Cards to Database", "Clear local Trading Cards", "Add Local Trading Card", "Generate Trading Card Images", "DEV: Add Dummy"],
        filter: (val) => {
            if(val === "DEV: Export Trading Cards to Database") {
                return "export";
            } else if(val === "Clear local Trading Cards") {
                return "clear";
            } else if(val === "Add Local Trading Card") {
                return "new";
            } else if(val === "Generate Trading Card Images") {
                return "gen";
            } else if(vall === "DEV: Add Dummy") {
                return "dummy";
            }
        }
    },
    {
        type: "input",
        name: "internalName",
        message: "What should the internal Trading Card Name be? (No Spaces and camelCaseWithLowercaseStart)",
        when: (answers) => { return answers.action === "new" }
    },
    {
        type: "input",
        name: "displayName",
        message: "What should the Display Name be?",
        when: (answers) => { return answers.action === "new" }
    },
    {
        type: "input",
        name: "anime",
        message: "What Anime/Manga/Universe is the Character from?",
        when: (answers) => { return answers.action === "new" }
    },
    {
        type: "number",
        name: "maxOwners",
        message: "What should the amount of Maximum Owners be? (-1 for Unlimited)",
        default: -1,
        when: (answers) => { return answers.action === "new" }
    },
    {
        type: "list",
        name: "rarity",
        message: "What is the Rarity?",
        default: "Common (80%)",
        when: (answers) => { return answers.action === "new" },
        choices: ["Common (80%)", "Uncommon (15%)", "Rare (3%)", "Exotic (1.99%)", "Ultimative (0.01%)"],
        filter: (val) => {
            return (val.split(" (")[0]).toLowerCase();
        }
    },
    {
        type: "input",
        name: "imageUrl",
        message: "What is the URL of the Card Image?",
        when: (answers) => { return answers.action === "new" }
    },
    {
        type: "input",
        name: "age",
        message: "What is the age? (e.g. 17 or 800+; gets displayed as 17 years old or 800+ years old on Card)",
        when: (answers) => { return answers.action === "new" }
    },
    {
        type: "input",
        name: "gender",
        message: "What is the gender? (e.g. Female or Unknown)",
        when: (answers) => { return answers.action === "new" }
    },
    {
        type: "input",
        name: "personality",
        message: "What is the Personality? (e.g. Tsundere, Yandere or Kind)",
        when: (answers) => { return answers.action === "new" }
    },
    {
        type: "input",
        name: "entity",
        message: "What is the Entity/Race? (e.g. Human or Kitsune)",
        when: (answers) => { return answers.action === "new" }
    }
]).then((answers) => {
    if(answers.action === "new") {
        let cards = require("./cards.json");
        cards.push({
            internalName: answers.internalName,
            displayName: answers.displayName,
            anime: answers.anime,
            maxOwners: answers.maxOwners,
            rarity: answers.rarity,
            imageUrl: answers.imageUrl,
            age: answers.age,
            gender: answers.gender,
            personality: answers.personality,
            entity: answers.entity
        });
        fs.writeFileSync("cards.json", JSON.stringify(cards));
        console.log("Added Card to cards.json");
    } else if(answers.action === "clear") {
        console.log("Not implemented yet, delete cards.json manually");
    } else if(answers.action === "export") {
        console.log("Not implemented yet.");
    } else if(answers.action === "gen") {
        let cards = require("./cards.json");
        console.log("Starting Rendering of Cards. Program will exit once complete...")
        cards.forEach((card) => {
            if(card.internalName !== "dummy") {
                generateImage(card.internalName, card.rarity, card.displayName, card.anime, card.age, card.gender, card.personality, card.entity, card.imageUrl);
            }
        })
    } else if(answers.action === "dummy") {
        let cards = require("./cards.json");
        cards.push({
            internalName: "dummy"
        });
        fs.writeFileSync("cards.json", JSON.stringify(cards));
        console.log("Added Dummy Card to cards.json");
    }
});



function generateImage(internalName, rarity, displayName, anime, age, gender, personality, entity, imageUrl) {
    let rarityColors = {
        common: "#7DAE2E",
        uncommon: "#D4723B",
        rare: "#3BB9D4",
        exotic: "#D43B85",
        ultimative: "#633BD4"
    }

    let html = fs.readFileSync("cardTemplate/card.html", { encoding: "utf-8" });
    htmlToImage({
        output: "./cards/" + internalName + ".png",
        html,
        content: {
            rarityColor: rarityColors[rarity],
            displayName,
            anime,
            rarityName: rarity[0].toUpperCase() + rarity.substr(1),
            age,
            gender,
            personality,
            entity,
            imageUrl
        }
    });
}