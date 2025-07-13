import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

import {
  RoleCellContainer,
  LoadingIndicator,
  OptionsContainer,
  RoleButton,
} from "./RoleCell.styles";

const RoleCell = ({ member, onRoleChange }) => {
  const [showOptions, setShowOptions] = useState(false);
  const [loading, setLoading] = useState(false);
  const apiUrl = window.ENV?.API_URL || "http://";

  const handleRoleClick = () => {
    setShowOptions(!showOptions);
  };

  const changeRole = async (newRole) => {
    if (member.role === newRole) {
      setShowOptions(false);
      return;
    }

    try {
      setLoading(true);
      // API 호출 시 쿠키와 인증 정보를 함께 보냄
      await axios.put(
        `${apiUrl}/api/admin/management/${member.memberNo}/role`,
        { role: newRole }, // 두 번째 인자: request body
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
          withCredentials: true,
        }
      );
      // 성공 시 상위 컴포넌트에 알림
      onRoleChange(member.memberNo, newRole);
      toast.success("권한 변경 성공");

      // 권한이 USER로 변경되었을 경우 리다이렉트 처리
      if (newRole === "USER") {
        // 페이지를 새로 고치고 관리자 페이지를 벗어나도록 처리
        window.location.href = "/"; // 올바른 방식으로 리다이렉트
      }
    } catch (error) {
      toast.error("권한 변경 실패:", error);
      alert("권한 변경에 실패했습니다.");
    } finally {
      setLoading(false);
      setShowOptions(false);
    }
  };

  return (
    <RoleCellContainer onClick={handleRoleClick}>
      {member.role}
      {loading && <LoadingIndicator>(처리 중...)</LoadingIndicator>}

      {showOptions && (
        <OptionsContainer>
          <RoleButton
            onClick={(e) => {
              e.stopPropagation();
              changeRole("USER");
            }}
            className={member.role === "USER" ? "active" : ""}
          >
            USER
          </RoleButton>
          <RoleButton
            onClick={(e) => {
              e.stopPropagation();
              changeRole("ADMIN");
            }}
            className={member.role === "ADMIN" ? "active" : ""}
          >
            ADMIN
          </RoleButton>
        </OptionsContainer>
      )}
    </RoleCellContainer>
  );
};

export default RoleCell;
