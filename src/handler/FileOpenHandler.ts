import { TFile } from 'obsidian';

import { Plugin } from "../Plugin"
import { VaultAttachmentConfiguration } from "../components/VaultAttachmentConfiguration"
import { buildFolderName } from "../Settings"

export class FileOpenHandler {
    plugin: Plugin
    vaultAttachmentConfiguration: VaultAttachmentConfiguration

    static build(plugin: Plugin) {
        const handler = new FileOpenHandler(plugin);
        return handler.handle.bind(handler);
    }

    constructor(plugin: Plugin) {
        this.plugin = plugin;
        this.vaultAttachmentConfiguration = plugin.vaultAttachmentConfiguration;
    }

    async handle(file: TFile | null) {
        console.log('Handle File Open');

        if (file == null) {
            return;
        }
        if (file.extension !== 'md' && file.extension !== 'canvas') {
            return;
        }

        this.vaultAttachmentConfiguration.update(buildFolderName(this.plugin.settings, file.name, file.basename))
    }
}