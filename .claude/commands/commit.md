---
name: Commit
description: 根据 git diff 生成符合规范的中文 commit message
category: Git
tags: [git, commit, conventional-commits]
---

**目标**
分析已暂存的代码变更（git diff --cached），生成符合 Conventional Commits 规范的中文 commit message。

**Commit Message 规范**

遵循以下格式：

```
<类型>(<范围>): <简短描述>

<详细描述>

<关联问题>
```

**类型（Type）**

- `feat`: 新功能
- `fix`: 修复 Bug
- `docs`: 文档变更
- `style`: 代码格式调整（不影响功能）
- `refactor`: 重构代码（既非新功能也非 Bug 修复）
- `perf`: 性能优化
- `test`: 添加或修改测试
- `build`: 构建系统或依赖变更
- `ci`: CI 配置变更
- `chore`: 其他杂项变更

**范围（Scope）**
根据项目模块划分，例如：

- `schedule`: 日程模块
- `memory`: 记忆模块
- `explore`: 探索模块
- `mine`: 我的模块
- `common`: 公共模块
- `api`: API 接口
- `ui`: UI 组件
- `router`: 路由
- `state`: 状态管理
- `utils`: 工具类
- `deps`: 依赖管理

如果变更涉及多个模块，范围可省略。

**执行步骤**

1. 执行 `git diff --cached` 获取已暂存的变更
2. 如果暂存区为空，提示用户先使用 `git add` 添加文件
3. 分析变更内容：
   - 识别变更类型（新功能/修复/重构等）
   - 确定影响范围（模块/组件）
   - 提取关键变更点
4. 生成 commit message：
   - 第一行：类型(范围): 简短描述（不超过 50 字符）
   - 空一行
   - 详细描述：说明变更的原因、影响和注意事项（如需要）
   - 空一行
   - 关联问题：相关的 issue 或任务编号（如有）
5. 输出生成的 commit message
6. 询问用户是否需要调整或直接执行 commit

**示例**

```
feat(schedule): 添加日程创建功能

- 实现日程创建对话框 UI
- 集成日程创建 API 接口
- 添加 EventBus 事件通知机制
- 支持日程创建成功后自动刷新列表

关联: #123
```

```
fix(memory): 修复聊天输入框在键盘弹起时被遮挡的问题

调整 MemoryChatInput 组件的布局逻辑，使用 Padding 替代
Transform.translate 确保输入框始终在可视区域内。
```

```
refactor(common): 优化 Base 架构的状态管理逻辑

- 简化 BaseController 的状态更新方法
- 移除冗余的响应式包装
- 统一错误处理机制
```

**注意事项**

- commit message 第一行必须使用中文，简洁明了
- 类型和范围使用英文小写
- 详细描述使用中文，可选但推荐添加
- 如果变更涉及 breaking changes，在类型后添加 `!`，例如：`feat(api)!: 重构用户登录接口`
- 保持每次提交的粒度适中，避免一次提交过多不相关的变更
- 使用祈使句，避免使用过去时态

**开始执行**

现在请执行以下步骤：

1. 运行 `git diff --cached` 获取已暂存的变更内容
2. 如果暂存区为空，提示用户需要先 `git add` 文件
3. 分析变更并生成符合规范的中文 commit message
4. 输出生成的 message 并询问用户是否需要调整或直接提交
