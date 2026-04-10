#!/usr/bin/env bash
# Pushes every variable in .env to Vercel (Production + Preview + Development)
# Run once from the project root: bash scripts/setup-vercel-env.sh

set -e

ENV_FILE=".env"

if [ ! -f "$ENV_FILE" ]; then
  echo "❌ .env file not found. Run from the project root."
  exit 1
fi

echo "Adding environment variables to Vercel..."
echo ""

while IFS= read -r line || [ -n "$line" ]; do
  # Skip blank lines and comments
  [[ "$line" =~ ^[[:space:]]*$ ]] && continue
  [[ "$line" =~ ^[[:space:]]*# ]]  && continue

  key="${line%%=*}"
  value="${line#*=}"

  # Skip keys with empty values
  [ -z "$key" ] || [ -z "$value" ] && continue

  echo "  → $key"
  echo "$value" | npx vercel env add "$key" production  --force 2>/dev/null || true
  echo "$value" | npx vercel env add "$key" preview     --force 2>/dev/null || true
  echo "$value" | npx vercel env add "$key" development --force 2>/dev/null || true

done < "$ENV_FILE"

echo ""
echo "✓ Done. Redeploying to production..."
npx vercel --prod --yes
echo "✓ Deployed."
