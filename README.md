# Radix × DaisyUI Playground

This project is a Vite-powered single-page application that showcases Radix UI
primitives styled with Tailwind CSS v4 and DaisyUI v5. It is intended as a
playground for experimenting with cross-theme component styling, spacing, and
interaction diagnostics.

## Features

- **React 19 + Vite dev server** with hot module reload and a static build
  pipeline tailored for GitHub Pages deployments.
- **Tailwind CSS v4 + DaisyUI v5** applying theme tokens, utilities, and
  component classes across Radix primitives.
- **Diagnostics panel** that runs runtime checks for DaisyUI tokens and theme
  application to catch regressions quickly.
- **Static preview server** (`server.ts`) providing an SPA-friendly fallback for
  the production bundle.

## Getting Started

Install dependencies with pnpm:

```bash
pnpm install
```

Start the dev server with hot reload:

```bash
pnpm dev
```

Create a production bundle tailored for GitHub Pages (sets the base path to
`/radix-daisyui-playground/`):

```bash
pnpm build
```

Preview the built assets with Vite’s static server:

```bash
pnpm preview
```

> Existing Bun helpers remain available if you prefer them. For example,
> `bun run server.ts` still serves `dist/` with an SPA fallback.

### DaisyUI theme configuration

Tailwind CSS v4 reads DaisyUI options from the `@plugin` block in
`src/index.css`. The project registers the same theme list there (with
`business` as the default and `dark` honouring `prefers-color-scheme`) so the
runtime diagnostics see all DaisyUI tokens across themes.

## GitHub Pages workflow

- `.github/workflows/deploy.yml` builds the site with pnpm and publishes to
  GitHub Pages on pushes to `main`.
- `make test-action` executes the workflow’s `build` job locally with
  [`act`](https://github.com/nektos/act) and runs a small smoke test over the
  generated artefacts.
- `make test-action-deploy` rehearses the `build` → `deploy` sequence using
  stubbed replacements for the Pages-specific actions, so you can exercise the
  entire job graph offline.
- `make test-action-local` performs the fast path (`pnpm install`, `pnpm build`)
  with the same smoke checks, which is handy for CI parity without Docker.

## Diagnostics

The `Diagnostics & Tests` section within the UI validates DaisyUI token
availability, theme application, and component accessibility hints. Keep an eye
on this panel when adjusting Tailwind or DaisyUI configuration.

## License

This project is released under the [ISC License](LICENSE).
