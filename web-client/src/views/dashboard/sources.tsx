import { FileType } from "~/lib/sources/file-entries.ts";
import { SplitPane } from "~/components/split-pane";
import { Directory } from "~/components/sources/directory.tsx";
import { SourcePane } from "~/components/sources/source-pane";

export default function Sources() {
  return (
    <SplitPane
      defaultPrefix="sources"
      leftPaneComponent={
        <div class="border-neutral-800 border-r-2 h-full overflow-y-auto">
          <Directory
            defaultPath=""
            defaultSize={0n}
            defaultFileType={FileType.DIR}
          />
        </div>
      }
      rightPaneComponent={
        <div class="overflow-y-auto h-full">
          <SourcePane />
        </div>
      }
    />
  );
}
