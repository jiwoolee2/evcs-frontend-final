// components/Header/Header.jsx
import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext/AuthContext";
import { toast } from "react-toastify";
import axios from "axios";
import {
  StyledHeaderDiv,
  StyledHeaderTop,
  StyledLogoDiv,
  LogoImage,
  LogoText,
  StyledAuthButtons,
  StyledLoginButton,
  StyledSignupButton,
  StyledNavbar,
  StyledNavLink,
  StyledMemberDiv,
} from "./Header.styles";

const Header = () => {
  const navigate = useNavigate();
  const { auth, logout } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const apiUrl = window.ENV?.API_URL || "http://localhost:8080";
  const checkAdminRole = useCallback(async () => {
    const token = auth.user?.accessToken;
    if (!token) {
      setIsAdmin(false);
      return;
    }
    try {
      const { data } = await axios.get(`${apiUrl}/admin/user/info`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setIsAdmin(!!data.isAdmin);
    } catch {
      setIsAdmin(false);
    }
  }, [auth.user]);

  useEffect(() => {
    if (auth.user?.isAuthenticated) checkAdminRole();
    else setIsAdmin(false);
  }, [auth.user, checkAdminRole]);

  const handleAdminAccess = async () => {
    const token = auth.user?.accessToken;
    if (!token) return;
    try {
      await axios.post(
        `${apiUrl}/admin`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate("/admin/memberManagement");
    } catch (err) {
      toast.error(
        err.response?.status === 403
          ? "관리자만 접속할 수 있습니다."
          : "오류가 발생했습니다."
      );
    }
  };

  return (
    <StyledHeaderDiv>
      <StyledHeaderTop>
        <StyledLogoDiv onClick={() => navigate("/")}>
          <LogoImage src="/images/hourRent.png" alt="Logo" />
          <LogoText>전기충만</LogoText>
        </StyledLogoDiv>

        <StyledAuthButtons>
          {auth.user?.isAuthenticated ? (
            <StyledMemberDiv>
              <StyledLoginButton onClick={() => navigate("/myPage")}>
                {auth.user.memberName}님
              </StyledLoginButton>
              <StyledSignupButton onClick={logout}>로그아웃</StyledSignupButton>
              {isAdmin && (
                <StyledSignupButton onClick={handleAdminAccess}>
                  관리자페이지
                </StyledSignupButton>
              )}
            </StyledMemberDiv>
          ) : (
            <StyledMemberDiv>
              <StyledLoginButton onClick={() => navigate("/loginPage")}>
                로그인
              </StyledLoginButton>
              <StyledSignupButton onClick={() => navigate("/signUpPage")}>
                회원가입
              </StyledSignupButton>
            </StyledMemberDiv>
          )}
        </StyledAuthButtons>
      </StyledHeaderTop>

      <StyledNavbar>
        <StyledNavLink onClick={() => navigate("/")}>홈</StyledNavLink>
        <StyledNavLink onClick={() => navigate("/timerentalPage")}>
          렌트카
        </StyledNavLink>
        <StyledNavLink onClick={() => navigate("/driveRouteBoard")}>
          커뮤니티
        </StyledNavLink>
        <StyledNavLink onClick={() => navigate("/chargingMap")}>
          충전소 조회
        </StyledNavLink>
        <StyledNavLink onClick={() => navigate("/newsMain")}>
          뉴스
        </StyledNavLink>
        <StyledNavLink onClick={() => navigate("/notice")}>
          공지사항
        </StyledNavLink>
      </StyledNavbar>
    </StyledHeaderDiv>
  );
};

export default Header;
