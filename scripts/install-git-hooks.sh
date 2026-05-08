#!/usr/bin/env sh
set -eu

git config core.hooksPath .githooks
git lfs install --local
printf 'Git hooks installed: core.hooksPath=.githooks and Git LFS local hooks enabled.\n'
