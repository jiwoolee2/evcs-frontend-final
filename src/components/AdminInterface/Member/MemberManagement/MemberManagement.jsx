import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Report2, Report3 } from "../../Report/AdminReport/AdminReport.styled";
import axios from "axios";
import AdminReportNav from "../../AdminCommon/AdminNav/AdminReportNav";
import { MemberBanButton } from "./MemberManagement.styled";
import RoleCell from "./RoleCell";
import { toast } from "react-toastify";

const AdminMemberManagement = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("accessToken");

  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [emailQueryInput, setEmailQueryInput] = useState("");
  const [emailQuery, setEmailQuery] = useState("");

  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const apiUrl = window.ENV?.API_URL || "http://";

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        email: emailQuery || undefined,
        page: page,
        size: 10,
      };
      const response = await axios.get(
        `${apiUrl}/api/admin/management/members`,
        {
          params,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const payload = response.data;
      const list = Array.isArray(payload)
        ? payload
        : Array.isArray(payload.content)
        ? payload.content
        : [];
      setMembers(list);
      setTotalPages(payload.totalPages || 1); // ← 최소 1페이지 보장
    } catch (err) {
      console.error(err);
      setError("회원 목록을 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, emailQuery, page, token]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const handleSearch = () => {
    setPage(0);
    setEmailQuery(emailQueryInput);
  };

  function toKSTDateString(date) {
    const kstDate = new Date(date.getTime() + 9 * 60 * 60 * 1000);
    return kstDate.toISOString().slice(0, 10);
  }

  const handlePreset = (days) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);
    setStartDate(toKSTDateString(start));
    setEndDate(toKSTDateString(end));
    setPage(0);
    setEmailQuery(emailQueryInput);
  };

  const handlePrev = () => {
    if (page > 0) setPage(page - 1);
  };

  const handleNext = () => {
    if (page < totalPages - 1) setPage(page + 1);
  };

  // 회원 상태 표시 함수
  const getMemberStatusText = (status) => {
    switch (status) {
      case "Y":
        return "활성화";
      case "N":
        return "제한";
      case "R":
        return "탈퇴";
      default:
        return "알 수 없음";
    }
  };

  // 이메일 인증 상태 표시 함수
  const getEmailVerifiedText = (verified) => {
    return verified === "Y" ? "인증됨" : "미인증";
  };

  // 날짜 형식 포맷팅 함수
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(date.getDate()).padStart(2, "0")}`;
  };

  const handleRoleChange = (memberNo, newRole) => {
    // members 상태를 업데이트하는 로직
    setMembers((prevMembers) =>
      prevMembers.map((m) =>
        m.memberNo === memberNo ? { ...m, role: newRole } : m
      )
    );
  };

  const handleBanMember = (memberNo) => {
    if (window.confirm("정말로 이 회원을 정지하시겠습니까?")) {
      axios
        .post(`${apiUrl}/admin/${memberNo}/ban`)
        .then(() => {
          toast.success("회원이 정지되었습니다.");
          // 예: window.location.reload(); 또는 상태 갱신 콜백 등
        })
        .catch((err) => {
          toast.error("회원 정지에 실패했습니다.");
          console.error(err);
        });
    }
  };

  return (
    <Report2>
      <AdminReportNav />
      <Report3>
        <h2>회원 관리</h2>

        <div className="report-filters">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <span>~</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
          <input
            type="text"
            placeholder="이메일 검색"
            value={emailQueryInput}
            onChange={(e) => setEmailQueryInput(e.target.value)}
          />
          <button onClick={() => handlePreset(7)}>1주일</button>
          <button onClick={() => handlePreset(30)}>1개월</button>
          <button onClick={() => handlePreset(90)}>3개월</button>
          <button onClick={() => handlePreset(180)}>6개월</button>
          <button onClick={() => handlePreset(365)}>1년</button>
          <button className="search-button" onClick={handleSearch}>
            검색
          </button>
        </div>

        <div className="report-table-container">
          {loading && <p>불러오는 중...</p>}
          {error && <p style={{ color: "red" }}>{error}</p>}
          {!loading && members.length === 0 && !error && (
            <p>회원 목록이 없습니다.</p>
          )}
          {members.length > 0 && (
            <>
              <table className="report-table">
                <thead>
                  <tr>
                    <th>회원번호</th>
                    <th>이메일</th>
                    <th>닉네임</th>
                    <th>이메일 인증</th>
                    <th>권한</th>
                    <th>회원 상태</th>
                    <th>생성일</th>
                    <th>회원 제재</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((member) => (
                    <tr key={member.memberNo}>
                      <td>{member.memberNo}</td>
                      <td>{member.email}</td>
                      <td>{member.memberNickname}</td>
                      <td>{member.emailVerified}</td>
                      {/* 권한 변경 컴포넌트 */}
                      <RoleCell
                        member={member}
                        onRoleChange={handleRoleChange}
                      />
                      <td>{member.memberStatus}</td>
                      <td>{member.createdAt}</td>
                      <td>
                        <MemberBanButton
                          onClick={() => handleBanMember(member.memberNo)}
                        >
                          정지
                        </MemberBanButton>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* 페이징 */}
              <div className="pagination">
                <button onClick={handlePrev} disabled={page === 0}>
                  ◀ 이전
                </button>

                {Array.from({ length: totalPages }, (_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setPage(idx)}
                    className={idx === page ? "active" : ""}
                  >
                    {idx + 1}
                  </button>
                ))}

                <button onClick={handleNext} disabled={page >= totalPages - 1}>
                  다음 ▶
                </button>
              </div>
            </>
          )}
        </div>
      </Report3>
    </Report2>
  );
};

export default AdminMemberManagement;
