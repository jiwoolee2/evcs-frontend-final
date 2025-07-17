import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  FindContainer,
  FindTitle,
  FindSubtitle,
  FindForm,
  FindInput,
  FindButton,
  VerifyButton,
  FindLogoImg,
  VerifyField,
  AuthenticationBtn,
} from "../../Member/FindByPasswordPage/FindPwPage.styles";

const FindByPwPage = () => {
  const navi = useNavigate();

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [isVerified, setIsVerified] = useState(false); // ✅ 인증 성공 여부 추가
  const apiUrl = window.ENV?.API_URL || "http://localhost:8080";

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const sendCode = (e) => {
    e.preventDefault();

    const data = {
      email: email,
    };

    if (!email || email.trim() === "") {
      toast.warn("이메일을 입력해주세요.");
      return;
    }

    if (!validateEmail(email)) {
      toast.warn("올바른 이메일 형식이 아닙니다.");
      return;
    }

    axios
      .post(`${apiUrl}/mail/password-reset`, data)
      .then((response) => {
        console.log(response.data);
        toast.success("인증코드 전송 성공!");
        setShowCodeInput(true);
      })
      .catch((error) => {
        console.error("코드 전송 실패!");
        if (error.response) {
          toast.error(error.response.data.message);
        } else {
          toast.error("뭐야 오류 발생");
        }
      });
  };

  const codeVerify = (e) => {
    e.preventDefault();

    if (!email || email.trim() === "") {
      toast.warn("이메일을 입력해주세요.");
      return;
    }

    if (!code || code.trim() === "") {
      toast.warn("인증번호를 입력해주세요.");
      return;
    }

    const verify = {
      email: email,
      code: code,
    };

    axios
      .post(`${apiUrl}/mail/password-verify`, verify)
      .then((response) => {
        console.log(response.data);
        toast.success("인증 성공!");
        setIsVerified(true); // ✅ 인증 성공 시 상태 변경
      })
      .catch((error) => {
        if (error.response) {
          toast.error(error.response.data.message);
        } else {
          toast.error("알수 없는 오류 발생~");
        }
      });
  };

  const goToUpdatePwPage = () => {
    if (!email || email.trim() === "") {
      toast.warn("이메일을 입력해주세요.");
      return;
    }

    if (!isVerified) {
      toast.warn("이메일 인증을 먼저 완료해주세요.");
      return;
    }
    navi("/updatePwPage", { state: { email } });
  };

  return (
    <FindContainer>
      <FindLogoImg src="/images/Logo.png" />
      <FindSubtitle>비밀번호를 찾고자하는 이메일을 입력해주세요.</FindSubtitle>
      <FindForm onSubmit={sendCode}>
        <FindInput
          type="email"
          placeholder="이메일을 입력하세요"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        {!showCodeInput && (
          <FindButton type="button" onClick={sendCode}>
            인증코드 전송
          </FindButton>
        )}

        {showCodeInput && (
          <>
            <VerifyField>
              <FindInput
                type="text"
                placeholder="인증번호를 입력하세요"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
              <AuthenticationBtn onClick={codeVerify}>확인</AuthenticationBtn>
            </VerifyField>

            <FindButton type="button" onClick={goToUpdatePwPage}>
              다음
            </FindButton>
          </>
        )}
      </FindForm>
    </FindContainer>
  );
};

export default FindByPwPage;
