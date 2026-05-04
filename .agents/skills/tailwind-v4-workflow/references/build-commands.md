# Build Commands Reference

## Commands

All commands run inside DDEV. **Never** run `npm` directly on the host.

### Production Build

```bash
ddev npm run build --prefix packages/my-site-package
```

- Compiles `Resources/Private/Assets/Css/main.css` → `Resources/Public/Css/main.css`
- Runs Tailwind's content scanner (purges unused classes)
- Minifies via cssnano
- **Expected output:** No output on success, exit code 0

### Watch Mode

```bash
ddev npm run dev --prefix packages/my-site-package
```

- Recompiles on every file save (CSS, HTML, JS, TS, PHP files matching `@source`)
- Does NOT minify (faster rebuilds)
- Keep running in a terminal during development

### Verify Token in Output

```bash
grep '--color-primary' packages/my-site-package/Resources/Public/Css/main.css
```

Replace `--color-primary` with any token name to verify it compiled into the output.

### Verify Class in Output

```bash
grep 'bg-primary' packages/my-site-package/Resources/Public/Css/main.css
```

If a class is missing from the compiled output, the class is either:

1. Not used in any file matched by `@source` directives
2. Constructed dynamically (string concatenation — Tailwind can't detect it)

## Error Interpretation

### `Error: Cannot find module '@tailwindcss/postcss'`

Node modules not installed. Fix:

```bash
ddev npm install --prefix packages/my-site-package
```

### `Error: Could not resolve entry point`

The input CSS file path is wrong or the file doesn't exist. Verify `Resources/Private/Assets/Css/main.css` exists.

### Build succeeds but output is empty/tiny

The `@source` directives don't match any files. Verify:

1. The relative paths in `@source` are correct from the CSS entry point location
2. The matched files actually contain Tailwind class names

### `SyntaxError: Unexpected token 'export'`

Missing `"type": "module"` in `package.json`. The `postcss.config.js` uses ESM syntax (`export default`).
