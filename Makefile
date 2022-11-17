.DEFAULT_GOAL := help

GO111MODULE := on
SHELL := bash

.PHONY: help
help:
	@grep -E '^[/0-9a-zA-Z_-]+:.*?## .*$$' Makefile | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-18s\033[0m %s\n", $$1, $$2}'

.PHONY: format
format: ## Format code
	@go fmt ./...
	@npm run format
	@npm run lint

.PHONY: clean
clean: ## Clean the generated files
	@rm -rf docs
	@rm -rf public/gopher-lua-playground.wasm

.PHONY: deps
deps: ## Install dependencies
	@go mod tidy
	@npm install

.PHONY: build
build: build-wasm ## Build production deployment
	@npm run build

.PHONY: build-wasm
build-wasm: ## Build wasm file
	@GOOS=js GOARCH=wasm go build -o public/gopher-lua-playground.wasm ./wasm

.PHONY: dev
dev: build-wasm ## Start dev server
	@npm run dev

.PHONY: start
start: ## Start local server with production deployment
	@npm run start
