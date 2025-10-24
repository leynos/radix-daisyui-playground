/** @file Radix × DaisyUI component playground rendered within the Bun SPA. */

"use client";

/*
  Radix × DaisyUI v5 — Design System Playground (TSX STRICT, FIXED)
  ----------------------------------------------------------------

  Tailwind + DaisyUI integration reminder (snippet escapes intentionally shown):
    // tailwind.config.ts
    import daisyui from "daisyui";
    export default {
      content: ["./src/**\/*.{ts,tsx,js,jsx,html}"], // ← in block comments, write **\/*
      theme: { extend: {} },
      plugins: [daisyui],
      daisyui: {
        themes: [
          "light","dark","corporate","business","emerald","cupcake",
          "dracula","forest","retro","synthwave","wireframe","aqua",
          "dim","lofi","nord","coffee"
        ],
      },
    };

  Ensure CSS includes Tailwind layers:
    @tailwind base; @tailwind components; @tailwind utilities;
*/

import * as Accordion from "@radix-ui/react-accordion";
import * as AvatarPr from "@radix-ui/react-avatar";
import * as CheckboxPr from "@radix-ui/react-checkbox";
import * as Dialog from "@radix-ui/react-dialog";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import {
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  Cross2Icon,
  InfoCircledIcon,
  MoonIcon,
  SunIcon,
} from "@radix-ui/react-icons";
import * as Popover from "@radix-ui/react-popover";
import * as ProgressPr from "@radix-ui/react-progress";
import * as RadioGroupPr from "@radix-ui/react-radio-group";
import * as ScrollAreaPr from "@radix-ui/react-scroll-area";
import * as SelectPr from "@radix-ui/react-select";
import * as SliderPr from "@radix-ui/react-slider";
import * as SwitchPr from "@radix-ui/react-switch";
import * as Tabs from "@radix-ui/react-tabs";
import * as ToastPr from "@radix-ui/react-toast";
import * as Tooltip from "@radix-ui/react-tooltip";
import React from "react";

// Themes list (typed)
export const THEMES = [
  "light",
  "dark",
  "corporate",
  "business",
  "emerald",
  "cupcake",
  "dracula",
  "forest",
  "retro",
  "synthwave",
  "wireframe",
  "aqua",
  "dim",
  "lofi",
  "nord",
  "coffee",
] as const;

export type ThemeName = (typeof THEMES)[number];

// -------------------------------------------------------------------------
// Utilities
// -------------------------------------------------------------------------
export const canUseDOM = (): boolean =>
  typeof window !== "undefined" && typeof document !== "undefined";

export function applyTheme(theme: string) {
  if (!canUseDOM()) return;
  const html = document.documentElement;
  const body = document.body || null;
  html.setAttribute("data-theme", theme);
  if (body) body.setAttribute("data-theme", theme);
}

// DaisyUI v5 renamed several design tokens (eg. --p -> --color-primary). Keep
// a compatibility table so diagnostics recognise both generations of names.
const TOKEN_ALIAS_GROUPS: readonly (readonly string[])[] = [
  ["--color-primary", "--p"],
  ["--color-primary-content", "--pc"],
  ["--color-secondary", "--s"],
  ["--color-accent", "--a"],
  ["--color-neutral", "--n"],
  ["--color-base-100", "--b1"],
  ["--color-base-200", "--b2"],
  ["--color-base-300", "--b3"],
  ["--color-info", "--in"],
  ["--color-success", "--su"],
  ["--color-warning", "--wa"],
  ["--color-error", "--er"],
];

const TOKEN_FALLBACKS = TOKEN_ALIAS_GROUPS.reduce<Record<string, readonly string[]>>(
  (acc, group) => {
    for (const token of group) {
      acc[token] = group;
    }
    return acc;
  },
  {},
);

export function resolveTokenCandidates(varName: string): readonly string[] {
  return TOKEN_FALLBACKS[varName] ?? [varName];
}

function formatTokenLabel(varName: string): string {
  const variants = Array.from(new Set(resolveTokenCandidates(varName)));
  if (variants.length === 1) return variants[0];
  const [primary, ...aliases] = variants;
  return `${primary} (alias ${aliases.join(", ")})`;
}

// Simple presence probe: is this DaisyUI token non-empty under current theme?
function hasToken(varName: string): boolean {
  if (!canUseDOM()) return false;
  return resolveTokenCandidates(varName).some((candidate) => {
    const el = document.createElement("div");
    el.style.backgroundColor = `oklch(var(${candidate}))`;
    document.body.appendChild(el);
    let computed = getComputedStyle(el).backgroundColor;
    if (isTransparent(computed)) {
      el.style.backgroundColor = `hsl(var(${candidate}))`;
      computed = getComputedStyle(el).backgroundColor;
    }
    el.remove();
    return !isTransparent(computed);
  });
}

