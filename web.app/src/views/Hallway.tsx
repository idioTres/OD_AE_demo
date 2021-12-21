import React from 'react';
import WebSocketAsPromised from 'websocket-as-promised';
import Card from '../components/Card';
import styles from './Hallway.module.css';

export interface HallwayProps {
  readonly accessToken?: string;
  readonly onConnection: (ws: WebSocket, role: string) => void;
};

const Hallway: React.FC<HallwayProps> = (props: HallwayProps) => {
  async function connectAs(role: string) {
    if (!props.accessToken) return;

    const accessToken = props.accessToken;
    const ws = new WebSocket(`ws://${window.location.hostname}:17002/?role=${role}`);
    ws.addEventListener('open', () => { ws.send(accessToken); });
    console.log(ws);
    props.onConnection(ws, role);
  }

  return (
    <div className={styles.Hallway}>
      {!props.accessToken && (
        <Card>
          <h3>잘못된 요청</h3>
          <p>무언가 잘못되었어요.</p>
          <p>엉뚱한 길로 왔나 본데요?</p>
        </Card>
      )}
      {props.accessToken && (
        <div className={styles.HallwayButtonFrame}>
          <div className={styles.HallwayButton} onClick={() => connectAs('host')}>
            Host
          </div>
          <div className={styles.HallwayButton} onClick={() => connectAs('viewer')}>
            Viewer
          </div>
        </div>
      )}
    </div>
  );
};

export default Hallway;
