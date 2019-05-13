function noop() {}
var ConnectDescriptions = {
  0: "CONNECTING",
  1: "OPEN",
  2: "CLOSING",
  3: "CLOSED"
};
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
  
  /**
   * data: the object data to send
   * callback: (success:bool,e:{code:int,reason:string})
   */
  _.sendJson = function(data,callback) {
    _.send(JSON.stringify(data || {}),callback);
  };

  /**
   * text: the msg to send
   * callback: (success:bool,e:{code:int,reason:string})
   */
  _.send = function(text, callback) {
    if (ws && ws.readyState == WebSocket.OPEN) {
      ws.send(text);
      callback && callback(true);
    } else {
      var code = ws.readyState;
      callback && callback(false, { code, msg: ConnectDescriptions[code] });
    }
  };

  /**
   * code: the code to show
   * reason: the reason to show
   * callback: (success:bool,e:{code:int,reason:string})
   */
  _.close = function(code, reason, callback) {
    if (
      ws &&
      (ws.readyState != WebSocket.CLOSED || ws.readyState != WebSocket.CLOSING)
    ) {
      ws.close(code || 1000, reason);
      callback && callback(true);
    } else {
      callback &&
        callback(false, { code: 1005, msg: ConnectDescriptions[code] });
    }
  };
  _.open();
  return _;
}
