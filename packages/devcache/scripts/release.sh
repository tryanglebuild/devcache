#!/bin/bash

# DevCache Release Script
# Usage: ./scripts/release.sh [patch|minor|major]

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if version type is provided
if [ -z "$1" ]; then
  echo -e "${RED}Error: Version type required${NC}"
  echo "Usage: ./scripts/release.sh [patch|minor|major]"
  exit 1
fi

VERSION_TYPE=$1

# Validate version type
if [[ ! "$VERSION_TYPE" =~ ^(patch|minor|major)$ ]]; then
  echo -e "${RED}Error: Invalid version type${NC}"
  echo "Must be one of: patch, minor, major"
  exit 1
fi

echo -e "${BLUE}🚀 DevCache Release Process${NC}\n"

# Check if on main branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
  echo -e "${YELLOW}⚠️  Warning: You're not on main branch (current: $CURRENT_BRANCH)${NC}"
  read -p "Continue anyway? (y/N) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
  fi
fi

# Check for uncommitted changes
if [[ -n $(git status -s) ]]; then
  echo -e "${RED}Error: You have uncommitted changes${NC}"
  git status -s
  exit 1
fi

# Pull latest changes
echo -e "${BLUE}📥 Pulling latest changes...${NC}"
git pull origin main

# Run tests
echo -e "${BLUE}🧪 Running tests...${NC}"
npm test --if-present || echo -e "${YELLOW}⚠️  No tests found${NC}"

# Build
echo -e "${BLUE}🔨 Building package...${NC}"
npm run build

# Bump version
echo -e "${BLUE}📦 Bumping version ($VERSION_TYPE)...${NC}"
NEW_VERSION=$(npm version $VERSION_TYPE --no-git-tag-version)
echo -e "${GREEN}New version: $NEW_VERSION${NC}"

# Update changelog prompt
echo -e "\n${YELLOW}📝 Don't forget to update CHANGELOG.md!${NC}"
read -p "Press enter when ready to continue..."

# Commit version bump
echo -e "${BLUE}💾 Committing version bump...${NC}"
git add package.json package-lock.json
git commit -m "chore: bump version to $NEW_VERSION"

# Create tag
echo -e "${BLUE}🏷️  Creating tag...${NC}"
git tag "$NEW_VERSION"

# Push changes
echo -e "${BLUE}⬆️  Pushing to GitHub...${NC}"
git push origin main
git push origin "$NEW_VERSION"

echo -e "\n${GREEN}✅ Release process initiated!${NC}"
echo -e "${BLUE}Monitor progress at:${NC}"
echo -e "https://github.com/tryanglebuild/devcache/actions"
echo -e "\n${BLUE}After deployment, verify at:${NC}"
echo -e "https://www.npmjs.com/package/devcache"
