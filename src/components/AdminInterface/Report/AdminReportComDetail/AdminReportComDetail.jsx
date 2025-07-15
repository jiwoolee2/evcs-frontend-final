import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  DetailContainer,
  FieldRow,
  Label,
  Value,
  ButtonGroup,
  ActionButton,
  BackButton,
  FieldRow2,
} from "./AdminReportComDetail.styled";
import axios from "axios";

const AdminReportComDetail = () => {
  const apiUrl = window.ENV?.API_URL || "http://localhost:8080";

  const { rpNo } = useParams();
  console.log("rpNo param:", rpNo);
  const navigate = useNavigate();

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("accessToken");

  useEffect(() => {
    const id = Number(rpNo);
    const fetchDetail = async () => {
      try {
        const { data } = await axios.get(`${apiUrl}/amReportsCom/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setReport(data);
        console.log("신고 상세 데이터:", data);
      } catch (err) {
        console.error(err);
        setError("신고 상세를 불러오는 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [rpNo]);

  const approval = async () => {
    if (!window.confirm("정말 피의자를 차단하시겠습니까?")) return;
    try {
      await axios.delete(`/amReportsCom/${rpNo}`);
      alert("차단되었습니다");
      navigate(-1);
    } catch (err) {
      console.error(err);
      alert("차단 중 오류가 발생했습니다.");
    }
  };

  const refusal = async () => {
    if (!window.confirm("상태코드를 거부됨 으로 변경하시겠습니까?")) return;
    try {
      await axios.delete(`/amReportsCom/${rpNo}`);
      alert("상태코드 변경 성공");
      navigate(-1);
    } catch (err) {
      console.error(err);
      alert("상태코드 변경 중 오류가 발생했습니다.");
    }
  };

  if (loading) return <DetailContainer>불러오는 중...</DetailContainer>;

  if (error) {
    return (
      <DetailContainer style={{ color: "red" }}>
        {error}
        <BackButton onClick={() => navigate(-1)}>뒤로가기</BackButton>
      </DetailContainer>
    );
  }

  return (
    <DetailContainer>
      <h2>댓글 신고 상세보기 (#{report.reNo})</h2>
      <FieldRow>
        <Label>신고자</Label>
        <Value>{report.memberNo}</Value>
      </FieldRow>
      <FieldRow>
        <Label>피의자</Label>
        <Value>{report.reMemberNo}</Value>
      </FieldRow>
      <FieldRow>
        <Label>신청일</Label>
        <Value>{report.reEnrollDate}</Value>
      </FieldRow>
      <FieldRow>
        <Label>진행상황</Label>
        <Value>
          {report.reStatus === "Y"
            ? "처리완료"
            : report.reStatus === "N"
            ? "거부됨"
            : report.reStatus === "P"
            ? "진행중"
            : report.reStatus === "O"
            ? "취소됨"
            : "알 수 없음"}
        </Value>
      </FieldRow>
      <FieldRow>
        <Label>신고 내용</Label>
        <Value>{report.reContent}</Value>
      </FieldRow>
      <FieldRow>
        <Label>게시판 번호</Label>
        <Value>{report.commentGroupNo}</Value>
      </FieldRow>
      <FieldRow>
        <Label>댓글 깊이</Label>
        <Value>{report.commentDepth}</Value>
      </FieldRow>

      {report.content && (
        <FieldRow2>
          <Label>상세 내용</Label>
          <Value style={{ whiteSpace: "pre-wrap" }}>{report.content}</Value>
        </FieldRow2>
      )}

      <ButtonGroup>
        <BackButton onClick={() => navigate(-1)}>뒤로가기</BackButton>
        <div>
          {report.reStatus === "g" && (
            <>
              <ActionButton onClick={refusal}>거부</ActionButton>
              <ActionButton onClick={approval}>승인</ActionButton>
            </>
          )}
        </div>
      </ButtonGroup>
    </DetailContainer>
  );
};

export default AdminReportComDetail;
