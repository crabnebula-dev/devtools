const test1 = document.getElementById("test1");

window.__TAURI__.event.listen("from-window", (event) => {
  console.log("got from window event", event);
});

test1.onclick = function (e) {
  e.preventDefault();
  window
    .__TAURI__.core.invoke("test1", {
      url: "https://www.rust-lang.org",
      timeoutSeconds: Math.floor(Math.random() * 10),
    })
    .then(() => {
      console.log("done");
    });
};