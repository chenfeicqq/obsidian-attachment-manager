import { App, Editor, MarkdownView } from 'obsidian';

import { Plugin } from "../Plugin"
import { VaultAttachmentConfiguration } from "../components/VaultAttachmentConfiguration"
import { buildFolderName, buildPastedImageFileName } from "../Settings"

export class EditorPasteHandler {
    app: App
    plugin: Plugin
    vaultAttachmentConfiguration: VaultAttachmentConfiguration

    static build(plugin: Plugin) {
        const handler = new EditorPasteHandler(plugin);
        return handler.handle.bind(handler);
    }

    constructor(plugin: Plugin) {
        this.app = plugin.app;
        this.plugin = plugin;
        this.vaultAttachmentConfiguration = plugin.vaultAttachmentConfiguration;
    }

    async handle(event: ClipboardEvent, editor: Editor, view: MarkdownView) {
        console.log('Handle Paste');

        const mdFile = view.file;
        if (!mdFile) {
            return;
        }

        const clipboardData = event.clipboardData;
        if (!clipboardData) {
            return;
        }
        if (clipboardData.getData('text/plain')) {
            return;
        }
        const clipboardItems = clipboardData.items;
        if (!clipboardData.items) {
            return;
        }

        const mdFileName = mdFile.basename;
        this.vaultAttachmentConfiguration.update(buildFolderName(this.plugin.settings, mdFileName))

        for (const i in clipboardItems) {
            if (!clipboardItems.hasOwnProperty(i))
                continue;
            const item = clipboardItems[i];
            if (item.kind !== 'file') {
                continue;
            }
            // 只处理 png、jpeg 图片
            if (item.type !== 'image/png' && item.type !== 'image/jpeg') {
                continue;
            }

            const pasteImage = item.getAsFile();
            if (!pasteImage) {
                continue;
            }

            // 标记事件被处理
            event.preventDefault();

            //@ts-ignore
            const imageFile = await this.app.saveAttachment(
                buildPastedImageFileName(this.plugin.settings, mdFileName),
                item.type === 'image/png' ? 'png' : item.type === 'image/jpeg' ? 'jpeg' : '',
                await this._blobToArrayBuffer(pasteImage)
            );

            editor.replaceSelection(await this.app.fileManager.generateMarkdownLink(imageFile, mdFile.path));
        }
    }

    _blobToArrayBuffer(blob: Blob) {
        return new Promise((resolve) => {
            const reader = new FileReader()
            reader.onloadend = () => resolve(reader.result)
            reader.readAsArrayBuffer(blob)
        })
    }
}