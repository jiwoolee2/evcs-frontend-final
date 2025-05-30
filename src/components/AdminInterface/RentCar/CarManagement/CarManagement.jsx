import { useState, useEffect } from "react";
import { Container, Row, Col, Form, Button, Table } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";

/* nav 관련 애들 */
import AdminRentCarNav from "../../AdminCommon/AdminNav/AdminRentCarNav";
import {
  RentContainerDiv,
  RentBodyDiv,
} from "../AdminRentCarCommon/AdminRentCar.styles";

const CarManagement = () => {
  const navigate = useNavigate();

  const [searchKeyword, setSearchKeyword] = useState("");
  const [carType, setCarType] = useState([]);
  const [carTypeNo, setCarTypeNo] = useState("");
  const [carCompany, setCarCompany] = useState([]);
  const [carCompanyNo, setCarCompanyNo] = useState("");
  const [carInfo, setCarInfo] = useState([]);
  const apiUrl = window.ENV?.API_URL || "http://localhost:80";
  useEffect(() => {
    axios
      .get(`${apiUrl}/car`, {
        params: {
          carCompanyNo: carCompanyNo,
          carTypeNo: carTypeNo,
          searchKeyword: searchKeyword,
        },
      })
      .then((result) => {
        console.log(result.data);
        setCarInfo(result.data.carInfo);
        setCarCompany(result.data.carCompanyInfo);
        setCarType(result.data.carTypeInfo);
      })
      .catch((error) => {
        console.log(error);
      });
  }, [carCompanyNo, carTypeNo]);

  const handleSearch = () => {
    axios
      .get(`${apiUrl}/car`, {
        params: {
          carCompanyNo: carCompanyNo,
          carTypeNo: carTypeNo,
          searchKeyword: searchKeyword,
        },
      })
      .then((result) => {
        setCarInfo(result.data.carInfo);
        setCarCompany(result.data.carCompanyInfo);
        setCarType(result.data.carTypeInfo);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  return (
    <>
      <RentContainerDiv>
        <AdminRentCarNav />
        <div style={{ width: "100%" }}>
          <RentBodyDiv>
            <Container
              className="mt-2 "
              style={{
                minHeight: "600px", // 이거 핵심!! 페이지 전체 높이 확보
                display: "flex",
                flexDirection: "column",
                justifyContent: "start",
              }}
            >
              {/* 상단 필터 영역 */}
              <Row className="mb-3">
                <Col md={2}>
                  <Form.Select
                    value={carCompanyNo}
                    onChange={(e) => setCarCompanyNo(e.target.value)}
                  >
                    <option value="">제조사</option>
                    {carCompany.map((item) => (
                      <option key={item.companyNo} value={item.companyNo}>
                        {item.companyName}
                      </option>
                    ))}
                  </Form.Select>
                </Col>
                <Col md={3}>
                  <Form.Select
                    value={carTypeNo}
                    onChange={(e) => setCarTypeNo(e.target.value)}
                  >
                    <option value="">차종</option>
                    {carType.map((item) => (
                      <option key={item.carTypeNo} value={item.carTypeNo}>
                        {item.carTypeName}
                      </option>
                    ))}
                  </Form.Select>
                </Col>
                <Col md={4}>
                  <Form.Control
                    type="text"
                    placeholder="검색 내용"
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault(); // 폼 submit 방지
                        handleSearch(); // 검색 함수 호출
                      }
                    }}
                  />
                </Col>
                <Col md={2}>
                  <Button variant="secondary" onClick={handleSearch}>
                    검색
                  </Button>
                </Col>
                <Col md={1}>
                  <Button
                    variant="dark"
                    onClick={() =>
                      navigate("/admin/insertCar", {
                        state: {
                          carType: carType,
                          carCompany: carCompany,
                        },
                      })
                    } // 등록 페이지로 이동
                  >
                    등록하기
                  </Button>
                </Col>
              </Row>

              {/* 차량 리스트 테이블 */}
              <Table bordered hover responsive>
                <thead
                  className="table-secondary"
                  style={{ textAlign: "center" }}
                >
                  <tr>
                    <th>모델명</th>
                    <th>차종</th>
                    <th>연식</th>
                    <th>제조사</th>
                    <th>배터리 용량</th>
                    <th>등록일</th>
                  </tr>
                </thead>
                <tbody>
                  {carInfo.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center">
                        등록된 차량이 없습니다.
                      </td>
                    </tr>
                  ) : (
                    carInfo.map((car, index) => (
                      <tr
                        key={index}
                        onClick={() =>
                          navigate("/admin/carDetails", {
                            state: {
                              car: car,
                              carType: carType,
                              carCompany: carCompany,
                            },
                          })
                        }
                        style={{ cursor: "pointer" }}
                      >
                        <td>{car.carName}</td>
                        <td>{car.carTypeName}</td>
                        <td>{car.carYear}</td>
                        <td>{car.companyName}</td>
                        <td>{car.carBattery}</td>
                        <td>{car.returnEnrollDate}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </Container>
          </RentBodyDiv>
        </div>
      </RentContainerDiv>
    </>
  );
};

export default CarManagement;
