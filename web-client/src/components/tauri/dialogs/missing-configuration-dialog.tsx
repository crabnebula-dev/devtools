import { Dialog } from "~/base-components/dialog";
import { BackToConfigButton } from "./back-to-config-button";

type Props = {
  config: string;
};

export function MissingConfigurationDialog(props: Props) {
  return (
    <Dialog
      title={'Could not find: "' + props.config + '"'}
      buttons={<BackToConfigButton />}
    >
      <p class="text-xl">
        We could not find configuration:{" "}
        <span class="text-red-500">{props.config}</span>
      </p>
      <p class="text-xl">Are you sure this is a valid configuration file?</p>
    </Dialog>
  );
}
