import { createSignal, createContext, useContext } from "solid-js";

const HighlightKeyContext = createContext();

export function HighlightKeyProvider(props) {
  const [highlightKey, setHighlightKey] = createSignal(props.key || ""),
    highlightKeyer = [
      highlightKey,
      {
        setHighlightKey(value: string) {
          setHighlightKey(value);
        },
      },
    ];

  return (
    <HighlightKeyContext.Provider value={highlightKeyer}>
      {props.children}
    </HighlightKeyContext.Provider>
  );
}

export function useHighlightKey() {
  return useContext(HighlightKeyContext);
}
