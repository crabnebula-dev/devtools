import { findLineNumberByNestedKey } from "~/lib/tauri/tauri-conf-schema";
import { useConfiguration } from "./configuration-context";
import { createEffect } from "solid-js";
import CodeView from "../sources/code-view";

export default function JsonView(props: {
  path: string;
  size: number;
  lang: string;
}) {
  const {
    highlightKey: { highlightKey },
    configurations: { configurations },
  } = useConfiguration();

  const config = () =>
    configurations.configs?.find((x) => x.path === props.path);

  const lineNumber = () =>
    findLineNumberByNestedKey(config()?.raw ?? "", highlightKey());

  createEffect(() => {
    highlightKey();
    const highlightedLine = document.querySelector(".line.highlighted");
    if (highlightedLine) {
      highlightedLine.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  });

  return (
    <CodeView
      path={props.path}
      size={props.size}
      lang={"json"}
      highlightedLine={lineNumber()}
    />
  );
}
