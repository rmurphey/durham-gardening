# Claude Code Project Setup Rules

*A comprehensive guide for establishing rigorous development standards with Claude Code.*

## 🚀 **How to Use This Guide**

### **For New Projects:**
1. **Share this entire file** with Claude Code
2. **Navigate to your project directory** (existing or new)
3. **Give Claude Code this exact command:**

```
I want to set up rigorous development standards for this codebase using the claude_setup_rules.md guide. Please:

1. Detect the project language(s) and type
2. Create the complete directory structure 
3. Set up all quality infrastructure appropriate for this language
4. Create all .claude/commands/ files customized for this project
5. Establish baseline quality metrics and thresholds
6. Create initial CLAUDE.md, ACTIVE_WORK.md, and documentation structure
7. Test that all commands work correctly

Once complete, show me the baseline quality status and recommend the first next steps for development.
```

### **What Claude Code Will Do:**
- **Automatically detect** your project type (JavaScript, Python, Go, Rust, Java, etc.)
- **Set up quality tools** (ESLint, Ruff, golangci-lint, Clippy, Checkstyle, etc.)
- **Create 13 custom commands** for project management (`/todo`, `/design`, `/hygiene`, etc.)
- **Generate documentation templates** (ACTIVE_WORK.md, LEARNINGS.md, CONTRIBUTING.md, etc.)
- **Configure CI/CD workflows** with quality gates
- **Establish quality thresholds** and monitoring

### **Result:**
Your project will have the same level of rigor and AI collaboration patterns as a well-maintained production system, regardless of language or technology stack.

### **After Setup - Using Your New System:**

Once Claude Code completes the setup, you'll have these powerful capabilities:

#### **Custom Commands Available:**
- `/todo <task>` - Quick task capture
- `/design <feature>` - Create comprehensive feature designs  
- `/hygiene` - Check project health status
- `/next` - Get AI recommendations for next priorities
- `/estimate <task>` - Get cost estimates based on your project patterns
- `/docs` - Update all documentation
- `/commit` - Quality-checked commits with co-author attribution
- *...and 6 more specialized commands*

#### **Quality Automation:**
- **Pre-commit hooks** prevent quality degradation
- **GitHub Actions** run comprehensive quality checks  
- **Automated thresholds** (complexity limits, file sizes, test coverage)
- **Language-specific linting** with consistent standards

#### **Documentation System:**
- **ACTIVE_WORK.md** - Your session management and priority tracking
- **LEARNINGS.md** - Captures AI development insights automatically
- **DEVELOPMENT_STANDARDS.md** - Quality rules and architectural guidelines
- **CONTRIBUTING.md** - Onboarding guide for contributors

#### **Typical Workflow:**
1. Start session: `/hygiene` to check project health
2. Plan work: `/next` for AI-recommended priorities  
3. Design features: `/design <feature-name>` before implementation
4. Track progress: `/todo` for quick task capture
5. Quality commits: `/commit` with automatic checks
6. Capture insights: `/learn <insight>` for methodology improvement

### **Validation:**
Test your setup by running `/hygiene` - you should see green quality metrics and a clean project status.

---

## 📋 Project Foundation Checklist

### **Phase 1: Repository Structure**
- [ ] Initialize git repository with descriptive README.md
- [ ] Create `.claude/` directory for Claude-specific configurations
- [ ] Create `docs/` directory for project documentation
- [ ] Set up `src/`, `public/`, and `scripts/` directories
- [ ] Create `designDocs/` directory for feature design documents

### **Phase 2: Quality Infrastructure**
- [ ] Configure ESLint with comprehensive rules (see ESLint Configuration below)
- [ ] Set up pre-commit hooks with Husky
- [ ] Create GitHub Actions workflow for quality checks
- [ ] Configure Jest for testing with coverage thresholds
- [ ] Set up database integrity checks if applicable

### **Phase 3: Documentation System**
- [ ] Create `CLAUDE.md` with AI behavioral guidelines
- [ ] Create `docs/ACTIVE_WORK.md` for session management
- [ ] Create `docs/DEVELOPMENT_STANDARDS.md` for quality standards
- [ ] Set up `.claude/commands/` directory with custom commands
- [ ] Create `docs/LEARNINGS.md` for insights tracking

## 🏗️ Essential File Configurations

### **CLAUDE.md Template**
```markdown
# CLAUDE.md - AI Behavioral Guide

## Core Directive
[Project purpose and constraints - be specific about budget, timeline, quality expectations]

## Communication Style
- Concise, direct responses (4 lines max unless detail requested)
- Professional peer relationship (assume senior developer)
- No preamble/postamble unless asked
- [Any project-specific communication preferences]

## Development Workflow

### After Any Code Changes
1. **Code quality**: Run `npm run lint:changed:fix`
2. **Tests**: Ensure all tests pass
3. **Critical paths**: Verify key features still work
4. **Documentation**: Update relevant docs

### Before Commits
1. **Repository hygiene**: Check `git status` - no artifacts
2. **Selective staging**: Use `git add <specific-files>`, never `git add .`
3. **Small commits**: Max 100 lines unless unavoidable
4. **Quality gates**: All ESLint errors must be fixed

### Documentation Triggers
- **Always**: Update docs/ACTIVE_WORK.md when completing tasks
- **New features**: Update README.md functionality
- **API changes**: Update relevant API documentation
- **Insights**: Add to docs/LEARNINGS.md with insights template

## AI Development Constraints

**CRITICAL PRINCIPLE:** AI's high velocity makes engineering practices MORE critical, not less.

### Required Practices
- **Tests as Guardrails**: Catch issues before runtime
- **Module Boundaries**: Prevent service layer sprawl
- **Function Contracts**: JSDoc annotations prevent breaking changes
- **Architectural Reviews**: Complexity should serve the problem

### Warning Signs
- Each solution adds layers rather than simplifying
- Increasing human guidance for basic functionality
- Multi-layered error handling patching architecture issues

**Key Principle:** Faster code addition = more important automated checks and boundaries.

## Key Constraints
- Never commit without explicit request
- [Project-specific technical constraints]
- [Version management rules]

## Memory
- Don't try to update a file that you haven't read first
- [Project-specific memory aids]

## Available Commands
Commands stored in `.claude/commands/` directory:
- `/todo <item>` - Quick capture to docs/ACTIVE_WORK.md
- `/next` - Analyze priorities and recommend next task
- `/design <feature>` - Create comprehensive design documents
- `/estimate <task>` - Cost estimate based on learned patterns
- `/docs [scope]` - Update all documentation
- `/hygiene` - Check repository cleanliness
```

## 🔧 Multi-Language Quality Infrastructure

### **Language-Specific Configurations**

#### **JavaScript/TypeScript Projects**

**ESLint Configuration (.eslintrc.js)**
```javascript
module.exports = {
  extends: [
    'react-app', // or appropriate base config
    'react-app/jest'
  ],
  rules: {
    // Architectural Constraints - Prevent complexity accumulation
    'max-lines-per-function': ['warn', { max: 300, skipBlankLines: true, skipComments: true }],
    'max-lines': ['error', { max: 400, skipBlankLines: true, skipComments: true }],
    'complexity': ['warn', { max: 15 }],
    'max-depth': ['error', { max: 4 }],
    'max-params': ['error', { max: 10 }],
    
    // Framework-specific rules
    'react/jsx-max-props-per-line': ['warn', { maximum: 3 }],
    
    // Code quality
    'no-unused-vars': 'error',
    'no-console': 'warn',
  },
  
  overrides: [
    {
      // Component-specific rules
      files: ['src/components/**/*.js', 'src/components/**/*.jsx'],
      excludedFiles: ['src/components/**/*.test.js'],
      rules: {
        'max-lines': ['warn', { max: 500 }],
        'complexity': ['warn', { max: 15 }]
      }
    },
    {
      // Relaxed rules for test files
      files: ['**/*.test.js', '**/*.test.jsx'],
      rules: {
        'max-lines': ['warn', { max: 600 }],
        'complexity': 'off',
        'max-depth': 'off'
      }
    },
    {
      // Service layer rules
      files: ["src/services/**/*.js", "src/utils/**/*.js"],
      rules: {
        "max-lines": ["warn", {"max": 800}],
        "complexity": ["warn", {"max": 20}]
      }
    }
  ]
};
```

