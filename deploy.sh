#!/bin/bash

# Auto-commit and push all changes to GitHub main branch

git add .
git commit -m "Auto-deploy: $(date '+%Y-%m-%d %H:%M:%S')"
git push origin main

echo "Pushed to GitHub. Render will auto-deploy." 