import { moment } from "obsidian";

export interface Settings {
    folderName: string;
    pastedImageFileName: string;
    datetimeFormat: string;
    hideFolder: boolean;
    autoRenameFolder: boolean;
    autoRenameFiles: boolean;
    autoDeleteFolder: boolean;
}

const _filename = "${filename}";
const _datetime = "${datetime}";

export const DEFAULT_SETTINGS: Settings = {
    folderName: `${_filename}.md_Attachments`,
    pastedImageFileName: `${_filename}-${_datetime}`,
    datetimeFormat: 'YYYYMMDDHHmmssSSS',
    hideFolder: false,
    autoRenameFolder: true,
    autoRenameFiles: false,
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

export const buildPastedImageFileName = (settings: Settings, fileName: string) => {
    const datetime = moment().format(settings.datetimeFormat);
    return settings.pastedImageFileName.replace(_filename, fileName).replace(_datetime, datetime);
}
