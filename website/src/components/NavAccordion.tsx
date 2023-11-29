import { Show, createEffect, createSignal } from "solid-js";

type Section = "products" | "blog" | "company" | "legal";

export const NavAccordion = () => {
  const [shouldBeAccordion, setShouldBeAccordion] = createSignal(false);
  const [activeSection, setActiveSection] = createSignal<Section>("products");

  createEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setShouldBeAccordion(true);
      } else {
        setShouldBeAccordion(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  });

  return (
    <div class="grid md:grid-cols-[1fr,1fr,1fr,1fr] gap-4">
      <div class="grid gap-2 content-start items-start">
        <button class="text-left" onClick={() => setActiveSection("products")}>
          Products & Services
        </button>
        <Show when={!shouldBeAccordion() || activeSection() === "products"}>
          <ul class="text-[#D9D9D9] grid gap-2 content-start items-start">
            {/* <li>Apeiron</li> */}
            <li>DevTools</li>
            <li>Security Auditing</li>
            <li>Consultation</li>
            <li>Distribution</li>
          </ul>
        </Show>
      </div>
      <div>
        <h3>Blog</h3>
      </div>
      <div class="grid gap-2 content-start items-start">
        <button class="text-left" onClick={() => setActiveSection("company")}>
          Company
        </button>
        <Show when={!shouldBeAccordion() || activeSection() === "company"}>
          <ul class="text-[#D9D9D9] grid gap-2 content-start items-start">
            <li>About</li>
            <li>Blog</li>
            <li>Case Studies</li>
            <li>Partners</li>
            <li>Careers</li>
          </ul>
        </Show>
      </div>
      <div class="grid gap-2 content-start items-start">
        <button class="text-left" onClick={() => setActiveSection("legal")}>
          Legal
        </button>
        <Show when={!shouldBeAccordion() || activeSection() === "legal"}>
          <ul class="text-[#D9D9D9] grid gap-2 content-start items-start">
            <li>Privacy Policy</li>
            <li>Cookie Policy</li>
            <li>Terms of Service</li>
          </ul>
        </Show>
      </div>
    </div>
  );
};
