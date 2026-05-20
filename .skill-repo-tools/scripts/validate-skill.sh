#!/bin/bash
# validate-skill.sh - Configurable skill repository validation
# Forked from netresearch/skill-repo-skill with configurable vendor/author settings
#
# Usage: ./validate-skill.sh [repo-root-path]
#
# Environment variables for configuration:
#   VENDOR_NAME      - Vendor prefix (default: netresearch)
#   AUTHOR_URL       - Required author URL (default: https://www.netresearch.de)
#
# Exit: 0 = valid, 1 = errors found

set -euo pipefail

REPO_DIR="${1:-.}"

# Configurable defaults (can be overridden via environment)
VENDOR_NAME="${VENDOR_NAME:-netresearch}"
AUTHOR_URL="${AUTHOR_URL:-https://www.netresearch.de}"

ERRORS=0
WARNINGS=0
NAME=""

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

error() { echo -e "${RED}ERROR:${NC} $1"; ((ERRORS++)) || true; }
warning() { echo -e "${YELLOW}WARNING:${NC} $1"; ((WARNINGS++)) || true; }
success() { echo -e "${GREEN}OK:${NC} $1"; }

# Check python3 availability (required for JSON parsing)
if ! command -v python3 &>/dev/null; then
    echo -e "${RED}ERROR:${NC} python3 is required for JSON parsing but not found in PATH"
    exit 1
fi

# Create temp dir for Python scripts
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
TEMP_DIR=$(mktemp -d)
trap "rm -rf $TEMP_DIR" EXIT

echo "Validating skill repository: $REPO_DIR"
echo "(Vendor: $VENDOR_NAME, Author URL: $AUTHOR_URL)"
echo "========================================"

# --- Discover SKILL.md ---
SKILL_FILE=""
if [[ -f "$REPO_DIR/SKILL.md" ]]; then
    SKILL_FILE="$REPO_DIR/SKILL.md"
else
    for f in "$REPO_DIR"/skills/*/SKILL.md; do
        if [[ -f "$f" ]]; then
            SKILL_FILE="$f"
            break
        fi
    done
fi

# --- SKILL.md checks ---
if [[ -n "$SKILL_FILE" ]]; then
    success "SKILL.md found: ${SKILL_FILE#"$REPO_DIR"/}"

    # Frontmatter delimiter
    if head -1 "$SKILL_FILE" | grep -q "^---$"; then
        CLOSING_LINE=$(awk '{if(/^---$/ && NR>1 && NR<=30) print NR; if(NR>30) exit}' "$SKILL_FILE" | head -1)
        if [[ -z "$CLOSING_LINE" ]]; then
            error "SKILL.md frontmatter has opening --- but no closing --- delimiter"
        else
            success "SKILL.md has frontmatter"
        fi

        FRONTMATTER=$(sed -n '2,/^---$/{ /^---$/d; p; }' "$SKILL_FILE")

        # Check frontmatter fields match Agent Skills spec
        EXTRA_FIELDS=$(echo "$FRONTMATTER" | grep -E "^[a-z_-]+:" | grep -vE "^(name|description|license|compatibility|metadata|allowed-tools):" || true)
        if [[ -z "$EXTRA_FIELDS" ]]; then
            success "Frontmatter fields are valid per Agent Skills spec"
        else
            FIELD_NAMES=$(echo "$EXTRA_FIELDS" | sed 's/:.*//' | tr '\n' ', ' | sed 's/,$//')
            error "Frontmatter has non-spec fields: $FIELD_NAMES (allowed: name, description, license, compatibility, metadata, allowed-tools)"
        fi

        # Check name field
        if echo "$FRONTMATTER" | grep -q "^name:"; then
            NAME=$(echo "$FRONTMATTER" | grep "^name:" | head -1 | sed 's/name: *//' | tr -d '"')
            if [[ "$NAME" =~ ^[a-z0-9-]{1,64}$ ]]; then
                success "SKILL.md name valid: $NAME"
            else
                error "SKILL.md name invalid (lowercase, hyphens, max 64): $NAME"
            fi
        else
            error "SKILL.md missing 'name' field"
        fi

        # Check description field and prefix
        if echo "$FRONTMATTER" | grep -q "^description:"; then
            DESC=$(echo "$FRONTMATTER" | grep "^description:" | head -1 | sed 's/description: *//' | sed 's/^"//' | sed 's/"$//')
            if [[ "$DESC" == Use\ when* ]]; then
                success "Description starts with 'Use when'"
            else
                error "Description must start with 'Use when': ${DESC:0:60}..."
            fi
        else
            error "SKILL.md missing 'description' field"
        fi
    else
        error "SKILL.md missing frontmatter (must start with ---)"
    fi

    # Word count check (max 500)
    WORDS=$(wc -w < "$SKILL_FILE")
    if [[ $WORDS -le 500 ]]; then
        success "SKILL.md is $WORDS words (under 500 limit)"
    else
        error "SKILL.md is $WORDS words (max 500)"
    fi
