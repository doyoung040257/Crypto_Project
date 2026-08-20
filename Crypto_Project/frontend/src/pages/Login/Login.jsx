import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import styles from './Login.module.css';

export default function Login() {
    const [formData, setFormData] = useState({ userId: '', password: '' });
    const [loginError, setLoginError] = useState('');
    const navigate = useNavigate();
    const { login } = useContext(AuthContext); // Context에서 login 함수 가져오기

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoginError('');

        if (!formData.userId || !formData.password) {
            setLoginError('아이디와 비밀번호를 모두 입력해 주세요.');
            return;
        }

        if (formData.password.length < 8) {
            setLoginError('비밀번호는 최소 8자 이상이어야 합니다.');
            return;
        }

        try {
            const response = await fetch('http://localhost:8080/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    loginId: formData.userId,
                    password: formData.password
                })
            });

            if (response.ok) {
                const data = await response.json();

                // Context 상태 업데이트
                login(data);

                alert(`✅ 로그인 성공! ${data.realName}님 환영합니다.`);
                navigate('/');
            } else {
                const errorData = await response.json().catch(() => ({}));
                setLoginError(errorData.message || '아이디 또는 비밀번호가 일치하지 않습니다.');
            }
        } catch (error) {
            console.error('API 통신 오류:', error);
            setLoginError('네트워크 오류가 발생했습니다. 서버(8080)를 확인해 주세요.');
        }
    };

    return (
        <div className={styles.loginPage}>
            <div className={styles.loginContainer}>
                <h1 className={styles.title}>로그인</h1>
                <p className={styles.subtitle}>서비스를 이용하시려면 로그인해 주세요.</p>

                <form className={styles.loginForm} onSubmit={handleSubmit}>
                    <div className={styles.sectionLabel}>계정 정보</div>
                    
                    <div className={styles.formGroup}>
                        <label htmlFor="userId">아이디</label> 
                        <input 
                            type="text" 
                            id="userId" 
                            name="userId" 
                            placeholder="아이디를 입력해 주세요" 
                            value={formData.userId} 
                            onChange={handleChange} 
                            required 
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="password">비밀번호</label>
                        <input 
                            type="password" 
                            id="password" 
                            name="password" 
                            placeholder="비밀번호를 입력해 주세요" 
                            value={formData.password} 
                            onChange={handleChange} 
                            required 
                        />
                    </div>
                    
                    {loginError && <p className={styles.errorMessage}>{loginError}</p>}
                    
                    <button type="submit" className={styles.loginBtn}>로그인</button>
                </form>
                
                <div className={styles.extraLinks}>
                    <span>계정이 없으신가요? </span>
                    <Link to="/signup" className={styles.signupLink}>회원가입</Link> 
                </div>
            </div>
        </div>
    );
}