**Package.json Scripts**
```json
{
  "scripts": {
    "// Development Commands": "======================================",
    "start": "react-scripts start",
    "dev": "npm run start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    
    "// Code Quality Commands": "=================================",
    "lint": "eslint src --ext .js,.jsx,.ts,.tsx",
    "lint:fix": "eslint src --ext .js,.jsx,.ts,.tsx --fix",
    "lint:changed": "git diff --name-only --cached | grep '\\.(js|jsx|ts|tsx)$' | xargs eslint",
    "lint:changed:fix": "git diff --name-only --cached | grep '\\.(js|jsx|ts|tsx)$' | xargs eslint --fix",
    "typecheck": "tsc --noEmit",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    
    "// Quality Gates": "========================================",
    "precommit": "npm run lint:changed && npm run typecheck && npm test -- --watchAll=false",
    "prepare": "husky"
  }
}
```

#### **Python Projects**

**pyproject.toml**
```toml
[tool.ruff]
line-length = 88
target-version = "py38"
extend-select = [
    "E",  # pycodestyle errors
    "W",  # pycodestyle warnings
    "F",  # pyflakes
    "I",  # isort
    "N",  # pep8-naming
    "C90", # mccabe complexity
    "UP",  # pyupgrade
]

[tool.ruff.mccabe]
max-complexity = 15

[tool.ruff.per-file-ignores]
"tests/**/*.py" = ["C901"]  # Allow complex test functions

[tool.pytest.ini_options]
minversion = "6.0"
addopts = "-ra -q --cov=src --cov-report=term-missing --cov-fail-under=50"
testpaths = ["tests"]

[tool.coverage.run]
source = ["src"]
omit = ["tests/*", "*/migrations/*"]

[tool.mypy]
python_version = "3.8"
warn_return_any = true
warn_unused_configs = true
disallow_untyped_defs = true
```

**Makefile**
```makefile
.PHONY: lint test format check-format typecheck quality-check install dev

install:
	pip install -r requirements-dev.txt

dev:
	python -m uvicorn main:app --reload

lint:
	ruff check .

lint-fix:
	ruff check . --fix

format:
	black .
	isort .

check-format:
	black --check .
	isort --check-only .

typecheck:
	mypy src/

test:
	pytest

coverage:
	pytest --cov=src --cov-report=html --cov-report=term

quality-check: lint typecheck test check-format
	@echo "All quality checks passed!"

# Pre-commit hook equivalent
precommit:
	@git diff --name-only --cached | grep '\.py$$' | xargs ruff check
	@git diff --name-only --cached | grep '\.py$$' | xargs black --check
	@mypy src/
	@pytest --tb=short
```

#### **Go Projects**

**Makefile**
```makefile
.PHONY: build test lint fmt vet security quality-check clean

# Build the application
build:
	go build -o bin/app ./cmd/app

# Run tests with coverage
test:
	go test ./... -v -race -coverprofile=coverage.out
	go tool cover -func=coverage.out

# Lint code
lint:
	golangci-lint run ./...

# Format code
fmt:
	gofmt -s -w .
	goimports -w .

# Vet code
vet:
	go vet ./...

# Security check
security:
	gosec ./...

# Check for vulnerabilities
vuln:
	govulncheck ./...

# Complexity check
complexity:
	gocyclo -over 15 .

# Full quality check
quality-check: fmt vet lint security test complexity
	@echo "All quality checks passed!"

# Development server
dev:
	air -c .air.toml

# Clean build artifacts
clean:
	rm -rf bin/ coverage.out

# Pre-commit checks
precommit:
	@git diff --name-only --cached | grep '\.go$$' | xargs gofmt -l
	@if [ -n "$$(git diff --name-only --cached | grep '\.go$$' | xargs gofmt -l)" ]; then \
		echo "Go files are not formatted. Run 'make fmt'"; \
		exit 1; \
	fi
	@go vet ./...
	@golangci-lint run ./...
	@go test ./... -short
```

**golangci-lint Configuration (.golangci.yml)**
```yaml
run:
  timeout: 5m
  tests: true

linters-settings:
  gocyclo:
    min-complexity: 15
  gofmt:
    simplify: true
  goimports:
    local-prefixes: github.com/your-org/your-project
  golint:
    min-confidence: 0
  govet:
    check-shadowing: true
  misspell:
    locale: US
  depguard:
    list-type: blacklist
    include-go-root: false

linters:
  enable:
    - bodyclose
    - deadcode
    - depguard
    - dogsled
    - dupl
    - errcheck
    - exhaustive
    - funlen
    - gochecknoinits
    - goconst
    - gocyclo
    - gofmt
    - goimports
    - golint
    - gomnd
    - goprintffuncname
    - gosec
    - gosimple
    - govet
    - ineffassign
    - interfacer
    - lll
    - misspell
    - nakedret
    - noctx
    - rowserrcheck
    - staticcheck
    - structcheck
    - stylecheck
    - typecheck
    - unconvert
    - unparam
    - unused
    - varcheck
    - whitespace

issues:
  exclude-rules:
    - path: _test\.go
      linters:
        - gocyclo
        - errcheck
        - dupl
        - gosec
        - funlen
```

#### **Rust Projects**

**Cargo.toml**
```toml
[package]
name = "your-project"
version = "0.1.0"
edition = "2021"

[dependencies]
# Your dependencies here

[dev-dependencies]
criterion = "0.5"

[[bench]]
name = "benchmarks"
harness = false

[profile.dev]
debug = true

[profile.release]
debug = false
lto = true
codegen-units = 1
panic = "abort"
```

**Makefile**
```makefile
.PHONY: build test lint fmt clippy security bench quality-check clean

# Build the project
build:
	cargo build

# Build for release
build-release:
	cargo build --release

# Run tests
test:
	cargo test -- --test-threads=1

# Run tests with coverage
test-coverage:
	cargo tarpaulin --out Html --output-dir coverage/

# Format code
fmt:
	cargo fmt

# Check formatting
fmt-check:
	cargo fmt -- --check

# Lint with clippy
clippy:
	cargo clippy -- -D warnings

# Security audit
security:
	cargo audit

# Run benchmarks
bench:
	cargo bench

# Check for unused dependencies
deps-check:
	cargo machete

# Full quality check
quality-check: fmt-check clippy test security
	@echo "All quality checks passed!"

# Development build with watch
dev:
	cargo watch -x run

# Clean build artifacts
clean:
	cargo clean

# Pre-commit checks
precommit:
	@cargo fmt -- --check
	@cargo clippy -- -D warnings
	@cargo test --quiet
```

**rustfmt.toml**
```toml
max_width = 100
hard_tabs = false
tab_spaces = 4
newline_style = "Unix"
use_small_heuristics = "Default"
reorder_imports = true
reorder_modules = true
remove_nested_parens = true
edition = "2021"
```

**clippy.toml**
```toml
cognitive-complexity-threshold = 15
type-complexity-threshold = 250
```

#### **Java Projects**

