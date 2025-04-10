const path = require("path");
const { existsSync } = require("fs");
const { readFile, writeFile } = require("fs/promises");

const EXTENSION_PATH = path.dirname(path.dirname(__filename));

const LUCIDE_STATIC_PATH = path.resolve(EXTENSION_PATH, "node_modules", "lucide-static");
const LUCIDE_STATIC_ICONS_PATH = path.resolve(EXTENSION_PATH, "node_modules", "lucide-static", "icons");
const LUCIDE_STATIC_TAGS_PATH = path.resolve(LUCIDE_STATIC_PATH, "tags.json");

async function main() {
    if (!existsSync(LUCIDE_STATIC_TAGS_PATH)) {
        console.error("Icons not found!");
        return;
    }

    let tags;
    try {
        const data = await readFile(LUCIDE_STATIC_TAGS_PATH, "utf-8");
        tags = JSON.parse(data);
    } catch (error) {
        console.error("Icons not found!");
        return;
    }

    const iconfiles = Object.keys(tags).map((key) => {
        return path.resolve(LUCIDE_STATIC_ICONS_PATH, `${key}.svg`);
    });

    for (let i = 0; i < iconfiles.length; i++) {
        const icon = iconfiles[i];
        const iconName = path.basename(icon, ".svg");
        const contents = await readFile(icon, "utf-8");
        const newContents = contents.replace(/currentColor/g, "#ffffff");
        const whiteIcon = path.resolve(path.dirname(icon), `${iconName}-white.svg`);
        await writeFile(whiteIcon, newContents);
    }
}

main().catch((error) => {
    console.error("An error occurred:", error);
});
