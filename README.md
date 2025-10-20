# Radix × DaisyUI Playground

This project is a Bun-powered single-page application that showcases Radix UI
primitives styled with Tailwind CSS v4 and DaisyUI v5. It is intended as a
playground for experimenting with cross-theme component styling, spacing, and
interaction diagnostics.

## Features

- **React 19 + Bun dev server** with hot reloading and a static build pipeline
  via `bun build`.
- **Tailwind CSS v4 + DaisyUI v5** applying theme tokens, utilities, and
  component classes across Radix primitives.
- **Diagnostics panel** that runs runtime checks for DaisyUI tokens and theme
  application to catch regressions quickly.
- **Static preview server** (`server.ts`) providing an SPA-friendly fallback for
  the production bundle.

## Getting Started

Install dependencies:

```bash
bun install
```

Start the dev server with hot reload:

```bash
bun run dev
```

Create a production bundle:

```bash
bun run build
```

Preview the built assets with Bun’s static server:

```bash
bun run preview
```

## Diagnostics

The `Diagnostics & Tests` section within the UI validates DaisyUI token
availability, theme application, and component accessibility hints. Keep an eye
on this panel when adjusting Tailwind or DaisyUI configuration.

## License

This project is released under the [ISC License](LICENSE).
