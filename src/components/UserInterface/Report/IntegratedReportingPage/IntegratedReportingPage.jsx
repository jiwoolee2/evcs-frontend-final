import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Container,
  Title,
  Form,
  Fieldset,
  Legend,
  InfoRow,
  LabelText,
  TextArea,
  ButtonGroup,
  Button,
  CancelButton,
} from "./IntegratedReportingPage.styled";

const IntegratedReportingPage = () => {
  const apiUrl = window.ENV?.API_URL || "http://localhost:8080";
  const { boardInfo, reporter, reported } = useLocation().state || {};
  const navigate = useNavigate();

  const [content, setContent] = useState("");

  const handleCancel = () => {
    navigate(-1);
  };

  const token = localStorage.getItem("accessToken");

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1) JSON payload 생성
    const payload = {
      boardId: boardInfo.boardId,
      boardTitle: boardInfo.boardTitle,
      reporterId: reporter.userId,
      reportedId: reported.userId,
      content: content,
    };

    try {
      const res = await fetch(`${apiUrl}/integrated-reports`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        alert("신고 실패: " + (err.message || res.statusText));
        return;
      }

      // 2) 성공 처리
      alert("신고가 완료되었습니다!");
      navigate(-1);
    } catch (error) {
      console.error(error);
      alert("네트워크 오류가 발생했습니다.");
    }
  };

  return (
    <Container>
      <Title>통합 신고 페이지</Title>
      <Form onSubmit={handleSubmit}>
        <Fieldset>
          <Legend>이전 게시판 정보</Legend>
          <InfoRow>
            <LabelText>게시글 번호:</LabelText>
            <span>{boardInfo.boardId}</span>
          </InfoRow>
          <InfoRow>
            <LabelText>게시글 제목:</LabelText>
            <span>{boardInfo.boardTitle}</span>
          </InfoRow>
        </Fieldset>

        <Fieldset>
          <Legend>신고자</Legend>
          <InfoRow>
            <LabelText>신고자 ID:</LabelText>
            <span>{reporter.userId}</span>
          </InfoRow>
        </Fieldset>

        <div>
          <LabelText>내용작성:</LabelText>
          <TextArea
            placeholder="신고 내용을 입력해 주세요..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
        </div>

        <ButtonGroup>
          <CancelButton type="button" onClick={handleCancel}>
            신고취소
          </CancelButton>
          <Button type="submit">신고하기</Button>
        </ButtonGroup>
      </Form>
    </Container>
  );
};

export default IntegratedReportingPage;
