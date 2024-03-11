import {
  createSignal,
  createContext,
  useContext,
  type JSXElement,
} from "solid-js";

type ConfigurationContextType = ReturnType<typeof makeConfigurationContext>;
const ConfigurationContext = createContext<ConfigurationContextType>();

export function ConfigurationContextProvider(props: { children: JSXElement }) {
  const configurationContext = makeConfigurationContext();
  return (
    <ConfigurationContext.Provider value={configurationContext}>
      {props.children}
    </ConfigurationContext.Provider>
  );
}

export const makeConfigurationContext = () => {
  const [highlightKey, setHighlightKey] = createSignal<string>("");
  const [descriptions, setDescriptions] = createSignal<
    Map<string, { default?: string }>
  >(new Map());
  return {
    highlightKey: {
      highlightKey: highlightKey,
      setHighlightKey: setHighlightKey,
    },
    descriptions: {
      descriptions: descriptions,
      setDescriptions: setDescriptions,
    },
  } as const;
};

export function useConfiguration() {
  const ctx = useContext(ConfigurationContext);
  if (!ctx) throw new Error("Can not build tauri configuration context");
  return ctx;
}
