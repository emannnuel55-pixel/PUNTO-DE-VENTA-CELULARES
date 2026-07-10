#!/usr/bin/env bash
set -euo pipefail
OWNER="emannnuel55-pixel"
REPO="punto-de-venta-celulares"
cd "$(dirname "$0")"

command -v git >/dev/null || { echo "Instala Git y vuelve a ejecutar el script."; exit 1; }
command -v gh >/dev/null || { echo "Instala GitHub CLI y vuelve a ejecutar el script."; exit 1; }

gh auth status --hostname github.com >/dev/null 2>&1 || gh auth login --hostname github.com --git-protocol https --web
LOGIN="$(gh api user --jq .login)"
if [[ "$LOGIN" != "$OWNER" ]]; then
  echo "ADVERTENCIA: la cuenta autenticada es '$LOGIN', no '$OWNER'."
  read -r -p "Escribe SI para continuar: " CONFIRM
  [[ "${CONFIRM^^}" == "SI" ]] || exit 1
fi
NAME="$(gh api user --jq '.name // empty')"
[[ -n "$NAME" ]] || NAME="$LOGIN"

[[ -d .git ]] || git init
git branch -M main
git config --local user.name >/dev/null 2>&1 || git config --local user.name "$NAME"
git config --local user.email >/dev/null 2>&1 || git config --local user.email "$LOGIN@users.noreply.github.com"
git add .
git diff --cached --quiet || git commit -m "feat: plataforma Punto de Venta Celulares funcional"

if gh repo view "$OWNER/$REPO" >/dev/null 2>&1; then
  if git remote get-url origin >/dev/null 2>&1; then
    git remote set-url origin "https://github.com/$OWNER/$REPO.git"
  else
    git remote add origin "https://github.com/$OWNER/$REPO.git"
  fi
  git push -u origin main
else
  gh repo create "$OWNER/$REPO" --public --source . --remote origin --push --description "Punto de venta, inventario y reparacion de celulares por LINOEM DEVELOPMENT"
fi

echo "SUBIDA COMPLETADA: https://github.com/$OWNER/$REPO"
