import * as vscode from "vscode";
import path, { dirname } from "path";
import { existsSync } from "fs";
import { readFile } from "fs/promises";
import { toTitleCase } from "./utils";

const EXTENSION_PATH = dirname(__dirname);

const LUCIDE_STATIC_PATH = path.resolve(EXTENSION_PATH, "node_modules", "lucide-static");
const LUCIDE_STATIC_ICONS_PATH = path.resolve(EXTENSION_PATH, "node_modules", "lucide-static", "icons");
const LUCIDE_STATIC_TAGS_PATH = path.resolve(LUCIDE_STATIC_PATH, "tags.json");

async function handleBrowseCommand() {
    if (!existsSync(LUCIDE_STATIC_TAGS_PATH)) {
        await vscode.window.showErrorMessage("Icons not found!");
        return;
    }
    let tags: IconTags;
    try {
        const data = await readFile(LUCIDE_STATIC_TAGS_PATH, "utf-8");
        tags = JSON.parse(data);
    } catch (error) {
        await vscode.window.showErrorMessage("Icons not found!");
        return;
    }

    const selectedIcon = await vscode.window.showQuickPick(
        Object.keys(tags).map((key) => {
            return {
                label: key,
                detail: tags[key].join(", "),
                iconPath: {
                    light: vscode.Uri.file(path.resolve(LUCIDE_STATIC_ICONS_PATH, `${key}.svg`)),
                    dark: vscode.Uri.file(path.resolve(LUCIDE_STATIC_ICONS_PATH, `${key}-white.svg`)),
                },
                id: key,
            };
        }),
        {
            title: "Choose an icon",
            matchOnDescription: true,
            matchOnDetail: true,
        }
    );

    if (!selectedIcon) {
        return;
    }

    const selectedMethod = await vscode.window.showQuickPick(
        [
            {
                label: "Vanill JS",
                detail: `data-lucide="${selectedIcon.id}"`,
                value: `data-lucide="${selectedIcon.id}"`,
            },
            {
                label: "React Component",
                detail: `<${toTitleCase(selectedIcon.id)} />`,
                value: `<${toTitleCase(selectedIcon.id)} />`,
            },
        ],
        {
            title: "Whats the icon for?",
            matchOnDescription: true,
            matchOnDetail: true,
        }
    );

    if (!selectedMethod) {
        return;
    }

    await vscode.env.clipboard.writeText(selectedMethod.value);
    await vscode.window.showInformationMessage("Copied!");
}

export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand("vscode-lucide-icons.browse", handleBrowseCommand);
    context.subscriptions.push(disposable);

    const hasAskedForReview = context.globalState.get("hasAskedForReview");

    if (!hasAskedForReview) {
        setTimeout(() => {
            vscode.window
                .showInformationMessage(
                    "Loving Lucide Icons? Support the extenstion by leaving a review!",
                    "Leave a Review",
                    "Maybe Later",
                    "Never"
                )
                .then((selection) => {
                    if (selection === "Leave a Review") {
                        vscode.env.openExternal(
                            vscode.Uri.parse(
                                "https://marketplace.visualstudio.com/items?itemName=Lakshmisankar.vscode-lucide-icons&ssr=false#review-details"
                            )
                        );
                        context.globalState.update("hasAskedForReview", true);
                    } else if (selection === "Never") {
                        context.globalState.update("hasAskedForReview", true);
                    }
                });
        }, 1500);
    }
}

export function deactivate() {}
