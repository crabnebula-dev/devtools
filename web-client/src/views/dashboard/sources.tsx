import { Entry } from "~/lib/proto/sources.ts";
import { FileType } from "~/lib/sources/file-entries.ts";
import { SplitPane } from "~/components/split-pane";
import { Directory } from "~/components/sources/directory.tsx";
import { SourcePane } from "../../components/sources/source-pane";

export default function Sources() {
  const root: Entry = { path: "", size: 0n, fileType: FileType.DIR };

  return (
    <SplitPane
      prefix=/*@once*/ "sources"
      leftPaneComponent={
        <div class="border-neutral-800 border-r-2 h-full overflow-y-auto">
          <Directory entry={root} />
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
