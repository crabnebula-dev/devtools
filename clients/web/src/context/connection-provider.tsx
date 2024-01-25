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
    <Suspense
      fallback={
        <div class="absolute right-1/2 bottom-1/2  transform translate-x-1/2 translate-y-1/2 ">
          <div class="border-t-transparent border-solid animate-spin  rounded-full dark:text-gray-600 fill-navy-700 border-8 h-64 w-64" />
        </div>
      }
    >
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
