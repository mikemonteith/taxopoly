import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Monopoly Tax" },
    { name: "description", content: "Monopoly... but with tax" },
  ];
}

export default function Home() {
  return <main>Home</main>;
}