else
    error "SKILL.md not found (checked root and skills/*/)"
fi

# --- Required files ---
for file in README.md LICENSE-MIT LICENSE-CC-BY-SA-4.0 .gitignore; do
    if [[ -f "$REPO_DIR/$file" ]]; then
        success "$file exists"
    else
        error "$file not found"
    fi
done

# Release workflow
if [[ -f "$REPO_DIR/.github/workflows/release.yml" ]]; then
    success "release.yml exists"
else
    error ".github/workflows/release.yml not found"
fi

# No composer.lock
if [[ -f "$REPO_DIR/composer.lock" ]]; then
    error "composer.lock must not exist in skill repos"
else
    success "No composer.lock"
fi

# --- composer.json checks ---
if [[ -f "$REPO_DIR/composer.json" ]]; then
    success "composer.json exists"

    if grep -q '"type".*"ai-agent-skill"' "$REPO_DIR/composer.json"; then
        success "composer.json type is ai-agent-skill"
    else
        error "composer.json type must be 'ai-agent-skill'"
    fi

    # Get license using Python
    cat > "$TEMP_DIR/get_license.py" <<'PYEOF'
import json, sys
with open(sys.argv[1] + '/composer.json', 'r') as f:
    print(json.load(f).get('license', ''))
PYEOF
    COMP_LICENSE=$(python3 "$TEMP_DIR/get_license.py" "$REPO_DIR" 2>/dev/null || echo "")

    if [[ "$COMP_LICENSE" == "(MIT AND CC-BY-SA-4.0)" ]]; then
        success "composer.json license is correct SPDX expression"
    else
        warning "composer.json license should be '(MIT AND CC-BY-SA-4.0)', got: $COMP_LICENSE"
    fi

    # Get name using Python
    cat > "$TEMP_DIR/get_name.py" <<'PYEOF'
import json, sys
with open(sys.argv[1] + '/composer.json', 'r') as f:
    print(json.load(f).get('name', ''))
PYEOF
    COMP_NAME=$(python3 "$TEMP_DIR/get_name.py" "$REPO_DIR" 2>/dev/null || echo "")

    REPO_NAME=""
    if [[ -n "${GITHUB_REPOSITORY:-}" ]]; then
        REPO_NAME="${GITHUB_REPOSITORY#*/}"
    elif git -C "$REPO_DIR" remote get-url origin &>/dev/null; then
        REMOTE_URL=$(git -C "$REPO_DIR" remote get-url origin 2>/dev/null)
        REPO_NAME=$(basename "$REMOTE_URL" .git)
    fi
    if [[ -n "$REPO_NAME" ]]; then
        EXPECTED_NAME="$VENDOR_NAME/$REPO_NAME"
        if [[ "$COMP_NAME" == "$EXPECTED_NAME" ]]; then
            success "composer.json name matches repo: $COMP_NAME"
        else
            error "composer.json name must match repo name: expected '$EXPECTED_NAME', got '$COMP_NAME'"
        fi
    elif [[ "$COMP_NAME" =~ ^"$VENDOR_NAME"/.*-skill$ ]]; then
        success "composer.json name: $COMP_NAME (repo name check skipped - no git remote)"
    else
        error "composer.json name must match $VENDOR_NAME/{repo-name}: $COMP_NAME"
    fi

    # Plugin dependency
    if grep -q "composer-agent-skill-plugin" "$REPO_DIR/composer.json"; then
        success "composer.json requires skill plugin"
    else
        warning "composer.json should require composer-agent-skill-plugin"
    fi

    # ai-agent-skill extra path(s) exist
    cat > "$TEMP_DIR/check_skill_paths.py" <<'PYEOF'
import json, os, sys
repo_dir = sys.argv[1]
data = json.load(open(os.path.join(repo_dir, 'composer.json')))
val = data.get('extra', {}).get('ai-agent-skill', '')
paths = val if isinstance(val, list) else [val] if val else []
if not paths:
    print('MISSING')
else:
    for p in paths:
        if not os.path.isfile(os.path.join(repo_dir, p)):
            print('NOTFOUND:' + p)
        else:
            print('OK:' + p)
PYEOF
    SKILL_PATH_ERRORS=$(python3 "$TEMP_DIR/check_skill_paths.py" "$REPO_DIR" 2>/dev/null || echo "ERROR")

    if [[ "$SKILL_PATH_ERRORS" == "MISSING" ]]; then
        error "composer.json missing extra.ai-agent-skill"
    elif [[ "$SKILL_PATH_ERRORS" == "ERROR" ]]; then
        error "composer.json extra.ai-agent-skill could not be parsed"
    else
        while IFS= read -r line; do
            case "$line" in
                OK:*) success "composer.json skill path exists: ${line#OK:}" ;;
                NOTFOUND:*) error "composer.json skill path missing: ${line#NOTFOUND:}" ;;
            esac
        done <<< "$SKILL_PATH_ERRORS"
    fi
