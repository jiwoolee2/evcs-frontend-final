import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Image,
  Card,
  Modal,
  Table,
} from "react-bootstrap";

/* nav 관련 애들 */
import AdminRentCarNav from "../../AdminCommon/AdminNav/AdminRentCarNav";
import {
  RentContainerDiv,
  RentBodyDiv,
} from "../AdminRentCarCommon/AdminRentCar.styles";

const RentCarDetails = () => {
  const location = useLocation();
  const navi = useNavigate();
  const [disabled, setDisabled] = useState(true);
  const [carInfoDisabled, setCarInfoDisabled] = useState(true);
  const [imagePreview, setImagePreview] = useState(null);
  const {
    carNo,
    carName,
    carCompany,
    carType,
    carYear,
    rentCarNo,
    categoryName,
    rentCarPrice,
    enrollPlace,
    postAdd,
    garageNo,
    status,
    categoryNo,
  } = location.state;
  const apiUrl = window.ENV?.API_URL || "http://localhost:8080";
  const [optionList, setOptionList] = useState([]); // 전체 옵션 목록
  const [selectedOptions, setSelectedOptions] = useState([]); // 체크된 옵션 번호

  const [form, setForm] = useState({
    carNo: carNo,
    carName: carName,
    carCompany: carCompany,
    carType: carType,
    carYear: carYear,
    rentCarNo: rentCarNo,
    categoryName: categoryName,
    rentCarPrice: rentCarPrice,
    enrollPlace: enrollPlace,
    postAdd: postAdd,
    garageNo: garageNo,
    status: status,
    categoryNo: categoryNo,
  });

  // --- 주소 찾기 모달 관련 상태들 추가  ---
  const [addressModal, setAddressModal] = useState(false);
  const [regionList, setRegionList] = useState([]); // 전체 지역 데이터
  const [garages, setGarages] = useState([]); // 검색된 차고지 (주소) 리스트
  const [regionSido, setRegionSido] = useState("");
  const [regionSigungu, setRegionSigungu] = useState("");
  const [regionDong, setRegionDong] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");

  // 중복 제거 함수
  const getUniqueList = (arr, key) => {
    const seen = new Set();
    return arr.filter((item) => {
      const v = item[key];
      if (seen.has(v)) return false;
      seen.add(v);
      return true;
    });
  };

  // 시/도, 시군구, 동 필터된 옵션들
  const filteredSigungu = regionList.filter((i) => i.regionSido === regionSido);
  const filteredDong = filteredSigungu.filter(
    (i) => i.regionSigungu === regionSigungu
  );
  const sidoOptions = getUniqueList(regionList, "regionSido");
  const sigunguOptions = getUniqueList(filteredSigungu, "regionSigungu");
  const dongOptions = getUniqueList(filteredDong, "regionDong");

  // 주소 모달 열릴 때 & 검색 파라미터 바뀔 때마다 데이터 조회
  useEffect(() => {
    if (!addressModal) return;
    axios
      .get(`${apiUrl}/admin-garages`, {
        params: {
          regionSido,
          regionSigungu,
          regionDong,
          status: "ing",
          searchKeyword,
        },
      })
      .then((res) => {
        setGarages(res.data.garageList || []);
        setRegionList(res.data.regionList || []);
      })
      .catch(console.error);
  }, [
    addressModal,
    regionSido,
    regionSigungu,
    regionDong,
    status,
    searchKeyword,
  ]);

  const handleRegionSearch = () => {
    // 모달 열려있을 때 같은 effect 를 강제 실행
    axios
      .get(`${apiUrl}/admin-garages`, {
        params: {
          regionSido,
          regionSigungu,
          regionDong,
          status,
          searchKeyword,
        },
      })
      .then((res) => {
        setGarages(res.data.garageList || []);
        setRegionList(res.data.regionList || []);
      })
      .catch(console.error);
  };

  useEffect(() => {
    axios
      .get(`${apiUrl}/car/image/${carName}`)
      .then((result) => {
        console.log(result.data);
        setImagePreview(result.data.fileLoad);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  useEffect(() => {
    console.log("렌트카 번호 확인: ", rentCarNo);

    axios
      .get(`${apiUrl}/rentCar/rentCaroptions`, {
        params: { rentCarNo: rentCarNo },
      })
      .then((res) => {
        console.log("등록된 옵션들: ", res.data);

        // 등록된 옵션 번호들만 추출
        const selected = res.data.map((opt) => opt.optionNo);

        setSelectedOptions(selected); // 선택된 옵션 번호만 저장
      })
      .catch((err) => {
        console.error("옵션 리스트 불러오기 실패:", err);
      });

    // 전체 옵션 목록은 따로 불러오기
    axios
      .get(`${apiUrl}/rentCar/options`)
      .then((res) => {
        console.log("전체 옵션 목록: ", res.data);
        setOptionList(res.data); // 전체 옵션 [{optionNo, optionName}, ...]
      })
      .catch((err) => {
        console.error("전체 옵션 목록 실패:", err);
      });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleWrite = (e) => {
    if (disabled) {
      setDisabled(false);
    } else {
      setDisabled(true);
    }
  };

  const carCompanyRef = useRef();
  const carTypeRef = useRef();
  const carNameRef = useRef();
  const rentCarNoRef = useRef();
  const categoryNameRef = useRef();
  const rentCarPriceRef = useRef();
  const enrollPlaceRef = useRef();

  const handleUpdate = (e) => {
    e.preventDefault();

    // 빈 값 체크 & ref 매핑
    const checks = [
      { val: form.carCompany, name: "제조사", ref: carCompanyRef },
      { val: form.carType, name: "차종", ref: carTypeRef },
      { val: form.carName, name: "모델명", ref: carNameRef },
      { val: form.rentCarNo, name: "차 번호", ref: rentCarNoRef },
      { val: form.categoryName, name: "카테고리", ref: categoryNameRef },
      { val: form.rentCarPrice, name: "가격", ref: rentCarPriceRef },
      { val: form.enrollPlace, name: "차고지", ref: enrollPlaceRef },
    ];
    const missing = checks.find((c) => !c.val?.toString().trim());
    if (missing) {
      alert(`${missing.name}를 입력해주세요.`);
      missing.ref.current.focus();
      return;
    }

    axios
      .post(`${apiUrl}/rentCar/update`, {
        ...form,
        optionNos: selectedOptions,
      })
      .then((result) => {
        console.log("등록된 데이터:", result);
        alert("차량이 수정되었습니다.");
        setDisabled(true);
      })
      .catch((error) => {
        console.log(error);
        alert("오류");
      });
  };

  const handleDelete = (e) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    axios
      .post(`${apiUrl}/rentCar/delete`, form, {
        headers: {
          "content-Type": "application/json",
        },
      })
      .then((result) => {
        console.log("삭제된 데이터:", result);
        alert("차량이 삭제되었습니다.");
        navi("/admin/rentCarManagement");
      })
      .catch((error) => {
        console.log(error);
        alert("오류");
      });
  };

  return (
    <>
      <RentContainerDiv>
        <AdminRentCarNav />

        <RentBodyDiv>
          <Container style={{ maxWidth: "600px" }}>
            <Card className="p-4 shadow-sm">
              {/* 이미지 업로드 */}
              <div className="mb-3 text-center">
                {imagePreview ? (
                  <Image
                    src={imagePreview}
                    alt="차 미리보기"
                    fluid
                    style={{ maxHeight: "200px", objectFit: "cover" }}
                  />
                ) : (
                  <div
                    style={{
                      width: "100%",
                      height: "180px",
                      backgroundColor: "#ddd",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <span>차 사진</span>
                  </div>
                )}
              </div>
              <Form>
                <Row className="mb-3">
                  {/* 차 이름 */}
                  <Col>
                    <Form.Group className="mb-3" controlId="carName">
                      <Form.Label className="fw-bold ">모델명 :</Form.Label>
                      <Form.Control
                        type="text"
                        name="carName"
                        value={form.carName}
                        disabled={carInfoDisabled}
                      />
                    </Form.Group>
                  </Col>
                  <Col>
                    <Form.Group className="mb-3" controlId="rentCarNo">
                      <Form.Label className="fw-bold ">차 번호 :</Form.Label>
                      <Form.Control
                        type="text"
                        name="rentCarNo"
                        value={form.rentCarNo}
                        onChange={handleChange}
                        disabled={carInfoDisabled}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                {/* 연식 + 카테고리 */}
                <Row className="mb-3">
                  <Col>
                    <Form.Group controlId="carYear">
                      <Form.Label className="fw-bold ">연식 :</Form.Label>
                      <Form.Control
                        type="text"
                        name="carYear"
                        value={form.carYear}
                        onChange={handleChange}
                        disabled={carInfoDisabled}
                      />
                    </Form.Group>
                  </Col>
                  <Col>
                    <Form.Group controlId="carType">
                      <Form.Label className="fw-bold ">차종 :</Form.Label>
                      <Form.Control
                        type="text"
                        name="carType"
                        value={form.carType}
                        onChange={handleChange}
                        disabled={carInfoDisabled}
                      />
                    </Form.Group>
                  </Col>
                  <Col>
                    <Form.Group controlId="carCompany">
                      <Form.Label className="fw-bold ">제조사 :</Form.Label>
                      <Form.Control
                        type="text"
                        name="carCompany"
                        value={form.carCompany}
                        onChange={handleChange}
                        disabled={carInfoDisabled}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                {/* 가격 */}
                <Row>
                  <Col>
                    <Form.Group controlId="categoryName">
                      <Form.Label className="fw-bold ">카테고리 :</Form.Label>
                      <Form.Select
                        name="categoryName"
                        value={form.categoryName}
                        onChange={handleChange}
                        disabled={disabled}
                      >
                        <option>선택</option>
                        <option>시간별렌트카</option>
                        <option>장기렌트카</option>
                        <option>구독렌트카</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col>
                    <Form.Group className="mb-3" controlId="rentCarPrice">
                      <Form.Label className="fw-bold ">가격 :</Form.Label>
                      <Form.Control
                        type="text"
                        name="rentCarPrice"
                        value={form.rentCarPrice}
                        onChange={handleChange}
                        disabled={disabled}
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">옵션 :</Form.Label>
                  <div>
                    {optionList.map((opt) => (
                      <Form.Check
                        inline
                        key={opt.optionNo}
                        label={opt.optionName}
                        value={opt.optionNo}
                        type="checkbox"
                        checked={selectedOptions.includes(opt.optionNo)}
                        onChange={(e) => {
                          const value = parseInt(e.target.value);
                          if (e.target.checked) {
                            setSelectedOptions([...selectedOptions, value]);
                          } else {
                            setSelectedOptions(
                              selectedOptions.filter((o) => o !== value)
                            );
                          }
                        }}
                        disabled={disabled}
                      />
                    ))}
                  </div>
                </Form.Group>
                {/* 변경된 부분: enrollPlace + postAdd를 한 줄에 */}
                <Row className="mb-4" style={{ alignItems: "flex-end" }}>
                  {/* 등록 주소 */}
                  <Col md={7}>
                    <Form.Group controlId="enrollPlace">
                      <Form.Label className="fw-bold">등록 주소 :</Form.Label>
                      <Form.Control
                        type="text"
                        name="enrollPlace"
                        ref={enrollPlaceRef}
                        value={form.enrollPlace}
                        placeholder="주소 찾기 버튼을 눌러주세요"
                        disabled
                      />
                    </Form.Group>
                  </Col>

                  {/* 우편번호 */}
                  <Col md={2}>
                    <Form.Group controlId="postAdd">
                      <Form.Control
                        type="text"
                        name="postAdd"
                        value={form.postAdd}
                        disabled
                      />
                    </Form.Group>
                  </Col>

                  {/* 주소 찾기 버튼 */}
                  <Col md={3} className="text-end">
                    {!disabled && (
                      <Button
                        variant="secondary"
                        onClick={() => setAddressModal(true)}
                      >
                        주소 찾기
                      </Button>
                    )}
                  </Col>
                </Row>

                <div className="text-center">
                  {disabled ? (
                    <>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <div>
                          <Button
                            type="button"
                            variant="secondary"
                            onClick={() => navi(-1)}
                          >
                            뒤로가기
                          </Button>
                        </div>
                        <div>
                          <Button
                            type="button"
                            variant="dark"
                            onClick={handleWrite}
                            style={{ marginRight: "10px" }}
                          >
                            수정하기
                          </Button>
                          <Button
                            type="button"
                            variant="danger"
                            onClick={handleDelete}
                          >
                            삭제하기
                          </Button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <div>
                          <Button variant="secondary" onClick={handleWrite}>
                            취소
                          </Button>
                        </div>
                        <div>
                          <Button
                            type="button"
                            variant="dark"
                            onClick={handleUpdate}
                          >
                            수정완료
                          </Button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </Form>
            </Card>
          </Container>
        </RentBodyDiv>
      </RentContainerDiv>

      <Modal
        show={addressModal}
        onHide={() => setAddressModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>주소 찾기</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Container>
            <Row className="mb-3">
              {/* 상태(전체/사용중/사용중지) */}
              {/* 시/도 */}
              <Col md={2}>
                <Form.Select
                  value={regionSido}
                  onChange={(e) => {
                    setRegionSido(e.target.value);
                    setRegionSigungu("");
                    setRegionDong("");
                    setSearchKeyword("");
                  }}
                >
                  <option value="">시/도 선택</option>
                  {sidoOptions.map((o) => (
                    <option key={o.regionSido} value={o.regionSido}>
                      {o.regionSido}
                    </option>
                  ))}
                </Form.Select>
              </Col>
              {/* 시군구 */}
              <Col md={2}>
                <Form.Select
                  value={regionSigungu}
                  disabled={!regionSido}
                  onChange={(e) => {
                    setRegionSigungu(e.target.value);
                    setRegionDong("");
                    setSearchKeyword("");
                  }}
                >
                  <option value="">시군구 선택</option>
                  {sigunguOptions.map((o) => (
                    <option key={o.regionSigungu} value={o.regionSigungu}>
                      {o.regionSigungu}
                    </option>
                  ))}
                </Form.Select>
              </Col>
              {/* 동 */}
              <Col md={2}>
                <Form.Select
                  value={regionDong}
                  disabled={!regionSigungu}
                  onChange={(e) => {
                    setRegionDong(e.target.value);
                    setSearchKeyword("");
                  }}
                >
                  <option value="">동 선택</option>
                  {dongOptions.map((o) => (
                    <option key={o.regionDong} value={o.regionDong}>
                      {o.regionDong}
                    </option>
                  ))}
                </Form.Select>
              </Col>
              {/* 검색어 */}
              <Col md={4}>
                <Form.Control
                  value={searchKeyword}
                  placeholder="검색어"
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleRegionSearch();
                    }
                  }}
                />
              </Col>
              <Col md={2}>
                <Button
                  className="w-100"
                  variant="secondary"
                  onClick={handleRegionSearch}
                >
                  검색
                </Button>
              </Col>
            </Row>

            <Row>
              <Col>
                <div
                  style={{
                    maxHeight: "300px", // 테이블 영역 최대 높이
                    overflowY: "auto", // 세로 스크롤 활성화
                    marginTop: "1rem",
                    border: "1px solid #dee2e6",
                    borderRadius: "0.25rem",
                  }}
                >
                  <Table striped bordered hover size="sm">
                    <thead>
                      <tr>
                        <th>번호</th>
                        <th>전체 주소</th>
                        <th>우편번호</th>
                        <th>상세 주소</th>
                        <th>등록일</th>
                        <th>상태</th>
                      </tr>
                    </thead>
                    <tbody>
                      {garages.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center">
                            검색 결과가 없습니다.
                          </td>
                        </tr>
                      ) : (
                        garages.map((g) => (
                          <tr
                            key={g.garageNo}
                            style={{ cursor: "pointer" }}
                            onClick={() => {
                              // 클릭 시 모달 닫고, form.enrollPlace에 allAddress 세팅
                              setForm((f) => ({
                                ...f,
                                enrollPlace: g.allAddress,
                                postAdd: g.postAdd,
                                garageNo: g.garageNo,
                              }));
                              setAddressModal(false);
                            }}
                          >
                            <td>{g.garageNo}</td>
                            <td>{g.allAddress}</td>
                            <td>{g.postAdd}</td>
                            <td>{g.address}</td>
                            <td>{g.enrollDate}</td>
                            <td
                              className={
                                g.statusName === "사용중"
                                  ? "text-success fw-bold"
                                  : g.statusName === "사용중지"
                                  ? "text-danger fw-bold"
                                  : ""
                              }
                            >
                              {g.statusName}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </Table>
                </div>
              </Col>
            </Row>
          </Container>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setAddressModal(false)}>
            닫기
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default RentCarDetails;
