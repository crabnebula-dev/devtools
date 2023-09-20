import { useSocketData } from "~/lib/ws-store";

export default function Performance() {
  const { data } = useSocketData();

  return (
    <ul>
      <li>
        Initialized:{" "}
        {new Date(data.perf?.initialized_at as number).toISOString()}
      </li>
      <li>Ready: {new Date(data.perf?.ready_at as number).toISOString()}</li>
      <li>
        Elapsed time:{" "}
        {(data.perf?.ready_at as number) -
          (data.perf?.initialized_at as number)}
        ms
      </li>
    </ul>
  );
}
