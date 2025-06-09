import { useEffect, useRef } from "react";
import Button from "react-bootstrap/esm/Button";
import Slider from "react-slick";
import InsertPhotoRoundedIcon from "@mui/icons-material/InsertPhotoRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import AutoAwesomeMotionOutlinedIcon from "@mui/icons-material/AutoAwesomeMotionOutlined";
import DriveRouteMap from "../../DriveRouteMap/DriveRouteMap";
import axios from "axios";
import {
  ModalWrapper,
  ModalLabel,
  ModalHeader,
  ModalContent,
  LeftContent,
  RightContent,
  ModalSubmit,
  ModalBack,
  CloseBtn,
  DriveRoute,
  MapImg,
  DriveContent,
  Textarea,
  ModalDriveRoute,
  ModalDriveRouteImg,
} from "../DRBoard.styles";

const BoardModal = ({
  updateBoardNo,
  openPhotoModal,
  setOpenPhotoModal,
  openRouteModal,
  setOpenRouteModal,
  openMapModal,
  setOpenMapModal,
  openDriveRoute,
  setOpenDriveRoute,
  boardImage,
  setBoardImage,
  imagesUrl,
  setImagesUrl,
  mapUrl,
  setMapUrl,
  boardContent,
  setBoardContent,
  isInsertMode,
  setIsInsertMode,
  auth,
  settings,
  handleContentValue,
  ref,
}) => {
  const apiUrl = window.ENV?.API_URL || "http://localhost:80";

  useEffect(() => {
    if (mapUrl !== "") {
      setOpenMapModal(false);
    }
  }, [mapUrl]);

  const fileHandler = () => {
    if (ref.current) {
      ref.current.value = null;
      ref.current.click();
    }
  };

  const handleImageChange = (e) => {
    const images = e.target.files;
    let imagesUrlList = [...imagesUrl]; // imagesUrl배열을 펼쳐서 [] 안에 집어넣음
    let imageLength = images.length > 10 ? 10 : images.length;

    for (let i = 0; i < imageLength; i++) {
      setBoardImage((prev) => [...prev, images[i]]);
      const currentImageUrl = URL.createObjectURL(images[i]);
      imagesUrlList.push(currentImageUrl);
    }
    setImagesUrl(imagesUrlList);
    console.log(imagesUrlList);
  };

  const handleInsertBoard = async (
    updateBoardNo,
    boardContent,
    boardImage,
    mapUrl
  ) => {
    console.log(
      "boardNo:",
      updateBoardNo,
      "boardContent:",
      boardContent,
      "boardImage:",
      boardImage,
      "mapUrl:",
      mapUrl
    );
    if (!boardContent || boardContent.trim === "") {
      alert("내용을 입력해주세요.");
      return;
    } else if (boardImage.length > 10 || boardImage.length < 2) {
      alert("이미지는 2장 이상 넣어주세요.");
      return;
    } else if (boardContent.length < 5 || boardContent.length > 200) {
      alert("내용은 5자 이상 200자 이하로 입력해주세요.");
      return;
    } else if (mapUrl === "") {
      alert("드라이브 루트를 선택해주세요.");
      return;
    }

    const formData = new FormData();
    formData.append("boardContent", boardContent);
    formData.append("boardWriter", auth.user.memberNo);
    boardImage.forEach((boardFiles) => {
      formData.append("boardFiles", boardFiles);
    });
    if (mapUrl) {
      const response = await fetch(mapUrl);
      const blob = await response.blob();
      const drFile = new File([blob], "driveRoute.png", { type: blob.type });
      formData.append("drFile", drFile);
    }

    axios
      .post(`${apiUrl}/driveRouteBoard/insert`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${auth.user.accessToken}`,
        },
      })
      .then((result) => {
        setOpenRouteModal(false);
        setBoardContent("");
        setBoardImage([]);
        setImagesUrl([]);
        setMapUrl("");
        setSrcMap("");
        alert("게시물이 등록되었습니다.");
        axios
          .get(`${apiUrl}/driveRouteBoard/1`, {
            headers: {
              Authorization: `Bearer ${auth.user.accessToken}`,
            },
          })
          .then((res) => {
            const drBoard = res.data;
            fetchBoards(1);
          });
      });
  };

  const handleUpdateBoard = async (
    updateBoardNo,
    boardContent,
    boardImage,
    mapUrl
  ) => {
    console.log(
      "boardNo:",
      updateBoardNo,
      "boardContent:",
      boardContent,
      "boardImage:",
      boardImage,
      "mapUrl:",
      mapUrl
    );
    if (!boardContent || boardContent.trim === "") {
      alert("내용을 입력해주세요.");
      return;
    } else if (boardContent.length < 5 || boardContent.length > 200) {
      alert("내용은 5자 이상 200자 이하로 입력해주세요.");
      return;
    } else if (mapUrl === "") {
      alert("드라이브 루트를 선택해주세요.");
      return;
    }

    const formData = new FormData();
    formData.append("boardContent", boardContent);
    formData.append("boardWriter", auth.user.memberNo);
    formData.append("boardNo", updateBoardNo);
    boardImage.forEach((boardFiles) => {
      formData.append("boardFiles", boardFiles);
    });
    if (mapUrl) {
      const response = await fetch(mapUrl);
      const blob = await response.blob();
      const drFile = new File([blob], "driveRoute.png", { type: blob.type });
      formData.append("drFile", drFile);
    }

    axios
      .post(`${apiUrl}/driveRouteBoard/update`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${auth.user.accessToken}`,
        },
      })
      .then((result) => {
        setOpenRouteModal(false);
        setBoardContent("");
        setBoardImage([]);
        setImagesUrl([]);
        setMapUrl("");
        setSrcMap("");
        alert("게시물이 수정되었습니다.");
        axios
          .get(`${apiUrl}/driveRouteBoard/1`, {
            headers: {
              Authorization: `Bearer ${auth.user.accessToken}`,
            },
          })
          .then((res) => {
            const drBoard = res.data;
            fetchBoards(1);
          });
      });
  };

  return (
    <>
      {/* 게시물 만들기(사진설정) 모달 */}
      {openPhotoModal && (
        <ModalWrapper>
          <CloseBtn
            onClick={() => {
              setOpenPhotoModal(false);
              setImagesUrl([]);
              setMapUrl("");
              setBoardContent("");
            }}
          >
            <CloseRoundedIcon style={{ fontSize: "40px" }} />
          </CloseBtn>
          <ModalLabel>
            <ModalHeader>
              {isInsertMode ? <>새 게시물 만들기</> : <>게시물 수정하기</>}
              <ModalSubmit
                onClick={() => {
                  setOpenRouteModal(true);
                  setOpenPhotoModal(false);
                }}
              >
                다음
              </ModalSubmit>
            </ModalHeader>
            <ModalContent>
              <input
                style={{ display: "none" }}
                type="file"
                ref={ref}
                onChange={handleImageChange}
                accept="image/*"
                multiple
              />
              {imagesUrl == "" ? (
                <>
                  <div
                    style={{
                      width: "200px",
                      height: "50px",
                      position: "fixed",
                      right: "400px",
                      top: "300px",
                      cursor: "pointer",
                    }}
                  >
                    <InsertPhotoRoundedIcon />
                    <Button variant="primary" onClick={fileHandler}>
                      사진을 선택해주세요
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div
                    className="slider-container"
                    style={{
                      width: "100%",
                      height: "100%",
                    }}
                  >
                    {imagesUrl.length === 1 ? (
                      <>
                        {imagesUrl.map((url, index) => (
                          <div key={index} style={{ position: "relative" }}>
                            <img
                              src={url}
                              style={{
                                width: "100%",
                                maxHeight: "630px",
                                objectFit: "cover",
                                backgroundRepeat: "no-repeat",
                              }}
                              alt={`preview-${index}`}
                            />
                          </div>
                        ))}
                      </>
                    ) : (
                      <Slider {...settings}>
                        {imagesUrl.map((url, index) => (
                          <div key={index} style={{ position: "relative" }}>
                            <img
                              src={url}
                              style={{
                                width: "100%",
                                maxHeight: "630px",
                                objectFit: "cover",
                                backgroundRepeat: "no-repeat",
                              }}
                              alt={`preview-${index}`}
                            />
                          </div>
                        ))}
                      </Slider>
                    )}
                  </div>
                  <AutoAwesomeMotionOutlinedIcon
                    style={{
                      position: "absolute",
                      bottom: "5px",
                      right: "20px",
                      fontSize: "30px",
                      color: "#fff",
                      backgroundColor: "rgba(0,0,0,0.4)",
                      borderRadius: "50%",
                      padding: "5px",
                      cursor: "pointer",
                    }}
                    onClick={() => fileHandler}
                  />
                </>
              )}
            </ModalContent>
          </ModalLabel>
        </ModalWrapper>
      )}

      {/* 경로설정 및 내용작성 모달 */}
      {openRouteModal && (
        <ModalWrapper>
          <CloseBtn
            onClick={() => {
              setOpenRouteModal(false);
              setImagesUrl([]);
              setMapUrl("");
              setBoardContent("");
            }}
          >
            <CloseRoundedIcon style={{ fontSize: "40px" }} />
          </CloseBtn>
          <ModalLabel>
            <ModalHeader>
              {isInsertMode ? (
                <>
                  새 게시물 만들기
                  <ModalSubmit
                    onClick={() =>
                      handleInsertBoard(
                        updateBoardNo,
                        boardContent,
                        boardImage,
                        mapUrl
                      )
                    }
                  >
                    공유하기
                  </ModalSubmit>
                </>
              ) : (
                <>
                  게시물 수정하기
                  <ModalSubmit
                    onClick={() =>
                      handleUpdateBoard(
                        updateBoardNo,
                        boardContent,
                        boardImage,
                        mapUrl
                      )
                    }
                  >
                    수정하기
                  </ModalSubmit>
                </>
              )}
              <ModalBack
                onClick={() => {
                  setOpenRouteModal(false);
                  setOpenPhotoModal(true);
                  setMapUrl("");
                }}
              >
                이전
              </ModalBack>
            </ModalHeader>
            <ModalContent>
              <LeftContent>
                {mapUrl == "" ? (
                  <>
                    <Button
                      variant="primary"
                      onClick={() => setOpenMapModal(true)}
                    >
                      드라이브 루트 선택하기
                    </Button>
                  </>
                ) : (
                  <>
                    <DriveRoute
                      onClick={() => setOpenMapModal(true)}
                      style={{ cursor: "pointer" }}
                    >
                      <MapImg src={mapUrl} alt="지도지도" />
                    </DriveRoute>
                  </>
                )}
              </LeftContent>
              <RightContent>
                <DriveContent>
                  <Textarea
                    type="text"
                    onChange={handleContentValue}
                    placeholder="내용을 작성해주세요"
                    value={boardContent}
                  ></Textarea>
                </DriveContent>
              </RightContent>
            </ModalContent>
          </ModalLabel>
        </ModalWrapper>
      )}

      {/* 드라이브 경로 모달 */}
      {openMapModal && (
        <ModalWrapper>
          <CloseBtn onClick={() => setOpenMapModal(false)}>
            <CloseRoundedIcon style={{ fontSize: "40px" }} />
          </CloseBtn>
          <ModalLabel>
            <ModalHeader>드라이브 경로 선택</ModalHeader>

            <DriveRouteMap mapUrl={(url) => setMapUrl(url)} />
          </ModalLabel>
        </ModalWrapper>
      )}
    </>
  );
};
export default BoardModal;
