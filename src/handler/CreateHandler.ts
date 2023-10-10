import { Workspace, TAbstractFile, TFile, FileManager, normalizePath, TextFileView, Vault } from 'obsidian';
import * as Path from 'path';

import { Plugin } from "../Plugin"
import { VaultAttachmentConfiguration } from "../components/VaultAttachmentConfiguration"
import { buildFolderName, buildPastedImageName } from "../Settings"

export class CreateHandler {
    vault: Vault
    plugin: Plugin
    workspace: Workspace
    fileManager: FileManager
    vaultAttachmentConfiguration: VaultAttachmentConfiguration

    static build(plugin: Plugin) {
        const handler = new CreateHandler(plugin);
        return handler.handle.bind(handler);
    }

    constructor(plugin: Plugin) {
        this.vault = plugin.app.vault;
        this.plugin = plugin;
        this.workspace = plugin.app.workspace;
        this.fileManager = plugin.app.fileManager;
        this.vaultAttachmentConfiguration = plugin.vaultAttachmentConfiguration;
    }

    async handle(file: TAbstractFile) {
        console.log('Handle File Create');

        if (!(file instanceof TFile)) {
            return;
        }

        // 非粘贴的图片，返回
        if (!file.name.startsWith("Pasted image ")) {
            return;
        }

        const activeView = this.workspace.getActiveViewOfType(TextFileView);
        const activeFile = activeView?.file;

        if (!activeFile) {
            return;
        }
        // active text file, `md` or `canvas`
        if (activeFile.extension !== 'md' && activeFile.extension !== 'canvas') {
            return;
        }

        const folderPath = Path.join(Path.dirname(activeFile.path), buildFolderName(this.plugin.settings, activeFile.name));

        // 不在激活文件的附件文件夹中
        if (!file.path.startsWith(folderPath)) {
            return;
        }

        // 新的文件名
        const imagePath = normalizePath(Path.join(folderPath, buildPastedImageName(this.plugin.settings, activeFile.basename) + "." + file.extension));

        if (activeFile.extension === 'md') {
            this._rename4MD(file, imagePath, activeView, activeFile);
        }
        if (activeFile.extension === 'canvas') {
            this._rename4Canvas(file, imagePath, activeView);
        }
    }

    async _rename4MD(file: TFile, newPath: string, activeView: TextFileView, activeFile: TFile) {
        // 先原地移动一次文件，否则当 newLinkFormat 设置为 shortest 时，generateMarkdownLink 生成的 oldLinkText 不正确
        // https://github.com/chenfeicqq/obsidian-attachment-manager/issues/4
        await this.fileManager.renameFile(file, file.path);
        const oldLinkText = this.fileManager.generateMarkdownLink(file, activeFile.path);
        await this.fileManager.renameFile(file, newPath);
        const newLinkText = this.fileManager.generateMarkdownLink(file, activeFile.path);

        let content = activeView.getViewData();
        content = content.replace(oldLinkText, newLinkText);
        activeView.setViewData(content, false);
    }

    async _rename4Canvas(file: TFile, newPath: string, activeView: TextFileView) {
        const oldPath = file.path;
        await this.fileManager.renameFile(file, newPath);

        let content = activeView.getViewData();
        content = content.replace(`/(file\\s*\\:\\s*\\")${oldPath}(\\")/g`, `$1${newPath}$2`);
        activeView.setViewData(content, false);
    }
}