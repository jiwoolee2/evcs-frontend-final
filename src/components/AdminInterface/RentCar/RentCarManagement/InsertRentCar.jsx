import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
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

const InsertRentCar = () => {
  const navi = useNavigate();
  const [imagePreview, setImagePreview] = useState(null);
  const [category, setCategory] = useState([]);
  const [carInfo, setCarInfo] = useState([]);
  const [form, setForm] = useState({
    rentCarNo: "",
    categoryName: "",
    carNo: "",
    rentCarPrice: "",
    carName: "",
    enrollPlace: "",
    carCompanyNo: "",
    carCompanyName: "",
    carYear: "",
    carTypeNo: "",
    carTypeName: "",
    garageNo: "",
  });

  // --- 주소 찾기 모달 관련 상태들 추가  ---
  const [addressModal, setAddressModal] = useState(false);
  const [regionList, setRegionList] = useState([]); // 전체 지역 데이터
  const [garages, setGarages] = useState([]); // 검색된 차고지 (주소) 리스트
  const [regionSido, setRegionSido] = useState("");
  const [regionSigungu, setRegionSigungu] = useState("");
  const [regionDong, setRegionDong] = useState("");
  const [status, setStatus] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");

  const [options, setOptions] = useState([]); // 전체 옵션 목록
  const [selectedOptions, setSelectedOptions] = useState([]); // 선택된 옵션번호 배열
  const apiUrl = window.ENV?.API_URL || "http://localhost:8080";
  useEffect(() => {
    axios
      .get(`${apiUrl}/rentCar/options`) // 옵션 목록 불러오기
      .then((res) => {
        console.log("옵션들 : ", res.data);
        setOptions(res.data); // [{ optionNo: 1, optionName: '네비' }, ...]
      })
      .catch(console.error);
  }, []);

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
      .get(`${apiUrl}/rentCar/category`)
      .then((result) => {
        console.log(result.data);
        setCategory(result.data.categoryInfo);
      })
      .catch((error) => {
        console.log(error);
      });

    axios
      .get(`${apiUrl}/rentCar/carInfo`)
      .then((res) => {
        console.log("res.data : ", res.data);
        const data = res.data.carInfoResult.map((item, idx) => ({
          carNo: item.carNo,
          carName: item.carName,
          carTypeNo: item.carTypeNo,
          carTypeName: item.carTypeName,
          carCompanyNo: item.companyNo,
          carCompanyName: item.companyName,
          carYear: item.carYear,
          carImage: res.data.imageResult[idx].fileLoad,
        }));
        setCarInfo(data);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleCarName = (e) => {
    const sel = carInfo.find((i) => i.carName === e.target.value);
    if (!sel) return;
    setForm((f) => ({
      ...f,
      carName: sel.carName,
      carNo: sel.carNo,
      carYear: sel.carYear,
      carCompanyNo: sel.carCompanyNo,
      carCompanyName: sel.carCompanyName,
      carTypeNo: sel.carTypeNo,
      carTypeName: sel.carTypeName,
    }));
    setImagePreview(sel.carImage);
  };

  //  필드별 ref 선언
  const carCompanyRef = useRef();
  const carTypeRef = useRef();
  const carNameRef = useRef();
  const rentCarNoRef = useRef();
  const categoryNameRef = useRef();
  const rentCarPriceRef = useRef();
  const enrollPlaceRef = useRef();

  const handleSubmit = (e) => {
    e.preventDefault();

    // 빈 값 체크 & ref 매핑
    const checks = [
      { val: form.carCompanyNo, name: "제조사", ref: carCompanyRef },
      { val: form.carTypeNo, name: "차종", ref: carTypeRef },
      { val: form.carName, name: "모델명", ref: carNameRef },
      { val: form.rentCarNo, name: "차 번호", ref: rentCarNoRef },
      { val: form.categoryNo, name: "카테고리", ref: categoryNameRef },
      { val: form.rentCarPrice, name: "가격", ref: rentCarPriceRef },
      { val: form.garageNo, name: "차고지", ref: enrollPlaceRef },
    ];
    const missing = checks.find((c) => !c.val?.toString().trim());
    if (missing) {
      alert(`${missing.name}를 입력해주세요.`);
      missing.ref.current.focus();
      return;
    }
    axios
      .post(`${apiUrl}/rentCar/insert`, {
        rentCarNo: form.rentCarNo,
        categoryNo: form.categoryNo,
        companyNo: form.carCompanyNo,
        carTypeNo: form.carTypeNo,
        carNo: form.carNo,
        rentCarPrice: form.rentCarPrice,
        garageNo: form.garageNo,
        optionNos: selectedOptions,
      })
      .then((result) => {
        alert("차량이 등록되었습니다!");
        navi("/admin/rentCarManagement");
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const companyOptions = Array.from(
    new Map(
      carInfo
        .filter((i) => i.carCompanyNo != null) // null 항목 제거
        .map((i) => [i.carCompanyNo, i.carCompanyName])
    ).entries()
  ).map(([companyNo, companyName]) => ({ companyNo, companyName }));

  const typeOptions = form.carCompanyNo
    ? Array.from(
        new Map(
          carInfo
            .filter(
              (i) => i.carCompanyNo === form.carCompanyNo && i.carTypeNo != null // null 항목 제거
            )
            .map((i) => [i.carTypeNo, i.carTypeName])
        ).entries()
      ).map(([carTypeNo, carTypeName]) => ({ carTypeNo, carTypeName }))
    : [];

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

              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col>
                    <Form.Group className="mb-3" controlId="carCompany">
                      <Form.Label className="fw-bold">제조사 :</Form.Label>
                      <Form.Select
                        name="carCompanyNo"
                        value={form.carCompanyNo}
                        ref={carCompanyRef}
                        onChange={(e) => {
                          const companyNo = parseInt(e.target.value, 10);
                          const companyName =
                            companyOptions.find((c) => c.companyNo == companyNo)
                              ?.companyName || "";
                          setForm({
                            ...form,
                            carCompanyNo: companyNo,
                            carCompanyName: companyName,
                            // 차종·모델 초기화
                            carTypeNo: "",
                            carTypeName: "",
                            carName: "",
                            carNo: "",
                            carYear: "",
                          });
                          setImagePreview(null);
                        }}
                      >
                        <option value="">제조사 선택</option>
                        {companyOptions.map(({ companyNo, companyName }) => (
                          <option key={companyNo} value={companyNo}>
                            {companyName}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col>
                    {/* ✨ 수정: 차종 드롭박스 */}
                    <Form.Group className="mb-3" controlId="carType">
                      <Form.Label className="fw-bold">차종 :</Form.Label>
                      <Form.Select
                        name="carTypeNo"
                        value={form.carTypeNo}
                        ref={carTypeRef}
                        disabled={!form.carCompanyNo}
                        onChange={(e) => {
                          const typeNo = parseInt(e.target.value, 10);
                          const typeName =
                            typeOptions.find((t) => t.carTypeNo == typeNo)
                              ?.carTypeName || "";
                          setForm({
                            ...form,
                            carTypeNo: typeNo,
                            carTypeName: typeName,
                            // 모델명 초기화
                            carName: "",
                            carNo: "",
                            carYear: "",
                          });
                          setImagePreview(null);
                        }}
                      >
                        <option value="">차종 선택</option>
                        {typeOptions.map(({ carTypeNo, carTypeName }) => (
                          <option key={carTypeNo} value={carTypeNo}>
                            {carTypeName}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col>
                    {/* 차 이름 */}
                    <Form.Group className="mb-3" controlId="carName">
                      <Form.Label className="fw-bold ">모델명 :</Form.Label>
                      <Form.Select
                        name="carName"
                        value={form.carName}
                        onChange={handleCarName}
                        ref={carNameRef}
                        disabled={!form.carCompanyNo || !form.carTypeNo}
                      >
                        <option>선택</option>
                        {carInfo
                          .filter(
                            (item) =>
                              item.carCompanyNo === form.carCompanyNo &&
                              item.carTypeNo === form.carTypeNo
                          )
                          .map((item) => (
                            <option key={item.carNo} value={item.carName}>
                              {item.carName}
                            </option>
                          ))}
                      </Form.Select>
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
                        disabled={true}
                      />
                    </Form.Group>
                  </Col>
                  <Col>
                    <Form.Group className="mb-3" controlId="rentCarNo">
                      <Form.Label className="fw-bold ">차 번호 :</Form.Label>
                      <Form.Control
                        type="text"
                        name="rentCarNo"
                        ref={rentCarNoRef}
                        value={form.rentCarNo}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                {/* 가격 */}
                <Row>
                  <Col>
                    <Form.Group controlId="categoryNo">
                      <Form.Label className="fw-bold ">카테고리 :</Form.Label>
                      <Form.Select
                        name="categoryNo"
                        value={form.categoryNo}
                        ref={categoryNameRef}
                        onChange={handleChange}
                      >
                        <option>선택</option>
                        {category.map((item) => (
                          <option key={item.categoryNo} value={item.categoryNo}>
                            {item.categoryName}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col>
                    <Form.Group className="mb-3" controlId="rentCarPrice">
                      <Form.Label className="fw-bold">가격 :</Form.Label>
                      <Form.Control
                        type="text"
                        name="rentCarPrice"
                        ref={rentCarPriceRef}
                        value={form.rentCarPrice}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Form.Group className="mb-3" controlId="carOptions">
                  <Form.Label className="fw-bold">차량 옵션 :</Form.Label>
                  <Row>
                    {options.map((opt) => {
                      const inputId = `option-${opt.optionNo}`; // 고유 id 생성
                      return (
                        <Col xs={6} key={opt.optionNo}>
                          <Form.Check
                            id={inputId} // 🔑 고유 ID
                            type="checkbox"
                            label={opt.optionName}
                            checked={selectedOptions.includes(opt.optionNo)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedOptions((prev) => [
                                  ...prev,
                                  opt.optionNo,
                                ]);
                              } else {
                                setSelectedOptions((prev) =>
                                  prev.filter((no) => no !== opt.optionNo)
                                );
                              }
                            }}
                          />
                        </Col>
                      );
                    })}
                  </Row>
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
                    <Button
                      variant="secondary"
                      onClick={() => setAddressModal(true)}
                    >
                      주소 찾기
                    </Button>
                  </Col>
                </Row>
                <div
                  style={{
                    marginTop: "50px",
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <Button variant="secondary" onClick={() => navi(-1)}>
                      뒤로가기
                    </Button>
                  </div>
                  <div>
                    <Button type="submit" variant="dark">
                      등록하기
                    </Button>
                  </div>
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
              <Col md={4}>
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
              <Col md={4}>
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
              <Col md={4}>
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

export default InsertRentCar;
