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

export const containsFilenameOrNotename = (settings: Settings) => {
    return settings.folderName.contains(_filename) || settings.folderName.contains(_notename);
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
    // 兼容 notename
    // https://github.com/chenfeicqq/obsidian-attachment-manager/issues/11
    reg = reg.replace(encode(_filename), ".+").replace(encode(_notename), ".+");
    return new RegExp("^" + reg + "$");
}

export const buildFolderName = (settings: Settings, fileName: string, notename: string) => {
    // 指定当前文件所在文件夹（"./"）下指定的文件夹

    // 使用 filename
    if (settings.folderName.contains(_filename)) {
        return "./" + settings.folderName.replace(_filename, fileName);
    }
    // 使用 notename
    if (settings.folderName.contains(_notename)) {
        return "./" + settings.folderName.replace(_notename, notename);
    }
    // 非 filename/notename
    return "./" + settings.folderName;
}

export const buildPastedImageName = (settings: Settings, notename: string) => {
    return buildPastedImageNameWithMoment(settings, moment(), notename);
}

export const buildPastedImageNameWithMoment = (settings: Settings, moment: moment.Moment, notename: string) => {
    const datetime = moment.format(settings.datetimeFormat);
    return settings.pastedImageName.replace(_notename, notename).replace(_datetime, datetime);
}