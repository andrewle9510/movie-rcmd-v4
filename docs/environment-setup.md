# Environment Setup Policy

## Rule
All environment setup MUST be project-scoped only. NO global installations allowed.

## Why Project-Scoped
- Ensures reproducible builds across machines
- Prevents version conflicts between projects
- Enables clean environment isolation
- Supports multiple project development

## Allowed Commands

### Python
✅ `python3 -m venv .venv`
✅ `.venv/bin/pip install <package>`
✅ `source .venv/bin/activate && command`

### Node.js
✅ `npm install <package>` (local)
✅ `npx <command>`
✅ `npm run <script>`

## Forbidden Commands
❌ `sudo pip install <package>`
❌ `pip install <package>` (global)
❌ `npm install -g <package>`
❌ `yarn global add <package>`
❌ `brew install <package>` for project dependencies

## Enforcement
- All scripts and documentation must use project-scoped approaches
- Docker images should include environment setup
- CI/CD pipelines must install dependencies in project scope
- New contributors guided to follow this policy

## Examples

### Correct Python Setup
```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### Correct Node.js Setup
```bash
npm install
npm run dev
```

### Wrong Commands (NEVER USE)
```bash
# DO NOT DO THIS:
sudo pip install requests
npm install -g typescript
pip install pandas
```

## Troubleshooting
If you encounter permission errors, use project-scoped solutions:
- Python: Create venv in project directory, use `.venv/bin/pip`
- Node.js: Use `npx` for one-off commands, local `npm install`
- Never use `sudo` for project dependencies
