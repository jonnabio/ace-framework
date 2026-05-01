#!/bin/bash
#
# ACE-Framework Validation Script
# Validates that the framework structure is correct
#

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

ERRORS=0
WARNINGS=0

print_check() {
    echo -n "Checking $1... "
}

print_ok() {
    echo -e "${GREEN}OK${NC}"
}

print_fail() {
    echo -e "${RED}FAIL${NC}"
    ((ERRORS++))
}

print_warn() {
    echo -e "${YELLOW}WARN${NC}"
    ((WARNINGS++))
}

# Check directory exists
check_dir() {
    print_check "directory $1"
    if [ -d "$1" ]; then
        print_ok
    else
        print_fail
        echo "  Missing directory: $1"
    fi
}

# Check file exists
check_file() {
    print_check "file $1"
    if [ -f "$1" ]; then
        print_ok
    else
        print_fail
        echo "  Missing file: $1"
    fi
}

# Check file exists (warning only)
check_file_warn() {
    print_check "file $1"
    if [ -f "$1" ]; then
        print_ok
    else
        print_warn
        echo "  Recommended file missing: $1"
    fi
}

echo "================================"
echo "ACE-Framework Structure Validator"
echo "================================"
echo ""

# Core directories
echo "Core Directories:"
check_dir ".ace"
check_dir ".ace/standards"
check_dir ".ace/skills"
check_dir ".ace/roles"
check_dir ".ace/knowledge"
check_dir ".ace/prompts"
check_dir ".ace/schemas"
check_dir ".ace/workflows"
check_dir ".ace/feedback"
echo ""

# Documentation directories
echo "Documentation Directories:"
check_dir "docs"
check_dir "docs/adr"
check_dir "docs/context"
check_dir "docs/planning"
check_dir "docs/rca"
check_dir "docs/requirements"
check_dir "docs/inputs"
echo ""

# Core files
echo "Core Files:"
check_file ".aceconfig"
check_file "README.md"
check_file "ACE-SPEC.md"
check_file "USER_GUIDE.md"
check_file ".ace/roles/roles.md"
check_file "docs/context/ACTIVE_CONTEXT.md"
check_file "docs/rca/regression-guards.yaml"
echo ""

# Standards
echo "Standards:"
check_file ".ace/standards/coding.md"
check_file ".ace/standards/security.md"
check_file ".ace/standards/architecture.md"
check_file ".ace/standards/documentation.md"
check_file_warn ".ace/standards/git-workflow.md"
check_file_warn ".ace/standards/environment.md"
check_file_warn ".ace/standards/observability.md"
echo ""

# Skills
echo "Skills:"
check_file ".ace/skills/api-design.md"
check_file ".ace/skills/database-operations.md"
check_file ".ace/skills/testing-strategy.md"
check_file ".ace/skills/root-cause-analysis.md"
check_file_warn ".ace/skills/refactoring.md"
check_file_warn ".ace/skills/migration-logic.md"
check_file_warn ".ace/skills/code-review.md"
echo ""

# Templates
echo "Templates:"
check_file "docs/adr/ADR-000-template.md"
check_file "docs/rca/RCA-000-template.md"
check_file_warn "docs/requirements/PRD-template.md"
check_file_warn "docs/requirements/TECH_SPEC-template.md"
echo ""

# IDE configs
echo "IDE Configuration (optional):"
check_file_warn ".cursorrules"
check_file_warn ".editorconfig"
check_file_warn ".vscode/settings.json"
echo ""

# Summary
echo "================================"
echo "Validation Summary"
echo "================================"
if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}All checks passed!${NC}"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}Passed with $WARNINGS warning(s)${NC}"
    exit 0
else
    echo -e "${RED}Failed with $ERRORS error(s) and $WARNINGS warning(s)${NC}"
    exit 1
fi
