import { createSignal } from "solid-js";
import type { LoaderArgs, RouteComponentProps } from "fels";

export async function loader(_args: LoaderArgs) {
  return {
    message: "Hello from Fels",
    highlights: ["SolidJS 2.0 renderer", "Pracht routing & loaders", "Streaming-ready SSR"],
  };
}

export default function Home(props: RouteComponentProps<typeof loader>) {
  const [count, setCount] = createSignal(0);

  return (
    <section>
      <h1>{props.data.message}</h1>
      <ul>
        {props.data.highlights.map((item) => (
          <li>{item}</li>
        ))}
      </ul>
      <button type="button" onClick={() => setCount((c) => c + 1)}>
        Count: {count()}
      </button>
    </section>
  );
}
