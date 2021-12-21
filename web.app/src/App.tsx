import React, { useState } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import Login from './views/Login';
import Hallway from './views/Hallway'
import Host from './views/Host';
import Viewer from './views/Viewer';

function App() {
  const navigate = useNavigate();
  const [accessToken, setAccessToken] = useState('');
  const [ws, setWs] = useState<WebSocket | null>(null);

  function onLogin(accessToken: string) {
    setAccessToken(accessToken);
    navigate('hallway');
  }

  function onConnection(ws: WebSocket, role: string) {
    setWs(ws);
    if (role === 'host') {
      navigate('room/host');
    }
    else {
      navigate('room/viewer');
    }
  }

  return (
    <div id='App'>
        <Routes>
          <Route path='/' element={<Login onLogin={onLogin}/>} />
          <Route path='/hallway' element={<Hallway accessToken={accessToken} onConnection={onConnection} />} />
          <Route path='/room/host' element={<Host ws={ws as WebSocket}/>} />
          <Route path='/room/viewer' element={<Viewer ws={ws as WebSocket}/>} />
        </Routes>
    </div>
  );
}

export default App;
