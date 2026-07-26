// View helpers for the React port.

function kebabToCamel(str) {
  return str.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
}

// Parse an inline-CSS string into a React style object.
// Mirrors the dc-runtime `cssToObj`: custom properties (--x) keep their name,
// everything else is camelCased. Passing an object returns it unchanged.
export function s(css) {
  if (!css) return {};
  if (typeof css === 'object') return css;
  const o = {};
  for (const decl of String(css).split(';')) {
    const i = decl.indexOf(':');
    if (i < 0) continue;
    const prop = decl.slice(0, i).trim();
    if (!prop) continue;
    o[prop.startsWith('--') ? prop : kebabToCamel(prop)] = decl.slice(i + 1).trim();
  }
  return o;
}
