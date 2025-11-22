import { Notice, Plugin } from "obsidian";
import { TelegramBot } from "./bot";
import type { TGInboxSettings } from "./settings";
import { TGInboxSettingTab } from "./settings";
import { runAfterSync } from "./utils/sync";

const DEFAULT_SETTINGS: TGInboxSettings = {
  token: "",
  marker: "#inbox",
  allow_users: [],
  download_dir: "/assets",
  download_media: false,
  markdown_escaper: false,
  message_template: "{{{text}}}",
  is_custom_file: false,
  custom_file_path: "Telegram-Inbox.md",
  disable_auto_reception: false,
  reverse_order: false,
  remove_formatting: false,
  run_after_sync: true,
  daily_note_time_cutoff: "00:00",
  ai_enabled: false,
  ai_prompt: `根据以下Telegram消息内容，生成一个带标签的标题。

消息内容：{{{text}}}
发送人：{{name}}

要求：
1. 标题前面要有1-3个标签（2-4个字左右）以表示消息的类别
2. 格式：#tag1 #tag2 #tag3 标题
3. 标签和标题之间用空格分隔
4. 标签可以是主题、情感、用途等方面的关键词，帮助快速识别消息内容
5. 标题要简洁明了，能够概括消息的主要内容
6. 标题总长度不超过50个字符，不要有特殊字符
7. 如果消息内容为空或无意义，请生成 #待定 {{name}}

示例：
#编程开发 #工具 #方法论 具体标题
#学习心得 #记忆力 #方法论 间隔重复与记忆巩固的挑战
#幸福 #心理 #感悟 记录"小确幸"，降低抑郁倾向
#书籍推荐 #投资心理 #财富自由 推荐金钱心理学

请直接返回带标签的标题，不要其他内容，不要用\`\`包裹。`,
  openai_api_base_url: "https://api.openai.com/v1/chat/completions",
  openai_api_key: "",
  ai_model: "gpt-3.5-turbo",
  ai_reply_in_telegram: false,
};

export default class TGInbox extends Plugin {
  settings: TGInboxSettings;
  bot: TelegramBot | null;
  botInfo: {
    username: string;
    isConnected: boolean;
  };

  async onload() {
    this.addSettingTab(new TGInboxSettingTab(this.app, this));
    this.addCommands();
    await this.loadSettings();

    if (this.settings.disable_auto_reception) {
      this.addRibbonIcon("send", "Telegram Inbox: Get Updates", () => {
        this.bot?.getUpdates();
      });
    }

    if (this.settings.run_after_sync) {
      runAfterSync.call(this, () => {
        this.initBot();
      });
    } else {
      this.initBot();
    }
  }

  addCommands() {
    this.addCommand({
      id: "tg-inbox-getupdates",
      name: "Get Updates",
      callback: () => this.bot?.getUpdates(),
    });

    this.addCommand({
      id: "tg-inbox-start",
      name: "Start Telegram Bot",
      callback: () => this.startBot(),
    });

    this.addCommand({
      id: "tg-inbox-stop",
      name: "Stop Telegram Bot",
      callback: () => this.stopBot(),
    });
  }

  async getBotInfo() {
    if (this.bot) {
      return this.bot.bot.api.getMe();
    }
    return null;
  }

  async onunload() {
    this.stopBot();
    console.log("telegram inbox unloaded");
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  async initBot() {
    try {
      if (!this.settings.token) {
        new Notice("Telegram bot token not set");
        return;
      }
      await this.stopBot();
      this.bot = new TelegramBot(this.app.vault, this.settings);
      if (!this.settings.disable_auto_reception) {
        this.startBot();
      }
    } catch (error) {
      console.error("Error launching bot:", error);
      new Notice("Error launching bot");
      this.bot = null;
    }
  }

  async startBot() {
    new Notice("Telegram bot starting");
    if (this.bot) {
      this.bot.start();
    }
  }

  async stopBot() {
    try {
      if (this.bot) {
        await this.bot.bot.stop();
        console.log("bot stopped");
        new Notice("Telegram bot stopped");
      }
    } catch (error) {
      console.error("Error stopping bot:", error);
    }
  }
}
