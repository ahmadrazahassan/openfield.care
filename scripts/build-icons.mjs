/**
 * Generates React components from the vector icon set in public/icons.
 *
 * The SVGs are the source of truth (produced by output/imagegen); this script
 * inlines them so they can inherit currentColor and take a className, which a
 * plain <img> cannot do. Re-run after regenerating the icon set:
 *
 *   node scripts/build-icons.mjs
 */
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const SRC = "public/icons";
const OUT = "src/components/icons/generated.tsx";

const toPascal = (s) =>
  s.replace(/(^|-)([a-z])/g, (_, __, c) => c.toUpperCase());
const toCamel = (s) => s.replace(/-([a-z])/g, (_, c) => c.toUpperCase());

const files = readdirSync(SRC)
  .filter((f) => f.endsWith(".svg"))
  .sort();

const parts = files.map((file) => {
  const name = file.replace(/\.svg$/, "");
  const raw = readFileSync(join(SRC, file), "utf8");

  const inner = raw
    .replace(/^[\s\S]*?<svg[^>]*>/, "")
    .replace(/<\/svg>\s*$/, "")
    .trim()
    // kebab-case SVG attributes -> camelCase JSX props
    .replace(/\b([a-z]+)-([a-z])/g, (_, a, b) => a + b.toUpperCase())
    .replace(/\s*\/>/g, " />");

  return {
    key: toCamel(name),
    component: `${toPascal(name)}Icon`,
    body: inner,
  };
});

const header = `// GENERATED FILE - do not edit by hand.
// Source: public/icons/*.svg  |  Regenerate: node scripts/build-icons.mjs
//
// Spec: 24x24 viewBox, 1.5 stroke, currentColor, fill none, round caps/joins.

import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { title?: string };

function Svg({
  children,
  title,
  ...props
}: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
      {...props}
    >
      {title ? <title>{title}</title> : null}
      {children}
    </svg>
  );
}
`;

const components = parts
  .map(
    (p) => `
export const ${p.component} = (p: IconProps) => (
  <Svg {...p}>
    ${p.body}
  </Svg>
);`,
  )
  .join("\n");

const registry = `

export const GENERATED_ICONS = {
${parts.map((p) => `  ${p.key}: ${p.component},`).join("\n")}
} as const;
`;

writeFileSync(OUT, header + components + registry, "utf8");
console.log(`Wrote ${OUT} with ${parts.length} icons:`);
console.log(parts.map((p) => p.key).join(", "));
