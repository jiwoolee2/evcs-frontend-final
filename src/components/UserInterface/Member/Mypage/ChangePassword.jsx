import MyPageNav from "../../Common/Nav/MyPageNav";
import {
  Form,
  MyPageDiv,
  Container,
  Title,
  Description,
  PwInput,
  ButtonGroup,
  PwButton,
  PwCancelButton,
  CaptionText,
  CaptchaControl,
} from "../../Member/Mypage/MyPage.styles";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../../Context/AuthContext/AuthContext";

const ChangePasswordPage = () => {
  const navi = useNavigate();
  const [currentPassword, setCurrentPassWord] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const apiUrl = window.ENV?.API_URL || "http://localhost:8080";

  const { auth } = useAuth();

  const changePw = (e) => {
    if (!currentPassword) {
      toast.error("현재 비밀번호를 입력해주세요.");
      return;
    }

    // 클라이언트 측 기본 유효성 검사
    if (!newPassword) {
      toast.error("신규 비밀번호를 입력해주세요.");
      return;
    }

    if (newPassword.length < 4 || newPassword.length > 20) {
      toast.error("비밀번호 값은 4글자 이상, 20자 이하만 사용할 수 있습니다.");
      return;
    }

    // 영어, 숫자, 특수문자만 허용하는 정규식
    const passwordPattern = /^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]*$/;
    if (!passwordPattern.test(newPassword)) {
      toast.error("비밀번호 값은 영어, 숫자, 특수문자만 사용할 수 있습니다.");
      return;
    }

    if (!confirmNewPassword) {
      toast.error("비밀번호 확인을 입력해주세요.");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      toast.error("새 비밀번호가 확인란과 일치하지 않습니다.");
      return;
    }

    const changePw = {
      currentPassword: currentPassword,
      newPassword: newPassword,
      confirmNewPassword: confirmNewPassword,
    };

    axios
      .post(`${apiUrl}/members/changePassword`, changePw, {
        headers: {
          Authorization: `Bearer ${auth.user.accessToken}`,
        },
      })
      .then((response) => {
        toast.success("비밀번호 변경 성공!");
        navi("/");
      })
      .catch((error) => {
        if (error.response && error.response.data) {
          toast.error(error.response.data.message); // 백엔드에서 던진 메시지 그대로 표시
        } else {
          toast.error("서버 오류가 발생했습니다. 다시 시도해주세요.");
        }
      });
  };

  return (
    <MyPageDiv>
      <MyPageNav />
      <Container>
        <Title>비밀번호 변경</Title>
        <Description>
          안전한 비밀번호로 내정보를 보호하세요
          <br />
          <span> 다른 아이디/사이트에서 사용한 적 없는 비밀번호</span>
          <br />
          <span> 이전에 사용한 적 없는 비밀번호가 안전합니다.</span>
        </Description>

        <PwInput
          type="password"
          placeholder="현재 비밀번호"
          value={currentPassword}
          onChange={(e) => setCurrentPassWord(e.target.value)}
        />
        <PwInput
          type="password"
          placeholder="새 비밀번호"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <PwInput
          type="password"
          placeholder="새 비밀번호 확인"
          value={confirmNewPassword}
          onChange={(e) => setConfirmNewPassword(e.target.value)}
        />

        <ButtonGroup>
          <PwButton type="button" onClick={changePw}>
            확인
          </PwButton>
          <PwCancelButton onClick={() => navi("/myPage")}>취소</PwCancelButton>
        </ButtonGroup>
      </Container>
    </MyPageDiv>
  );
};

export default ChangePasswordPage;
