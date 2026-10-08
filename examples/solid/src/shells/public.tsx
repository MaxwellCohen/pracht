import type { ShellProps } from "fels";

export function Shell(props: ShellProps) {
  return (
    <div class="public-shell">
      <header>
        <strong>Fels</strong>
        <nav>
          <a href="/">Home</a>
          <a href="/about">About</a>
        </nav>
      </header>
      <main>{props.children}</main>
      <footer>Solid 2.0 · Pracht · Fels</footer>
    </div>
  );
}

export function head() {
  return {
    title: "Fels Example",
    meta: [{ name: "viewport", content: "width=device-width, initial-scale=1" }],
  };
}
