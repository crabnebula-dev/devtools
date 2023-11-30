import { Match, Show, Switch, createSignal } from "solid-js";
import { BurgerIcon } from "./BurgerIcon";
import { NavAccordion } from "./NavAccordion";
import { CloseBurgerIcon } from "./CloseBurgerIcon";

export const MobileNav = () => {
  const [isActive, setIsActive] = createSignal(false);

  const toggle = () => {
    setIsActive(!isActive());
  };

  return (
    <>
      <button class="lg:hidden" onClick={() => toggle()}>
        <Switch>
          <Match when={isActive()}>
            <CloseBurgerIcon />
          </Match>
          <Match when={!isActive()}>
            <BurgerIcon />
          </Match>
        </Switch>
      </button>
      <Show when={isActive()}>
        <div
          onclick={() => setIsActive(false)}
          class="fixed z-10 px-4 py-8 top-[104px] left-0 w-full h-[calc(100vh-104px)] bg-black bg-opacity-90 backdrop-blur-xl"
        >
          <NavAccordion />
        </div>
      </Show>
    </>
  );
};
