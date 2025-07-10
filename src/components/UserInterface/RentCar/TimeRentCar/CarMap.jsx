import { useEffect, useState } from "react";
import styled from "styled-components";
import Offcanvas from "react-bootstrap/Offcanvas";
import "./CarMap.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { Container, Row, Col, Button, Image } from "react-bootstrap";
import axios from "axios";
import { useAuth } from "../../Context/AuthContext/AuthContext";
import { H1, H3, RentBodyDiv, RentContainerDiv, Map } from "./CarMap.styles";
import { useNavigate, useLocation } from "react-router-dom";
import RentCarNav from "../../Common/Nav/RentCarNav";
import { PaymentButton } from "../LongTermRentCar/PaymentButton";
import { InlineBadge } from "../RentCarCommon/RentCarCard.styles";

const CarMap = () => {
  const apiUrl = window.ENV?.API_URL || "http://localhost:80";
  const location = useLocation();
  const startDate = new Date(location.state.startDate);
  const endDate = new Date(location.state.endDate);
  const navi = useNavigate();
  const { auth } = useAuth();
  const [memberNo, setMemberNo] = useState(auth.user.memberNo);
  const [loaded, setLoaded] = useState(false);
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const [timeRentCarResult, setTimeRentCarResult] = useState([]);
  const [enrollPlace, setEnrollPlace] = useState([]);
  const [enrollPosition, setEnrollPosition] = useState([]);
  const [currentPosition, setCurrentPosition] = useState(null);
  const [selectedCar, setSelectedCar] = useState(null);
  const totalMinutes = Math.round((endDate - startDate) / (1000 * 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const totalHoursDecimal = totalMinutes / 60;
  const pad = (n) => (n < 10 ? "0" + n : n);
  const formatDateToLocalDateTime = (date) => {
    return (
      date.getFullYear() +
      "-" +
      pad(date.getMonth() + 1) +
      "-" +
      pad(date.getDate()) +
      "T" +
      pad(date.getHours()) +
      ":" +
      pad(date.getMinutes()) +
      ":" +
      pad(date.getSeconds())
    );
  };

  useEffect(() => {
    if (!window.kakao || !window.kakao.maps) return;
    window.kakao.maps.load(() => {
      setLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (!loaded) return;

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        setCurrentPosition(new window.kakao.maps.LatLng(latitude, longitude));
      });
    }
  }, [loaded]);

  useEffect(() => {
    // 시간별 렌트카 정보를 조회해옴
    axios
      .get(`${apiUrl}/rentCar/timeRentCarInfo`, {
        params: {
          startDate: formatDateToLocalDateTime(new Date(startDate)),
          endDate: formatDateToLocalDateTime(new Date(endDate)),
        },
      })
      .then((result) => {
        setTimeRentCarResult(result.data.timeRentCarResult);
        const enrollPlaceDatas = result.data.timeRentCarResult.map(
          (item) => item.enrollPlace
        );
        setEnrollPlace(enrollPlaceDatas);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, []);

  useEffect(() => {
    if (!loaded || enrollPlace.length === 0) return;

    const geocoder = new window.kakao.maps.services.Geocoder();

    const getCoords = (address) =>
      new Promise((resolve, reject) => {
        geocoder.addressSearch(address, (result, status) => {
          if (status === window.kakao.maps.services.Status.OK) {
            const coords = new window.kakao.maps.LatLng(
              result[0].y,
              result[0].x
            );
            resolve(coords);
          } else {
            reject(`Geocode failed for ${address}`);
          }
        });
      });

    const fetchAllCoords = async () => {
      try {
        const promises = enrollPlace.map((address) => getCoords(address));
        const results = await Promise.all(promises);
        setEnrollPosition(results);
      } catch (err) {
        console.error("Geocoding error:", err);
      }
    };
    fetchAllCoords();
  }, [loaded, enrollPlace]);

  console.log("enrollPosition", enrollPosition);
  console.log("timeRentCarResult", timeRentCarResult);

  useEffect(() => {
    if (!loaded || enrollPosition.length === 0 || !currentPosition) return;

    const mapContainer = document.getElementById("map");
    if (!mapContainer) {
      console.warn("mapContainer가 null입니다.");
      return;
    }
    const mapOption = {
      center: currentPosition,
      level: 5,
    };

    const map = new window.kakao.maps.Map(mapContainer, mapOption);

    const uniquePositions = [
      ...new Set(enrollPosition.map((item) => `${item.Ma}-${item.La}`)),
    ];

    const positions = uniquePositions.map((key) => {
      const [Ma, La] = key.split("-");
      const latlng = new window.kakao.maps.LatLng(Ma, La);

      const carsAtSamePosition = enrollPosition
        .map((pos, index) => ({ pos, index }))
        .filter(
          ({ pos }) =>
            parseFloat(pos.Ma) === parseFloat(Ma) &&
            parseFloat(pos.La) === parseFloat(La)
        );
      const address =
        timeRentCarResult[carsAtSamePosition[0].index]?.address || "주소 없음";
      const content = `
  <div class="wrap">
    <div class="info">
      <div class="header">
        <div style="display: flex; align-items: center; height: 15px;">
          <img src="https://cdn-icons-png.flaticon.com/512/684/684908.png" width="16" height="16" style="margin-right: 8px;" />
          ${address}
        </div>
        <div class="close" title="닫기"></div>
      </div>
      <div class="wrapper">
        ${carsAtSamePosition
          .map(({ index }) => {
            return `
              <div class="customBody">
                <div style="display: flex; align-items: center;">
                  <div class="img">
                    <img src="${
                      timeRentCarResult[index].fileLoad
                    }" width="60" height="40" style="object-fit: cover;" />
                  </div>
                  <div class="desc" style="margin-left: 10px;">
                    <div class="carTitle" style="font-weight: bold">
                      ${timeRentCarResult[index].carName}
                      ${
                        Number(timeRentCarResult[index].ingHotdeal) === 1
                          ? '<span style="color:red; margin-left:5px;">🔥 핫딜</span>'
                          : ""
                      }
                    </div>
                    <div style="color: #666; font-size: 12px;">
                      ${Math.round(
                        timeRentCarResult[index].rentCarPrice *
                          (1 - timeRentCarResult[index].dealPercent / 100)
                      ).toLocaleString()}원
                    </div>
                  </div>
                </div>
                <div class="arrow" style="font-size: 20px; color: #188ceb;">›</div>
              </div>
            `;
          })
          .join("")}
      </div>
    </div>
  </div>
`;
      return { latlng, content, carsAtSamePosition };
    });

    for (let i = 0; i < positions.length; i++) {
      const { latlng, content, carsAtSamePosition } = positions[i];

      const marker = new window.kakao.maps.Marker({
        map: map,
        position: positions[i].latlng,
      });

      const container = document.createElement("div");
      container.innerHTML = positions[i].content;

      const bodies = container.querySelectorAll(".customBody");
      bodies.forEach((el, index) => {
        el.addEventListener("click", () => {
          const carIndex = carsAtSamePosition[index].index;
          setSelectedCar({
            carBattery: timeRentCarResult[carIndex].carBattery,
            carNo: timeRentCarResult[carIndex].carNo,
            carName: timeRentCarResult[carIndex].carName,
            carTypeName: timeRentCarResult[carIndex].carTypeName,
            carYear: timeRentCarResult[carIndex].carYear,
            companyName: timeRentCarResult[carIndex].companyName,
            categoryName: timeRentCarResult[carIndex].categoryName,
            fileLoad: timeRentCarResult[carIndex].fileLoad,
            enrollPlace: timeRentCarResult[carIndex].enrollPlace,
            garageNo: timeRentCarResult[carIndex].garageNo,
            address: timeRentCarResult[carIndex].address,
            postAdd: timeRentCarResult[carIndex].postAdd,
            rentCarNo: timeRentCarResult[carIndex].rentCarNo,
            rentCarPrice: timeRentCarResult[carIndex].rentCarPrice,
            status: timeRentCarResult[carIndex].status,
            ingHotdeal: timeRentCarResult[carIndex].ingHotdeal,
            dealPercent: timeRentCarResult[carIndex].dealPercent,
          });
          handleShow();
        });
      });

      const overlay = new window.kakao.maps.CustomOverlay({
        content: container,
        position: positions[i].latlng,
        map: null,
      });

      window.kakao.maps.event.addListener(marker, "click", function () {
        overlay.setMap(map);
        map.setCenter(positions[i].latlng);
      });

      const closeBtn = container.querySelector(".close");
      if (closeBtn) {
        closeBtn.addEventListener("click", () => {
          overlay.setMap(null);
        });
      }
    }
  }, [loaded, enrollPosition, timeRentCarResult, currentPosition]);

  const handlePayment = () => {
    console.log("결제하기 버튼 클릭됨");
    axios
      .post(`${apiUrl}/reservation/insert`, {
        memberNo: memberNo,
        rentCarNo: selectedCar.rentCarNo,
        categoryName: selectedCar.categoryName,
        enrollPlace: selectedCar.enrollPlace,
        garageNo: selectedCar.garageNo,
        rentCarPrice: selectedCar.rentCarPrice,
        rentalTime: startDate,
        returnTime: endDate,
      })
      .then((result) => {
        console.log(result.data);
      })
      .catch((error) => {
        console.error("Error message :", error.response.data.message);
        alert(error.response.data.message);
      });
  };
  return (
    <>
      <RentContainerDiv>
        <RentCarNav />
        <RentBodyDiv>
          <H1>시간별 렌트카 대여하기</H1>
          <br />
          <br />
          <H3>대여위치 및 차량 설정</H3>

          <div
            style={{
              position: "absolute",
              top: "0",
              right: "0",
              margin: "200px 150px 0 0", // 위치 조절
              zIndex: 10,
            }}
          >
            <div
              style={{
                backgroundColor: "#f8f9fa",
                borderRadius: "12px",
                padding: "20px 30px",
                boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)",
                minWidth: "320px",
                textAlign: "center",
              }}
            >
              <h5
                style={{
                  fontWeight: "bold",
                  marginBottom: "12px",
                  color: "#333",
                }}
              >
                이용 시간 안내
              </h5>
              <div
                style={{ fontSize: "16px", marginBottom: "6px", color: "#555" }}
              >
                <span
                  style={{
                    fontWeight: "bold",
                    fontSize: "18px",
                    color: "#007bff",
                  }}
                >
                  총 {hours}시간 {minutes > 0 ? `${minutes}분` : ""} 이용
                </span>{" "}
              </div>
              <div style={{ fontSize: "14px", color: "#666" }}>
                {startDate.toLocaleString()} ~ {endDate.toLocaleString()}
              </div>
            </div>
          </div>
          <Map id="map" />
          <div style={{ textAlign: "right" }}>
            <Button
              variant="primary"
              onClick={() => navi(-1)}
              style={{ marginBottom: "30px", marginRight: "100px" }}
            >
              이전으로
            </Button>
          </div>
        </RentBodyDiv>
      </RentContainerDiv>

      <Offcanvas
        show={show}
        onHide={handleClose}
        placement="end"
        className="custom-offcanvas"
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>예약 및 결제하기</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Container style={{ fontSize: "17px", lineHeight: "1.8" }}>
            {/* 차량 이미지 및 이름 */}
            <Row className="justify-content-center mb-4">
              <Col xs="auto" className="text-center">
                <Image
                  src={selectedCar?.fileLoad}
                  alt="차 이미지"
                  width={300}
                  height={200}
                  style={{ objectFit: "cover", borderRadius: "8px" }}
                />
                <div
                  style={{
                    fontWeight: "bold",
                    fontSize: "20px",
                    marginTop: "12px",
                  }}
                >
                  [{selectedCar?.categoryName}] {selectedCar?.carName}
                </div>
                <div style={{ fontSize: "15px", color: "#777" }}>
                  {selectedCar?.carTypeName}
                  {Number(selectedCar?.ingHotdeal) === 1 ? (
                    <InlineBadge>🔥 핫딜</InlineBadge>
                  ) : (
                    ""
                  )}
                </div>
              </Col>
            </Row>

            {/* 차량 정보 */}
            <Row className="mb-3">
              <Col>
                <h4>차량 정보</h4>
                <ul style={{ fontSize: "18px", paddingLeft: "1.5em" }}>
                  <li>연식: {selectedCar?.carYear}</li>
                  <li>제조사: {selectedCar?.companyName}</li>
                  <li>차량 번호: {selectedCar?.rentCarNo}</li>
                  <li>배터리: {selectedCar?.carBattery ?? "정보 없음"}</li>
                </ul>
              </Col>
            </Row>

            {/* 대여 장소 */}
            <Row className="mb-3">
              <Col>
                <h4>대여 장소</h4>
                <div style={{ fontWeight: "bold", fontSize: "16px" }}>
                  {selectedCar?.enrollPlace}
                </div>
                <div style={{ fontSize: "15px", color: "#666" }}>
                  {selectedCar?.address}
                </div>
              </Col>
            </Row>

            {/* 이용 시간 안내 */}
            <Row className="mb-3">
              <Col>
                <h4>이용 시간</h4>
                <div style={{ fontSize: "16px" }}>
                  총 {Math.round((endDate - startDate) / (1000 * 60 * 60))}시간
                </div>
                <div style={{ fontSize: "15px", color: "#666" }}>
                  {startDate.toLocaleString()} ~ {endDate.toLocaleString()}
                </div>
              </Col>
            </Row>

            {/* 요금 합계 */}
            <Row className="mb-4">
              <Col>
                <h4>요금</h4>
                <div
                  style={{
                    fontWeight: "bold",
                    textAlign: "right",
                    fontSize: "20px",
                  }}
                >
                  총 {hours}시간 {minutes > 0 ? `${minutes}분` : ""} 이용 X{" "}
                  {selectedCar?.ingHotdeal == 1
                    ? `${Math.round(
                        selectedCar?.rentCarPrice *
                          (1 - selectedCar?.dealPercent / 100)
                      ).toLocaleString()}원 = `
                    : `${selectedCar?.rentCarPrice?.toLocaleString()}원 = `}
                  {selectedCar?.ingHotdeal == 1
                    ? `${Math.round(
                        totalHoursDecimal *
                          (selectedCar?.rentCarPrice *
                            (1 - selectedCar?.dealPercent / 100))
                      ).toLocaleString()}원`
                    : `${Math.round(
                        totalHoursDecimal * selectedCar?.rentCarPrice
                      ).toLocaleString()}원`}
                </div>
              </Col>
            </Row>

            {/* 결제 버튼 */}
            <Row>
              <Col>
                <PaymentButton
                  variant="primary"
                  className="w-100"
                  style={{
                    fontSize: "23px",
                    padding: "14px",
                    fontWeight: "bold",
                  }}
                  onClick={handlePayment}
                  startDate={startDate}
                  endDate={endDate}
                  memberNo={localStorage.getItem("memberNo")}
                  rentCarNo={selectedCar?.rentCarNo}
                  amount={
                    Math.round((endDate - startDate) / (1000 * 60 * 60)) *
                    selectedCar?.rentCarPrice
                  }
                  carName={selectedCar?.carName}
                />
              </Col>
            </Row>
          </Container>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
};

export default CarMap;
