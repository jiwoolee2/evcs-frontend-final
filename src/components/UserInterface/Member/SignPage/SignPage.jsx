import {
  StyledInput,
  StyledForm,
  StyledLoginForm,
  StyledLogoDiv,
  StyledImg,
  StyledInputContainer,
  StyledButtonDiv,
  EmailInputWrapper,
  StyledSignUpButton,
  VerificationWrapper,
  VerifyButton,
  ReSendCodeButton,
  DisableSendCodeButton,
} from "../LoginPage/LoginPage.styles";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

function SignUpPage() {
  const navi = useNavigate();
  const [showVerificationInput, setShowVerificationInput] = useState(false);
  const [showReSendCode, setReSendCode] = useState(false);
  const [isResendDisabled, setIsResendDisabled] = useState(false);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  // 추가 상태
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const apiUrl = window.ENV?.API_URL || "http://localhost:8080";

  // 타이머 설정 (30초로 변경)
  const [resendTimer, setResendTimer] = useState(0);

  // 이메일 입력 핸들러
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  // 인증코드 입력 핸들러
  const handleCodeChange = (e) => {
    setCode(e.target.value);
  };

  // 비밀번호 입력 핸들러
  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  // 닉네임 입력 핸들러
  const handleNicknameChange = (e) => {
    setNickname(e.target.value);
  };

  const validateEmail = (email) => {
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    return emailRegex.test(email);
  };

  const handleSendCode = (e) => {
    e.preventDefault();

    if (!email || !email.trim()) {
      toast.error("이메일을 입력해주세요.");
      return;
    }

    if (!validateEmail(email)) {
      toast.error("유효한 이메일 형식이 아닙니다.");
      return;
    }

    axios
      .post(`${apiUrl}/mail/send`, { email: email })
      .then((response) => {
        console.log("인증코드 발송 성공:", response.data);
        setShowVerificationInput(true);
        setReSendCode(true);
        setIsResendDisabled(true);
        setResendTimer(30);
        toast.success("인증번호가 발송되었습니다. 이메일을 확인해주세요.");
      })
      .catch((error) => {
        if (error.response) {
          if (error.response.data.message) {
            toast.error(error.response.data.message);
          } else {
            toast.error("인증코드 발송에 실패했습니다. 다시 시도해주세요.");
          }
        }
      });
  };

  useEffect(() => {
    let timer;
    if (resendTimer > 0) {
      timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
    } else if (resendTimer === 0) {
      setIsResendDisabled(false);
    }
    return () => clearTimeout(timer);
  }, [resendTimer]);

  const handleResendCode = () => {
    setIsResendDisabled(true); // 버튼 비활성화
    setResendTimer(30); // 30초 타이머 시작

    axios
      .post(`${apiUrl}/mail/resend-verification-code`, { email: email })
      .then((response) => {
        console.log("인증코드 재전송 성공:", response.data);
        toast.success("인증코드가 재전송되었습니다. 이메일을 확인해주세요.");
      })
      .catch((error) => {
        console.error("인증코드 재전송 실패:", error);
        toast.error("재전송에 실패했습니다. 다시 시도해주세요.");
        setIsResendDisabled(false); // 실패 시 다시 활성화
        setResendTimer(0);
      });
  };

  const handleVerify = (e) => {
    e.preventDefault();

    if (!code || !code.trim()) {
      toast.error("인증코드를 입력해주세요.");
      return;
    }

    axios
      .post(`${apiUrl}/mail/verify`, {
        email: email,
        code: code,
      })
      .then((response) => {
        console.log("인증코드 확인 성공:", response.data);
        setIsVerified(true);
        toast.success("인증이 완료되었습니다.");
      })
      .catch((error) => {
        console.error("인증코드 확인 실패:", error);
        toast.error("인증번호가 일치하지 않습니다. 다시 확인해주세요.");
      });
  };

  // 회원가입 요청 함수 추가
  const handleSignUp = (e) => {
    e.preventDefault();

    if (!email || !password || !nickname) {
      toast.error("모든 항목을 입력해주세요.");
      return;
    }

    if (!validateEmail(email)) {
      toast.error("유효한 이메일 형식이 아닙니다.");
      return;
    }

    if (password.length < 4 || password.length > 20) {
      toast.error("비밀번호는 4자 이상, 20자 이하로 입력해주세요.");
      return;
    }

    if (!isVerified) {
      toast.error("이메일 인증이 필요합니다.");
      return;
    }

    const memberData = {
      email: email,
      memberPw: password,
      memberNickname: nickname,
    };

    axios
      .post(`${apiUrl}/members`, memberData)
      .then((response) => {
        if (response.status === 200) {
          toast.success("회원가입이 완료되었습니다!");
          navi("/loginPage");
        }
      })
      .catch((error) => {
        console.error("회원가입 실패:", error);
        if (error.response) {
          toast.error(
            `회원가입 실패: ${
              error.response.data.message || "오류가 발생했습니다."
            }`
          );
        } else {
          toast.error("회원가입 중 오류가 발생했습니다. 다시 시도해주세요.");
        }
      });
  };

  return (
    <StyledForm
      className="forms"
      action=""
      onSubmit={(e) => e.preventDefault()}
    >
      <StyledLoginForm>
        <StyledLogoDiv>
          <StyledImg
            src="/images/Logo.png"
            alt="전기충만 로고"
            onClick={() => navi("/")}
          />
        </StyledLogoDiv>

        <StyledInputContainer>
          <EmailInputWrapper>
            <StyledInput
              className="email"
              type="email"
              name="email"
              value={email}
              onChange={handleEmailChange}
              autoComplete="username"
              placeholder="이메일"
            />
            <DisableSendCodeButton
              type="button"
              onClick={handleSendCode}
              disabled={isVerified || isResendDisabled}
            >
              인증코드
            </DisableSendCodeButton>

            {showReSendCode && (
              <ReSendCodeButton
                onClick={handleResendCode}
                disabled={isResendDisabled}
              >
                {isResendDisabled
                  ? `재전송(${resendTimer.toString().padStart(2, "0")}초)`
                  : "재전송"}
              </ReSendCodeButton>
            )}
          </EmailInputWrapper>

          {showVerificationInput && (
            <VerificationWrapper>
              <StyledInput
                type="text"
                name="code"
                value={code}
                onChange={handleCodeChange}
                placeholder="인증코드 입력"
                disabled={isVerified}
              />
              <VerifyButton
                type="button"
                onClick={handleVerify}
                disabled={isVerified}
              >
                확인
              </VerifyButton>
            </VerificationWrapper>
          )}

          <StyledInput
            className="password"
            type="password"
            name="memberPw"
            value={password}
            onChange={handlePasswordChange}
            autoComplete="new-password"
            placeholder="비밀번호"
          />

          <StyledInput
            className="nickname"
            type="text"
            name="nickname"
            value={nickname}
            onChange={handleNicknameChange}
            placeholder="닉네임"
          />
        </StyledInputContainer>

        <StyledButtonDiv>
          <StyledSignUpButton type="button" onClick={handleSignUp}>
            회원가입
          </StyledSignUpButton>
        </StyledButtonDiv>
      </StyledLoginForm>
    </StyledForm>
  );
}

export default SignUpPage;
