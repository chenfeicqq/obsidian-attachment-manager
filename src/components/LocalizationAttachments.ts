import { moment, FileManager, FileSystemAdapter, Notice, TFile, TextFileView, Vault, Workspace, normalizePath, requestUrl } from "obsidian";
import * as Path from 'path';


import { Plugin } from '../Plugin'
import { lang } from '../lang'
import { buildFolderName, buildPastedImageNameWithMoment } from "../Settings";

// https://developer.mozilla.org/zh-CN/docs/Web/Media/Formats/Image_types
const IMAGE_EXTENSION: Record<string, string> = {
    "image/apng": "apng",
    "image/avif": "avif",
    "image/bmp": "bmp",
    "image/gif": "gif",
    "image/x-icon": "ico",
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/svg+xml": "svg",
    "image/tiff": "tif",
    "image/webp": "webp",
}

class Node{
    type: string;
    url: string | undefined;
    file: string;
}

export class LocalizationAttachments {
    vault: Vault
    plugin: Plugin
    adapter: FileSystemAdapter
    workspace: Workspace
    fileManager: FileManager

    constructor(plugin: Plugin) {
        this.vault = plugin.app.vault;
        this.plugin = plugin;
        this.adapter = plugin.adapter;
        this.workspace = plugin.app.workspace;
        this.fileManager = plugin.app.fileManager;
    }

    load() {
        // 添加文件菜单
        /* this.plugin.registerEvent(this.workspace.on("file-menu", (menu, file) => {
            if (!(file instanceof TFile)) {
                return;
            }
            // `md` file
            if (file.extension === 'md') {
                return;
            }
            menu.addItem((menuItem: MenuItem) => {
                menuItem.setTitle(lang.get("command_localization_remote_attachments"));
                menuItem.onClick(() => {

                })
            });
        })); */
        // This adds a command that can be triggered anywhere
        this.plugin.addCommand({
            id: "localization-remote-attachments",
            name: lang.get("command_localization_remote_attachments"),
            callback: () => {
                this.processActivePage();
            },
        });
    }

    async processActivePage() {
        const activeView = this.workspace.getActiveViewOfType(TextFileView);
        const activeFile = activeView?.file;

        if (!activeFile) {
            return;
        }

        const folderPath = Path.join(Path.dirname(activeFile.path), buildFolderName(this.plugin.settings, activeFile.name, activeFile.basename));

        // 图片存放目录不存在时，创建目录
        // https://github.com/chenfeicqq/obsidian-attachment-manager/issues/2
        if (!(await this.adapter.exists(folderPath))) {
            await this.vault.createFolder(folderPath);
        }

        // `md` file
        if (activeFile.extension === 'md') {
            await this._process4MD(activeView, activeFile, folderPath);
            return;
        }
        // `canvas` file
        if (activeFile.extension === 'canvas') {
            await this._process4Canvas(activeView, activeFile, folderPath);
            return;
        }
    }

    async _process4MD(activeView: TextFileView, activeFile: TFile, folderPath: string) {

        const content = activeView.getViewData();

        // 附件正则
        const regex = /!\[(?<anchor>.*?)\]\((?<link>.+?)\)/g

        const promises: Promise<string>[] = [];
        // 时间种子
        let timeseed = moment();

        // 找到所有链接异步下载
        // TODO 避免同链接重复下载
        content.replace(regex, (match: string, anchor: string, link: string) => {
            // 时间种子 +1 ms，避免 content 中存在多个图片链接时，相同时间的图片名称相同，会导致保存失败
            // https://github.com/chenfeicqq/obsidian-attachment-manager/issues/8
            timeseed = timeseed.add(1, 'm');
            const imagePath = Path.join(folderPath, buildPastedImageNameWithMoment(this.plugin.settings, timeseed, activeFile.basename));
            promises.push(this._download4MD(activeFile, match, link, imagePath));
            return match;
        });

        const list = await Promise.all(promises);

        // 替换为下载后的链接
        // const newContent = content.replace(regex, () => list.shift());
        const newContent = content.replace(regex, (match: string) => {
            const newLink = list.shift();
            return newLink ? newLink : match;
        });

        if (content != newContent) {
            activeView.setViewData(newContent, false);
        }
    }

    async _download4MD(activeFile: TFile, match: string, link: string, imagePath: string) {
        // 不是远程文件
        if (!this._isUrl(link)) {
            return match;
        }
        const file = await this._download(link, imagePath);
        // 未下载
        if (!(file instanceof TFile)) {
            return match;
        }
        return this.fileManager.generateMarkdownLink(file, activeFile.path);
    }

    async _process4Canvas(activeView: TextFileView, activeFile: TFile, folderPath: string) {

        const content = JSON.parse(activeView.getViewData());

        const promises: Promise<void>[] = [];
        // 时间种子
        let timeseed = moment();

        // TODO 避免同链接重复下载
        content.nodes.forEach((node: Node) => {
            // 时间种子 +1 ms，避免 content 中存在多个图片链接时，相同时间的图片名称相同，会导致保存失败
            // https://github.com/chenfeicqq/obsidian-attachment-manager/issues/8
            timeseed = timeseed.add(1, 'm');
            const imagePath = Path.join(folderPath, buildPastedImageNameWithMoment(this.plugin.settings, timeseed, activeFile.basename));
            promises.push(this._download4Canvas(node, imagePath));
        });

        // 等待处理完成
        await Promise.all(promises);

        activeView.setViewData(JSON.stringify(content, null, "\t"), false);
    }

    async _download4Canvas(node: Node, imagePath: string) {
        // 非 link 节点
        // if (node.type !== 'link') {
        if (node.type !== 'link' || !node.url) {
            return;
        }
        // link 类型 url 一定存在
        const file = await this._download(node.url, imagePath);
        // 未下载
        if (!(file instanceof TFile)) {
            return;
        }
        // 修改节点为本地文件节点
        node.type = 'file';
        delete node.url;
        node.file = file.path;
    }

    _isUrl(url: string) {
        try {
            return Boolean(new URL(url));
        } catch (_) {
            return false;
        }
    }

    async _download(url: string, imagePath: string) {
        return await requestUrl(url).then(async (response) => {
            if (200 != response.status) {
                new Notice(`${url} ${lang.get("command_localization_remote_attachments_failure")}`);
                return false;
            }
            const contentType = response.headers['content-type'];
            const extension = IMAGE_EXTENSION[contentType];

            if (!extension) {
                // 非图片跳过
                return false;
            }
            const file = await this.vault.createBinary(normalizePath(imagePath + "." + extension), response.arrayBuffer);
            new Notice(`${url} ${lang.get("command_localization_remote_attachments_success")}`);
            return file;
        });
    }
}