# --- Config -------------------------------------------------------------------

OUT_DIR ?= dist
WORKFLOW ?= .github/workflows/deploy.yml
NODE_VERSION ?= 20
PNPM_VERSION ?= 9

ACT_PLATFORM ?= ubuntu-latest=catthehacker/ubuntu:act-22.04

# Pin for reproducibility; bump as needed
ACTIONLINT_VERSION ?= 1.7.1

BIN_DIR := $(CURDIR)/.bin
export PATH := $(BIN_DIR):$(PATH)

# --- High-level targets -------------------------------------------------------

.PHONY: test-action
## Run the actual GitHub Actions workflow locally (build job) using 'act'
test-action: .deps-actionlint .deps-act
	@echo ">> linting workflows with actionlint"
	@$(MAKE) --no-print-directory lint-actions
	@echo ">> running 'build' job via act against $(WORKFLOW)"
	@ACT_PLATFORM="$(ACT_PLATFORM)" \
	act \
	  --workflows "$(WORKFLOW)" \
	  --job build \
	  --env NODE_VERSION="$(NODE_VERSION)" \
	  --env PNPM_VERSION="$(PNPM_VERSION)" \
	  --artifact-server-path "$(CURDIR)/.artifacts" \
	  --container-architecture linux/amd64 \
	  -P "$(ACT_PLATFORM)"

	@./scripts/smoke_pages_build.sh "$(OUT_DIR)"

.PHONY: test-action-deploy
## Run the workflow including deploy, but stub the Pages actions (no network)
test-action-deploy: .deps-actionlint .deps-act stub-gh-pages-actions
	@echo ">> linting workflows with actionlint"
	@$(MAKE) --no-print-directory lint-actions
	@echo ">> running 'build' + 'deploy' with stubbed Pages actions"
	@ACT_PLATFORM="$(ACT_PLATFORM)" \
	act \
	  --workflows "$(WORKFLOW)" \
	  --event push \
	  --env NODE_VERSION="$(NODE_VERSION)" \
	  --env PNPM_VERSION="$(PNPM_VERSION)" \
	  --artifact-server-path "$(CURDIR)/.artifacts" \
	  --container-architecture linux/amd64 \
	  -P "$(ACT_PLATFORM)" \
	  --replace 'actions/upload-pages-artifact@v3=.act-stubs/upload-pages-artifact' \
	  --replace 'actions/deploy-pages@v4=.act-stubs/deploy-pages'

	@./scripts/smoke_pages_build.sh "$(OUT_DIR)"

.PHONY: test-action-local
## Fast path: run the same steps your workflow does, minus GitHub
test-action-local: .deps-node
	@echo ">> installing dependencies"
	@COREPACK_HOME="$(CURDIR)/.cache/corepack" pnpm install --frozen-lockfile
	@echo ">> building"
	@COREPACK_HOME="$(CURDIR)/.cache/corepack" pnpm build
	@./scripts/smoke_pages_build.sh "$(OUT_DIR)"

.PHONY: lint-actions
## Lint all workflows and composite actions with actionlint (+ shellcheck if present)
lint-actions: .deps-actionlint
	@echo ">> actionlint $(ACTIONLINT_VERSION)"
	@# Use shellcheck if installed; actionlint will auto-detect and enrich diagnostics
	@SC=$$(command -v shellcheck || true); \
	if [ -n "$$SC" ]; then \
	  echo ">> shellcheck detected at $$SC"; \
	fi; \
	actionlint -color

.PHONY: clean
clean:
	@rm -rf "$(OUT_DIR)" .artifacts .act-stubs

# --- Dependencies -------------------------------------------------------------

.PHONY: .deps-node
.deps-node: .deps-pnpm
	@node -v >/dev/null 2>&1 || { echo "Node not found. Install Node $(NODE_VERSION)."; exit 1; }

.PHONY: .deps-pnpm
.deps-pnpm:
	@pnpm -v >/dev/null 2>&1 || { \
	  echo "Installing pnpm $(PNPM_VERSION) locally into $(BIN_DIR)"; \
	  mkdir -p "$(BIN_DIR)" "$(CURDIR)/.cache/corepack"; \
	  COREPACK_HOME="$(CURDIR)/.cache/corepack" corepack enable || true; \
	  COREPACK_HOME="$(CURDIR)/.cache/corepack" corepack prepare pnpm@$(PNPM_VERSION) --activate; \
	}

.PHONY: .deps-act
.deps-act:
	@docker version >/dev/null 2>&1 || { echo "Docker is required for 'act'."; exit 1; }
	@which act >/dev/null 2>&1 || { \
	  echo "Installing 'act' into $(BIN_DIR)"; \
	  mkdir -p "$(BIN_DIR)"; \
	  curl -sSL https://raw.githubusercontent.com/nektos/act/master/install.sh | bash -s -- -b "$(BIN_DIR)"; \
	}

.PHONY: .deps-actionlint
.deps-actionlint:
	@which actionlint >/dev/null 2>&1 && { \
	  echo "actionlint found at $$(command -v actionlint)"; exit 0; \
	} || true
	@echo "Installing actionlint $(ACTIONLINT_VERSION) into $(BIN_DIR)"
	@mkdir -p "$(BIN_DIR)" "$(BIN_DIR)/_tmp_actionlint"
	@OS=$$(uname -s | tr '[:upper:]' '[:lower:]'); \
	ARCH=$$(uname -m); \
	case "$$ARCH" in \
	  x86_64) ARCH=amd64 ;; \
	  aarch64) ARCH=arm64 ;; \
	  arm64) ARCH=arm64 ;; \
	  *) echo "Unsupported arch: $$ARCH"; exit 1 ;; \
	esac; \
	URL="https://github.com/rhysd/actionlint/releases/download/v$(ACTIONLINT_VERSION)/actionlint_$(ACTIONLINT_VERSION)_$${OS}_$${ARCH}.tar.gz"; \
	echo ">> downloading $$URL"; \
	curl -fsSL "$$URL" -o "$(BIN_DIR)/_tmp_actionlint/actionlint.tgz"; \
	tar -xzf "$(BIN_DIR)/_tmp_actionlint/actionlint.tgz" -C "$(BIN_DIR)/_tmp_actionlint"; \
	install -m 0755 "$(BIN_DIR)/_tmp_actionlint/actionlint" "$(BIN_DIR)/actionlint"; \
	rm -rf "$(BIN_DIR)/_tmp_actionlint"

.PHONY: stub-gh-pages-actions
stub-gh-pages-actions:
	@./scripts/install_pages_stubs.sh
