import {
  JSXElement,
  createContext,
  onCleanup,
  untrack,
  useContext,
} from "solid-js";
import { setup } from "~/lib/connection/transport";

type ProviderProps = {
  host: string;
  port: string;
  children: JSXElement;
};

const ConnectionContext = createContext<ReturnType<typeof setup>>();

export function useConnection() {
  const ctx = useContext(ConnectionContext);

  if (!ctx) throw new Error("can not find ConnectionContext.Provider");
  return ctx;
}

export function ConnectionProvider(props: ProviderProps) {
  const url = untrack(() => `http://${props.host}:${props.port}`);
  const connection = setup(url);

  onCleanup(() => {
    connection.connectionStore.abortController.abort();
  });

  return (
    <ConnectionContext.Provider value={connection}>
      {props.children}
    </ConnectionContext.Provider>
  );
}
