# Hookify Rule Examples

## Example 1: Warn About console.log

```markdown
---
name: warn-console-log
enabled: true
event: file
pattern: console\.log\(
---

**Console.log detected!**

You're adding console.log to code.

**Why this matters:**
- Debug logs shouldn't ship to production
- Console.log can expose sensitive data
- Impacts browser performance

**Alternatives:**
- Use a proper logging library
- Remove before committing
- Use conditional debug builds
```

## Example 2: Block Dangerous rm

```markdown
---
name: block-dangerous-rm
enabled: true
event: bash
pattern: rm\s+-rf
action: block
---

**Dangerous rm command detected!**

You're trying to execute `rm -rf` which permanently deletes files.

** Safer alternatives:**
- Use `rm -i` for interactive deletion
- Move files to trash first
- Use version control to recover
```

## Example 3: Warn About .env Edits

```markdown
---
name: warn-env-edits
enabled: true
event: file
conditions:
  - field: file_path
    operator: regex_match
    pattern: \.env$
  - field: new_text
    operator: contains
    pattern: API_KEY|SECRET|PASSWORD
---

**Sensitive data in .env file!**

You're adding sensitive credentials to a .env file.

**Ensure:**
- [ ] This file is in .gitignore
- [ ] .gitignore is not being modified
- [ ] Credentials are not committed to version control
```

## Example 4: Require Tests Before Stop

```markdown
---
name: require-tests-stop
enabled: true
event: stop
pattern: .*
---

**Before stopping, verify:**

- [ ] Code changes have been tested
- [ ] Tests are passing (npm test)
- [ ] Build succeeds (npm run build)
- [ ] No lint errors

If any checks failed, address them before stopping.
```

## Example 5: Block Path Traversal

```markdown
---
name: block-path-traversal
enabled: true
event: file
conditions:
  - field: file_path
    operator: contains
    pattern: ".."
---

**Path traversal detected!**

File path contains `..` which could access files outside the project.

**This is a security risk.** Use paths within the project directory.
```

## Example 6: Warn About eval()

```markdown
---
name: warn-eval
enabled: true
event: file
pattern: \beval\(|\bexec\(
---

**Dangerous code pattern: eval() or exec()**

Using eval() or exec() is a security risk.

**Why:**
- Code injection vulnerability
- Difficult to audit
- Performance impact

**Alternatives:**
- Use JSON.parse() for JSON
- Use Function constructor for dynamic code
- Restructure to avoid dynamic execution
```
