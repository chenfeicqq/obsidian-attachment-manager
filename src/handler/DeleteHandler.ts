import { TFile, Vault, FileSystemAdapter } from 'obsidian';
import * as Path from 'path';

import { Plugin } from "../Plugin"
import { VaultAttachmentConfiguration } from "../components/VaultAttachmentConfiguration"
import { buildFolderName, containsFilename } from "../Settings"

export class DeleteHandler {
    vault: Vault
    plugin: Plugin
    adapter: FileSystemAdapter
    vaultAttachmentConfiguration: VaultAttachmentConfiguration

    static build(plugin: Plugin) {
        const handler = new DeleteHandler(plugin);
        return handler.handle.bind(handler);
    }

    constructor(plugin: Plugin) {
        this.vault = plugin.app.vault;
        this.plugin = plugin;
        this.adapter = plugin.adapter;
        this.vaultAttachmentConfiguration = plugin.vaultAttachmentConfiguration;
    }

    async handle(file: TFile) {
        console.log('Handle Delete');

        if (file.extension !== 'md' && file.extension !== 'canvas') {
            return;
        }

        // 未包含 filename，说明不是每个文件一个附件文件夹（不能删除）
        if (!containsFilename(this.plugin.settings) || !this.plugin.settings.autoDeleteFolder) {
            return;
        }

        const folderPath = Path.join(Path.dirname(file.path), buildFolderName(this.plugin.settings, file.name));

        if (await this.adapter.exists(folderPath)) {

            //@ts-ignore
            const trashOption = this.vault.getConfig("trashOption");

            if (trashOption === "system") {
                await this.adapter.trashSystem(folderPath);
            } else if (trashOption === "local") {
                await this.adapter.trashLocal(folderPath);
            } else {
                await this.adapter.remove(folderPath);
            }
            console.log('Deleted', folderPath)
        }
    }
}