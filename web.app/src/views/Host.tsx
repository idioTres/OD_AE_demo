import React, { useEffect, useRef, useState } from 'react';
import { Camera } from '../core/Camera';
import styles from './Host.module.css';

export interface HostProps {
  readonly ws: WebSocket;
};

const camera = new Camera();

const Host: React.FC<HostProps> = (props: HostProps) => {
  const [cameraList, setCameraList] = useState<MediaDeviceInfo[]>([]);

  async function updateCameraList() {
    setCameraList(await camera.getCameraList());
  }

  async function selectCameara(e: React.ChangeEvent<HTMLSelectElement>) {
    await camera.useCamera(e.target.value);
  }

  useEffect(() => {
    updateCameraList();

    props.ws.onmessage = ({data}: {data: string}) => {
      if (data.startsWith('M     IDLE')) {
        props.ws.send(camera.capture());
      }
    };

    props.ws.onerror = (e) => {
      console.log(e);
    };

    return () => {
      props.ws.onmessage = null;
    };
  });

  return (
    <div>
      <select name='camera-devide' onChange={selectCameara} onFocus={e => e.target.selectedIndex = -1}>
        {cameraList.map(device =>
          <option key={device.deviceId} value={device.deviceId}>{device.label + ' ' + device.deviceId}</option>)}
      </select>
      <button onClick={() => camera.capture()}/>
    </div>
  );
};

export default Host;
