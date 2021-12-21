import React, { useEffect, useState } from 'react';
import styles from './Viewer.module.css';
import Card from '../components/Card';

export interface ViewerProps {
  readonly ws: WebSocket;
}

const Viewer: React.FC<ViewerProps> = (props: ViewerProps) => {
  const [b64img, setb64img] = useState('');

  useEffect(() => {
    props.ws.onmessage = ({data}) => {
      setb64img('data:image/png;base64,' + data);
    }

    return () => {
      props.ws.onmessage = null;
    };
  });

  return (
    <div className={styles.Viewer}>
      <Card>
        <img src={b64img}></img>
      </Card>
    </div>
  );
};

export default Viewer;
