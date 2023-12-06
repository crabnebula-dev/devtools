import { Dialog } from "~/base-components/dialog";
import { BackToConfigButton } from "./back-to-config-button";

type Props = {
  config: string;
  selectedParameter: string;
};

export function MissingConfigurationParameterDialog(props: Props) {
  return (
    <Dialog
      title={
        'Could not find key: "' +
        props.selectedParameter +
        '" in ' +
        props.config
      }
      buttons={<BackToConfigButton backPath={props.config} />}
    >
      <p class="text-xl">
        We could not find a configuration parameter with this key:{" "}
        <span class="text-red-500">{props.selectedParameter}</span> in this
        configuration: <span class="text-green-500">{props.config}</span>
      </p>
      <p class="text-xl">
        Are you sure this key is present in your configuration?
      </p>
    </Dialog>
  );
}
