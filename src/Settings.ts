import { moment } from "obsidian";

export interface Settings {
    folderName: string;
    pastedImageName: string;
    datetimeFormat: string;
    hideFolder: boolean;
    aeroFolder: boolean;
    autoRenameFolder: boolean;
    autoRenameFiles: boolean;
    autoDeleteFolder: boolean;
}

const _notename = "${notename}";
const _filename = "${filename}";
const _datetime = "${datetime}";

export const DEFAULT_SETTINGS: Settings = {
    folderName: `${_filename}_Attachments`,
    pastedImageName: `${_notename}-${_datetime}`,
    datetimeFormat: 'YYYYMMDDHHmmssSSS',
    hideFolder: false,
    aeroFolder: true,
    autoRenameFolder: true,
    autoRenameFiles: true,
    autoDeleteFolder: false,
}

export const containsFilename = (settings: Settings) => {
    return settings.folderName.contains(_filename);
}

const encode = (text: string) => {
    // 特殊字符
    const specialCharacters = ["\\$", "\\[", "\\]", "\\{", "\\}", "\\(", "\\)", "\\*", "\\+", "\\.", "\\?", "\\\\", "\\^"];
    // 特殊字符的匹配正则
    const reg = new RegExp("[" + specialCharacters.join("") + "]", 'gi');
    // 对特殊字符进行转义
    return text.replace(reg, (character: string) => `\\${character}`);
}

export const buildFolderRegExp = (settings: Settings) => {
    let reg = encode(settings.folderName);
    reg = reg.replace(encode(_filename), ".+");
    return new RegExp("^" + reg + "$");
}

export const buildFolderName = (settings: Settings, fileName: string) => {
    // 指定当前文件所在文件夹（"./"）下指定的文件夹
    return "./" + settings.folderName.replace(_filename, fileName);
}

export const buildPastedImageName = (settings: Settings, notename: string) => {
    const datetime = moment().format(settings.datetimeFormat);
    return settings.pastedImageName.replace(_notename, notename).replace(_datetime, datetime);
}
