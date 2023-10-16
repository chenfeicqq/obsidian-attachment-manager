import { TFile, TAbstractFile, Vault, FileManager, FileSystemAdapter, normalizePath } from 'obsidian';
import * as Path from "path/posix";

import { Plugin } from "../Plugin"
import { VaultAttachmentConfiguration } from "../components/VaultAttachmentConfiguration"
import { buildFolderName, containsFilenameOrNotename } from "../Settings"

export class RenameHandler {
    vault: Vault
    plugin: Plugin
    adapter: FileSystemAdapter
    fileManager: FileManager
    vaultAttachmentConfiguration: VaultAttachmentConfiguration

    static build(plugin: Plugin) {
        const handler = new RenameHandler(plugin);
        return handler.handle.bind(handler);
    }

    constructor(plugin: Plugin) {
        this.vault = plugin.app.vault;
        this.plugin = plugin;
        this.adapter = plugin.adapter;
        this.fileManager = plugin.app.fileManager;
        this.vaultAttachmentConfiguration = plugin.vaultAttachmentConfiguration;
    }

    async handle(newFile: TAbstractFile, oldFilePath: string) {
        console.log('Handle Rename');

        if (!(newFile instanceof TFile)) {
            return;
        }

        if (newFile.extension !== 'md' && newFile.extension !== 'canvas') {
            return;
        }

        // 未包含 filename/notename，说明不是每个 md 文件一个附件文件夹
        if (!containsFilenameOrNotename(this.plugin.settings) || !this.plugin.settings.autoRenameFolder) {
            return;
        }
        const newFolderName = buildFolderName(this.plugin.settings, newFile.name, newFile.basename);
        this.vaultAttachmentConfiguration.update(newFolderName);
        const newFolderPath = normalizePath(Path.join(Path.dirname(newFile.path), newFolderName));

        const oldFileParsedPath = Path.parse(oldFilePath);
        const oldFolderPath = normalizePath(Path.join(Path.dirname(oldFilePath), buildFolderName(this.plugin.settings, oldFileParsedPath.base, oldFileParsedPath.name)));

        await this._renameFolder(oldFolderPath, newFolderPath);

        if (!this.plugin.settings.autoRenameFiles) {
            return;
        }

        // 老的文件名中剔除后缀（假定 rename 后缀不会变化）
        await this._renameFiles(newFolderPath, newFile.basename, Path.basename(oldFilePath, "." + newFile.extension))
    }

    async _renameFolder(oldFolderPath: string, newFolderPath: string) {
        if (!(await this.adapter.exists(oldFolderPath)) || oldFolderPath === newFolderPath) {
            return;
        }
        const oldFolder = this.vault.getAbstractFileByPath(oldFolderPath);

        if (oldFolder == null) {
            return;
        }

        // 新 folder 的父目录不存在时，创建父目录，避免移动失败
        // https://github.com/chenfeicqq/obsidian-attachment-manager/issues/5
        const newFolderParentPath = Path.dirname(newFolderPath);
        if (!(await this.adapter.exists(newFolderParentPath))) {
            await this.vault.createFolder(newFolderParentPath);
        }

        await this.fileManager.renameFile(oldFolder, newFolderPath);

        // 父文件夹为空时，顺便删除父文件夹
        const oldFolderParentPath = Path.dirname(oldFolderPath);
        const oldFolderParentListedFiles = await this.adapter.list(oldFolderParentPath);
        if (oldFolderParentListedFiles.folders.length === 0 && oldFolderParentListedFiles.files.length === 0) {
            await this.adapter.rmdir(oldFolderParentPath, true);
        }
    }

    async _renameFiles(newFolderPath: string, newFileName: string, oldFileName: string) {

        const attachmentFiles = (await this.adapter.list(newFolderPath)).files;

        for (const file of attachmentFiles) {

            let attachmentFileName = Path.basename(file);

            if (!attachmentFileName.contains(oldFileName)) {
                continue;
            }

            attachmentFileName = attachmentFileName.replace(oldFileName, newFileName);

            const newFilePath = normalizePath(Path.join(newFolderPath, attachmentFileName));

            const attachmentFile = this.vault.getAbstractFileByPath(file);
            if (attachmentFile == null) {
                continue;
            }
            await this.fileManager.renameFile(attachmentFile, newFilePath);
        }
    }
}