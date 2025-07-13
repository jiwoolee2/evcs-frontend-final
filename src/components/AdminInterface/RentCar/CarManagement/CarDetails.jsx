import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Image,
  Card,
} from "react-bootstrap";
/* nav 관련 애들 */
import AdminRentCarNav from "../../AdminCommon/AdminNav/AdminRentCarNav";
import {
  RentContainerDiv,
  RentBodyDiv,
} from "../AdminRentCarCommon/AdminRentCar.styles";

const InsertCar = () => {
  const location = useLocation();
  const [disabled, setDisabled] = useState(true);
  const navi = useNavigate();

  const car = location.state?.car;
  const carCompany = location.state?.carCompany;
  const carType = location.state?.carType;
  const [imagePreview, setImagePreview] = useState(car?.fileLoad);
  const apiUrl = window.ENV?.API_URL || "http://localhost:8080";
  const [form, setForm] = useState({
    carNo: car.carNo,
    carName: car.carName,
    carTypeName: car.carTypeName,
    carTypeNo: car.carTypeNo,
    carYear: car.carYear,
    companyName: car.companyName,
    companyNo: car.companyNo,
    carBattery: car.carBattery,
    enrollDate: car.returnEnrollDate,
  });

  console.log(form);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    }
    setForm({ ...form, image: file });
  };

  const handleWrite = (e) => {
    if (disabled) {
      setDisabled(false);
    } else {
      setDisabled(true);
    }
  };

  const handleUpdate = (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("carNo", form.carNo);
    formData.append("carName", form.carName);
    formData.append("carTypeNo", form.carTypeNo);
    formData.append("carYear", form.carYear);
    formData.append("companyNo", form.companyNo);
    formData.append("carBattery", form.carBattery);
    formData.append("image", form.image);

    axios
      .post(`${apiUrl}/car/update`, formData, {
        headers: {
          "content-Type": "multipart/form-data",
        },
      })
      .then((result) => {
        alert("차량이 수정되었습니다.");
        setDisabled(true);
      })
      .catch((error) => {
        alert("오류");
      });
  };

  const handleDelete = (e) => {
    axios
      .post(`${apiUrl}/car/delete`, form, {
        headers: {
          "content-Type": "application/json",
        },
      })
      .then((result) => {
        alert("차량이 삭제되었습니다.");
        navi("/admin/carManagement");
      })
      .catch((error) => {
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
                <Form.Control
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="mt-2"
                  disabled={disabled}
                />
              </div>

              <Form>
                {/* 연식 + 카테고리 */}
                <Row className="mb-3">
                  <Col>
                    <Form.Group controlId="carCompany">
                      <Form.Label className="fw-bold ">제조사 :</Form.Label>
                      <Form.Select
                        name="companyNo"
                        value={form.companyNo}
                        onChange={handleChange}
                        disabled={disabled}
                      >
                        <option value="">제조사</option>
                        {carCompany.map((item) => (
                          <option key={item.companyNo} value={item.companyNo}>
                            {item.companyName}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col>
                    <Form.Group controlId="carType">
                      <Form.Label className="fw-bold ">차종 :</Form.Label>
                      <Form.Select
                        name="carTypeNo"
                        value={form.carTypeNo}
                        onChange={handleChange}
                        disabled={disabled}
                      >
                        <option value="">차종</option>
                        {carType.map((item) => (
                          <option key={item.carTypeNo} value={item.carTypeNo}>
                            {item.carTypeName}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>
                {/* 차 이름 */}

                <Row className="mb-3">
                  <Col>
                    <Form.Group className="mb-3" controlId="carName">
                      <Form.Label className="fw-bold ">모델명 :</Form.Label>
                      <Form.Control
                        type="text"
                        name="carName"
                        onChange={handleChange}
                        value={form.carName}
                        disabled={disabled}
                      />
                    </Form.Group>
                  </Col>
                  <Col>
                    <Form.Group controlId="carYear">
                      <Form.Label className="fw-bold ">연식 :</Form.Label>
                      <Form.Control
                        type="text"
                        name="carYear"
                        value={form.carYear}
                        onChange={handleChange}
                        disabled={disabled}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                {/* 배터리 용량 */}
                <Form.Group className="mb-3" controlId="carBattery">
                  <Form.Label className="fw-bold ">배터리 용량 :</Form.Label>
                  <Form.Control
                    type="text"
                    name="carBattery"
                    value={form.carBattery}
                    onChange={handleChange}
                    disabled={disabled}
                  />
                </Form.Group>

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
    </>
  );
};

export default InsertCar;
