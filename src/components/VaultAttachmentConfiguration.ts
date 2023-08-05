import { Vault } from "obsidian";

export class VaultAttachmentConfiguration {
    vault: Vault
    key = "attachmentFolderPath"
    _value: string

    constructor(vault: Vault) {
        this.vault = vault;
    }

    backup() {
        //@ts-ignore
        this._value = this.vault.getConfig(this.key);
    }

    update(value: string) {
        //@ts-ignore
        this.vault.setConfig(this.key, value);
    }

    restore() {
        this.update(this._value)
    }
}
