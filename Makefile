.DEFAULT_GOAL := help
.PHONY: help dev build lint test clean install release link unlink

help: ## Show available make targets
	@echo "Available commands:"
	@grep -E '^[a-zA-Z0-9_-]+:.*##' $(MAKEFILE_LIST) | sort | awk -F ':.*## ' '{printf "  make %-15s %s\n", $$1, $$2}'

dev: ## Run in development mode (watch)
	# 开发模式，监听文件变化
	pnpm dev

build: ## Type check and build for production
	# 类型检查 + 生产构建
	pnpm build

lint: ## Run ESLint check
	# ESLint 检查
	pnpm lint

test: ## Run all tests
	# 运行所有测试
	pnpm test

install: ## Install dependencies
	# 安装依赖
	pnpm install

clean: ## Clean build artifacts
	# 清理构建产物
	rm -rf main.js main.js.map styles.css

# Git operations
pull: ## Pull latest changes and install deps
	git pullz
	pnpm install

# Release workflow
release: ## Build and copy to Obsidian vault (set VAULT_PATH)
	@if [ -z "$(VAULT_PATH)" ]; then \
		echo "Error: VAULT_PATH not set"; \
		echo "Usage: make release VAULT_PATH=~/.obsidian/plugins/telegram-inbox"; \
		exit 1; \
	fi
	pnpm build
	mkdir -p $(VAULT_PATH)
	cp main.js manifest.json styles.css $(VAULT_PATH)/

# Symlink for live development
link: ## Create symlinks to VAULT_PATH for live reload
	@if [ -z "$(VAULT_PATH)" ]; then \
		echo "Error: VAULT_PATH not set"; \
		exit 1; \
	fi
	mkdir -p $(VAULT_PATH)
	ln -sf $(PWD)/main.js $(VAULT_PATH)/main.js
	ln -sf $(PWD)/manifest.json $(VAULT_PATH)/manifest.json
	ln -sf $(PWD)/styles.css $(VAULT_PATH)/styles.css
	@echo "Symlinks created. Run 'make dev' to start development."

unlink: ## Remove symlinks from VAULT_PATH
	@if [ -z "$(VAULT_PATH)" ]; then \
		echo "Error: VAULT_PATH not set"; \
		exit 1; \
	fi
	rm -f $(VAULT_PATH)/main.js $(VAULT_PATH)/manifest.json $(VAULT_PATH)/styles.css
	@echo "Symlinks removed."

# Testing shortcuts
test-diary: ## Run diary tests only
	pnpm test -- test/diary.spec.ts

test-template: ## Run template tests only
	pnpm test -- test/template.spec.ts

# Development helpers
typecheck: ## Run TypeScript type check only
	npx tsc --noEmit

# Prevent make from treating arguments as targets
%:
	@:
