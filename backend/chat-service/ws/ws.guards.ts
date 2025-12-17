import type { WebSocket } from "ws";
import type { WSContext } from "./ws.types";

export function isWSContext(ws: WebSocket): ws is WSContext {
  return (ws as WSContext).isAlive !== undefined;
}
