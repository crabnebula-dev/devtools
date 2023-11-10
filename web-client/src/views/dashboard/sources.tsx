import { Match, onMount, Show, Suspense, Switch } from "solid-js";
import { Entry } from "~/lib/proto/sources.ts";
import { useParams, useSearchParams } from "@solidjs/router";
import { FileType, guessContentType } from "~/lib/sources/util.ts";
import Directory from "~/components/sources/directory.tsx";
import { UnknownView } from "~/components/sources/unknown-view.tsx";
import CodeView from "~/components/sources/code-view.tsx";
import { ImageView } from "~/components/sources/image-view.tsx";
import Split from "split.js";

export default function Sources() {
  const root: Entry = { path: "", size: 0n, fileType: FileType.DIR };
  const params = useParams();

  const [searchParams] = useSearchParams();
  const contentType = () => guessContentType(params.path);
  const sizeHint = () => parseInt(searchParams.sizeHint);

  const splitGutterSizeKey = "sources-split-size";
  const storedSizes = localStorage.getItem(splitGutterSizeKey);
  let sizes = [200, 800];

  if (storedSizes) {
    sizes = JSON.parse(storedSizes);
  }

  onMount(() => {
    Split(["#tree", "#source"], {
      sizes: sizes,
      minSize: [70, 200],
      gutterSize: 20,
      onDragEnd: function (sizes) {
        localStorage.setItem(splitGutterSizeKey, JSON.stringify(sizes));
      },
    });
  });

  return (
    <div class={"split flex h-full overflow-y-hidden"}>
      <div id="tree" class={"border-neutral-800 border-r-2"}>
        <Directory entry={root} />
      </div>
      <div id="source">
        <Show when={params.path && searchParams.sizeHint}>
          <Suspense fallback={<span>Loading...</span>}>
            <Switch fallback={<UnknownView path={params.path} />}>
              <Match when={contentType()?.startsWith("code/")}>
                <CodeView
                  path={params.path}
                  size={sizeHint()}
                  lang={contentType()!.replace("code/", "")}
                />
              </Match>
              <Match when={contentType()?.startsWith("image/")}>
                <ImageView
                  path={params.path}
                  size={sizeHint()}
                  type={contentType()!.replace("image/", "")}
                />
              </Match>
            </Switch>
          </Suspense>
        </Show>
      </div>
    </div>
  );
}
