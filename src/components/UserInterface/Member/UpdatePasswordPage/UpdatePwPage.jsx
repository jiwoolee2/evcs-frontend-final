import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useLocation } from "react-router-dom";
import {
  FindContainer,
  FindSubtitle,
  FindForm,
  FindInput,
  FindButton,
  FindLogoImg,
} from "../../Member/FindByPasswordPage/FindPwPage.styles";

const UpdatePwPage = () => {
  const navi = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const location = useLocation();
  const email = location.state?.email;
  const apiUrl = window.ENV?.API_URL || "http://localhost:8080";

  console.log("넘겨받은 이메일:", email);

  const updatePw = (e) => {
    e.preventDefault();

    // 클라이언트 측 기본 유효성 검사
    if (!newPassword) {
      toast.error("비밀번호를 입력해주세요.");
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

    if (!confirmPassword) {
      toast.error("비밀번호 확인을 입력해주세요.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("새 비밀번호와 비밀번호 확인이 일치하지 않습니다.");
      return;
    }

    const updatePw = {
      email: email,
      newPassword: newPassword,
      confirmPassword: confirmPassword,
    };

    axios
      .post(`${apiUrl}/mail/password/update`, updatePw)
      .then((response) => {
        console.log(response.data);
        toast.success("비밀번호 변경 성공!!");
        navi("/");
      })
      .catch((error) => {
        console.error("변경 실패!");
        if (error.response) {
          toast.error(error.response.data.message);
        } else {
          toast.error("뭐야 오류 발생");
        }
      });
  };

  return (
    <FindContainer>
      <FindLogoImg src="/images/Logo.png" />
      <FindSubtitle>새롭게 변경할 비밀번호를 입력해주세요.</FindSubtitle>
      <FindForm>
        <FindInput
          type="password"
          placeholder="신규 비밀번호를 입력해주세요."
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />

        <FindInput
          type="password"
          placeholder="신규 비밀번호를  재입력해주세요."
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <FindButton type="submit" onClick={updatePw}>
          변경
        </FindButton>
      </FindForm>
    </FindContainer>
  );
};

export default UpdatePwPage;
