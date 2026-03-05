import {
  WebSocketGateway as WsGateway,
  WebSocketServer,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

@WsGateway({
  cors: { origin: '*' },
})
export class WebSocketGatewayService implements OnGatewayInit {
  @WebSocketServer()
  server!: Server;

  afterInit() {
    console.log('WebSocket gateway ready at /ws');
  }

  broadcastGps(data: {
    vehicle_id: string;
    lat: number;
    lng: number;
    speed: number;
    timestamp: number;
  }) {
    this.server?.emit('gps:update', data);
  }

  broadcastAlert(data: {
    vehicle_id: string;
    lat: number;
    lng: number;
    speed: number;
    timestamp: number;
    anomaly_types: string[];
  }) {
    this.server?.emit('alert:new', data);
  }
}
