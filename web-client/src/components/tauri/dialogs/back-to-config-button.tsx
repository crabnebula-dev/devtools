import { getTauriTabBasePath } from "~/lib/tauri/tauri-conf-schema";
import { A } from "@solidjs/router";

type Props = {
  backPath?: string;
};

export function BackToConfigButton(props: Props) {
  const tauriBasePath = getTauriTabBasePath();
  return (
    <A
      href={tauriBasePath + "/" + (props.backPath ? props.backPath + "/" : "")}
      class="border border-neutral-400 hover:bg-neutral-800 hover:border-neutral-100 text-white text-lg py-2 px-4 rounded focus:outline-dashed focus:outline-white focus:outline-offset-2"
    >
      Back to Config
    </A>
  );
}
