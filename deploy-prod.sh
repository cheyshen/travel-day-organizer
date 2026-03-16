#!/bin/bash
set -euo pipefail

# =============================================================================
# deploy-prod.sh — Build and deploy travel app to Hostinger
# Usage: ./deploy-prod.sh "commit message"
# =============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="$SCRIPT_DIR/.env.prod"

# Colors
CYAN='\033[0;36m'
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m'

info()    { echo -e "${BLUE}[INFO]${NC} $1"; }
success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
error()   { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }
header()  { echo -e "\n${CYAN}${BOLD}=== $1 ===${NC}"; }

# Validate
[[ $# -lt 1 ]] && error "Usage: ./deploy-prod.sh \"commit message\""
[[ -f "$ENV_FILE" ]] || error ".env.prod file not found at $ENV_FILE"

MESSAGE="$1"

# Load credentials
source "$ENV_FILE"

cd "$SCRIPT_DIR"

# ── Step 1: Build ────────────────────────────────────────────────────────────
header "STEP 1: Build"
npx vite build 2>&1
success "Build complete ($(du -sh dist | cut -f1) total)"

# ── Step 2: Upload via FTP ───────────────────────────────────────────────────
header "STEP 2: Upload to Hostinger"

# Collect all files from dist/
UPLOAD_FILES=()
while IFS= read -r -d '' file; do
  UPLOAD_FILES+=("$file")
done < <(find dist -type f -print0)

info "Uploading ${#UPLOAD_FILES[@]} files to $FTP_HOST:$FTP_REMOTE_DIR"

# Collect unique directories to create
declare -A DIRS_CREATED
for file in "${UPLOAD_FILES[@]}"; do
  rel="${file#dist/}"
  remote_dir="$(dirname "$FTP_REMOTE_DIR/$rel")"
  if [[ "$remote_dir" != "$FTP_REMOTE_DIR" && -z "${DIRS_CREATED[$remote_dir]:-}" ]]; then
    curl -s -u "$FTP_USER:$FTP_PASS" "ftp://$FTP_HOST/" -Q "MKD $remote_dir" 2>/dev/null || true
    DIRS_CREATED[$remote_dir]=1
  fi
done

# Upload files
for file in "${UPLOAD_FILES[@]}"; do
  rel="${file#dist/}"
  remote_path="$FTP_REMOTE_DIR/$rel"
  curl -s -u "$FTP_USER:$FTP_PASS" -T "$file" "ftp://$FTP_HOST${remote_path}" 2>&1
  info "  uploaded $rel"
done

success "All files uploaded"

# ── Step 3: Verify ───────────────────────────────────────────────────────────
header "STEP 3: Verify"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "https://travel.cheyshen.com/" 2>&1)

if [[ "$HTTP_CODE" == "200" ]]; then
  success "Site is live — https://travel.cheyshen.com/"
else
  error "Site returned HTTP $HTTP_CODE"
fi

# ── Summary ──────────────────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}┌─────────────────────────────────────────────────────┐${NC}"
echo -e "${BOLD}│              PROD DEPLOYMENT SUMMARY                │${NC}"
echo -e "${BOLD}├─────────────────────────────────────────────────────┤${NC}"
echo -e "${BOLD}│${NC} App:        ${GREEN}travel${NC}                                  ${BOLD}│${NC}"
echo -e "${BOLD}│${NC} Target:     ${GREEN}https://travel.cheyshen.com/${NC}             ${BOLD}│${NC}"
echo -e "${BOLD}│${NC} Message:    ${GREEN}${MESSAGE:0:40}${NC}  ${BOLD}│${NC}"
echo -e "${BOLD}│${NC} Status:     ${GREEN}LIVE${NC}                                    ${BOLD}│${NC}"
echo -e "${BOLD}└─────────────────────────────────────────────────────┘${NC}"
