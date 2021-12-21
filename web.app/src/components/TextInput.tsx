import React, { useRef, useState } from 'react';
import styles from './TextInput.module.css';

export interface TextInputProps {
  readonly desc?: string;
  readonly onKeyUp?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  readonly onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const TextInput: React.FC<TextInputProps> = (props: TextInputProps) => {
  const [isEmpty, setIsEmpty] = useState(true);
  const [isFocused, setIsFocused] = useState(false);
  const inputElRef = useRef<HTMLInputElement>(null);

  function onBlur() {
    setIsEmpty(!inputElRef.current?.value);
    setIsFocused(false);
  }

  const classNames = [
    styles.TextInput,
    (isEmpty ? styles.empty : ''),
    (isFocused ? styles.focus : ''),
  ];

  return (
    <div className={classNames.join(' ')}>
      <input
       ref={inputElRef}
       type='text'
       onChange={props.onChange}
       onKeyUp={props.onKeyUp}
       onFocus={() => setIsFocused(true)}
       onBlur={onBlur}
       />
      {props.desc && <span className={styles.Tag}>{props.desc}</span>}
    </div>
  );
};

export default TextInput;
