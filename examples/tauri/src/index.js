const test1 = document.getElementById("test1");
const spamTest = document.getElementById("spam-test");
const duplicationTest = document.getElementById("duplication-test");

window.__TAURI__.event.listen("from-window", (event) => {
  console.log("got from window event", event);
});

test1.onclick = function (e) {
  e.preventDefault();
  window.__TAURI__.core
    .invoke("test1", {
      url: "https://www.rust-lang.org",
      timeoutSeconds: Math.floor(Math.random() * 10),
    })
    .then(() => {
      console.log("done");
    });
};

spamTest.onclick = function (e) {
  e.preventDefault();

  const interval = setInterval(() => {
    window.__TAURI__.core.invoke("spam_test");
  }, 500);

  setTimeout(() => {
    clearInterval(interval);
  }, 5000);
};

duplicationTest.onclick = function (e) {
  e.preventDefault();
  window.__TAURI__.core.invoke("duplicate", { number: 1 });
  window.__TAURI__.core.invoke("duplicate", { number: 2 });
  window.__TAURI__.core.invoke("duplicate", { number: 3 });
  window.__TAURI__.core.invoke("duplicate", { number: 4 });
  window.__TAURI__.core.invoke("duplicate", { number: 5 });
  window.__TAURI__.core.invoke("duplicate", { number: 6 });
  window.__TAURI__.core.invoke("duplicate", { number: 7 });
  window.__TAURI__.core.invoke("duplicate", { number: 8 });
  window.__TAURI__.core.invoke("duplicate", { number: 9 });
  window.__TAURI__.core.invoke("duplicate", { number: 10 });
  window.__TAURI__.core.invoke("duplicate", { number: 11 });
  window.__TAURI__.core.invoke("duplicate", { number: 12 });
  window.__TAURI__.core.invoke("duplicate", { number: 13 });
  window.__TAURI__.core.invoke("duplicate", { number: 14 });
  window.__TAURI__.core.invoke("duplicate", { number: 15 });
};
