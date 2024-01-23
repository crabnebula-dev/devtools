import { FileType } from "~/lib/sources/file-entries.ts";
import { SplitPane } from "~/components/split-pane";
import { Directory } from "~/components/sources/directory.tsx";
import { SourcePane } from "~/components/sources/source-pane";
import { useMonitor } from "~/context/monitor-provider";
import { Show } from "solid-js";

export default function Sources() {
  const { monitorData } = useMonitor();

  return (
    <SplitPane
      defaultPrefix="sources"
      initialSizes={[22, 78]}
      defaultMinSizes={[70, 200]}
    >
      <div class="relative h-full">
        <div class="overflow-hidden relative">
          <Directory
            defaultPath="."
            defaultSize={0n}
            defaultFileType={FileType.DIR}
          />
        </div>
        <Show when={monitorData.health === 0}>
          <div class="absolute inset-0 flex items-center justify-center bg-opacity-70 bg-black">
            <h2 class="text-white text-2xl font-bold text-center p-3">
              App currently disconnected
            </h2>
          </div>
        </Show>
      </div>

      <SourcePane />
    </SplitPane>
  );
}