function isTransparent(color: string | null): boolean {
  if (!color) return true;
  const c = color.trim().toLowerCase();
  if (c === "transparent") return true;
  const s = c.split(" ").join("");
  if (s.startsWith("rgba(") && s.endsWith(",0)")) return true;
  if (s.startsWith("hsla(") && s.endsWith(",0)")) return true;
  return false;
}

function SectionCard({
  title,
  subtitle,
  children,
  right,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <div className="card bg-base-100 shadow-xl border border-base-200">
      <div className="card-body gap-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="card-title text-base-content/90">{title}</h2>
            {subtitle ? (
              <p className="text-sm text-base-content/60 leading-snug mt-1">{subtitle}</p>
            ) : null}
          </div>
          {right ? <div className="shrink-0">{right}</div> : null}
        </div>
        <div className="pt-1">{children}</div>
      </div>
    </div>
  );
}

function TokenSwatch({
  name,
  varName,
  swatchClass,
}: {
  name: string;
  varName: string;
  swatchClass: string;
}) {
  const tokenLabel = formatTokenLabel(varName);
  return (
    <div className="flex items-center gap-3 p-3 rounded-box border border-base-200 bg-base-100">
      <div className={`w-14 h-14 rounded-box ring ring-base-200 ${swatchClass}`} />
      <div className="min-w-0">
        <div className="font-medium">{name}</div>
        <div className="text-xs text-base-content/60 font-mono">{tokenLabel}</div>
      </div>
    </div>
  );
}

function ThemePicker({
  theme,
  setTheme,
}: {
  theme: ThemeName;
  setTheme: (t: ThemeName) => void;
}) {
  return (
    <SelectPr.Root value={theme} onValueChange={(v) => setTheme(v as ThemeName)}>
      <SelectPr.Trigger asChild>
        <button
          type="button"
          className="btn join-item min-w-44 justify-between"
          aria-label="Choose theme"
        >
          <span className="truncate capitalize">{theme}</span>
          <SelectPr.Icon>
            <ChevronDownIcon />
          </SelectPr.Icon>
        </button>
      </SelectPr.Trigger>
      <SelectPr.Portal>
        {/* Surface background directly on Radix Content */}
        <SelectPr.Content
          position="popper"
          sideOffset={8}
          className="z-[9999] bg-base-100 border border-base-200 rounded-box shadow-xl"
        >
          <div className="menu menu-sm bg-base-100 rounded-box w-56 p-1">
            <SelectPr.ScrollUpButton className="flex items-center justify-center p-1">
              <ChevronUpIcon />
            </SelectPr.ScrollUpButton>
            <SelectPr.Viewport className="max-h-60">
              {THEMES.map((t) => (
                <SelectPr.Item
                  key={t}
                  value={t}
                  className="px-3 py-2 rounded cursor-pointer data-[highlighted]:bg-base-200 outline-none flex items-center justify-between"
                >
                  <SelectPr.ItemText className="capitalize">{t}</SelectPr.ItemText>
                  <SelectPr.ItemIndicator>
                    <CheckIcon />
                  </SelectPr.ItemIndicator>
                </SelectPr.Item>
              ))}
            </SelectPr.Viewport>
            <SelectPr.ScrollDownButton className="flex items-center justify-center p-1">
              <ChevronDownIcon />
            </SelectPr.ScrollDownButton>
          </div>
        </SelectPr.Content>
      </SelectPr.Portal>
    </SelectPr.Root>
  );
}

// --- Individual Radix × DaisyUI demos ------------------------------------

function TabsDemo() {
  return (
    <Tabs.Root defaultValue="t1" className="w-full">
      <Tabs.List className="tabs tabs-boxed bg-base-200">
        <Tabs.Trigger value="t1" className="tab data-[state=active]:tab-active">
          Overview
        </Tabs.Trigger>
        <Tabs.Trigger value="t2" className="tab data-[state=active]:tab-active">
          Details
        </Tabs.Trigger>
        <Tabs.Trigger value="t3" className="tab data-[state=active]:tab-active">
          History
        </Tabs.Trigger>
      </Tabs.List>
      <div className="p-4 rounded-box bg-base-100 border border-base-200 mt-3">
        <Tabs.Content value="t1">
          <p className="text-sm text-base-content/80">
            This area reflects your tab content. Attach tokens and typographic rules here to
            evaluate reading comfort.
          </p>
        </Tabs.Content>
        <Tabs.Content value="t2">
          <ul className="text-sm leading-6 list-disc pl-5">
            <li>Use of spacing scale</li>
            <li>Contrast ratios across themes</li>
            <li>Interactive states (hover, focus, pressed)</li>
          </ul>
        </Tabs.Content>
        <Tabs.Content value="t3">
          <p className="text-sm">Track design decisions and ADRs alongside components.</p>
        </Tabs.Content>
      </div>
    </Tabs.Root>
  );
}

