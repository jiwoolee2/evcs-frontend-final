import MyPageNav from "../../Common/Nav/MyPageNav";
import {
  Form,
  MyPageDiv,
  TitleH1,
  TitleDiv,
  InputGroup,
  InputLabel,
  StyledInput,
  InputWrap,
  SubmitButton,
  SubmitWrapDiv,
  DeleteButton,
  RatingDiv,
  ChangeButton,
  InputWrapByPassword,
  DeleteButtonWrap,
} from "../../Member/Mypage/MyPage.styles";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../Context/AuthContext/AuthContext";
import { toast } from "react-toastify";
import { useEffect, useState } from "react";

const MyPage = () => {
  const { auth, cancel } = useAuth();
  const navigate = useNavigate();
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const apiUrl = window.ENV?.API_URL || "http://localhost:8080";

  useEffect(() => {
    if (shouldRedirect) {
      window.location.href = "/";
    }
  }, [shouldRedirect]);

  const handleDeleteAccount = async () => {
    if (window.confirm("정말로 회원 탈퇴를 하시겠습니까?")) {
      try {
        await axios.post(
          `${apiUrl}/admin/delete`,
          {},
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
          }
        );

        toast.success("회원 탈퇴가 완료되었습니다.");

        // 로컬 스토리지 토큰 직접 제거
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        // 추가로 저장된 다른 사용자 관련 데이터가 있다면 모두 삭제

        // AuthContext의 logout 함수 호출
        cancel();

        // 리다이렉트 트리거 (여러 방법 동시에 시도)
        setShouldRedirect(true);
        navigate("/", { replace: true });
      } catch (error) {
        console.error("회원 탈퇴 실패 : ", error);
        toast.error(
          error.response?.data?.message || "회원 탈퇴에 실패했습니다."
        );
      }
    }
  };

  return (
    <MyPageDiv>
      <MyPageNav />
      <Form onSubmit={(e) => e.preventDefault()}>
        <TitleDiv>
          <TitleH1>내 정보</TitleH1>
        </TitleDiv>

        <InputGroup>
          {auth.user && auth.user.isAuthenticated && (
            <>
              <InputWrap>
                <InputLabel>닉네임</InputLabel>
                <StyledInput
                  id="name"
                  type="text"
                  name="nickName"
                  value={auth.user.memberName || ""}
                  readOnly
                />
              </InputWrap>

              <InputWrap>
                <InputLabel>이메일</InputLabel>
                <StyledInput
                  id="email"
                  type="text"
                  name="email"
                  value={auth.user.email || ""}
                  readOnly
                />
              </InputWrap>

              <InputWrapByPassword>
                <InputLabel>
                  비밀번호
                  <ChangeButton
                    type="button"
                    onClick={() => navigate("/changePasswordPage")}
                  >
                    수정
                  </ChangeButton>
                </InputLabel>
              </InputWrapByPassword>
            </>
          )}

          <DeleteButtonWrap>
            <DeleteButton type="button" onClick={handleDeleteAccount}>
              회원 탈퇴
            </DeleteButton>
          </DeleteButtonWrap>
        </InputGroup>
      </Form>
    </MyPageDiv>
  );
};

export default MyPage;
