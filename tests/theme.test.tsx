import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { act } from "react";
import { type Root, createRoot } from "react-dom/client";

import RadixDaisyUIPlayground, {
  applyTheme,
  canUseDOM,
  resolveTokenCandidates,
  THEMES,
} from "../src/index";

describe("theme utilities", () => {
  beforeEach(() => {
    document.documentElement.removeAttribute("data-theme");
    document.body.removeAttribute("data-theme");
  });

  it("sets the DaisyUI theme on <html> and <body>", () => {
    expect(canUseDOM()).toBe(true);
    applyTheme("emerald");

    expect(document.documentElement.getAttribute("data-theme")).toBe("emerald");
    expect(document.body.getAttribute("data-theme")).toBe("emerald");
  });

  it("resolves legacy DaisyUI token aliases", () => {
    const aliases = resolveTokenCandidates("--color-primary");
    expect(aliases).toContain("--p");
    expect(aliases).toContain("--color-primary");
  });
});

describe("Radix × DaisyUI Playground", () => {
  let root: Root | null = null;

  beforeEach(() => {
    document.body.innerHTML = '<div id="mount"></div>';
    window.localStorage.clear();
    document.documentElement.removeAttribute("data-theme");
    document.body.removeAttribute("data-theme");
  });

  afterEach(async () => {
    if (root) {
      await act(async () => {
        root?.unmount();
      });
    }
    root = null;
    document.body.innerHTML = "";
    document.documentElement.removeAttribute("data-theme");
    document.body.removeAttribute("data-theme");
  });

  it("loads with the default theme and toggles to dark", async () => {
    const mount = document.getElementById("mount");
    expect(mount).toBeTruthy();
    if (!mount) throw new Error("Missing mount element");

    root = createRoot(mount);
    await act(async () => {
      root?.render(<RadixDaisyUIPlayground />);
    });

    expect(document.documentElement.getAttribute("data-theme")).toBe("business");
    expect(window.localStorage.getItem("rdp.theme")).toBe("business");

    const toggle = mount.querySelector<HTMLButtonElement>("button[aria-label='Toggle light/dark']");
    expect(toggle).toBeTruthy();
    if (!toggle) throw new Error("Toggle button not found");

    await act(async () => {
      toggle.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
    });

    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    expect(window.localStorage.getItem("rdp.theme")).toBe("dark");
  });

  it("exposes the full theme list for potential selectors", () => {
    expect(THEMES.length).toBeGreaterThan(0);
    expect(THEMES).toContain("business");
    expect(THEMES).toContain("dark");
  });
});
