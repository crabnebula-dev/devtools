import {
  JSXElement,
  createContext,
  onCleanup,
  untrack,
  useContext,
  createResource,
  Show,
  Suspense,
} from "solid-js";
import { ErrorRoot } from "~/components/errors/error-root";
import { setup, checkConnection } from "~/lib/connection/transport";
import { Loader } from "~/components/loader";

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

  const fetchConnection = async () => {
    const ping = (await checkConnection(url)).status;

    if (!(ping === "success")) {
      return undefined;
    }

    return setup(url);
  };

  const [connection] = createResource(fetchConnection);

  onCleanup(() => {
    if (connection.state === "ready")
      connection()?.connectionStore.abortController.abort();
  });

  return (
    <Suspense fallback={<Loader />}>
      <Show
        when={connection()}
        fallback={
          <ErrorRoot
            error={"Connection could not be established"}
            type="connectionFailedError"
          />
        }
      >
        {(resolvedConnection) => (
          <ConnectionContext.Provider value={resolvedConnection()}>
            {props.children}
          </ConnectionContext.Provider>
        )}
      </Show>
    </Suspense>
  );
}
