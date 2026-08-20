import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Signup.module.css';

// 1. 비밀번호 유효성 검사 함수 (ESLint 경고 해결 버전)
const validatePassword = (password) => {
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    // [ ] / 앞의 불필요한 \ 제거
    const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]+/.test(password);
    const isLengthValid = password.length >= 8;

    if (!isLengthValid) return '비밀번호는 8자 이상이어야 합니다.';
    if (!(hasLetter && hasNumber && hasSpecial)) {
        return '영문, 숫자, 특수문자를 모두 포함해야 합니다.';
    }
    return '';
};

export default function Signup() {
    const [formData, setFormData] = useState({
        loginId: '',
        password: '',
        passwordConfirm: '',
        email: '',
        realName: '',
        phone: '',
        birthdate: '', // 소문자 birthdate 확인
        agreeAll: false,
        agreeService: false,
        agreePrivacy: false,
    });

    const [isLoginIdAvailable, setIsLoginIdAvailable] = useState(null);
    const [isEmailAvailable, setIsEmailAvailable] = useState(null);
    const [passwordValidMsg, setPasswordValidMsg] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (type === 'checkbox') {
            if (name === 'agreeAll') {
                setFormData({ ...formData, agreeAll: checked, agreeService: checked, agreePrivacy: checked });
            } else {
                const newState = { ...formData, [name]: checked };
                newState.agreeAll = newState.agreeService && newState.agreePrivacy;
                setFormData(newState);
            }
        } else {
            if (name === 'loginId') setIsLoginIdAvailable(null);
            if (name === 'email') setIsEmailAvailable(null);
            if (name === 'password') setPasswordValidMsg(validatePassword(value));
            setFormData({ ...formData, [name]: value });
        }
    };

    const checkAvailability = async (field) => {
        const value = formData[field];
        const fieldNameKr = field === 'loginId' ? '아이디' : '이메일';
        if (!value) {
            alert(`${fieldNameKr}를 입력해 주세요.`);
            return;
        }
        try {
            const response = await fetch(
                `http://localhost:8080/auth/check-${field}?${field}=${encodeURIComponent(value)}`
            );
            if (!response.ok) throw new Error('서버 응답 오류');
            const data = await response.json();
            if (data.available) {
                alert(`✅ 사용 가능한 ${fieldNameKr}입니다.`);
                field === 'loginId' ? setIsLoginIdAvailable(true) : setIsEmailAvailable(true);
            } else {
                alert(`❌ 이미 사용 중인 ${fieldNameKr}입니다.`);
                field === 'loginId' ? setIsLoginIdAvailable(false) : setIsEmailAvailable(false);
            }
        } catch (error) {
            console.error('중복확인 에러:', error);
            alert('서버 연결 오류가 발생했습니다.');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // 유효성 검사 (생략 없이 유지)
        if (!/^[가-힣]{2,5}$/.test(formData.realName)) { alert('성명은 한글 2~5자로 입력해 주세요.'); return; }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) { alert('이메일 형식이 올바르지 않습니다.'); return; }
        if (!/^\d{8}$/.test(formData.birthdate)) { alert('생년월일은 YYYYMMDD 형식으로 입력해 주세요.'); return; }
        if (!/^010-\d{4}-\d{4}$/.test(formData.phone)) { alert('연락처 형식이 올바르지 않습니다. (예: 010-1234-5678)'); return; }
        
        const passwordError = validatePassword(formData.password);
        if (passwordError) { alert(passwordError); return; }
        if (formData.password !== formData.passwordConfirm) { alert('비밀번호가 일치하지 않습니다.'); return; }
        if (isLoginIdAvailable !== true) { alert('아이디 중복 확인을 완료해 주세요.'); return; }
        if (isEmailAvailable !== true) { alert('이메일 중복 확인을 완료해 주세요.'); return; }
        if (!formData.agreeService || !formData.agreePrivacy) { alert('필수 약관에 동의해야 가입할 수 있습니다.'); return; }

        // ✅ 핵심 수정: birthdate (소문자)를 사용하도록 변경
        const formattedBirthdate = formData.birthdate.replace(
            /^(\d{4})(\d{2})(\d{2})$/,
            '$1-$2-$3'
        );

        // 서버 전송 객체
        const signupPayload = {
            loginId: formData.loginId,
            password: formData.password,
            email: formData.email,
            realName: formData.realName,
            phone: formData.phone,
            birthdate: formattedBirthdate,
            agreeService: formData.agreeService,
            agreePrivacy: formData.agreePrivacy
        };

        try {
            const response = await fetch('http://localhost:8080/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(signupPayload),
            });

            if (response.ok) {
                alert('회원가입에 성공하였습니다! 로그인 페이지로 이동합니다.\n\n' + '모의투자 가능자산 10,000,000원이 지급되었습니다.');
                navigate('/login');
            } else {
                const errorMsg = await response.text();
                console.error("서버 에러:", errorMsg);
                alert('회원가입에 실패하였습니다. 다시 시도해 주세요.');
            }
        } catch (error) {
            console.error('가입 에러:', error);
            alert('네트워크 오류가 발생했습니다.');
        }
    };

    return (
        <div className={styles.signupPage}>
            <div className={styles.signupContainer}>
                <h2 className={styles.title}>회원가입</h2>
                <form className={styles.signupForm} onSubmit={handleSubmit}>
                    {/* ... (이하 JSX 구조는 동일하므로 생략) ... */}
                    {/* (생년월일 input의 name="birthdate"가 잘 되어있으므로 그대로 사용) */}
                    <div className={styles.section}>
                        <h3 className={styles.sectionTitle}>기본 정보</h3>
                        <div className={styles.formGroup}>
                            <label htmlFor="realName">성명 (한글)</label>
                            <input type="text" id="realName" name="realName" placeholder="홍길동" value={formData.realName} onChange={handleChange} required />
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="birthdate">생년월일</label>
                            <input type="text" id="birthdate" name="birthdate" placeholder="YYYYMMDD" value={formData.birthdate} onChange={handleChange} required />
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="phone">연락처</label>
                            <input type="text" id="phone" name="phone" placeholder="010-0000-0000" value={formData.phone} onChange={handleChange} required />
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="email">이메일</label>
                            <div className={styles.inputWithButton}>
                                <input type="email" id="email" name="email" placeholder="user@example.com" value={formData.email} onChange={handleChange} required />
                                <button type="button" className={styles.checkBtn} onClick={() => checkAvailability('email')}>중복 확인</button>
                            </div>
                        </div>
                    </div>

                    <div className={styles.section}>
                        <h3 className={styles.sectionTitle}>계정 정보</h3>
                        <div className={styles.formGroup}>
                            <label htmlFor="loginId">아이디</label>
                            <div className={styles.inputWithButton}>
                                <input type="text" id="loginId" name="loginId" placeholder="아이디를 입력해주세요" value={formData.loginId} onChange={handleChange} required />
                                <button type="button" className={styles.checkBtn} onClick={() => checkAvailability('loginId')}>중복 확인</button>
                            </div>
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="password">비밀번호</label>
                            <input type="password" id="password" name="password" placeholder="영문자, 숫자, 특수문자 포함 8자 이상" value={formData.password} onChange={handleChange} required />
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="passwordConfirm">비밀번호 확인</label>
                            <input type="password" id="passwordConfirm" name="passwordConfirm" placeholder="비밀번호 재입력" value={formData.passwordConfirm} onChange={handleChange} required />
                        </div>
                    </div>

                    <div className={`${styles.section} ${styles.agreementSection}`}>
                        <div className={`${styles.agreementItem} ${styles.agreeAll}`}>
                            <input type="checkbox" id="agreeAll" name="agreeAll" checked={formData.agreeAll} onChange={handleChange} />
                            <label htmlFor="agreeAll">전체 동의</label>
                        </div>
                        <div className={`${styles.agreementlist} ${styles.agreeOne}`}>
                            <div>
                                <input type="checkbox" id="agreeService" name="agreeService" checked={formData.agreeService} onChange={handleChange} />
                                <label htmlFor="agreeService">서비스 이용 약관 (필수)</label>
                            </div>
                            <div>
                                <input type="checkbox" id="agreePrivacy" name="agreePrivacy" checked={formData.agreePrivacy} onChange={handleChange} />
                                <label htmlFor="agreePrivacy">개인정보 수집 이용 (필수)</label>
                            </div>
                        </div>
                    </div>

                    <div className={styles.buttonGroup}>
                        <button type="submit" className={`${styles.submitBtn} ${styles.primary}`}>가입하기</button>
                    </div>
                </form>
            </div>
        </div>
    );
}