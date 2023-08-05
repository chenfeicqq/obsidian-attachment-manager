import { Editor, MarkdownView } from 'obsidian';

import { Plugin } from "../Plugin"
import { VaultAttachmentConfiguration } from "../components/VaultAttachmentConfiguration"
import { buildFolderName } from "../Settings"

export class EditorDropHandler {
    plugin: Plugin
    vaultAttachmentConfiguration: VaultAttachmentConfiguration

    static build(plugin: Plugin) {
        const handler = new EditorDropHandler(plugin);
        return handler.handle.bind(handler);
    }

    constructor(plugin: Plugin) {
        this.plugin = plugin;
        this.vaultAttachmentConfiguration = plugin.vaultAttachmentConfiguration;
    }

    async handle(event: DragEvent, editor: Editor, view: MarkdownView) {
        console.log('Handle Drop');

        const mdFile = view.file;
        if (!mdFile) {
            return;
        }

        this.vaultAttachmentConfiguration.update(buildFolderName(this.plugin.settings, mdFile.basename))
    }
}