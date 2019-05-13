# js-websoket: A gracefull wrapped usage of websocket!

## Usage

Unlike `WebSocket`, you should declare all event listeners on initialization:

```js
import SocketWrapper from "../src/index.js";

const ws = new SocketWrapper("ws://localhost:3001", {
  timeout: 5e3,
  maxAttempts: 10,
  onopen: e => console.log("Connected!", e),
  onmessage: e => console.log("Received:", e),
  onreconnect: e => console.log("Reconnecting...", e),
  onmaximum: e => console.log("Stop Attempting!", e),
  onclose: e => console.log("Closed!", e),
  onerror: e => console.log("Error:", e)
});

ws.send("Hello, world!", (success, e) => {
  if (success) {
    console.log("success send");
  } else {
    const { code, msg } = e;
    console.log(`fail send,code:${code},msg:${msg}`);
  }
});

ws.sendJson({ type: "ping" }, (success, e) => {
  if (success) {
    console.log("success sendJson");
  } else {
    const { code, msg } = e;
    console.log(`fail sendJson,code:${code},msg:${msg}`);
  }
});

setTimeout(() => {
  ws.close();
}, 2000);

setTimeout(() => {
  ws.reconnect();
}, 5000);
```
