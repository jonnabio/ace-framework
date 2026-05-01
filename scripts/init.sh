#!/bin/bash
#
# ACE-Framework Initialization Script
# Usage: curl -fsSL https://raw.githubusercontent.com/jonnabio/ace-framework/main/scripts/init.sh | bash
# Or: ./scripts/init.sh [target-directory]
#

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
REPO_URL="https://github.com/jonnabio/ace-framework"
BRANCH="main"

# Functions
print_banner() {
    echo -e "${BLUE}"
    echo "    _    ____ _____   _____                                            _    "
    echo "   / \  / ___| ____| |  ___| __ __ _ _ __ ___   _____      _____  _ __| | __"
    echo "  / _ \| |   |  _|   | |_ | '__/ _\` | '_ \` _ \ / _ \ \ /\ / / _ \| '__| |/ /"
    echo " / ___ \ |___| |___  |  _|| | | (_| | | | | | |  __/\ V  V / (_) | |  |   < "
    echo "/_/   \_\____|_____| |_|  |_|  \__,_|_| |_| |_|\___| \_/\_/ \___/|_|  |_|\_\\"
    echo -e "${NC}"
    echo -e "${GREEN}AI-assisted Code Engineering Framework v2.2${NC}"
    echo ""
}

print_step() {
    echo -e "${BLUE}==>${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}!${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

check_dependencies() {
    print_step "Checking dependencies..."

    # Check for git
    if ! command -v git &> /dev/null; then
        print_error "git is required but not installed."
        exit 1
    fi
    print_success "git found"

    # Check for curl or wget
    if command -v curl &> /dev/null; then
        DOWNLOAD_CMD="curl -fsSL"
        print_success "curl found"
    elif command -v wget &> /dev/null; then
        DOWNLOAD_CMD="wget -qO-"
        print_success "wget found"
    else
        print_error "curl or wget is required but not installed."
        exit 1
    fi
}

get_target_directory() {
    if [ -n "$1" ]; then
        TARGET_DIR="$1"
    else
        read -p "Enter project directory (default: ./ace-project): " TARGET_DIR
        TARGET_DIR="${TARGET_DIR:-./ace-project}"
    fi

    # Expand ~ to home directory
    TARGET_DIR="${TARGET_DIR/#\~/$HOME}"

    echo "$TARGET_DIR"
}

init_new_project() {
    local target="$1"

    print_step "Creating new project at: $target"

    if [ -d "$target" ]; then
        print_warning "Directory exists. Checking if empty..."
        if [ "$(ls -A $target 2>/dev/null)" ]; then
            read -p "Directory is not empty. Continue anyway? (y/N): " confirm
            if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
                print_error "Aborted."
                exit 1
            fi
        fi
    else
        mkdir -p "$target"
    fi

    # Clone or download
    print_step "Downloading ACE-Framework..."

    if git clone --depth 1 "$REPO_URL" "$target/.ace-temp" 2>/dev/null; then
        # Move contents
        cp -r "$target/.ace-temp/.ace" "$target/" 2>/dev/null || true
        cp -r "$target/.ace-temp/docs" "$target/" 2>/dev/null || true
        cp "$target/.ace-temp/.aceconfig" "$target/" 2>/dev/null || true
        cp "$target/.ace-temp/.aiconfig" "$target/" 2>/dev/null || true
        cp "$target/.ace-temp/.cursorrules" "$target/" 2>/dev/null || true
        cp "$target/.ace-temp/.editorconfig" "$target/" 2>/dev/null || true
        cp -r "$target/.ace-temp/.vscode" "$target/" 2>/dev/null || true
        cp -r "$target/.ace-temp/.cursor" "$target/" 2>/dev/null || true

        # Copy docs but not the full README (they'll create their own)
        cp "$target/.ace-temp/ACE-SPEC.md" "$target/" 2>/dev/null || true
        cp "$target/.ace-temp/USER_GUIDE.md" "$target/" 2>/dev/null || true

        # Cleanup
        rm -rf "$target/.ace-temp"
        print_success "Framework files copied"
    else
        print_error "Failed to download framework"
        exit 1
    fi
}

init_existing_project() {
    local target="$1"

    print_step "Adding ACE-Framework to existing project: $target"

    # Check for conflicts
    if [ -d "$target/.ace" ]; then
        print_warning ".ace directory already exists"
        read -p "Overwrite? (y/N): " confirm
        if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
            print_error "Aborted."
            exit 1
        fi
    fi

    # Download and add
    init_new_project "$target"
}

customize_project() {
    local target="$1"

    print_step "Customizing project..."

    # Ask for project name
    read -p "Project name (default: my-project): " PROJECT_NAME
    PROJECT_NAME="${PROJECT_NAME:-my-project}"

    # Update .aceconfig
    if [ -f "$target/.aceconfig" ]; then
        sed -i.bak "s/project_name: .*/project_name: \"$PROJECT_NAME\"/" "$target/.aceconfig"
        rm -f "$target/.aceconfig.bak"
        print_success "Updated .aceconfig"
    fi

    # Reset ACTIVE_CONTEXT.md
    if [ -f "$target/docs/context/ACTIVE_CONTEXT.md" ]; then
        cat > "$target/docs/context/ACTIVE_CONTEXT.md" << 'EOF'
# Active Context: Project Setup

## Session Metadata
- **Last Updated:** $(date +%Y-%m-%d)
- **Active Role:** Architect
- **Mode:** PLANNING

## Current Objective
Initialize and configure the ACE-Framework for this project.

## Current State

### Working
- ACE-Framework structure initialized

### In Progress
- Project customization

### Blocked
- None

## Next Steps
1. [ ] Customize .ace/standards/ for your tech stack
2. [ ] Create ADR-001 for tech stack decisions
3. [ ] Set up first feature specification

## Active Constraints
- .ace/standards/coding.md
- .ace/standards/security.md

## Session Notes
- Framework initialized via init script
EOF
        print_success "Reset ACTIVE_CONTEXT.md"
    fi
}

create_gitignore() {
    local target="$1"

    if [ ! -f "$target/.gitignore" ]; then
        print_step "Creating .gitignore..."
        cat > "$target/.gitignore" << 'EOF'
# Dependencies
node_modules/
vendor/
.venv/
venv/

# Build outputs
dist/
build/
*.egg-info/

# IDE
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Logs
*.log
logs/

# Environment
.env
.env.local
.env.*.local

# Secrets (never commit!)
*.pem
*.key
credentials.json
secrets.yaml
EOF
        print_success "Created .gitignore"
    fi
}

print_next_steps() {
    local target="$1"

    echo ""
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}ACE-Framework initialized successfully!${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo ""
    echo "Next steps:"
    echo ""
    echo "  1. cd $target"
    echo ""
    echo "  2. Read the guides:"
    echo "     - USER_GUIDE.md  (practical usage)"
    echo "     - ACE-SPEC.md    (full specification)"
    echo ""
    echo "  3. Customize for your stack:"
    echo "     - Edit .ace/standards/coding.md"
    echo "     - Edit .ace/standards/security.md"
    echo ""
    echo "  4. Start your first session:"
    echo "     Tell your AI assistant:"
    echo '     "Read .aceconfig and ACTIVE_CONTEXT.md to begin."'
    echo ""
    echo "  5. Create your first ADR:"
    echo "     Copy docs/adr/ADR-000-template.md to ADR-001-tech-stack.md"
    echo ""
    echo -e "${BLUE}Happy coding with ACE-Framework!${NC}"
    echo ""
}

# Main
main() {
    print_banner

    check_dependencies

    TARGET_DIR=$(get_target_directory "$1")

    if [ -d "$TARGET_DIR" ] && [ -f "$TARGET_DIR/package.json" -o -f "$TARGET_DIR/Cargo.toml" -o -f "$TARGET_DIR/go.mod" -o -f "$TARGET_DIR/requirements.txt" ]; then
        init_existing_project "$TARGET_DIR"
    else
        init_new_project "$TARGET_DIR"
    fi

    customize_project "$TARGET_DIR"
    create_gitignore "$TARGET_DIR"
    print_next_steps "$TARGET_DIR"
}

main "$@"
