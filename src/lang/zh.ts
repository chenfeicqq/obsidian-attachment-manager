export default {
    "plugin_name": "附件管理器",
    "settings_folder_name": "附件文件夹",
    "settings_folder_name_desc": "附件文件夹的名称，使用变量 ${filename} 获取笔记（md/canvas）文件名称（包含后缀），例：${filename}_Attachments。",
    "settings_pasted_image_file_name": "“粘贴图片”文件名",
    "settings_pasted_image_file_name_desc": "“粘贴图片”保存为文件的名称，使用变量 ${notename} 获取笔记（md/canvas）名称，使用变量 ${datetime} 获取时间，例：${notename}-${datetime}。",
    "settings_datetime_format": "${datetime} 格式",
    "settings_datetime_format_desc": "日期时间格式（使用 moment.js 格式），例：YYYYMMDDHHmmssSSS。",
    "settings_hide_folder": "隐藏附件文件夹",
    "settings_auto_rename_folder": "自动重命名附件文件夹",
    "settings_auto_rename_folder_desc": "笔记（md/canvas）名称变化时，如果附件文件夹名称中包含“${filename}”，自动重命名附件文件夹。",
    "settings_auto_rename_files": "自动重命名附件文件",
    "settings_auto_rename_files_desc": "笔记（md/canvas）名称变化时，如果附件文件名称中包含“${notename}”，自动重命名附件文件。",
    "settings_auto_delete_folder": "自动删除附件文件夹",
    "settings_auto_delete_folder_desc": "笔记（md/canvas）删除时，如果附件文件夹名称中包含“${filename}”，自动删除附件文件夹。",
    "command_toggle_attachment_folder_visibility": "切换附件文件夹的“显示/隐藏”",
    "status_attachment_folder_visibility": "附件文件夹已隐藏",
}