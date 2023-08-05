import zh from './zh';
import en from './en';

export const lang = {
    en,
    zh,
    get(key: string, ...args: string[]): string {
        // 获取语言设置
        const language = window.localStorage.getItem('language') || "en";
        // 找不到默认 en
        const _lang = this[language] || en;
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
