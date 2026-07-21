# Tiinex Site v172 Validation Notes

v172 continues closure repair after v171 source identity work.

Validated in this sandbox:

```bash
npm run validate
npm run ui:shape
npm run usecase:uc001
```

The v172 behavioral change is Audit epistemics for plain Markdown:

- Markdown with no Tiinex Continuity Context and no declared Current Schema is classified as `supporting-material`.
- Supporting Markdown does not count as an invalid Tiinex leaf and does not emit root-envelope errors.
- Malformed Tiinex leaf candidates still count as `invalid-or-incomplete`.
- Metadata-only/source-backed material remains `pending-unavailable`.

A full local/CI pass should still run:

```bash
npm install --no-audit --no-fund
npm run test
```
