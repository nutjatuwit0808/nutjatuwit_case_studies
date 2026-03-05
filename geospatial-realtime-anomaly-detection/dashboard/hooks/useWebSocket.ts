"use client";

import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import type { GpsUpdate, AlertPayload } from "@/types/websocket";
import { ALERT_RETENTION_COUNT, ALERT_HIGHLIGHT_MS } from "@/lib/constants";

export type { GpsUpdate, AlertPayload };

export function useWebSocket(url: string) {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [vehicles, setVehicles] = useState<Map<string, GpsUpdate>>(new Map());
  const [alerts, setAlerts] = useState<AlertPayload[]>([]);
  const [alertedIds, setAlertedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const socket = io(url, { autoConnect: true });
    socketRef.current = socket;

    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));

    socket.on("gps:update", (data: GpsUpdate) => {
      setVehicles((prev) => {
        const next = new Map(prev);
        next.set(data.vehicle_id, data);
        return next;
      });
    });

    socket.on("alert:new", (data: AlertPayload) => {
      setAlerts((prev) => [data, ...prev].slice(0, ALERT_RETENTION_COUNT));
      setAlertedIds((prev) => new Set(prev).add(data.vehicle_id));
      setTimeout(() => {
        setAlertedIds((p) => {
          const n = new Set(p);
          n.delete(data.vehicle_id);
          return n;
        });
      }, ALERT_HIGHLIGHT_MS);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [url]);

  return { connected, vehicles, alerts, alertedIds };
}