function AccordionDemo() {
  return (
    <Accordion.Root type="single" collapsible className="w-full">
      {[1, 2, 3].map((n) => (
        <Accordion.Item
          key={n}
          value={`item-${n}`}
          className="border border-base-200 rounded-box mb-2 bg-base-100"
        >
          <Accordion.Header>
            <Accordion.Trigger className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-base-200 rounded-box transition">
              <span className="font-medium">Panel {n}</span>
              <ChevronDownIcon className="size-4 transition-transform data-[state=open]:rotate-180" />
            </Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content className="px-4 pb-4 pt-2 text-sm text-base-content/80">
            Content for panel {n}. Evaluate hierarchy, rhythm, and readable line-length.
          </Accordion.Content>
        </Accordion.Item>
      ))}
    </Accordion.Root>
  );
}

function DialogDemo() {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button type="button" className="btn btn-primary">
          Open dialog
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        {/* Explicit background color via DaisyUI token class */}
        <Dialog.Overlay className="fixed inset-0 z-[9998] bg-base-300/60 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-[9999]">
          <div className="card bg-base-100 shadow-xl border border-base-200">
            <div className="card-body">
              <div className="flex items-start justify-between">
                <Dialog.Title className="card-title">Dialog title</Dialog.Title>
                <Dialog.Close asChild>
                  <button type="button" className="btn btn-ghost btn-sm" aria-label="Close">
                    <Cross2Icon />
                  </button>
                </Dialog.Close>
              </div>
              <Dialog.Description className="text-sm text-base-content/70">
                Use this surface to evaluate modal spacing, elevation, and focus trapping.
              </Dialog.Description>
              <div className="card-actions justify-end mt-4">
                <Dialog.Close asChild>
                  <button type="button" className="btn">
                    Cancel
                  </button>
                </Dialog.Close>
                <Dialog.Close asChild>
                  <button type="button" className="btn btn-primary">
                    Confirm
                  </button>
                </Dialog.Close>
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function DropdownMenuDemo() {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button type="button" className="btn">
          Actions
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          sideOffset={8}
          className="z-[9999] bg-base-100 border border-base-200 rounded-box shadow-xl min-w-48 p-2"
        >
          <DropdownMenu.Item className="menu-item px-3 py-2 rounded hover:bg-base-200 cursor-pointer">
            Edit
          </DropdownMenu.Item>
          <DropdownMenu.Item className="menu-item px-3 py-2 rounded hover:bg-base-200 cursor-pointer">
            Duplicate
          </DropdownMenu.Item>
          <DropdownMenu.Separator className="my-2 h-px bg-base-300" />
          <DropdownMenu.Item className="menu-item px-3 py-2 rounded hover:bg-base-200 cursor-pointer text-error">
            Delete
          </DropdownMenu.Item>
          <DropdownMenu.Arrow className="fill-base-100" />
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

function PopoverDemo() {
  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button type="button" className="btn btn-outline">
          Details
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        {/* Background on the Radix surface itself */}
        <Popover.Content
          sideOffset={8}
          className="max-w-xs z-[9999] bg-base-100 border border-base-200 rounded-box shadow-xl p-0"
        >
          <div className="card bg-base-100 border-0 shadow-none">
            <div className="card-body p-4">
              <div className="flex items-center gap-2">
                <InfoCircledIcon />
                <h3 className="font-medium">Compact surface</h3>
              </div>
              <p className="text-sm text-base-content/70">
                Great for inline explanations, microcopy, or helping text.
              </p>
              <Popover.Close asChild>
                <button type="button" className="btn btn-sm mt-2 self-end">
                  Close
                </button>
              </Popover.Close>
            </div>
          </div>
          <Popover.Arrow className="fill-base-100" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

function TooltipDemo() {
  return (
    <Tooltip.Provider delayDuration={300}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <button type="button" className="btn btn-circle">
            <InfoCircledIcon />
          </button>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            sideOffset={8}
            className="px-3 py-1.5 rounded bg-base-200 text-sm text-base-content border border-base-300 shadow z-[9999]"
          >
            Helpful tooltip
            <Tooltip.Arrow className="fill-base-200" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}

function SwitchDemo() {
  const [checked, setChecked] = React.useState<boolean>(true);
  return (
    <div className="flex items-center gap-3">
      <SwitchPr.Root
        checked={checked}
        onCheckedChange={setChecked}
        className="relative inline-flex h-6 w-11 items-center rounded-full bg-base-300 transition-colors data-[state=checked]:bg-primary focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        <SwitchPr.Thumb className="block h-5 w-5 rounded-full bg-base-100 shadow transition-transform translate-x-0.5 data-[state=checked]:translate-x-[22px]" />
      </SwitchPr.Root>
      <span className="text-sm">Enable feature</span>
    </div>
  );
}

function SliderDemo() {
  const [value, setValue] = React.useState<number[]>([40]);
  // Debug logging helps trace slider behaviour under DaisyUI theme tokens.
  const handleValueChange = React.useCallback(
    (next: number[]) => {
      console.debug("[SliderDemo] value change", {
        previous: value,
        next,
        delta: next[0] - value[0],
      });
      setValue([...next]);
    },
    [value],
  );
  const handleValueCommit = React.useCallback((next: number[]) => {
    console.debug("[SliderDemo] value commit", { next });
  }, []);
  const allowPointerEvent = React.useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    console.debug("[SliderDemo] pointer event", event.type, {
      pointerType: event.pointerType,
      button: event.button,
    });
  }, []);
  return (
    <div>
      <SliderPr.Root
        value={value}
        onValueChange={handleValueChange}
        onValueCommit={handleValueCommit}
        max={100}
        step={1}
        onPointerDown={allowPointerEvent}
        className="relative flex h-4 w-full touch-none select-none items-center"
      >
        <SliderPr.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-base-300">
          <SliderPr.Range className="absolute h-full rounded-full bg-primary" />
        </SliderPr.Track>
        <SliderPr.Thumb className="block size-5 rounded-full border border-base-300 bg-base-100 shadow transition-transform focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary data-[state=active]:scale-105">
          <span className="sr-only">Adjust value</span>
        </SliderPr.Thumb>
      </SliderPr.Root>
      <div className="mt-4 text-sm leading-snug text-base-content/70">
        {/* Ensure text sits below the interactive area so it does not intercept pointer events. */}
        Value: {value[0]}
      </div>
    </div>
  );
}

function CheckboxRadioDemo() {
  const [c1, setC1] = React.useState<boolean>(true);
  const [c2, setC2] = React.useState<boolean>(false);
  const [radio, setRadio] = React.useState<string>("a");
  return (
    <div className="grid grid-cols-2 gap-6">
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <CheckboxPr.Root
            checked={c1}
            onCheckedChange={setC1}
            id="cb1"
            className="size-5 rounded border border-base-300 data-[state=checked]:bg-primary data-[state=checked]:border-primary grid place-items-center text-primary-content focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
          >
            <CheckboxPr.Indicator>
              <CheckIcon />
            </CheckboxPr.Indicator>
          </CheckboxPr.Root>
          <label htmlFor="cb1" className="text-sm">
            Email notifications
          </label>
        </div>
        <div className="flex items-center gap-3">
          <CheckboxPr.Root
            checked={c2}
            onCheckedChange={setC2}
            id="cb2"
            className="size-5 rounded border border-base-300 data-[state=checked]:bg-primary data-[state=checked]:border-primary grid place-items-center text-primary-content focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
          >
            <CheckboxPr.Indicator>
              <CheckIcon />
            </CheckboxPr.Indicator>
          </CheckboxPr.Root>
          <label htmlFor="cb2" className="text-sm">
            Product updates
          </label>
        </div>
      </div>
      <RadioGroupPr.Root value={radio} onValueChange={setRadio} className="space-y-3">
        {["a", "b", "c"].map((val) => (
          <div key={val} className="flex items-center gap-3">
            <RadioGroupPr.Item
              value={val}
              id={`r-${val}`}
              className="size-5 rounded-full border border-base-300 grid place-items-center data-[state=checked]:border-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
            >
              <div className="size-2 rounded-full bg-primary data-[state=unchecked]:hidden" />
            </RadioGroupPr.Item>
            <label htmlFor={`r-${val}`} className="text-sm">
              Choice {val.toUpperCase()}
            </label>
          </div>
        ))}
      </RadioGroupPr.Root>
    </div>
  );
}

function ProgressAvatarDemo() {
  const [progress, setProgress] = React.useState<number>(65);
  React.useEffect(() => {
    const id = setInterval(() => setProgress((p) => (p >= 100 ? 0 : p + 5)), 1500);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="flex items-center justify-between gap-6">
      <div className="w-full">
        <ProgressPr.Root
          value={progress}
          className="relative h-4 w-full overflow-hidden rounded bg-base-300"
        >
          <ProgressPr.Indicator
            style={{ width: `${progress}%` }}
            className="h-full bg-primary transition-[width] duration-700"
          />
        </ProgressPr.Root>
        <div className="mt-2 text-sm text-base-content/70">{progress}% complete</div>
      </div>
      <AvatarPr.Root className="inline-flex size-14 select-none items-center justify-center overflow-hidden rounded-full align-middle ring ring-primary ring-offset-2 ring-offset-base-100">
        <AvatarPr.Image
          src="https://images.unsplash.com/photo-1527980965255-d3b416303d12?q=80&w=200&auto=format&fit=crop"
          alt="Avatar"
          className="h-full w-full object-cover"
        />
        <AvatarPr.Fallback className="text-sm bg-base-200 w-full h-full grid place-items-center">
          PX
        </AvatarPr.Fallback>
      </AvatarPr.Root>
    </div>
  );
}

function SelectDemo() {
  const [value, setValue] = React.useState<string>("apple");
  return (
    <SelectPr.Root value={value} onValueChange={setValue}>
      <SelectPr.Trigger asChild>
        <button type="button" className="btn justify-between w-56">
          <SelectPr.Value />
          <SelectPr.Icon>
            <ChevronDownIcon />
          </SelectPr.Icon>
        </button>
      </SelectPr.Trigger>
      <SelectPr.Portal>
        <SelectPr.Content
          position="popper"
          sideOffset={8}
          className="z-[9999] bg-base-100 border border-base-200 rounded-box shadow-xl"
        >
          <div className="menu menu-sm bg-base-100 rounded-box w-56 p-1">
            <SelectPr.ScrollUpButton className="flex items-center justify-center p-1">
              <ChevronUpIcon />
            </SelectPr.ScrollUpButton>
            <SelectPr.Viewport className="max-h-60">
              {[
                { label: "Apple", value: "apple" },
                { label: "Banana", value: "banana" },
                { label: "Cherry", value: "cherry" },
                { label: "Dragonfruit", value: "dragonfruit" },
              ].map((opt) => (
                <SelectPr.Item
                  key={opt.value}
                  value={opt.value}
                  className="px-3 py-2 rounded cursor-pointer data-[highlighted]:bg-base-200 outline-none flex items-center justify-between"
                >
                  <SelectPr.ItemText>{opt.label}</SelectPr.ItemText>
                  <SelectPr.ItemIndicator>
                    <CheckIcon />
                  </SelectPr.ItemIndicator>
                </SelectPr.Item>
              ))}
            </SelectPr.Viewport>
            <SelectPr.ScrollDownButton className="flex items-center justify-center p-1">
              <ChevronDownIcon />
            </SelectPr.ScrollDownButton>
          </div>
        </SelectPr.Content>
      </SelectPr.Portal>
      <div className="text-sm text-base-content/70 mt-2">Selected: {value}</div>
    </SelectPr.Root>
  );
}

function ScrollAreaDemo() {
  const items = Array.from({ length: 20 }, (_, i) => `Item ${i + 1}`);
  return (
    <ScrollAreaPr.Root className="h-40 w-full rounded-box border border-base-200 bg-base-100">
      <ScrollAreaPr.Viewport className="h-full w-full p-3">
        <ul className="space-y-2">
          {items.map((it) => (
            <li key={it} className="px-3 py-2 rounded bg-base-200">
              {it}
            </li>
          ))}
        </ul>
      </ScrollAreaPr.Viewport>
      <ScrollAreaPr.Scrollbar
        orientation="vertical"
        className="flex select-none touch-none p-0.5 bg-base-200"
      >
        <ScrollAreaPr.Thumb className="relative flex-1 rounded bg-base-300" />
      </ScrollAreaPr.Scrollbar>
    </ScrollAreaPr.Root>
  );
}

function ToastDemo() {
  const [open, setOpen] = React.useState<boolean>(false);
  return (
    <ToastPr.Provider swipeDirection="right" duration={2500}>
      <button type="button" className="btn btn-secondary" onClick={() => setOpen(true)}>
        Show toast
      </button>
      <ToastPr.Root
        open={open}
        onOpenChange={setOpen}
        className="rounded-box bg-base-100 border border-base-200 shadow-xl px-4 py-3 data-[swipe=move]:translate-x-0 data-[swipe=cancel]:translate-x-0 data-[state=open]:animate-fadeIn data-[state=closed]:animate-fadeOut"
      >
        <ToastPr.Title className="font-medium">Saved</ToastPr.Title>
        <ToastPr.Description className="text-sm text-base-content/70">
          Your changes have been stored safely.
        </ToastPr.Description>
      </ToastPr.Root>
      <ToastPr.Viewport className="fixed bottom-4 right-4 w-96 max-w-[90vw] outline-none space-y-2 z-[9999]" />
    </ToastPr.Provider>
  );
}

// --- Diagnostics (runtime tests) -----------------------------------------

type TestResult = { name: string; pass: boolean; details?: string };

function DiagnosticsPanel({ theme }: { theme: ThemeName }) {
  const [results, setResults] = React.useState<TestResult[]>([]);

  React.useEffect(() => {
    const r: TestResult[] = [];

    if (!canUseDOM()) {
      r.push({
        name: "DOM available",
        pass: false,
        details: "window/document not available",
      });
      setResults(r);
      return;
    }

    // Test 1: data-theme applied to :root
    const rootTheme = document.documentElement.getAttribute("data-theme");
    r.push({
      name: "Root data-theme matches state",
      pass: rootTheme === theme,
      details: `root='${rootTheme}', state='${theme}'`,
    });

    // Test 2: DaisyUI tokens resolve (bg-primary computes to a color)
    const probe = document.createElement("div");
    probe.className = "bg-primary";
    document.body.appendChild(probe);
    const color = getComputedStyle(probe).backgroundColor;
    document.body.removeChild(probe);
    r.push({
      name: "Token bg-primary resolves to a color",
      pass: !isTransparent(color),
      details: color,
    });

    // Test 3: CSS variables present (simple presence probe) - tolerate DaisyUI v4/v5 names.
    const primaryTokenPresent = hasToken("--color-primary");
    const base100TokenPresent = hasToken("--color-base-100");
    const base200TokenPresent = hasToken("--color-base-200");
    r.push({
      name: "Theme variable primary (--color-primary/--p) present",
      pass: primaryTokenPresent,
      details: primaryTokenPresent
        ? formatTokenLabel("--color-primary")
        : `missing ${formatTokenLabel("--color-primary")}`,
    });
    r.push({
      name: "Theme variable base-100 (--color-base-100/--b1) present",
      pass: base100TokenPresent,
      details: base100TokenPresent
        ? formatTokenLabel("--color-base-100")
        : `missing ${formatTokenLabel("--color-base-100")}`,
    });
    r.push({
      name: "Theme variable base-200 (--color-base-200/--b2) present",
      pass: base200TokenPresent,
      details: base200TokenPresent
        ? formatTokenLabel("--color-base-200")
        : `missing ${formatTokenLabel("--color-base-200")}`,
    });

    // Test 4: Body data-theme mirrors state (for portals)
    const bodyTheme = document.body?.getAttribute("data-theme");
    r.push({
      name: "Body data-theme matches state",
      pass: bodyTheme === theme,
      details: `body='${bodyTheme}', state='${theme}'`,
    });

    // Test 5: Overlay vs navbar z-index sanity
    const overlay = document.createElement("div");
    overlay.className = "fixed z-[9999]";
    const navbar = document.createElement("div");
    navbar.className = "sticky z-40";
    document.body.appendChild(overlay);
    document.body.appendChild(navbar);
    const ziOverlay = Number.parseInt(getComputedStyle(overlay).zIndex || "0", 10);
    const ziNavbar = Number.parseInt(getComputedStyle(navbar).zIndex || "0", 10);
    overlay.remove();
    navbar.remove();
    r.push({
      name: "Overlay z-index above navbar",
      pass: ziOverlay > ziNavbar,
      details: `${ziOverlay} > ${ziNavbar}`,
    });

    // Test 6: Theme availability hint
    const themeTokensAvailable = base100TokenPresent && primaryTokenPresent;
    r.push({
      name: "Theme CSS present (checks base-100 & primary tokens)",
      pass: themeTokensAvailable,
      details: themeTokensAvailable
        ? "theme tokens resolved"
        : "missing DaisyUI theme variables — ensure daisyui plugin is registered",
    });

    // Test 7: LocalStorage theme persistence
    try {
      const stored = window.localStorage.getItem("rdp.theme");
      r.push({
        name: "localStorage('rdp.theme') matches state",
        pass: stored === theme,
        details: `stored='${stored}', state='${theme}'`,
      });
    } catch (e) {
      r.push({
        name: "localStorage accessible",
        pass: false,
        details: String(e),
      });
    }

    // Test 8: Base surface computes a non-transparent background
    const bgProbe = document.createElement("div");
    bgProbe.className = "bg-base-100";
    document.body.appendChild(bgProbe);
    const bgColor = getComputedStyle(bgProbe).backgroundColor;
    bgProbe.remove();
    r.push({
      name: "bg-base-100 resolves to a color",
      pass: !isTransparent(bgColor),
      details: bgColor,
    });

    // Test 9: Overlay utility resolves non-transparent color
    const ov = document.createElement("div");
    ov.className = "bg-base-300/60";
    document.body.appendChild(ov);
    const ovColor = getComputedStyle(ov).backgroundColor;
    ov.remove();
    r.push({
      name: "bg-base-300/60 resolves to a color",
      pass: !isTransparent(ovColor),
      details: ovColor,
    });

    // --- Additional tests (added, non-breaking) ---
    // Test 10: Primary content token present
    const primaryContentTokenPresent = hasToken("--color-primary-content");
    r.push({
      name: "Theme variable primary-content (--color-primary-content/--pc) present",
      pass: primaryContentTokenPresent,
      details: primaryContentTokenPresent
        ? formatTokenLabel("--color-primary-content")
        : `missing ${formatTokenLabel("--color-primary-content")}`,
    });
    // Test 11: Neutral token present
    const neutralTokenPresent = hasToken("--color-neutral");
    r.push({
      name: "Theme variable neutral (--color-neutral/--n) present",
      pass: neutralTokenPresent,
      details: neutralTokenPresent
        ? formatTokenLabel("--color-neutral")
        : `missing ${formatTokenLabel("--color-neutral")}`,
    });
    // Test 12: Border color resolves for border-base-200
    const borderProbe = document.createElement("div");
    borderProbe.className = "border border-base-200";
    document.body.appendChild(borderProbe);
    const borderColor = getComputedStyle(borderProbe).borderTopColor;
    borderProbe.remove();
    r.push({
      name: "border-base-200 resolves to a color",
      pass: !isTransparent(borderColor),
      details: borderColor,
    });
    // Test 13: Text color resolves for text-base-content
    const textProbe = document.createElement("div");
    textProbe.className = "text-base-content";
    document.body.appendChild(textProbe);
    const textColor = getComputedStyle(textProbe).color;
    textProbe.remove();
    r.push({
      name: "text-base-content resolves to a color",
      pass: !isTransparent(textColor),
      details: textColor,
    });

    setResults(r);
  }, [theme]);

  return (
    <div className="overflow-x-auto">
      <table className="table table-zebra">
        <thead>
          <tr>
            <th>Check</th>
            <th>Status</th>
            <th>Details</th>
          </tr>
        </thead>
        <tbody>
          {results.map((t) => (
            <tr key={t.name}>
              <td className="whitespace-pre-wrap">{t.name}</td>
              <td>{t.pass ? "✅" : "❌"}</td>
              <td className="text-xs text-base-content/70">{t.details}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// --- Page ----------------------------------------------------------------

export default function RadixDaisyUIPlayground() {
  const KEY = "rdp.theme";
  const initialTheme: ThemeName = React.useMemo(() => {
    if (!canUseDOM()) return "business";
    const stored = window.localStorage.getItem(KEY) as ThemeName | null;
    return stored && (THEMES as readonly string[]).includes(stored) ? stored : "business";
  }, []);

  const [theme, setTheme] = React.useState<ThemeName>(initialTheme);
  const [density, setDensity] = React.useState<"comfortable" | "compact">("comfortable");

  // Apply + persist theme
  React.useLayoutEffect(() => {
    applyTheme(theme);
    if (canUseDOM()) window.localStorage.setItem(KEY, theme);
  }, [theme]);

  return (
    <div
      id="playground-root"
      className={`min-h-screen ${density === "compact" ? "text-sm" : "text-base"} bg-base-200 text-base-content`}
    >
      {/* Top Nav */}
      <div className="navbar bg-base-100 border-b border-base-200 sticky top-0 z-40">
        <div className="flex-1">
          <span className="font-semibold text-lg px-2">Radix × DaisyUI</span>
        </div>
        <div className="flex-none pr-2 flex items-center gap-2 flex-row-reverse">
          <div className="join flex-row">
            <button
              type="button"
              className="btn join-item"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label="Toggle light/dark"
            >
              {theme === "dark" ? <SunIcon /> : <MoonIcon />}
            </button>
            <ThemePicker theme={theme} setTheme={setTheme} />
          </div>
          <div className="form-control">
            <label className="label cursor-pointer gap-3">
              <span className="label-text">Compact</span>
              <input
                type="checkbox"
                className="toggle"
                checked={density === "compact"}
                onChange={(e) => setDensity(e.target.checked ? "compact" : "comfortable")}
              />
            </label>
          </div>
        </div>
      </div>

      {/* Page header */}
      <header className="container max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Design System Playground</h1>
            <p className="text-base-content/70 mt-1">
              Radix primitives with DaisyUI v5 theming. Tune tokens, typographic rhythm, spacing,
              and states across themes.
            </p>
          </div>
          <div className="stats shadow">
            <div className="stat">
              <div className="stat-title">Theme</div>
              <div className="stat-value text-primary">{theme}</div>
              <div className="stat-desc">data-theme</div>
            </div>
            <div className="stat">
              <div className="stat-title">Density</div>
              <div className="stat-value">{density}</div>
              <div className="stat-desc">type scale</div>
            </div>
          </div>
        </div>
      </header>

      {/* Tokens */}
      <section className="container max-w-6xl mx-auto px-4 pb-8">
        <SectionCard
          title="Design tokens (live)"
          subtitle="Primary, Secondary, Accent, Neutral, Base — rendered from DaisyUI theme variables"
          right={<div className="badge">Tokens</div>}
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            <TokenSwatch name="Primary" varName="--color-primary" swatchClass="bg-primary" />
            <TokenSwatch
              name="Primary Content"
              varName="--color-primary-content"
              swatchClass="bg-primary text-primary-content"
            />
            <TokenSwatch name="Secondary" varName="--color-secondary" swatchClass="bg-secondary" />
            <TokenSwatch name="Accent" varName="--color-accent" swatchClass="bg-accent" />
            <TokenSwatch name="Neutral" varName="--color-neutral" swatchClass="bg-neutral" />
            <TokenSwatch name="Base-100" varName="--color-base-100" swatchClass="bg-base-100" />
            <TokenSwatch name="Base-200" varName="--color-base-200" swatchClass="bg-base-200" />
            <TokenSwatch name="Base-300" varName="--color-base-300" swatchClass="bg-base-300" />
            <TokenSwatch name="Info" varName="--color-info" swatchClass="bg-info" />
            <TokenSwatch name="Success" varName="--color-success" swatchClass="bg-success" />
            <TokenSwatch name="Warning" varName="--color-warning" swatchClass="bg-warning" />
            <TokenSwatch name="Error" varName="--color-error" swatchClass="bg-error" />
          </div>
        </SectionCard>
      </section>

      {/* Components grid */}
      <main className="container max-w-6xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <SectionCard title="Tabs" subtitle="Radix Tabs with DaisyUI tabs/tabs-boxed styling">
            <TabsDemo />
          </SectionCard>
          <SectionCard
            title="Accordion"
            subtitle="Single-collapse accordion with animated chevrons"
          >
            <AccordionDemo />
          </SectionCard>
          <SectionCard title="Dialog" subtitle="Focus-trapped modal with overlay and card surface">
            <DialogDemo />
          </SectionCard>
          <SectionCard title="Dropdown Menu" subtitle="Context unobtrusive actions">
            <DropdownMenuDemo />
          </SectionCard>
          <SectionCard title="Popover" subtitle="Inline, anchored surface for microcopy or forms">
            <PopoverDemo />
          </SectionCard>
          <SectionCard title="Tooltip" subtitle="Short, low-latency affordance hints">
            <TooltipDemo />
          </SectionCard>
          <SectionCard title="Switch" subtitle="Binary toggle with explicit focus treatment">
            <SwitchDemo />
          </SectionCard>
          <SectionCard title="Slider" subtitle="1D continuous input with tokenised rails">
            <SliderDemo />
          </SectionCard>
          <SectionCard title="Checkbox & Radio" subtitle="Form controls with clear checked states">
            <CheckboxRadioDemo />
          </SectionCard>
          <SectionCard title="Progress & Avatar" subtitle="Foreground motion + identity clustering">
            <ProgressAvatarDemo />
          </SectionCard>
          <SectionCard
            title="Select"
            subtitle="Use when options exceed a small radio/segmented set"
          >
            <SelectDemo />
          </SectionCard>
          <SectionCard title="Scroll Area" subtitle="Constrained panel with styled scrollbar">
            <ScrollAreaDemo />
          </SectionCard>
          <SectionCard title="Toast" subtitle="Transient confirmations and nudges">
            <ToastDemo />
          </SectionCard>
        </div>

        {/* Diagnostics & tests */}
        <div className="mt-10">
          <SectionCard
            title="Diagnostics & Tests"
            subtitle="Runtime checks to prevent regressions in theming and tokens"
            right={<div className="badge badge-outline">non-blocking</div>}
          >
            <DiagnosticsPanel theme={theme} />
          </SectionCard>
        </div>
      </main>

      {/* Footer */}
      <footer className="container max-w-6xl mx-auto px-4 pb-10">
        <div className="alert bg-base-100 border border-base-200">
          <div>
            <InfoCircledIcon />
            <div>
              <h3 className="font-medium">Design notes</h3>
              <p className="text-sm text-base-content/70">
                Compare components across themes, verify minimum contrast (WCAG AA/AAA), and
                document hover/active/focus states. Establish size ramps (XS–XL), corner radii,
                shadows, and motion guidelines here before exporting tokens.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
