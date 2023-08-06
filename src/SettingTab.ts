import { App, PluginSettingTab, Setting, normalizePath } from 'obsidian';
import { lang } from './lang'
import { Plugin } from './Plugin';
import { DEFAULT_SETTINGS } from './Settings';

export class SettingTab extends PluginSettingTab {
    plugin: Plugin;

    constructor(app: App, plugin: Plugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;

        containerEl.empty();

        new Setting(containerEl)
            .setName(lang.get('settings_folder_name'))
            .setDesc(lang.get('settings_folder_name_desc'))
            .addText(text => text
                .setPlaceholder(DEFAULT_SETTINGS.folderName)
                .setValue(this.plugin.settings.folderName)
                .onChange(async (value: string) => {
                    value = normalizePath(value);
                    this.plugin.settings.folderName = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName(lang.get('settings_pasted_image_file_name'))
            .setDesc(lang.get('settings_pasted_image_file_name_desc'))
            .addText(text => text
                .setPlaceholder(DEFAULT_SETTINGS.pastedImageName)
                .setValue(this.plugin.settings.pastedImageName)
                .onChange(async (value: string) => {
                    this.plugin.settings.pastedImageName = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName(lang.get('settings_datetime_format'))
            .setDesc(lang.get('settings_datetime_format_desc'))
            .addMomentFormat(text => text
                .setDefaultFormat(DEFAULT_SETTINGS.datetimeFormat)
                .setValue(this.plugin.settings.datetimeFormat)
                .onChange(async (value: string) => {
                    this.plugin.settings.datetimeFormat = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName(lang.get('settings_hide_folder'))
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.hideFolder)
                .onChange(async (value: boolean) => {
                    this.plugin.settings.hideFolder = value;
                    await this.plugin.saveSettings();
                    await this.plugin.hideFolder.refresh();
                }));

        new Setting(containerEl)
            .setName(lang.get('settings_auto_rename_folder'))
            .setDesc(lang.get('settings_auto_rename_folder_desc'))
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.autoRenameFolder)
                .onChange(async (value: boolean) => {
                    this.plugin.settings.autoRenameFolder = value;
                    await this.plugin.saveSettings();
                }));

        if (this.plugin.settings.autoRenameFolder)
            new Setting(containerEl)
                .setName(lang.get('settings_auto_rename_files'))
                .setDesc(lang.get('settings_auto_rename_files_desc'))
                .addToggle(toggle => toggle
                    .setValue(this.plugin.settings.autoRenameFiles)
                    .onChange(async (value: boolean) => {
                        this.plugin.settings.autoRenameFiles = value;
                        await this.plugin.saveSettings();
                    }));

        new Setting(containerEl)
            .setName(lang.get('settings_auto_delete_folder'))
            .setDesc(lang.get('settings_auto_delete_folder_desc'))
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.autoDeleteFolder)
                .onChange(async (value: boolean) => {
                    this.plugin.settings.autoDeleteFolder = value;
                    await this.plugin.saveSettings();
                }));
    }
}
