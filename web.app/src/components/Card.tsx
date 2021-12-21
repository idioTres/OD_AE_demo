import React from 'react';
import styles from './Card.module.css';

const Card: React.FC = (props) => {
  return (
    <div className={styles.CardContainer}>
      <div className={styles.Card}>
        {props.children}
      </div>
    </div>
  );
};

export default Card;
