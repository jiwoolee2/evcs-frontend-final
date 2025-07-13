import {
  StyledInput,
  StyledForm,
  StyledFindDiv,
  Styled_a,
  StyledLoginForm,
  StyledLogoDiv,
  StyledImg,
  StyledInputContainer,
  StyledLoginButton,
  StyledButtonDiv,
  StyledSocialDiv,
  StyledSocialImg,
} from "./LoginPage.styles";
import "./LoginPage.css";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import { useAuth } from "../../Context/AuthContext/AuthContext";
import { toast } from "react-toastify";

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const apiUrl = window.ENV?.API_URL || "http://localhost:8080";

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleLogin = (e) => {
    e.preventDefault();

    const loginData = {
      email: email,
      memberPw: password,
    };
    axios
      .post(`${apiUrl}/auth/login`, loginData)
      .then((response) => {
        console.log("로그인 응답 데이터:", response.data);
        const { email, memberName, memberNo, refreshToken, accessToken } =
          response.data;
        login(email, memberName, memberNo, refreshToken, accessToken);

        alert("로그인 성공!");
        window.location.href = "/";
      })
      .catch((error) => {
        if (error.response) {
          if (error.response.status === 400) {
            const errorMessage = error.response.data.message;
            toast.error(errorMessage || "로그인 실패");
          } else if (error.response.status === 401) {
            toast.error("아이디 또는 비밀번호를 잘못 입력하셨습니다.");
          } else {
            toast.error(
              error.response.data.message || "알 수 없는 오류가 발생했습니다."
            );
          }
        } else {
          toast.error("알 수 없는 오류가 발생했습니다.");
        }
      });
  };

  const handleKakaoLogin = () => {
    window.location.href = `${apiUrl}/auth/login/kakao`;
  };

  return (
    <StyledForm className="forms" onSubmit={handleLogin}>
      <StyledLoginForm>
        <StyledLogoDiv>
          <StyledImg
            src="/images/Logo.png"
            alt="전기충만 로고"
            onClick={() => navigate("/")}
          />
        </StyledLogoDiv>

        <StyledInputContainer>
          <StyledInput
            className="email"
            type="email"
            name="name"
            value={email}
            onChange={handleEmailChange}
            autoComplete="username"
            placeholder="이메일"
          />
          <StyledInput
            className="password"
            type="password"
            name="password"
            value={password}
            onChange={handlePasswordChange}
            autoComplete="current-password"
            placeholder="비밀번호"
          />
        </StyledInputContainer>

        <StyledFindDiv>
          <Styled_a onClick={() => navigate("/findByPwPage")}>
            비밀번호 찾기
          </Styled_a>
          <a className="stick">|</a>
          <Styled_a onClick={() => navigate("/signUpPage")}>회원가입</Styled_a>
        </StyledFindDiv>

        <StyledButtonDiv>
          <StyledLoginButton type="button" onClick={handleLogin}>
            로그인
          </StyledLoginButton>
        </StyledButtonDiv>

        <StyledSocialDiv>
          <StyledSocialImg
            onClick={handleKakaoLogin}
            src="/images/kakao_login_button.png"
          />
        </StyledSocialDiv>
      </StyledLoginForm>
    </StyledForm>
  );
}

export default LoginPage;