**build.gradle**
```gradle
plugins {
    id 'java'
    id 'application'
    id 'checkstyle'
    id 'pmd'
    id 'jacoco'
    id 'com.github.spotbugs' version '5.0.14'
}

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(17)
    }
}

repositories {
    mavenCentral()
}

dependencies {
    implementation 'org.springframework.boot:spring-boot-starter:3.0.0'
    testImplementation 'org.junit.jupiter:junit-jupiter:5.9.0'
    testImplementation 'org.assertj:assertj-core:3.23.1'
}

tasks.named('test') {
    useJUnitPlatform()
    finalizedBy jacocoTestReport
}

checkstyle {
    toolVersion = '10.3.4'
    configFile = file("${rootDir}/config/checkstyle/checkstyle.xml")
}

pmd {
    toolVersion = '6.52.0'
    ruleSets = []
    ruleSetFiles = files("${rootDir}/config/pmd/pmd-rules.xml")
}

spotbugs {
    toolVersion = '4.7.3'
    effort = 'max'
    reportLevel = 'medium'
}

jacoco {
    toolVersion = "0.8.8"
}

jacocoTestReport {
    reports {
        xml.required = true
        html.required = true
    }
    afterEvaluate {
        classDirectories.setFrom(files(classDirectories.files.collect {
            fileTree(dir: it, exclude: ['**/config/**', '**/dto/**'])
        }))
    }
}

jacocoTestCoverageVerification {
    violationRules {
        rule {
            limit {
                minimum = 0.50
            }
        }
    }
}

task qualityCheck {
    dependsOn 'checkstyleMain', 'pmdMain', 'spotbugsMain', 'test', 'jacocoTestCoverageVerification'
    description 'Run all quality checks'
}

task precommit {
    dependsOn 'checkstyleMain', 'pmdMain', 'test'
    description 'Pre-commit quality checks'
}
```

**Makefile**
```makefile
.PHONY: build test lint quality-check clean dev

# Build the project
build:
	./gradlew build

# Run tests
test:
	./gradlew test

# Run tests with coverage
test-coverage:
	./gradlew test jacocoTestReport

# Code quality checks
lint:
	./gradlew checkstyleMain pmdMain spotbugsMain

# Full quality check
quality-check:
	./gradlew qualityCheck

# Development server
dev:
	./gradlew bootRun --continuous

# Clean build artifacts
clean:
	./gradlew clean

# Pre-commit checks
precommit:
	./gradlew precommit
```

### **Multi-Language GitHub Actions**

#### **JavaScript/TypeScript Projects (.github/workflows/quality-check.yml)**
```yaml
name: Quality Check

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  quality-check:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Type checking
      run: npm run typecheck
      if: hashFiles('tsconfig.json') != ''
    
    - name: Run ESLint
      run: npm run lint
    
    - name: Count warnings
      run: |
        WARNING_COUNT=$(npm run lint 2>&1 | grep -c "warning" || echo "0")
        echo "ESLint warnings: $WARNING_COUNT"
        if [ $WARNING_COUNT -gt 25 ]; then
          echo "::error::Too many ESLint warnings ($WARNING_COUNT). Threshold is 25."
          exit 1
        elif [ $WARNING_COUNT -gt 10 ]; then
          echo "::warning::ESLint warnings approaching threshold ($WARNING_COUNT/25)"
        fi
    
    - name: Check formatting
      run: npm run format:check
      if: hashFiles('.prettierrc*') != ''
    
    - name: Run tests
      run: npm test -- --coverage --watchAll=false
    
    - name: Check test coverage
      run: |
        COVERAGE=$(npm test -- --coverage --watchAll=false --silent | grep -o '[0-9]*\.[0-9]*%' | head -1 | sed 's/%//')
        echo "Test coverage: $COVERAGE%"
        if (( $(echo "$COVERAGE < 50" | bc -l) )); then
          echo "::warning::Test coverage below 50% ($COVERAGE%)"
        fi
```

#### **Python Projects (.github/workflows/python-quality.yml)**
```yaml
name: Python Quality Check

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  quality-check:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        python-version: [3.8, 3.9, '3.10', '3.11']
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up Python ${{ matrix.python-version }}
      uses: actions/setup-python@v4
      with:
        python-version: ${{ matrix.python-version }}
        cache: 'pip'
    
    - name: Install dependencies
      run: |
        python -m pip install --upgrade pip
        pip install -r requirements-dev.txt
    
    - name: Lint with Ruff
      run: ruff check .
    
    - name: Check formatting with Black
      run: black --check .
    
    - name: Check import sorting
      run: isort --check-only .
    
    - name: Type checking with mypy
      run: mypy src/
    
    - name: Security check with bandit
      run: bandit -r src/
    
    - name: Run tests with coverage
      run: |
        pytest --cov=src --cov-report=xml --cov-report=term-missing
    
    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage.xml
        fail_ci_if_error: true
```

#### **Go Projects (.github/workflows/go-quality.yml)**
```yaml
name: Go Quality Check

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  quality-check:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        go-version: [1.19, '1.20', 1.21]
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up Go ${{ matrix.go-version }}
      uses: actions/setup-go@v4
      with:
        go-version: ${{ matrix.go-version }}
        cache: true
    
    - name: Install dependencies
      run: |
        go mod download
        go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest
        go install github.com/securecodewarrior/gosec/v2/cmd/gosec@latest
        go install golang.org/x/vuln/cmd/govulncheck@latest
        go install github.com/fzipp/gocyclo/cmd/gocyclo@latest
    
    - name: Format check
      run: |
        if [ -n "$(gofmt -l .)" ]; then
          echo "Go files are not formatted:"
          gofmt -l .
          exit 1
        fi
    
    - name: Vet
      run: go vet ./...
    
    - name: Lint
      run: golangci-lint run ./...
    
    - name: Security check
      run: gosec ./...
    
    - name: Vulnerability check
      run: govulncheck ./...
    
    - name: Complexity check
      run: gocyclo -over 15 .
    
    - name: Run tests
      run: go test -race -coverprofile=coverage.out -covermode=atomic ./...
    
    - name: Check coverage
      run: |
        COVERAGE=$(go tool cover -func=coverage.out | grep total | awk '{print substr($3, 1, length($3)-1)}')
        echo "Test coverage: $COVERAGE%"
        if (( $(echo "$COVERAGE < 50" | bc -l) )); then
          echo "::warning::Test coverage below 50% ($COVERAGE%)"
        fi
    
    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage.out
        fail_ci_if_error: true
```

#### **Rust Projects (.github/workflows/rust-quality.yml)**
```yaml
name: Rust Quality Check

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  quality-check:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        rust-version: [stable, beta, nightly]
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Install Rust ${{ matrix.rust-version }}
      uses: actions-rs/toolchain@v1
      with:
        toolchain: ${{ matrix.rust-version }}
        components: rustfmt, clippy
        override: true
    
    - name: Cache dependencies
      uses: actions/cache@v3
      with:
        path: |
          ~/.cargo/registry
          ~/.cargo/git
          target
        key: ${{ runner.os }}-cargo-${{ hashFiles('**/Cargo.lock') }}
    
    - name: Install cargo tools
      run: |
        cargo install cargo-audit cargo-machete cargo-tarpaulin
    
    - name: Format check
      run: cargo fmt -- --check
    
    - name: Clippy
      run: cargo clippy -- -D warnings
    
    - name: Security audit
      run: cargo audit
    
    - name: Check for unused dependencies
      run: cargo machete
    
    - name: Run tests
      run: cargo test --verbose
    
    - name: Generate coverage
      run: cargo tarpaulin --out Xml
    
    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v3
      with:
        file: ./cobertura.xml
        fail_ci_if_error: true
    
    - name: Run benchmarks
      run: cargo bench
      if: matrix.rust-version == 'stable'
```

#### **Java Projects (.github/workflows/java-quality.yml)**
```yaml
name: Java Quality Check

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  quality-check:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        java-version: [11, 17, 21]
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up JDK ${{ matrix.java-version }}
      uses: actions/setup-java@v3
      with:
        java-version: ${{ matrix.java-version }}
        distribution: 'temurin'
        cache: gradle
    
    - name: Grant execute permission for gradlew
      run: chmod +x gradlew
    
    - name: Run Checkstyle
      run: ./gradlew checkstyleMain
    
    - name: Run PMD
      run: ./gradlew pmdMain
    
    - name: Run SpotBugs
      run: ./gradlew spotbugsMain
    
    - name: Run tests
      run: ./gradlew test
    
    - name: Generate test coverage report
      run: ./gradlew jacocoTestReport
    
    - name: Verify coverage
      run: ./gradlew jacocoTestCoverageVerification
    
    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v3
      with:
        file: ./build/reports/jacoco/test/jacocoTestReport.xml
        fail_ci_if_error: true
    
    - name: Upload test results
      uses: actions/upload-artifact@v3
      if: always()
      with:
        name: test-results-${{ matrix.java-version }}
        path: build/reports/tests/
```

