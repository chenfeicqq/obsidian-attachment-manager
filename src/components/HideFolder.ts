import { setIcon } from "obsidian";

import { Plugin } from '../Plugin'
import { lang } from '../lang'
import { buildFolderRegExp } from '../Settings'

export class HideFolder {
    plugin: Plugin
    ribbonIconButton: HTMLElement;
    statusBarItem: HTMLElement;
    mutationObserver: MutationObserver;

    constructor(plugin: Plugin) {
        this.plugin = plugin;
    }

    load() {
        // This creates an icon in the left ribbon.
        this.ribbonIconButton = this.plugin.addRibbonIcon(
            this.plugin.settings.hideFolder ? "eye-off" : "eye",
            lang.get("command_toggle_attachment_folder_visibility"),
            (evt: MouseEvent) => {
                this.plugin.settings.hideFolder = !this.plugin.settings.hideFolder;
                this.plugin.saveSettings();
                this.refresh();
            }
        );

        // This adds a status bar item to the bottom of the app. Does not work on mobile apps.
        this.statusBarItem = this.plugin.addStatusBarItem();
        this.statusBarItem.setText(this.plugin.settings.hideFolder ? lang.get("status_attachment_folder_visibility") : "");

        // This adds a command that can be triggered anywhere
        this.plugin.addCommand({
            id: "toggle-attachment-folder_visibility",
            name: lang.get("command_toggle_attachment_folder_visibility"),
            callback: () => {
                this.plugin.settings.hideFolder = !this.plugin.settings.hideFolder;
                this.plugin.saveSettings();
                this.refresh();
            },
        });

        this.mutationObserver = new MutationObserver((mutationRecord) => {
            mutationRecord.forEach(record => {
                if (record.target?.parentElement?.classList.contains("nav-folder")) {
                    this.refreshFolders();
                }
            });
        });
        this.mutationObserver.observe(window.document, { childList: true, subtree: true });
    }

    async refresh() {
        setIcon(this.ribbonIconButton, this.plugin.settings.hideFolder ? "eye-off" : "eye");
        this.statusBarItem.setText(this.plugin.settings.hideFolder ? lang.get("status_attachment_folder_visibility") : "");
        await this.refreshFolders();
    }

    async refreshFolders() {
        const filter = buildFolderRegExp(this.plugin.settings);

        const folders = document.querySelectorAll(".nav-folder-title-content");

        folders.forEach((folder) => {
            const folderName = folder.innerHTML;
            if (filter.test(folderName)) {
                if (this.plugin.settings.hideFolder) {
                    folder.parentElement?.parentElement?.addClass("hide-attachment-folder");
                } else {
                    folder.parentElement?.parentElement?.removeClass("hide-attachment-folder");
                }
                if (this.plugin.settings.aeroFolder) {
                    folder.parentElement?.parentElement?.addClass("aero-attachment-folder");
                } else {
                    folder.parentElement?.parentElement?.removeClass("aero-attachment-folder");
                }
            }
        })
    }

    unload() {
        this.mutationObserver.disconnect();
    }
}