import zh from './zh';

export const lang = {
    zh,
    get(key: string, ...args: string[]): string {
        // 获取语言设置
        const language = window.i18next?.language;
        // 找不到默认 zh
        const _lang = this[language] || zh;
        // 找不到 key，直接使用 key
        let text = _lang[key] || key;
        // 替换占位符参数
        if (args) {
            for (let i = 0; i < args.length; i++) {
                text = text.replace(new RegExp(`\\{\\{${i}\\}\\}`, "g"), args[i])
            }
        }
        return text;
    }
}