### **Language-Agnostic Quality Metrics**

#### **Universal Quality Thresholds**
```yaml
# Common thresholds across all languages
quality_thresholds:
  complexity:
    function: 15       # Maximum cyclomatic complexity per function
    file: 20          # Maximum complexity per file
  
  file_size:
    lines: 400        # Maximum lines per file
    warning: 300      # Warning threshold
    
  test_coverage:
    minimum: 50       # Fail below 50%
    target: 70        # Target coverage
    
  code_duplication:
    maximum: 10       # Maximum percentage of duplicated code
    
  technical_debt:
    maximum: "8h"     # Maximum technical debt per file
    
  security:
    vulnerabilities: 0 # Zero tolerance for high/critical vulnerabilities
```

#### **Cross-Language Pre-commit Configuration (.pre-commit-config.yaml)**
```yaml
repos:
  # Universal hooks
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.4.0
    hooks:
      - id: trailing-whitespace
      - id: end-of-file-fixer
      - id: check-yaml
      - id: check-json
      - id: check-toml
      - id: check-xml
      - id: check-merge-conflict
      - id: check-case-conflict
      - id: mixed-line-ending
      - id: detect-private-key

  # Language-specific hooks
  - repo: https://github.com/psf/black
    rev: 23.3.0
    hooks:
      - id: black
        language_version: python3
        files: \.py$

  - repo: https://github.com/charliermarsh/ruff-pre-commit
    rev: v0.0.270
    hooks:
      - id: ruff
        files: \.py$

  - repo: https://github.com/pre-commit/mirrors-eslint
    rev: v8.43.0
    hooks:
      - id: eslint
        files: \.(js|jsx|ts|tsx)$
        additional_dependencies:
          - eslint@8.43.0

  - repo: https://github.com/pre-commit/mirrors-prettier
    rev: v3.0.0
    hooks:
      - id: prettier
        files: \.(js|jsx|ts|tsx|json|css|md)$

  - repo: https://github.com/dnephin/pre-commit-golang
    rev: v0.5.1
    hooks:
      - id: go-fmt
      - id: go-vet-mod
      - id: go-mod-tidy

  - repo: https://github.com/doublify/pre-commit-rust
    rev: v1.0
    hooks:
      - id: fmt
      - id: cargo-check
      - id: clippy

  - repo: local
    hooks:
      - id: quality-check
        name: Quality Check
        entry: make quality-check
        language: system
        pass_filenames: false
        always_run: true
```

## 📊 Quality Thresholds & Standards

### **ESLint Warning Thresholds**
- **Green**: <10 warnings (excellent)
- **Yellow**: 10-25 warnings (acceptable, schedule cleanup)  
- **Red**: 25+ warnings (immediate systematic cleanup required)

### **File Size Limits**
- **Target**: <400 lines per file
- **Review Required**: Files >600 lines
- **Refactor Required**: Files >800 lines
- **Test files**: 600 lines warning threshold

### **Component Architecture**
- **Max props per component**: 8 (review at 10)
- **Function complexity**: Max 15 (12 for UI components)
- **Nesting depth**: Max 4 levels
- **Parameters per function**: Max 10

### **Test Coverage**
- **Minimum**: 50% overall coverage
- **Target**: 60%+ for critical services
- **Zero-coverage files**: Must be prioritized for testing

## 🛠️ Development Standards

### **Component Creation Checklist**
- [ ] Does this functionality fit in an existing component?
- [ ] Is the component <400 lines?
- [ ] Does it have <10 props?
- [ ] Is it mobile-friendly?
- [ ] Does it follow existing design patterns?
- [ ] Is it tested?

### **Code Quality Gates**
- [ ] All ESLint errors fixed before commit
- [ ] No console.log statements in production code
- [ ] Functions have JSDoc comments for complex logic
- [ ] Tests cover happy path and error cases
- [ ] Mobile responsiveness verified

### **Architectural Principles**
- **Prefer enhancing existing components** over creating new ones
- **Functional programming patterns** over mutation
- **Tests as architectural guardrails** - catch breaking changes early
- **Module boundaries prevent sprawl** - clear service layer separation
- **Design documents before implementation** - comprehensive planning

## 📁 Directory Structure Template

```
project/
├── .claude/
│   ├── commands/          # Custom Claude commands
│   └── settings.local.json
├── .github/
│   └── workflows/
│       └── quality-check.yml
├── docs/
│   ├── ACTIVE_WORK.md     # Session management
│   ├── DEVELOPMENT_STANDARDS.md
│   └── LEARNINGS.md       # AI development insights
├── designDocs/            # Feature design documents
├── src/
│   ├── components/
│   ├── services/
│   ├── utils/
│   └── __tests__/
├── scripts/               # Build and utility scripts
├── CLAUDE.md             # AI behavioral guide
├── .eslintrc.js          # Quality enforcement
├── package.json          # With quality scripts
└── README.md
```

## 🎯 Session Management System

## 📄 Essential Documentation Templates

### **docs/ACTIVE_WORK.md Template**
```markdown
# Active Work - Current Session Focus

## 🎯 NEXT SESSION PRIORITIES

### **Learning Experiment Status** 
**Current Phase**: Initial Setup and Foundation Building 🚀
**Budget Used**: $0 of flexible budget (excellent efficiency)
**Budget Philosophy**: Cost-conscious but not fixed - can extend beyond initial budget if learning value and user impact justify investment
**Focus**: Establish rigorous development standards and implement foundational features

**Current Status**: Starting fresh with comprehensive quality infrastructure

## 🚀 HIGH-VALUE FEATURE DEVELOPMENT

### **Phase 1: Foundation & Quality Infrastructure** ✨ **PRIORITY**
**Target**: Establish robust development standards and quality gates

**Strategic Approach**: 
- **Quality First**: Implement comprehensive quality infrastructure before feature development
- **Documentation-Driven**: Establish clear documentation patterns and standards
- **AI-Assisted Patterns**: Create workflows optimized for AI collaboration

**Next Actions**: 
- Set up language-specific quality tools and thresholds
- Establish documentation templates and patterns
- Create custom Claude commands for project management
- Implement automated quality checks and CI/CD

### **Maintenance Backlog** (Address when quality thresholds exceeded)
- Code quality warnings (target: maintain green status)
- Test coverage improvements (minimum: 50%, target: 70%)
- Documentation updates (triggered by new features)

## 🛡️ QUALITY DRIFT PREVENTION PLAN

### **📊 Current Quality Status**
**[Initial State]** - Establishing baseline metrics
- **Strategic Approach:** Set up monitoring and automated thresholds
- **Green:** <10 warnings (excellent)
- **Yellow:** 10-25 warnings (acceptable, schedule cleanup)  
- **Red:** 25+ warnings (immediate systematic cleanup required)

### **🔧 Quality Infrastructure Tasks**
- [ ] Language-specific linter configuration
- [ ] Pre-commit hooks setup
- [ ] GitHub Actions quality workflow
- [ ] Test coverage baseline and targets
- [ ] Documentation standards and automation

## 📋 PLANNED FEATURES
*Features with completed design documents ready for implementation*

[Features will be added here as they are designed]

## 💡 FUTURE ENHANCEMENT IDEAS
*Features identified but not yet designed*

[Ideas will be captured here via /idea command]

## 🔄 DEFERRED FEATURES
*Features postponed for later consideration*

[Deferred items will be tracked here via /defer command]

## 📊 Implementation Dependencies

[Dependencies will be documented as features are designed]

═══════════════════════════════════════════════════════════════════════════════
# 📜 COMPLETED WORK & HISTORICAL RECORD
═══════════════════════════════════════════════════════════════════════════════

## ✅ Recent Completions

**Project Setup** - IN PROGRESS
- [ ] Quality infrastructure setup
- [ ] Documentation template creation
- [ ] Claude commands configuration
- [ ] Initial baseline establishment

## 📋 Current Session Tasks

**Active Todo List** (Use `/todo` to add items):
1. 🔧 **IN PROGRESS:** Complete project setup with rigorous standards
2. ✨ **NEXT:** Establish quality baseline and metrics
3. 📝 **READY:** Begin feature development planning

**Quality Status**: Setting up infrastructure
**Architecture Status**: Establishing patterns and standards

## Blockers & Decisions Needed
*Current blockers requiring user input*

[None currently - setup phase provides clear direction]

## Quick Capture
*Use /todo or /idea commands to add items here*

[Items will be captured here automatically]
```

