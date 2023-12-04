/*  This code is taken from: https://raqueebuddinaziz.com/blog/3-patterns-to-write-better-and-more-readable-solidjs-components 
    Written by: raqueebuddin aziz */
import { children, Component, createComputed, JSXElement, on } from "solid-js";
import { createStore } from "solid-js/store";

export const getSlots = (_children: JSXElement) => {
  const parts = children(() => _children);
  const [slots, setSlots] = createStore<Record<string, JSXElement>>({});
  createComputed(
    on(parts, () => {
      const defaultParts: JSXElement[] = [];
      for (const part of parts.toArray() as unknown as SlotProps[]) {
        if (!part.name) {
          defaultParts.push(part);
          continue;
        }
        setSlots(part.name, () => part.children);
      }
      setSlots("default", defaultParts);
    })
  );
  return slots;
};

interface SlotProps {
  name: string;
  children: JSXElement;
}
export const Slot: Component<SlotProps> = (props) => {
  return props as unknown as JSXElement;
};
