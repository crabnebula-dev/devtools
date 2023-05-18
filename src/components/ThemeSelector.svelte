<!-- import { useEffect, useState } from "preact/hooks";
import type { FunctionalComponent } from "preact";

export default function ThemeToggle(): FunctionalComponent {
  const [theme, setTheme] = useState(localStorage.getItem("theme") ?? "light");

  useEffect(() => {
    
  }, [theme]);

  return (
    <button onClick={handleClick}>{}</button>
  );
} -->

<script lang="ts">
    let theme = localStorage.getItem("theme") ?? "light";

    if (theme === "dark") {
        document.documentElement.classList.add("dark");
    } else {
        document.documentElement.classList.remove("dark");
    }

    function handleClick() {
        theme = theme === "light" ? "dark" : "light";
        
        localStorage.setItem("theme", theme);
    }
</script>

<button on:click={handleClick}>{theme === "light" ? "🌙" : "🌞"}</button>