### **docs/LEARNINGS.md Template**
```markdown
# Development Learnings & Insights

*Structured insights from AI-assisted development patterns and project evolution*

## Overview

This document captures concrete insights, patterns, and lessons learned during development. Each entry includes context, impact, and reusability guidance to improve future development velocity and quality.

## Insights Template

```
## [Task] ([Date]) - [git SHA]
**Insight:** [What saves time/changes approach]
**Pattern:** [Reusable technique or approach]
**Impact:** [Cost/time/quality effect - be specific]
**Context:** [When to apply this pattern]
**Code Example:** [Link to implementation if applicable]
```

## 🎯 Key Patterns Discovered

### **AI Development Patterns**

[AI collaboration insights will be captured here]

### **Quality Automation Patterns**

[Quality tool and automation insights will be captured here]

### **Architecture Patterns**

[Technical architecture insights will be captured here]

### **Cost Estimation Patterns**

[Development cost and estimation insights will be captured here]

## 📊 Development Velocity Insights

### **Time Savers**
- [Techniques that significantly reduced development time]

### **Common Pitfalls**
- [Issues that commonly slow down development]

### **Quality Accelerators**
- [Practices that improve quality without slowing velocity]

## 🏗️ Architectural Lessons

### **What Works Well**
- [Architectural decisions that proved effective]

### **What to Avoid**
- [Patterns or approaches that created problems]

### **Future Considerations**
- [Architectural insights for future projects]

## 💰 Cost & Budget Insights

### **Estimation Accuracy**
- [Learnings about estimation patterns and accuracy]

### **Budget Optimization**
- [Strategies for maximizing value within budget constraints]

### **ROI Insights**
- [Which investments provided the best returns]

---

*This document is updated via the `/learn` command to capture insights as they emerge during development.*
```

### **docs/DEVELOPMENT_STANDARDS.md Template**
```markdown
# Development Standards

## Overview

Comprehensive development standards for this project, based on industry best practices and optimized for AI-assisted development workflows.

## Core Principle

**"Quality at Velocity"** - Maintain high code quality while maximizing development speed through automation and clear standards.

# 📊 Quality Thresholds

## Language-Specific Warning Limits
- **Green**: <10 warnings (excellent)
- **Yellow**: 10-25 warnings (acceptable, schedule cleanup)  
- **Red**: 25+ warnings (immediate systematic cleanup required)

## Test Coverage Requirements
- **Minimum**: 50% overall coverage
- **Target**: 70%+ for critical components
- **Zero-coverage**: Must be documented and justified

## File Size Guidelines
- **Target**: <400 lines per file
- **Review Required**: Files >600 lines
- **Refactor Required**: Files >800 lines
- **Test files**: 600 lines warning threshold

# 🏗️ Architecture Standards

## Component Design Principles
- **Single Responsibility**: Each component has one clear purpose
- **Composition over Inheritance**: Prefer composable patterns
- **Testability**: Design for easy testing and mocking
- **Performance**: Consider performance implications of design decisions

## Code Organization
- **Clear Module Boundaries**: Well-defined interfaces between modules
- **Consistent Naming**: Follow established naming conventions
- **Documentation**: JSDoc/docstrings for public APIs
- **Error Handling**: Consistent error handling patterns

# 🔧 Quality Enforcement

## Automated Checks
- **Pre-commit Hooks**: Linting, formatting, basic tests
- **CI/CD Pipeline**: Full test suite, security scans, quality metrics
- **Quality Gates**: Automated failure on quality threshold violations

## Manual Review Guidelines
- **Code Reviews**: Required for all changes
- **Architecture Reviews**: For significant structural changes
- **Security Reviews**: For authentication, data handling, external integrations

# 🧪 Testing Standards

## Test Categories
- **Unit Tests**: Individual component/function testing
- **Integration Tests**: Component interaction testing
- **End-to-End Tests**: Full user workflow testing
- **Performance Tests**: Load and performance validation

## Test Quality Requirements
- **Descriptive Names**: Test names explain the scenario
- **Arrange-Act-Assert**: Clear test structure
- **Independence**: Tests don't depend on each other
- **Maintainability**: Tests are easy to understand and modify

# 📚 Documentation Requirements

## Code Documentation
- **API Documentation**: All public interfaces documented
- **Complex Logic**: Non-obvious code explained
- **Decision Records**: Architectural decisions documented
- **Setup Instructions**: Clear development setup guide

## Project Documentation
- **README**: Project overview, setup, and usage
- **ACTIVE_WORK**: Current priorities and session management
- **LEARNINGS**: Insights and patterns discovered
- **Design Documents**: Feature designs before implementation

# 🚨 Quality Drift Prevention

## Daily Practices
- **Quality Checks**: Run quality tools before commits
- **Test Coverage**: Maintain or improve coverage with changes
- **Clean Commits**: Small, focused commits with clear messages
- **Documentation Updates**: Update docs with code changes

## Weekly Reviews
- **Quality Metrics**: Review trends and address degradation
- **Technical Debt**: Identify and plan debt reduction
- **Process Improvements**: Refine standards based on learnings
- **Tool Updates**: Keep quality tools current

## Monthly Assessments
- **Architecture Review**: Assess overall system health
- **Standards Updates**: Evolve standards based on project growth
- **Team Feedback**: Incorporate developer experience insights
- **Tooling Evaluation**: Assess and upgrade development tools

---

*These standards evolve based on project needs and team learnings. Standards changes should be documented and communicated clearly.*
```

### **docs/DATABASE_API.md Template (for data-driven projects)**
```markdown
# Database & API Documentation

## Overview

This document describes the database schema, API endpoints, and data access patterns for the project.

## Database Schema

### Tables

[Document database tables, relationships, and constraints]

### Indexes

[Document database indexes and performance considerations]

### Migrations

[Document migration patterns and procedures]

## API Endpoints

### Authentication

[Document authentication patterns and endpoints]

### Core Resources

[Document main API resources and endpoints]

### Error Handling

[Document error response patterns and codes]

## Data Access Patterns

### Service Layer

[Document data access service patterns]

### Caching Strategy

[Document caching approaches and invalidation]

### Performance Considerations

[Document query optimization and performance patterns]

## Development Guidelines

### Database Changes

[Document procedures for schema changes]

### API Versioning

[Document API versioning strategy]

### Testing Data

[Document test data management and setup]

---

*This document is updated automatically when database or API changes are made.*
```

### **docs/DEVELOPMENT_LOG.md Template**
```markdown
# Development Log

*Daily/weekly development progress and insights for project tracking and reflection*

## Current Sprint/Phase

**Dates**: [Start Date] - [End Date]
**Focus**: [Primary objectives for this period]
**Budget**: [Budget allocation and tracking]

### Daily Progress

#### [Date]
**Hours**: [Time spent]
**Accomplished**:
- [Completed tasks with brief descriptions]

**Challenges**:
- [Issues encountered and how they were resolved]

**Insights**:
- [Learning points and realizations]

**Tomorrow's Focus**:
- [Planned priorities for next session]

---

#### [Date]
**Hours**: [Time spent]
**Accomplished**:
- [Completed tasks with brief descriptions]

**Challenges**:
- [Issues encountered and how they were resolved]

**Insights**:
- [Learning points and realizations]

**Tomorrow's Focus**:
- [Planned priorities for next session]

---

### Weekly Summary

**Week of [Date Range]**

**Objectives Met**:
- [Weekly goals that were achieved]

**Key Insights**:
- [Major learnings and patterns discovered]

**Velocity Observations**:
- [Development speed and efficiency notes]

**Quality Metrics**:
- [Code quality, test coverage, technical debt trends]

**Budget Status**:
- [Spend vs planned, efficiency observations]

**Next Week Priorities**:
- [Focus areas for upcoming week]

---

## Monthly Retrospectives

### [Month Year]

**Major Accomplishments**:
- [Significant features or improvements delivered]

**Technical Evolution**:
- [Architectural improvements and decisions]

**Process Improvements**:
- [Workflow and methodology enhancements]

**Quality Trends**:
- [Long-term quality and maintainability observations]

**Budget Performance**:
- [Monthly budget analysis and efficiency trends]

**Lessons for Next Month**:
- [Strategic insights for future development]

---

*This log is updated via the `/reflect` command and daily development notes.*
```

