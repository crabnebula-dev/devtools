import { createSignal, createContext, useContext } from "solid-js";

export function HighlightKeyProvider(props: { key?: string; children: any }) {
  const highlightKeyer = makeHighlightKeyContext(props.key);
  return (
    <HighlightKeyContext.Provider value={highlightKeyer}>
      {props.children}
    </HighlightKeyContext.Provider>
  );
}

export const makeHighlightKeyContext = (initialKey = "") => {
  const [highlightKey, setHighlightKey] = createSignal<string>(initialKey);
  return [
    highlightKey,
    {
      setHighlightKey(value: string) {
        setHighlightKey(value);
      },
    },
  ] as const;
};
type HighlightKeyContextType = ReturnType<typeof makeHighlightKeyContext>;
const HighlightKeyContext = createContext<HighlightKeyContextType>();

export function useHighlightKey() {
  const ctx = useContext(HighlightKeyContext);
  if (!ctx) throw new Error("Can not build highlight key context");
  return ctx;
}
