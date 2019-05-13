function noop() {}
export default function(url, opts) {
  opts = opts || {};
  var ws,
    num = 0,
    timeout = 1e3,
    timeoutRef = null,
    _ = {};
  _.open = function() {
    ws = new WebSocket(url, opts.protocols || []);
    ws.onmessage = opts.onmessage || noop;
    ws.onopen = function(e) {
      (opts.onopen || noop)(e);
      num = 0;
    };
    ws.onclose = function(e) {
      _.reconnect(e);
      (opts.onclose || noop)(e);
    };
    ws.onerror = function(e) {
      _.reconnect(e);
      (opts.onerror || noop)(e);
    };
  };
  _.reconnect = function(e) {
    var max = opts.maxAttempts || Infinity;
    if (num++ < max) {
      timeoutRef && clearTimeout(timeoutRef);
      timeoutRef = setTimeout(function() {
        (opts.onreconnect || noop)(e);
        _.open();
      }, opts.timeout || timeout);
    } else {
      (opts.onmaximum || noop)(e);
    }
  };
  _.sendJson = function(data) {
    _.send(JSON.stringify(data || {}));
  };
  _.send = function(text, callback) {
    var desc = {
      0: "CONNECTING",
      1: "OPEN",
      2: "CLOSING",
      3: "CLOSED"
    };
    if (ws && ws.readyState == WebSocket.OPEN) {
      ws.send(text);
      callback && callback(true);
    } else {
      var code = ws.readyState;
      callback && callback(false, { code, reason: desc[code] });
    }
  };
  _.close = function(code, reason) {
    ws.close(code || 1005, reason);
  };
  _.open();
  return _;
}
