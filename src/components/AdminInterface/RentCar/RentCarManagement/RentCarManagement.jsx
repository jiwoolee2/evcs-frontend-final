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
import Pagination from "../../AdminCommon/Pagination/GetPageInfo.jsx";

const RentCarManagement = () => {
  const navigate = useNavigate();

  const [category, setCategory] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageInfo, setPageInfo] = useState(null);
  const [carInfo, setCarInfo] = useState([]);
  const [rentCarInfo, setRentCarInfo] = useState([]);
  const [useStatus, setUseStatus] = useState("");

  useEffect(() => {
    axios
      .get(`http://localhost/rentCar/${currentPage}`, {
        params: {
          useStatus, // 사용중인지 아닌지
          category, // 카테고리
          searchKeyword, // 검색어
        },
      })
      .then((result) => {
        const res = result.data;

        setRentCarInfo(res.rentCarInfo);
        setPageInfo(res.pageInfo);

        const carList = res.carInfo.map((carinformation) => ({
          carNo: carinformation.carNo,
          carName: carinformation.carName,
          carType: carinformation.carType,
          carYear: carinformation.carYear,
          carCompany: carinformation.carCompany,
        }));

        setCarInfo([...carList]);

        const rentCarList = res.rentCarInfo.map((rentCarinformation) => ({
          rentCarNo: rentCarinformation.rentCarNo,
          categoryName: rentCarinformation.categoryName,
          carNo: rentCarinformation.carNo,
          rentCarPrice: rentCarinformation.rentCarPrice,
          enrollPlace: rentCarinformation.enrollPlace,
          postAdd: rentCarinformation.postAdd,
          enrollDate: rentCarinformation.enrollDate,
          garageNo: rentCarinformation.garageNo,
          status: rentCarinformation.status,
          statusName: rentCarinformation.statusName,
          categoryNo: rentCarinformation.categoryNo,
          reserStatus: rentCarinformation.reserStatus,
        }));

        setRentCarInfo([...rentCarList]);
        console.log("데이타 ", result.data);
      })
      .catch((error) => {
        console.log(error);
      });
  }, [currentPage, category, useStatus]);

  const handleSearch = () => {
    axios
      .get(`http://localhost/rentCar/${currentPage}`, {
        params: {
          useStatus, // 사용중인지 아닌지
          category, // 카테고리
          searchKeyword, // 검색어
        },
      })
      .then((result) => {
        console.log(result.data);
        const res = result.data;
        setPageInfo(res.pageInfo);
        setRentCarInfo(res.rentCarInfo);

        const carList = res.carInfo.map((carinformation) => ({
          carNo: carinformation.carNo,
          carName: carinformation.carName,
          carType: carinformation.carType,
          carYear: carinformation.carYear,
          carCompany: carinformation.carCompany,
        }));

        setCarInfo(carList);

        const rentCarList = res.rentCarInfo.map((rentCarinformation) => ({
          rentCarNo: rentCarinformation.rentCarNo,
          categoryName: rentCarinformation.categoryName,
          carNo: rentCarinformation.carNo,
          rentCarPrice: rentCarinformation.rentCarPrice,
          enrollPlace: rentCarinformation.enrollPlace,
          postAdd: rentCarinformation.postAdd,
          enrollDate: rentCarinformation.enrollDate,
          garageNo: rentCarinformation.garageNo,
          status: rentCarinformation.status,
          statusName: rentCarinformation.statusName,
        }));

        setRentCarInfo(rentCarList);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  console.log("rentCarList :", rentCarInfo);
  console.log("carInfo :", carInfo);

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
                    value={useStatus}
                    onChange={(e) => setUseStatus(e.target.value)}
                  >
                    <option value="">선택</option>
                    <option value="ing">사용중</option>
                    <option value="noIng">사용불가</option>
                  </Form.Select>
                </Col>
                <Col md={2}>
                  <Form.Select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <option value="">선택</option>
                    <option value="allAddress">등록 주소지</option>
                    <option value="postAdd">우편번호</option>
                    <option value="carNo">차번호</option>
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
                        e.preventDefault(); // 폼 제출이 되지 않도록 방지
                        handleSearch(); // 검색 함수 호출
                      }
                    }}
                  />
                </Col>
                <Col md={3}>
                  <Button variant="secondary" onClick={handleSearch}>
                    검색
                  </Button>
                </Col>
                <Col md={1}>
                  <Button
                    variant="dark"
                    onClick={() => navigate("/admin/insertRentCar")} // 등록 페이지로 이동
                  >
                    등록
                  </Button>
                </Col>
              </Row>

              {/* 차량 리스트 테이블 */}
              <Table bordered hover responsive>
                <thead className="table-secondary">
                  <tr style={{ textAlign: "center" }}>
                    <th>카테고리</th>
                    <th>차 번호</th>
                    <th>모델명</th>
                    <th>차종</th>
                    <th>제조사</th>
                    <th>연식</th>
                    <th>등록 주소지</th>
                    <th>우편번호</th>
                    <th>가격</th>
                    <th>가용 여부</th>
                    <th>등록일자</th>
                    <th>상태</th>
                  </tr>
                </thead>
                <tbody>
                  {rentCarInfo.length === 0 ? (
                    <tr>
                      <td colSpan="12" className="text-center">
                        등록된 차량이 없습니다.
                      </td>
                    </tr>
                  ) : (
                    rentCarInfo.map((car, index) => (
                      <tr
                        key={index}
                        onClick={() =>
                          navigate("/admin/rentCarDetails", {
                            state: {
                              carNo: carInfo[index].carNo,
                              carName: carInfo[index].carName,
                              carCompany: carInfo[index].carCompany,
                              carType: carInfo[index].carType,
                              carYear: carInfo[index].carYear,
                              categoryName: car.categoryName,
                              rentCarNo: car.rentCarNo,
                              rentCarPrice: car.rentCarPrice,
                              enrollPlace: car.enrollPlace,
                              postAdd: car.postAdd,
                              garageNo: car.garageNo,
                              status: car.status,
                              categoryNo: car.categoryNo,
                              optionNos: car.optionNos,
                            },
                          })
                        }
                        style={{ cursor: "pointer" }}
                      >
                        <td>{car.categoryName}</td>
                        <td>{car.rentCarNo}</td>
                        <td>{carInfo[index].carName}</td>
                        <td>{carInfo[index].carType}</td>
                        <td>{carInfo[index].carCompany}</td>
                        <td>{carInfo[index].carYear}</td>
                        <td>{car.enrollPlace}</td>
                        <td>{car.postAdd}</td>
                        <td>{car.rentCarPrice}</td>
                        <td>{car.reserStatus}</td>
                        <td>{car.enrollDate}</td>
                        <td
                          className={
                            car.statusName === "사용중"
                              ? "text-success fw-bold"
                              : car.statusName === "사용불가"
                              ? "text-danger fw-bold"
                              : ""
                          }
                        >
                          {car.statusName}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </Container>
            {pageInfo && (
              <Pagination
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                pageInfo={pageInfo}
              />
            )}
          </RentBodyDiv>
        </div>
      </RentContainerDiv>
    </>
  );
};

export default RentCarManagement;
