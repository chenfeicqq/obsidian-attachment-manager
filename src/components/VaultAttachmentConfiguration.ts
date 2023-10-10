import { Vault } from "obsidian";

export class VaultAttachmentConfiguration {
    vault: Vault
    key = "attachmentFolderPath"
    _value: string
    key2 = "newLinkFormat"
    _value2: string

    constructor(vault: Vault) {
        this.vault = vault;
    }

    backup() {
        //@ts-ignore
        this._value = this.vault.getConfig(this.key);
        //@ts-ignore
        this._value2 = this.vault.getConfig(this.key2)
        //@ts-ignore
        this.vault.setConfig(this.key2, "relative");
    }

    update(value: string) {
        //@ts-ignore
        this.vault.setConfig(this.key, value);
    }

    restore() {
        //@ts-ignore
        this.vault.setConfig(this.key, this._value);
        //@ts-ignore
        this.vault.setConfig(this.key2, this._value2);
    }
}