### **docs/NOTES_TO_FUTURE.md Template**
```markdown
# Notes to Future Developers

*Important context, decisions, and gotchas for future development team members*

## Project Context

### **Why This Project Exists**
[Explain the core problem this project solves and its value proposition]

### **Key Design Principles**
[Document the fundamental principles that guide technical decisions]

### **Architecture Philosophy**
[Explain the overall architectural approach and reasoning]

## Critical Decisions Made

### **Technology Choices**
**Decision**: [Technology or framework chosen]
**Date**: [When decided]
**Reasoning**: [Why this was chosen over alternatives]
**Trade-offs**: [What was gained/lost with this decision]
**Review Date**: [When this should be reconsidered]

---

### **Architectural Patterns**
**Pattern**: [Specific architectural pattern implemented]
**Date**: [When implemented]
**Reasoning**: [Why this pattern was chosen]
**Location**: [Where implemented in codebase]
**Gotchas**: [Things to watch out for when working with this pattern]

---

## Things That Will Save You Time

### **Development Workflow**
- [Key workflow optimizations and shortcuts]
- [Common development patterns that work well]
- [Tools and commands that boost productivity]

### **Debugging Patterns**
- [Common issues and their solutions]
- [Debugging techniques that work well for this codebase]
- [Performance optimization approaches]

### **Testing Strategies**
- [Effective testing patterns for this project]
- [Test data management approaches]
- [Integration testing gotchas]

## Things That Will Waste Your Time

### **Known Limitations**
- [Technical limitations you'll run into]
- [Workarounds that are already in place]
- [Things that look like bugs but are actually constraints]

### **Anti-Patterns to Avoid**
- [Patterns that were tried and didn't work]
- [Common mistakes that slow development]
- [Architectural choices to avoid]

### **External Dependencies**
- [Third-party services with quirks]
- [API limitations and workarounds]
- [Integration challenges to be aware of]

## Code Organization

### **Key Modules**
**Module**: [Important module name]
**Purpose**: [What this module does]
**Key Files**: [Most important files in this module]
**Gotchas**: [Things to watch out for]

---

### **Data Flow**
[Explain how data flows through the system]

### **State Management**
[Explain state management patterns and locations]

### **Configuration**
[Explain configuration management and environment setup]

## Performance Considerations

### **Known Bottlenecks**
- [Performance issues and their workarounds]
- [Monitoring points and thresholds]
- [Optimization opportunities]

### **Scaling Considerations**
- [How the system scales and its limits]
- [Resource usage patterns]
- [Capacity planning insights]

## Security Notes

### **Authentication/Authorization**
[Explain security model and implementation]

### **Data Protection**
[Explain how sensitive data is handled]

### **Security Gotchas**
[Security considerations and potential pitfalls]

## Deployment & Operations

### **Environment Setup**
[Critical setup steps and gotchas]

### **Monitoring**
[What to monitor and why]

### **Troubleshooting**
[Common operational issues and solutions]

## Future Roadmap Considerations

### **Technical Debt**
[Known technical debt and prioritization]

### **Scalability Plans**
[How the system should evolve to handle growth]

### **Technology Evolution**
[Planned technology upgrades and migrations]

---

## Contact & Resources

### **Original Team**
- [Key people who built this and their expertise areas]

### **Documentation**
- [Key documentation beyond this file]
- [External resources and references]

### **Tools & Services**
- [Important tools and their access/setup info]

---

*Update this document when making significant architectural decisions or discovering important gotchas.*
```

### **CONTRIBUTING.md Template**
```markdown
# Contributing Guide

Welcome to the project! This guide will help you get started with contributing effectively.

## 🚀 Quick Start

### Prerequisites
- [List required tools and versions]
- [Required accounts or access]

### Setup
```bash
# Clone the repository
git clone [repository-url]
cd [project-name]

# Install dependencies
[installation commands]

# Set up development environment
[setup commands]

# Verify installation
[verification commands]
```

### Development Workflow
```bash
# Start development server
[development server command]

# Run tests
[test command]

# Run quality checks
[quality check commands]
```

## 📋 Development Standards

### Code Quality
- **Linting**: All code must pass linter checks (`make lint`)
- **Testing**: New features require tests (`make test`)
- **Coverage**: Maintain >50% test coverage
- **Documentation**: Update relevant docs with changes

### Git Workflow
1. **Branch Naming**: `feature/description`, `fix/description`, `docs/description`
2. **Commit Messages**: Clear, descriptive commit messages
3. **Small Commits**: Keep commits focused and atomic
4. **Quality Gates**: All quality checks must pass before merge

### Code Review Process
1. **Self Review**: Review your own code before requesting review
2. **Quality Checks**: Ensure all automated checks pass
3. **Documentation**: Update documentation for new features
4. **Testing**: Verify tests pass and cover new functionality

## 🏗️ Architecture Guidelines

### Component Design
- **Single Responsibility**: Each component has one clear purpose
- **Reusability**: Design for reuse across the application
- **Testability**: Write components that are easy to test
- **Performance**: Consider performance implications

### Code Organization
```
src/
├── components/     # Reusable UI components
├── services/       # Business logic and API calls
├── utils/          # Utility functions
├── tests/          # Test files
└── docs/           # Project documentation
```

### Naming Conventions
- **Files**: `kebab-case.js`
- **Components**: `PascalCase`
- **Functions**: `camelCase`
- **Constants**: `UPPER_SNAKE_CASE`

## 🧪 Testing Guidelines

### Test Structure
```javascript
describe('ComponentName', () => {
  it('should do specific behavior when condition', () => {
    // Arrange: Set up test data
    // Act: Perform the action
    // Assert: Verify the result
  });
});
```

### Testing Best Practices
- **Descriptive Names**: Test names should clearly describe the scenario
- **Independence**: Tests should not depend on each other
- **Fast Execution**: Keep tests fast and focused
- **Real Scenarios**: Test realistic user scenarios

### What to Test
- **Happy Paths**: Normal user flows work correctly
- **Error Cases**: Error conditions are handled gracefully
- **Edge Cases**: Boundary conditions and unusual inputs
- **Integration**: Components work together correctly

## 📚 Documentation Standards

### Code Documentation
- **JSDoc**: Use JSDoc for function and class documentation
- **README Updates**: Update README.md for new features
- **API Changes**: Document API changes in docs/DATABASE_API.md

### Design Documents
- **New Features**: Create design documents for significant features
- **Architecture Changes**: Document architectural decisions
- **Performance Changes**: Document performance implications

## 🔒 Security Guidelines

### Data Handling
- **Input Validation**: Validate all user inputs
- **Output Encoding**: Properly encode outputs
- **Authentication**: Follow established auth patterns
- **Sensitive Data**: Never commit secrets or API keys

### Code Security
- **Dependencies**: Keep dependencies updated
- **Linting**: Use security linting rules
- **Reviews**: Security-sensitive changes require extra review

## 🐛 Bug Reports

### Bug Report Template
```markdown
**Description**
A clear description of the bug.

**Steps to Reproduce**
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected Behavior**
What you expected to happen.

**Actual Behavior**
What actually happened.

**Environment**
- OS: [e.g. iOS]
- Browser: [e.g. chrome, safari]
- Version: [e.g. 22]

