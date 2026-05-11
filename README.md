# Site Publishing

This site is published by the GitHub Actions workflow in [site/.github/workflows/publish-public.yml](.github/workflows/publish-public.yml).

## What It Publishes

- Source: the root of this `site` repository
- Publish target: the `public` branch
- Output behavior: copies the static site files, adds `.nojekyll`, and writes `CNAME` when configured

## Default Behavior

- Pushes to `master` trigger a publish to `public`
- Manual runs can publish any branch, tag, or commit to `public` through `workflow_dispatch`
- The first successful run creates the `public` branch automatically if it does not exist yet

## Repository Variables

- `PAGES_CNAME`: optional custom domain, for example `example.com`

## GitHub Pages Setup

1. Open repository `Settings` -> `Pages`
2. Choose `Deploy from a branch`
3. Select `public`
4. Select `/ (root)` as the folder
5. If you use a custom domain, set `PAGES_CNAME` so the workflow keeps the `CNAME` file in sync

## Manual Publish

Run `Publish Public Branch` from the Actions tab when you want to:

- republish without waiting for the next push
- publish from a specific branch, tag, or commit