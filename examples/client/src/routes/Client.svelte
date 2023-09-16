<script lang="ts">
  import { onMount } from "svelte";
  import { Tabs, Tab, TabList, TabPanel } from "svelte-tabs";
  import { JsonView } from "@zerodevx/svelte-json-view";

  interface Message {
    status: "sent" | "received";
    message: any;
  }

  interface Duration {
    secs: number;
    nanos: number;
  }

  interface Log {}

  interface Span {
    id: number;
    timestamp: number;
    level: "ERROR" | "WARN" | "INFO" | "DEBUG" | "TRACE";
    target: string;
    module_path: string;
    file: string;
    line: number;
    fields: Record<string, string>;
    name: string;
    total_duration: Duration;
    busy_duration: Duration;
    idle_duration: Duration;
    nodes: (Log | Span)[];
  }

  let messageList: Message[] = [];
  let spans: Span[] = [];
  let logs: string[] = [];

  let socketStatus = { status: "", message: "" };
  let logsBtn: HTMLElement;
  let logsUnwatchBtn: HTMLElement;
  let spansBtn: HTMLElement;
  let closeBtn: HTMLElement;
  let spansUnwatchBtn: HTMLElement;
  let tauriConfigBtn: HTMLElement;
  let getMetricsBtn: HTMLElement;

  let socket;
  let currentLogSubscription = null;
  let currentSpanSubscription = null;

  let messagePlaceholder = { jsonrpc: "2.0", id: 1, method: "", params: {} };
  let message = {};

  onMount(() => {
    const rpcApiUrl = window.location.hash.slice(1);

    // Create a new WebSocket.
    socket = new WebSocket(`ws://${rpcApiUrl}`);
    let currentLogSubscription = null;
    let currentSpanSubscription = null;

    // Handle any errors that occur.
    socket.onerror = function (error) {
      console.log("WebSocket Error: " + error);
    };

    // Show a connected message when the WebSocket is opened.
    socket.onopen = function (event) {
      socketStatus.message = "Connected to: " + event.currentTarget.url;
      socketStatus.status = "open";
      closeBtn.style.display = "inline-block";
    };

    // Handle messages sent by the server.
    socket.onmessage = function (event) {
      const message = JSON.parse(event.data);

      if (message.id === "spans_watch") {
        currentSpanSubscription = message.result;
        spansBtn.style.display = "none";
        spansUnwatchBtn.style.display = "inline-block";
      }

      if (message.id === "spans_unwatch") {
        currentLogSubscription = undefined;
        spansBtn.style.display = "inline-block";
        spansUnwatchBtn.style.display = "none";
      }

      // unique id from our message
      if (message.id === "logs_watch") {
        currentLogSubscription = message.result;
        logsBtn.style.display = "none";
        logsUnwatchBtn.style.display = "inline-block";
      }

      if (message.id === "logs_unwatch") {
        currentLogSubscription = undefined;
        logsBtn.style.display = "inline-block";
        logsUnwatchBtn.style.display = "none";
      }

      if (message.method === "logs_added") {
        message.params.result.forEach((element) => {
          const {
            timestamp,
            message: logMessage,
            target,
            level,
            file,
            line,
            span,
            fields,
          } = element;

          const timestampHuman = new Date(timestamp).toLocaleString();

          logs = [
            ...logs,
            `${timestampHuman} ${level} ${target} ${logMessage} (span = ${span}) (fields = ${JSON.stringify(
              fields
            )})`,
          ];

          const logsField = document.getElementById("logsField");
          if (logsField) {
            logsField.scrollTop = logsField.scrollHeight;
          }
        });
      } else if (message.method === "spans_added") {
        message.params.result.forEach((element) => {
          spans = [...spans, element];
        });
      } else {
        messageList = [
          ...messageList,
          {
            status: "received",
            message: message,
          },
        ];
      }
    };

    // Show a disconnected message when the WebSocket is closed.
    socket.onclose = function (event) {
      socketStatus.message = "Disconnected from Inspector protocol.";
      socketStatus.status = "closed";
      closeBtn.style.display = "none";
      logsUnwatchBtn.style.display = "none";
      logsBtn.style.display = "inline-block";
    };
  });

  // Send a message when the form is submitted.
  function onSubmit(e) {
    e.preventDefault();

    // Send the message through the WebSocket.
    socket.send(JSON.stringify(message));

    // Add the message to the messages list.
    messageList = [
      ...messageList,
      {
        status: "sent",
        message,
      },
    ];

    // Clear out the message field.
    message = {};

    return false;
  }

  // Close the WebSocket connection when the close button is clicked.
  function close(e) {
    e.preventDefault();

    // Close the WebSocket.
    socket.close();

    return false;
  }

  function watchLog(e) {
    e.preventDefault();

    message = {
      jsonrpc: "2.0",
      // unique id could be used to match async result
      id: "logs_watch",
      method: "logs_watch",
      params: {},
    };

    return false;
  }

  function watchSpan(e) {
    e.preventDefault();

    message = {
      jsonrpc: "2.0",
      // unique id could be used to match async result
      id: "spans_watch",
      method: "spans_watch",
      params: {},
    };

    return false;
  }

  function getTauriConfig(e) {
    e.preventDefault();

    message = {
      jsonrpc: "2.0",
      // unique id could be used to match async result
      id: 1,
      method: "tauri_getConfig",
      params: {},
    };

    return false;
  }

  function unwatchLog(e) {
    e.preventDefault();

    message = {
      jsonrpc: "2.0",
      // unique id could be used to match async result
      id: "logs_unwatch",
      method: "logs_unwatch",
      params: [currentLogSubscription],
    };

    return false;
  }

  function unwatchSpan(e) {
    e.preventDefault();

    message = {
      jsonrpc: "2.0",
      // unique id could be used to match async result
      id: "spans_unwatch",
      method: "spans_unwatch",
      params: [currentSpanSubscription],
    };

    return false;
  }

  function getMetrics(e) {
    e.preventDefault();

    message = {
      jsonrpc: "2.0",
      // unique id could be used to match async result
      id: "metrics",
      method: "performance_getMetrics",
      params: {},
    };

    return false;
  }