**Additional Context**
Any other context about the problem.
```

## ✨ Feature Requests

### Feature Request Template
```markdown
**Feature Description**
A clear description of the feature you'd like to see.

**Problem Statement**
What problem does this feature solve?

**Proposed Solution**
How you envision this feature working.

**Alternative Solutions**
Other approaches you've considered.

**Additional Context**
Any other context about the feature request.
```

## 🚀 Release Process

### Version Management
- **Semantic Versioning**: Use semantic versioning (major.minor.patch)
- **Changelog**: Update CHANGELOG.md with each release
- **Git Tags**: Tag releases with version numbers

### Release Checklist
- [ ] All tests pass
- [ ] Documentation updated
- [ ] Version bumped
- [ ] Changelog updated
- [ ] Quality checks pass
- [ ] Security scan clean

## 🤝 Getting Help

### Resources
- **Documentation**: Check docs/ directory first
- **Issues**: Search existing issues before creating new ones
- **Discussions**: Use GitHub Discussions for questions

### Contact
- **Technical Questions**: [contact method]
- **Process Questions**: [contact method]
- **Security Issues**: [security contact]

## 📋 Claude Code Integration

This project uses Claude Code with custom commands for development assistance:

### Available Commands
- `/todo <task>` - Add tasks to development backlog
- `/design <feature>` - Create feature design documents
- `/hygiene` - Check repository quality status
- `/next` - Get next recommended development task
- `/docs` - Update project documentation

### AI Development Guidelines
- **Quality First**: Use quality commands before commits
- **Documentation**: Update docs with AI assistance
- **Design**: Create design documents before implementation
- **Testing**: Use AI to help write comprehensive tests

---

## 🙏 Thank You

Thank you for contributing! Your efforts help make this project better for everyone.

For questions about this guide, please open an issue or reach out to the maintainers.
```

## ⚙️ Custom Commands Setup

### **Essential .claude/commands/**

#### **todo.md**
```markdown
# Todo Command
Quick capture of tasks to docs/ACTIVE_WORK.md

## Usage
```bash
/todo <task description>
```

Adds item to "Current Session Tasks" section with timestamp and priority classification.

## Integration
- Updates ACTIVE_WORK.md automatically
- Creates context for task prioritization
- Enables task completion tracking
```

#### **design.md**
```markdown
# Design Command
Creates comprehensive design documents for features

## Usage
```bash
/design <feature-name>
```

## What it does
1. Analyzes current project context
2. Creates detailed design document with cost estimates
3. Includes security, privacy, and content moderation
4. Links design to ACTIVE_WORK.md
5. Moves feature to "PLANNED FEATURES" section

## Design Document Structure
- **Cost Summary**: Total estimated cost at top
- **Dependencies**: Required prerequisite features
- **Technical Architecture**: Database, services, components
- **Implementation Phases**: Staged development
- **Integration Points**: Existing system connections
- **Risk Mitigation**: Performance and safety considerations
```

#### **hygiene.md**
```markdown
# Hygiene Command
Repository cleanliness check

## Usage
```bash
/hygiene
```

## What it checks
- Git status for uncommitted artifacts
- Language-specific warning counts vs thresholds
- Test coverage levels
- File size violations
- Security vulnerabilities
- Dependency updates needed
```

#### **next.md**
```markdown
# Next Command
Analyzes priorities and recommends next task

## Usage
```bash
/next
```

## What it does
1. Reviews docs/ACTIVE_WORK.md current status
2. Considers quality thresholds and blockers
3. Analyzes feature dependencies and readiness
4. Recommends specific next action with rationale

## Integration
- Considers current session budget and timeline
- Factors in quality debt vs feature development balance
- Provides cost estimates for recommended actions
```

#### **estimate.md**
```markdown
# Estimate Command
Provides cost estimates for tasks based on learned patterns

## Usage
```bash
/estimate <task description>
```

## What it does
1. Analyzes task complexity and scope
2. References historical cost data from LEARNINGS.md
3. Considers current project architecture and patterns
4. Provides cost range with confidence level

## Estimate Factors
- Technical complexity (simple/medium/complex)
- Integration requirements
- Testing overhead
- Documentation needs
- Quality assurance time
```

#### **docs.md**
```markdown
# Docs Command
Updates all relevant documentation

## Usage
```bash
/docs [scope]
```

## What it does
1. **No scope**: Updates all documentation
2. **Specific scope**: Updates targeted documentation
   - `api` - Database and API documentation
   - `readme` - README.md functionality map
   - `architecture` - Technical architecture docs
   - `learnings` - Insights and patterns

## Integration
- Automatically triggered after major feature completion
- Updates based on code changes and new patterns
- Maintains consistency across documentation
```

#### **learn.md**
```markdown
# Learn Command
Captures insights and patterns in docs/LEARNINGS.md

## Usage
```bash
/learn <insight description>
```

## What it does
1. Adds structured insight to LEARNINGS.md
2. Includes context: task, date, git SHA
3. Categorizes by impact and reusability
4. Links to relevant code examples

## Insight Template
```
## [Task] ([Date]) - [git SHA]
**Insight:** [What saves time/changes approach]
**Pattern:** [Reusable technique]
**Impact:** [Cost/time/quality effect]
**Context:** [When to apply this pattern]
```
```

#### **reflect.md**
```markdown
# Reflect Command
Weekly development insights and retrospective

## Usage
```bash
/reflect
```

## What it does
1. Prompts structured reflection questions
2. Updates development log with insights
3. Identifies patterns and improvements
4. Plans adjustments for next week

## Reflection Areas
- Recent challenges and breakthroughs
- AI collaboration effectiveness
- Architectural decisions and outcomes
- Quality and velocity trends
- Budget and timeline insights
```

#### **defer.md**
```markdown
# Defer Command
Moves features to deferred section with reasoning

## Usage
```bash
/defer <feature-name> [reason]
```

## What it does
1. Moves feature from any section to "DEFERRED FEATURES"
2. Records deferral reason and date
3. Maintains feature design links for future reference
4. Updates priority calculations

## Common Deferral Reasons
- Lower ROI compared to alternatives
- Missing critical dependencies
- Scope complexity vs timeline
- User research needed
```

#### **commit.md**
```markdown
# Commit Command
Creates structured commits with quality checks

## Usage
```bash
/commit [message]
```

## What it does
1. Runs pre-commit quality checks
2. Reviews staged changes for completeness
3. Generates descriptive commit message if none provided
4. Includes co-author attribution
5. Verifies commit size and scope guidelines

## Quality Gates
- All language-specific linters pass
- Tests pass
- No artifacts or sensitive data
- Commit size under guidelines (100 lines typical)
```

#### **push.md**
```markdown
# Push Command
Pushes commits with final verification

## Usage
```bash
/push
```

## What it does
1. Runs git status to verify clean state
2. Performs final quality verification
3. Pushes to remote repository
4. Updates ACTIVE_WORK.md with completion status

## Pre-push Checks
- All commits have proper messages
- No uncommitted changes
- Quality thresholds maintained
- Documentation updated if needed
```

#### **version-tag.md**
```markdown
# Version Tag Command
Manages semantic versioning and git tags

## Usage
```bash
/version-tag <major|minor|patch> [message]
```

## What it does
1. Updates version in package.json/Cargo.toml/etc.
2. Creates descriptive commit message
3. Creates git tag with version
4. Pushes tag to remote

## Versioning Rules
- **Major**: Breaking changes
- **Minor**: New features, backward compatible
- **Patch**: Bug fixes, no new features

## Integration
- Automatically updates changelog
- Triggers deployment workflows if configured
```

