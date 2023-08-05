import { Plugin as ObsidianPlugin, FileSystemAdapter } from 'obsidian';

import { Settings, DEFAULT_SETTINGS } from "./Settings";
import { SettingTab } from './SettingTab';
import { VaultAttachmentConfiguration } from './components/VaultAttachmentConfiguration';
import { EditorPasteHandler } from './handler/EditorPasteHandler';
import { EditorDropHandler } from './handler/EditorDropHandler';
import { FileOpenHandler } from './handler/FileOpenHandler';
import { DeleteHandler } from './handler/DeleteHandler';
import { RenameHandler } from './handler/RenameHandler';
import { HideFolder } from './components/HideFolder';

export class Plugin extends ObsidianPlugin {
    settings: Settings
    hideFolder: HideFolder
    adapter: FileSystemAdapter
    vaultAttachmentConfiguration: VaultAttachmentConfiguration

    async onload() {
        console.log('loading plugin');

        this.adapter = this.app.vault.adapter as FileSystemAdapter;
        this.vaultAttachmentConfiguration = new VaultAttachmentConfiguration(this.app.vault);
        this.vaultAttachmentConfiguration.backup();

        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());

        this.addSettingTab(new SettingTab(this.app, this));

        // 粘贴图片
        this.registerEvent(this.app.workspace.on('editor-paste', EditorPasteHandler.build(this)));
        // 拓拽文件至 md 文件
        this.registerEvent(this.app.workspace.on('editor-drop', EditorDropHandler.build(this)));
        // 文件打开
        this.registerEvent(this.app.workspace.on('file-open', FileOpenHandler.build(this)));
        // 文件重命名
        this.registerEvent(this.app.vault.on('rename', RenameHandler.build(this)));
        // 文件删除
        this.registerEvent(this.app.vault.on('delete', DeleteHandler.build(this)));

        this.hideFolder = new HideFolder(this);
        this.hideFolder.load();
    }

    onunload() {
        console.log('unloading plugin');
        this.vaultAttachmentConfiguration.restore();
        this.hideFolder.unload();
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }
}
