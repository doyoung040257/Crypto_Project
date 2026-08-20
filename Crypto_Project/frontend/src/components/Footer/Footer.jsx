import React from 'react';
import styles from './Footer.module.css';

export default function Footer(){
    return(
        <footer className={styles.footer}>
        <div className={styles.brand}>Crypto Project</div>
        <p>© 2025 compile. All rights reserved.</p>
        </footer>
    )
}