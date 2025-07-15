import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Form,
  Button,
  Pagination,
} from "react-bootstrap";
import NoticeNav from "../../AdminCommon/AdminNav/AdminNoitceNav";
import "./AdminEventBoard.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const AdminEventBoard = () => {
  const ENV_URL = window.ENV?.API_URL || `http://localhost:2580`;
  const navigate = useNavigate();
  const [category, setCategory] = useState("eventName");
  const [ingCategory, setIngCategory] = useState("allEvent");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [events, setEvents] = useState([]);
  const [page, setPage] = useState(1);
  const [pageInfo, setPageInfo] = useState({
    startPage: 1,
    endPage: 1,
    currentPage: 1,
    maxPage: 1,
    count: 0,
  });

  useEffect(() => {
    axios
      .get(`${ENV_URL}/admin-events`, {
        params: { page, category, ingCategory, searchKeyword },
      })
      .then((res) => {
        console.log("effect data : ", res.data);
        setEvents(res.data.eventList);
        setPageInfo(res.data.pageInfo);
      })
      .catch(console.error);
  }, [page]);

  const handleSearch = () => {
    setPage(1);
    axios
      .get(`${ENV_URL}/admin-events`, {
        params: { page, category, ingCategory, searchKeyword },
      })
      .then((res) => {
        console.log("data : ", res.data);
        setEvents(res.data.eventList);
        setPageInfo(res.data.pageInfo);
      })
      .catch(console.error);
  };

  const renderPagination = () => {
    const items = [];
    const { startPage, endPage, currentPage, maxPage, count } = pageInfo;

    items.push(
      <Pagination.First
        key="first"
        disabled={currentPage === 1}
        onClick={() => setPage(1)}
      >
        맨앞
      </Pagination.First>,
      <Pagination.Prev
        key="prev"
        disabled={currentPage === 1}
        onClick={() => setPage(currentPage - 1)}
      >
        이전
      </Pagination.Prev>
    );

    for (let num = startPage; num <= endPage && num <= maxPage; num++) {
      items.push(
        <Pagination.Item
          key={num}
          active={num === currentPage}
          onClick={() => setPage(num)}
        >
          {num}
        </Pagination.Item>
      );
    }

    items.push(
      <Pagination.Next
        key="next"
        disabled={currentPage === maxPage || count === 0}
        onClick={() => setPage(currentPage + 1)}
      >
        다음
      </Pagination.Next>,
      <Pagination.Last
        key="last"
        disabled={currentPage === maxPage || count === 0}
        onClick={() => setPage(maxPage)}
      >
        마지막
      </Pagination.Last>
    );

    return items;
  };

  return (
    <div className="EventContainerDiv">
      <NoticeNav />
      <div className="content-area">
        <div className="page-wrapper d-flex flex-column">
          <Container
            className="mt-2 "
            style={{
              minHeight: "600px", // 이거 핵심!! 페이지 전체 높이 확보
              display: "flex",
              flexDirection: "column",
              justifyContent: "start",
            }}
          >
            <Row className="my-4">
              <Col md={2}>
                <Form.Select
                  value={ingCategory}
                  onChange={(e) => setIngCategory(e.target.value)}
                >
                  <option value="allEvent">전체</option>
                  <option value="ingEvent">진행중</option>
                  <option value="endEvent">마감</option>
                </Form.Select>
              </Col>
              <Col md={2}>
                <Form.Select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="eventName">제목</option>
                  <option value="eventContent">내용</option>
                </Form.Select>
              </Col>
              <Col md={6}>
                <Form.Control
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault(); // 폼 submit 방지
                      handleSearch(); // 검색 함수 호출
                    }
                  }}
                  placeholder="검색어 입력"
                />
              </Col>
              <Col md={1}>
                <Button
                  className="w-100"
                  variant="secondary"
                  onClick={handleSearch}
                >
                  검색
                </Button>
              </Col>
              <Col md={1}>
                <Button
                  className="w-100"
                  variant="dark"
                  onClick={() => navigate("/admin/goAdminEventEnrollForm")}
                >
                  등록하기
                </Button>
              </Col>
            </Row>

            <Row>
              <Col>
                <Card>
                  <Card.Header className="bg-secondary text-white">
                    이벤트 게시판
                  </Card.Header>
                  <Card.Body className="p-0">
                    <Table striped bordered hover className="text-center mb-0">
                      <thead>
                        <tr>
                          <th>번호</th>
                          <th>제목</th>
                          <th>작성자</th>
                          <th>시작일자</th>
                          <th>마감일자</th>
                          <th>상태</th>
                        </tr>
                      </thead>
                      <tbody>
                        {events.length === 0 ? (
                          <tr>
                            <td colSpan="5">검색 결과가 없습니다.</td>
                          </tr>
                        ) : (
                          events.map((ev) => (
                            <tr
                              key={ev.eventNo}
                              style={{ cursor: "pointer" }}
                              onClick={() =>
                                navigate("/admin/goAdminEventDetailPage", {
                                  state: { event: ev },
                                })
                              }
                            >
                              <td>{ev.eventNo}</td>
                              <td>{ev.eventName}</td>
                              <td>{ev.memberNickname}</td>
                              <td>{ev.startDate}</td>
                              <td>{ev.endDate}</td>
                              <td
                                className={
                                  ev.statusName === "진행중"
                                    ? "text-success fw-bold"
                                    : ev.statusName === "마감"
                                    ? "text-danger fw-bold"
                                    : ""
                                }
                              >
                                {ev.statusName}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </Table>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Container>

          {/* 항상 아래에 붙는 페이징 */}
          <footer className="footer-pagination">
            <Pagination className="justify-content-center mb-0">
              {renderPagination()}
            </Pagination>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default AdminEventBoard;
