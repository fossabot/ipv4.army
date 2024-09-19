import initData from "./initData.ts";
import Socket from "./socket.ts";
import listeners from "./listeners.ts";
import { send } from "./sse.ts";

const ws = new Socket( // Yes, this can be hardcoded.
  "wss://app.hyperate.io/socket/websocket?token=wv39nM6iyrNJulvpmMQrimYPIXy2dVrYRjkuHpbRapKT2VSh65ngDGHdCdCtmEN9"
);

let hrInterval;

const setHRInterval = () => {
  hrInterval = setInterval(() => {
    initData.heartrate = { hr: "Inactive" };
    for (const listener of listeners) {
      send(listener, { type: "heartrate", data: "Inactive" });
    }
  }, 6000);
};

ws.onopen = () => {
  ws.send(
    JSON.stringify({
      topic: `hr:0BCA`,
      event: "phx_join",
      payload: {},
      ref: 0,
    })
  );

  setInterval(() => {
    ws.send(
      JSON.stringify({
        topic: "phoenix",
        event: "heartbeat",
        payload: {},
        ref: 0,
      })
    );
  }, 10000);

  setHRInterval();
};

ws.onmessage = ({ data }) => {
  let { event, payload } = JSON.parse(data);
  switch (event) {
    case "hr_update": {
      initData.heartrate = payload;
      clearInterval(hrInterval);
      setHRInterval();
      for (const listener of listeners) {
        send(listener, { type: "heartrate", data: payload.hr });
      }
      break;
    }
  }
};