else
    error "composer.json not found"
fi

# --- plugin.json checks ---
PLUGIN_FILE="$REPO_DIR/.claude-plugin/plugin.json"
if [[ -f "$PLUGIN_FILE" ]]; then
    success "plugin.json exists"

    # Get plugin name
    cat > "$TEMP_DIR/get_plugin_name.py" <<'PYEOF'
import json, sys
with open(sys.argv[1], 'r') as f:
    print(json.load(f).get('name', ''))
PYEOF
    PLUGIN_NAME=$(python3 "$TEMP_DIR/get_plugin_name.py" "$PLUGIN_FILE" 2>/dev/null || echo "")

    # Get skill count
    cat > "$TEMP_DIR/get_skill_count.py" <<'PYEOF'
import json, sys
with open(sys.argv[1], 'r') as f:
    print(len(json.load(f).get('skills', [])))
PYEOF
    SKILL_COUNT=$(python3 "$TEMP_DIR/get_skill_count.py" "$PLUGIN_FILE" 2>/dev/null || echo "1")

    if [[ "$SKILL_COUNT" -le 1 ]]; then
        if [[ -n "$NAME" ]] && [[ "$PLUGIN_NAME" == "$NAME" ]]; then
            success "plugin.json name matches SKILL.md: $PLUGIN_NAME"
        elif [[ -n "$NAME" ]]; then
            error "plugin.json name '$PLUGIN_NAME' does not match SKILL.md name '$NAME'"
        fi
    else
        success "plugin.json is multi-skill ($SKILL_COUNT skills), name check skipped"
    fi

    # Skills is array
    if python3 -c "import json,sys; json.load(open(sys.argv[1]))['skills']" "$PLUGIN_FILE" 2>/dev/null; then
        success "plugin.json skills is array"
    else
        error "plugin.json skills must be an array"
    fi

    # All skill paths exist
    cat > "$TEMP_DIR/check_plugin_paths.py" <<'PYEOF'
import json, os, sys
plugin_file = sys.argv[1]
repo_dir = sys.argv[2]
data = json.load(open(plugin_file))
for path in data.get('skills', []):
    # Strip leading ./
    clean_path = path.lstrip('./')
    # Add SKILL.md if it's a directory path (not a direct file)
    if not clean_path.endswith('.md'):
        full_path = os.path.join(repo_dir, clean_path, 'SKILL.md')
    else:
        full_path = os.path.join(repo_dir, clean_path)
    if not os.path.isfile(full_path):
        print(path)
PYEOF
    MISSING_PATHS=$(python3 "$TEMP_DIR/check_plugin_paths.py" "$PLUGIN_FILE" "$REPO_DIR" 2>/dev/null || echo "")

    if [[ -z "$MISSING_PATHS" ]]; then
        success "All plugin.json skill paths exist"
    else
        while IFS= read -r path; do
            [[ -n "$path" ]] && error "plugin.json skill path not found: $path"
        done <<< "$MISSING_PATHS"
    fi

    # Author URL (configurable)
    cat > "$TEMP_DIR/get_author_url.py" <<'PYEOF'
import json, sys
with open(sys.argv[1], 'r') as f:
    print(json.load(f).get('author', {}).get('url', ''))
PYEOF
    PLUGIN_AUTHOR_URL=$(python3 "$TEMP_DIR/get_author_url.py" "$PLUGIN_FILE" 2>/dev/null || echo "")

    if [[ "$PLUGIN_AUTHOR_URL" == "$AUTHOR_URL" ]]; then
        success "plugin.json author.url is $AUTHOR_URL"
    else
        error "plugin.json author.url must be $AUTHOR_URL (got: $PLUGIN_AUTHOR_URL)"
    fi
else
    error "plugin.json not found"
fi

# Warn about old single LICENSE file
if [[ -f "$REPO_DIR/LICENSE" ]] && [[ -f "$REPO_DIR/LICENSE-MIT" ]]; then
    warning "Old LICENSE file still exists alongside LICENSE-MIT — remove it"
elif [[ -f "$REPO_DIR/LICENSE" ]] && [[ ! -f "$REPO_DIR/LICENSE-MIT" ]]; then
    warning "Single LICENSE file found — migrate to LICENSE-MIT + LICENSE-CC-BY-SA-4.0"
fi

# --- Summary ---
echo ""
echo "========================================"
echo "Validation Summary"
echo "========================================"
echo "Errors:   $ERRORS"
echo "Warnings: $WARNINGS"

if [[ $ERRORS -gt 0 ]]; then
    echo "Skill repository has $ERRORS error(s) that must be fixed."
    exit 1
elif [[ $WARNINGS -gt 0 ]]; then
    echo "Skill repository is valid (with $WARNINGS warning(s))."
    exit 0
else
    echo "Skill repository is valid."
    exit 0
fi
