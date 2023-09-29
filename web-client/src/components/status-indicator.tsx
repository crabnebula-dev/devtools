type Props = {
  status: "on" | "off";
};
export const StatusIndicator = (props: Props) => {
  let className = "bg-gray-500";

  if (props.status === "on") {
    className = "bg-emerald-500";
  }
  return <div class={`${className} rounded-full w-2 h-2`}></div>;
};
