# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

Obsidian 插件，用于接收 Telegram 机器人消息并添加到日记或自定义文件中。使用 TypeScript 开发，grammy 处理 Telegram Bot API，Mustache 模板引擎，async-mutex 保证线程安全。

## 常用命令

```bash
pnpm dev          # 开发模式（监听文件变化）
pnpm build        # 类型检查 + 生产构建
pnpm lint         # ESLint 检查
pnpm test         # 运行所有测试

# 运行单个测试文件
pnpm test -- test/diary.spec.ts

# 按模式匹配运行测试
pnpm test -- --testNamePattern="cutoff"
```

## 架构

### 入口
- `src/main.ts` - `TGInbox` 插件类，处理生命周期、设置和机器人初始化

### 核心模块
- `src/bot.ts` - `TelegramBot` 类处理消息接收、白名单认证、mutex 锁定的 vault 写入
- `src/settings.ts` - `TGInboxSettings` 接口和设置界面
- `src/io.ts` - Vault 文件操作（追加/前置消息内容）

### 工具模块 (`src/utils/`)
- `diary.ts` - 日记创建，支持时间截止点（截止时间前的消息归入前一天）
- `template.ts` - Mustache 模板渲染，构建 `MessageData` 和 `PathData` 对象
- `file.ts` - 路径解析、文件/目录创建
- `markdown.ts` - Telegram 实体转 Markdown（使用 `@telegraf/entity`）
- `download.ts` - 从 Telegram 下载媒体文件
- `sync.ts` - 等待 Obsidian Sync/Remotely Save 完成后再启动机器人

### 数据流
1. 接收 Telegram 消息 → 白名单认证检查（allowed_users）
2. 构建模板数据（`buildMsgData`）→ Mustache 渲染
3. 确定目标文件（带时间截止点的日记 或 自定义路径模板）
4. Mutex 锁定写入 vault → 发送表情回复

### 关键类型
- `MessageUpdate` (src/type.ts) - 频道和非频道 Telegram 消息类型的联合类型
- `TGInboxSettings` - 所有插件配置选项
- `MessageData`, `PathData` - 模板变量对象

## 测试

测试文件位于 `/test` 目录，使用 Jest + ts-jest。主要覆盖：
- 时间截止点日期调整逻辑
- 消息数据转换
- 路径生成及特殊字符处理
- 转发消息处理（用户/频道/群组来源）

测试中通过 `jest.mock("obsidian")` mock Obsidian 模块。

## 关键实现细节

- **线程安全**：使用 `async-mutex` 处理并发消息写入，防止 vault 损坏
- **访问控制**：通过 Telegram 用户名或数字 ID 白名单认证
- **时间截止点**：日记可设置自定义起始时间（如凌晨 4:00），截止时间前的消息归入前一天
- **同步集成**：可等待同步插件完成后再启动机器人（`run_after_sync` 设置）
