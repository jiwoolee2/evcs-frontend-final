import { useEffect, useRef } from "react";
import Button from "react-bootstrap/esm/Button";
import Slider from "react-slick";
import InsertPhotoRoundedIcon from "@mui/icons-material/InsertPhotoRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import AutoAwesomeMotionOutlinedIcon from "@mui/icons-material/AutoAwesomeMotionOutlined";
import DriveRouteMap from "../../DriveRouteMap/DriveRouteMap";
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
  boardImage,
  openPhotoModal,
  setOpenPhotoModal,
  openRouteModal,
  setOpenRouteModal,
  openMapModal,
  setOpenMapModal,
  openDriveRoute,
  setOpenDriveRoute,
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
  handleUpdateBoard,
  handleInsertBoard,
  handleContentValue,
  handleImageChange,
  fileHandler,
  ref,
}) => {
  const apiUrl = window.ENV?.API_URL || "http://localhost:80";

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

      {/* 드라이브 경로 이미지 */}
      {openDriveRoute && (
        <ModalWrapper>
          <CloseBtn onClick={() => setOpenDriveRoute(false)}>
            <CloseRoundedIcon style={{ fontSize: "40px" }} />
          </CloseBtn>
          <ModalLabel>
            <ModalHeader>드라이브 경로</ModalHeader>
            <ModalDriveRoute>
              <ModalDriveRouteImg
                src={srcMap}
                alt="드라이브 경로"
                style={{
                  width: "100%",
                  maxHeight: "630px",
                  objectFit: "cover",
                  backgroundRepeat: "none",
                }}
              />
            </ModalDriveRoute>
          </ModalLabel>
        </ModalWrapper>
      )}
    </>
  );
};
export default BoardModal;
