import React, { useState } from 'react';
import styles from './Login.module.css';
import Card from '../components/Card';
import TextInput from '../components/TextInput'

interface LoginProps {
  readonly onLogin?: (accessToken: string) => void;
}

const Login: React.FC<LoginProps> = (props: LoginProps) => {
  const [authKey, setAuthKey] = useState('');
  const [isInvalidAuthKey, setIsInvalidAuthKey] = useState(false);

  async function authenticate() {
    const res = await fetch(
      `http://${window.location.hostname}:17001/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({token: authKey}),
      }
    );

    if (res.status === 201) {
      const accessToken = (await res.json())['access_token'];
      props.onLogin && props.onLogin(accessToken);
    }
    else {
      setIsInvalidAuthKey(true);
    }
  }

  function handleKeyUp(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') authenticate();
  }

  return (
    <div className={styles.Login}>
      <Card>
        <div className={styles.LoginCard}>
          {!isInvalidAuthKey && (
            <>
              <h3>안녕하세요</h3>
              <p>소개론 세 얼간이 팀의 데모 시연을 위한 웹 애플리케이션이예요.</p>
              <p>계속하여 진행하기 위한 인증키를 입력해주시겠어요?</p>
            </>
          )}
          {isInvalidAuthKey && (
            <>
              <h3>저런!</h3>
              <p>인증키가 잘못되었나 본데요?</p>
              <p>많이 피곤하신가봐요.</p>
            </>
          )}
          <br />
          <TextInput
            desc='인증키'
            onChange={e => setAuthKey(e.target.value)}
            onKeyUp={handleKeyUp}
            />
        </div>
      </Card>
    </div>
  );
}

export default Login;
