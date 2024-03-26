import { createContext, useContext, JSXElement, createSignal } from "solid-js";

type CallsContextType = ReturnType<typeof makeCallsContext>;
const CallsContext = createContext<CallsContextType>();

export function CallsContextProvider(props: { children: JSXElement }) {
  const callsContext = makeCallsContext();
  return (
    <CallsContext.Provider value={callsContext}>
      {props.children}
    </CallsContext.Provider>
  );
}

function makeCallsContext() {
  const [granularity, setGranularity] = createSignal(1);

  return {
    granularity: {
      granularity,
      setGranularity,
    },
  };
}

export function useCalls() {
  const context = useContext(CallsContext);

  if (!context) throw new Error("Calls context could not be retrieved");

  return context;
}