</script>

<div id="page-wrapper">
  <div>
    <div class={socketStatus.status}>{socketStatus.message}</div>
    <button
      type="button"
      id="closeBtn"
      bind:this={closeBtn}
      on:click={close}
      class="small-button"
    >
      Close Connection
    </button>
  </div>

  <ul>
    {#each messageList as message}
      <li class={message.status}>
        <JsonView json={message.message} />
      </li>
    {/each}
  </ul>

  <Tabs>
    <TabList>
      <Tab>Logs</Tab>
      <Tab>Spans</Tab>
    </TabList>

    <TabPanel>
      <textarea id="logsField" value={logs.join("\n")} placeholder="Logs" />
    </TabPanel>

    <TabPanel>
      <ul>
        {#each spans as span}
          <li class="received">
            <JsonView json={span} />
          </li>
        {/each}
      </ul>
    </TabPanel>
  </Tabs>

  <form id="message-form" on:submit={onSubmit} action="#" method="post">
    <textarea
      id="message"
      value={JSON.stringify(message)}
      placeholder={JSON.stringify(messagePlaceholder)}
      required
    />
    <button type="submit">Send call</button>
    <div style="margin-top: 1em">
      <h4>API Commands</h4>
      <button type="button" id="logsBtn" bind:this={logsBtn} on:click={watchLog}
        >Subscribe logs</button
      >
      <button
        type="button"
        id="logsUnwatchBtn"
        bind:this={logsUnwatchBtn}
        on:click={unwatchLog}
        style="display: none"
      >
        Unsubscribe logs
      </button>
      <button
        type="button"
        id="spansBtn"
        bind:this={spansBtn}
        on:click={watchSpan}>Subscribe spans</button
      >
      <button
        type="button"
        id="spansUnwatchBtn"
        bind:this={spansUnwatchBtn}
        on:click={unwatchSpan}
        style="display: none"
      >
        Unsubscribe spans
      </button>
      <button
        type="button"
        id="tauriConfigBtn"
        bind:this={tauriConfigBtn}
        on:click={getTauriConfig}>Tauri config</button
      >
      <button
        type="button"
        id="getMetricsBtn"
        bind:this={getMetricsBtn}
        on:click={getMetrics}>Performance</button
      >
    </div>
  </form>
</div>

<style>
  #page-wrapper {
    width: 80vw;
    background: #fff;
    padding: 1em;
    margin: 1em auto;
    border-top: 5px solid #5fe5f5;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.8);
  }

  h1 {
    margin-top: 0;
  }

  #status {
    display: inline-block;
    font-size: 0.9rem;
    margin-bottom: 1rem;
  }

  #closeBtn {
    display: none;
  }

  #logsField {
    font-size: 0.7rem;
    min-height: 20vh;
  }

  #message {
    font-size: 1rem;
    min-height: 5vh;
  }

  .open {
    color: #e100a3;
  }

  .closed {
    color: red;
  }

  ul {
    list-style: none;
    margin: 0;
    padding: 0;
    font-size: 0.95rem;
  }

  ul li {
    padding: 0.5rem 0.75rem;
    border-bottom: 1px solid #eee;
  }

  ul li:first-child {
    border-top: 1px solid #eee;
  }

  ul li span {
    display: inline-block;
    width: 90px;
    font-weight: bold;
    color: #999;
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .sent {
    background-color: #f7f7f7;
  }

  .received {
  }

  #message-form {
    margin-top: 1.5rem;
  }

  textarea {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #d9d9d9;
    border-radius: 3px;
    box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.1);
    margin-bottom: 1rem;
  }

  button {
    display: inline-block;
    border-radius: 3px;
    border: none;
    font-size: 0.9rem;
    padding: 0.6rem 1em;
    color: white;
    margin: 0 0.25rem;
    text-align: center;
    background: #bababa;
    border-bottom: 1px solid #999;
  }

  .small-button {
    font-size: 0.5rem;
    padding: 0.3rem 0.8em;
    margin: 0 0.2rem;
  }

  button[type="submit"] {
    background: #86b32d;
    border-bottom: 1px solid #5d7d1f;
  }

  button:hover {
    opacity: 0.75;
    cursor: pointer;
  }
</style>