#### **maintainability.md**
```markdown
# Maintainability Command
Comprehensive codebase health assessment

## Usage
```bash
/maintainability
```

## What it does
1. Analyzes code quality metrics across dimensions
2. Generates maintainability score (0-100)
3. Identifies specific improvement areas
4. Provides actionable recommendations

## Assessment Dimensions
- **Code Quality**: Linting, complexity, duplication
- **Architecture**: Module boundaries, dependencies
- **Documentation**: Coverage, accuracy, completeness
- **Testing**: Coverage, quality, maintainability
- **Workflow**: CI/CD, automation, standards

## Scoring Thresholds
- **90-100**: Excellent (minimal maintenance burden)
- **70-89**: Good (manageable technical debt)
- **50-69**: Fair (requires attention)
- **30-49**: Poor (technical debt impacting velocity)
- **0-29**: Critical (major refactoring needed)
```

#### **idea.md**
```markdown
# Idea Command
Captures feature ideas and enhancement suggestions

## Usage
```bash
/idea <idea description>
```

## What it does
1. Adds idea to "Quick Capture" section in ACTIVE_WORK.md
2. Includes timestamp and context
3. Categorizes by potential impact and effort
4. Creates foundation for future design work

## Idea Categories
- **Features**: New user-facing functionality
- **Improvements**: Enhancements to existing features
- **Technical**: Infrastructure, performance, architecture
- **Quality**: Testing, documentation, maintainability
```

## 🔍 Quality Monitoring

### **Daily Quality Checks**
- ESLint warnings under threshold
- All tests passing
- Working tree clean (no artifacts)
- Critical user flows functional

### **Weekly Quality Review**
- Update ESLint rules based on new patterns
- Review dependency security updates
- Align CI thresholds with project growth
- Update documentation based on insights

### **Monthly Architecture Review**
- Service layer boundaries maintained
- Component complexity trends
- Test coverage gaps addressed
- Performance regression monitoring

## 🚨 Warning Signs & Prevention

### **Technical Debt Accumulation**
- **Warning**: Each solution adds layers rather than simplifying
- **Prevention**: Require architectural justification for complex solutions
- **Mitigation**: Regular refactoring sessions, complexity metrics monitoring

### **Quality Drift**
- **Warning**: ESLint warnings trending upward consistently
- **Prevention**: Daily warning count monitoring, automated thresholds
- **Mitigation**: Systematic cleanup sessions, AST-based fixes for patterns

### **AI Development Pitfalls**
- **Warning**: Increasing human guidance needed for basic functionality
- **Prevention**: Strong architectural boundaries, comprehensive testing
- **Mitigation**: Service layer refactoring, clearer function contracts

## 📈 Success Metrics

### **Code Quality Metrics**
- ESLint warnings consistently <10
- Test coverage >60% for critical paths
- File size violations <5% of codebase
- Zero critical security vulnerabilities

### **Development Velocity Metrics**
- Feature development cost accuracy ±20%
- Implementation time predictability
- Reduced debugging time via automated checks
- Architectural consistency across features

### **AI Collaboration Metrics**
- Decreased clarification requests over time
- Increased feature completion rate
- Reduced rework due to missed requirements
- Improved cost estimation accuracy

---

## 🎬 Automated Implementation Steps

### **Phase 1: Project Detection & Setup (1 session)**

When you give Claude Code this guide, it should:

1. **Language Detection**
   ```bash
   # Detect project type automatically
   if [ -f "package.json" ]; then LANG="javascript"
   elif [ -f "pyproject.toml" ] || [ -f "requirements.txt" ]; then LANG="python"  
   elif [ -f "Cargo.toml" ]; then LANG="rust"
   elif [ -f "go.mod" ]; then LANG="go"
   elif [ -f "build.gradle" ] || [ -f "pom.xml" ]; then LANG="java"
   else echo "Multi-language or unknown project type"
   fi
   ```

2. **Directory Structure Creation**
   ```bash
   mkdir -p .claude/commands docs designDocs .github/workflows
   ```

3. **Core Files Setup**
   - Create `CLAUDE.md` with project-specific constraints
   - Create `docs/ACTIVE_WORK.md` with initial structure
   - Create `docs/DEVELOPMENT_STANDARDS.md` 
   - Create `docs/LEARNINGS.md` with initial template
   - Create `docs/DATABASE_API.md` (if applicable)
   - Create `designDocs/` directory for feature designs

### **Phase 2: Language-Specific Quality Infrastructure (1 session)**

Based on detected language, Claude should:

1. **Install Quality Tools**
   - **JavaScript/TypeScript**: ESLint, Prettier, TypeScript, Husky
   - **Python**: Ruff, Black, MyPy, Pytest, Pre-commit
   - **Go**: golangci-lint, gosec, govulncheck, gocyclo
   - **Rust**: Clippy, Rustfmt, Cargo-audit, Cargo-tarpaulin
   - **Java**: Checkstyle, PMD, SpotBugs, JaCoCo

2. **Configuration Files**
   - Create appropriate config files for detected language
   - Set up pre-commit hooks with language-specific checks
   - Configure GitHub Actions workflow
   - Set quality thresholds appropriate for language

3. **Build Script Integration**
   - Add quality commands to package.json/Makefile/Cargo.toml/build.gradle
   - Create unified `make quality-check` command
   - Set up development server commands

### **Phase 3: Claude Commands Setup (1 session)**

1. **Create All .claude/commands/ Files**
   - Create all 13 command files from the templates above
   - Customize commands for detected language/framework
   - Test each command works with project structure

2. **Command Integration**
   - Link commands to appropriate project files
   - Configure commands to use correct quality tools
   - Set up language-specific thresholds in commands

### **Phase 4: Validation & Customization (ongoing)**

1. **Initial Quality Baseline**
   - Run `/hygiene` to establish current quality metrics
   - Run `/maintainability` to get baseline score
   - Document current state in ACTIVE_WORK.md

2. **Custom Thresholds**
   - Adjust warning thresholds based on project size
   - Customize complexity limits for project type
   - Set appropriate test coverage targets

## 🚀 Quick Start Command

To implement this entire system, tell Claude Code:

```
I want to set up rigorous development standards for this codebase using the claude_setup_rules.md guide. Please:

1. Detect the project language(s) and type
2. Create the complete directory structure 
3. Set up all quality infrastructure appropriate for this language
4. Create all .claude/commands/ files customized for this project
5. Establish baseline quality metrics and thresholds
6. Create initial CLAUDE.md, ACTIVE_WORK.md, and documentation structure
7. Test that all commands work correctly

Once complete, show me the baseline quality status and recommend the first next steps for development.
```

## 🔧 Language-Specific Customizations

### **Project Type Detection Patterns**

Claude should detect and configure appropriately for:

- **React/Next.js**: Component-focused linting, JSX rules, build optimization
- **Vue/Nuxt**: Vue-specific linting, composition API patterns
- **Node.js Backend**: API-focused testing, security scanning, performance monitoring  
- **Python Web (Django/FastAPI)**: Security scanning, migration checks, API documentation
- **Python Data Science**: Jupyter notebook support, data quality checks
- **Go Web Services**: Performance benchmarks, security scanning, container optimization
- **Rust Systems**: Memory safety, performance benchmarks, unsafe code auditing
- **Java Enterprise**: Spring-specific patterns, security compliance, performance monitoring
- **Mobile (React Native/Flutter)**: Platform-specific testing, bundle size monitoring

### **Framework-Specific Quality Rules**

- **Web Apps**: Bundle size limits, accessibility checks, performance budgets
- **APIs**: Security scanning, load testing, documentation requirements  
- **CLI Tools**: Cross-platform testing, binary size optimization
- **Libraries**: API stability checks, backward compatibility, documentation coverage
- **Data Processing**: Memory usage monitoring, processing time limits
- **Game Development**: Performance profiling, asset optimization

### **Quality Threshold Adaptation**

Adjust thresholds based on:
- **Project Size**: Larger projects get stricter thresholds
- **Team Size**: More developers = stricter architectural constraints
- **Criticality**: Production systems get zero-tolerance security rules
- **Performance Requirements**: Real-time systems get stricter performance rules

---

*This setup guide is based on learnings from the Climate Garden Simulation project, where rigorous standards prevented technical debt accumulation during rapid AI-assisted development. The system reduced ESLint warnings by 65% (197→68) while maintaining high development velocity and architectural consistency.*