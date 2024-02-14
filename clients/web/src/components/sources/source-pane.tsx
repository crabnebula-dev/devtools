import { UnknownView } from "~/components/sources/unknown-view.tsx";
import { ImageView } from "~/components/sources/image-view.tsx";
import { Match, Show, Suspense, Switch } from "solid-js";
import { useParams, useSearchParams } from "@solidjs/router";
import { decodeFileName, guessContentType } from "~/lib/sources/file-entries";
import CodeView from "./code-view";
import { Loader } from "~/components/loader";
import { HighlighterLang } from "~/lib/code-highlight";
import { Heading } from "../heading";

export function SourcePane() {
  const params = useParams<Record<"source", string>>();
  const filePath = () => decodeFileName(params.source);
  const [searchParams] = useSearchParams();

  const contentType = () => guessContentType(filePath());
  const sizeHint = () => parseInt(searchParams.sizeHint);

  return (
    <Show
      when={params.source}
      keyed
      fallback={
        <div class="h-full grid gap-4 text-center content-center justify-center items-center border-l p-4 border-gray-800">
          <Heading>No File Selected</Heading>
          &larr; Use the sidebar to get started.
        </div>
      }
    >
      <Suspense fallback={<Loader />}>
        <Show when={contentType()} fallback={<UnknownView path={filePath()} />}>
          {(resolvedContentType) => (
            <Switch fallback={<UnknownView path={filePath()} />}>
              <Match when={resolvedContentType().startsWith("code/")} keyed>
                <CodeView
                  path={filePath()}
                  size={sizeHint()}
                  lang={
                    resolvedContentType().replace(
                      "code/",
                      "",
                    ) as HighlighterLang
                  }
                />
              </Match>
              <Match when={resolvedContentType().startsWith("image/")} keyed>
                <ImageView
                  path={filePath()}
                  size={sizeHint()}
                  type={resolvedContentType().replace("image/", "")}
                />
              </Match>
            </Switch>
          )}
        </Show>
      </Suspense>
    </Show>
  );
}
