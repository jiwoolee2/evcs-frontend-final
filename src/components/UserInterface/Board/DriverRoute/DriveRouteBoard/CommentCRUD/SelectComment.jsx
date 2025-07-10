import { useEffect, useState } from "react";
import axios from "axios";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import Slider from "react-slick";
import {
  CommentModalWrapper,
  CloseBtn,
  CommentModalLabel,
  ModalHeader,
  ModalContent,
  LeftComment,
  BoardImage,
  BoardContent,
  RightContent,
  Comments,
  CommentSubmit,
  InsertComment,
  Commentarea,
  CommentItem,
  CommentTop,
  CommentAuthor,
  CommentText,
  CommentButtonGroup,
} from "../DRBoard.styles";
const SelectComment = ({
  openCommentModal,
  commentTargetBoard,
  imagesUrl,
  setOpenCommentModal,
  auth,
  settings,
  apiUrl,
}) => {
  const [currentCommentPage, setCurrentCommentPage] = useState(1);
  const [commentInfo, setCommentInfo] = useState([]);
  const [editingCommentNo, setEditingCommentNo] = useState(null); // 수정 중인 댓글 번호
  const [editedContent, setEditedContent] = useState(""); // 임시 수정 값 저장
  const [hasMoreComment, setHasMoreComment] = useState(true);
  const [comment, setComment] = useState({
    boardNo: null,
    commentContent: null,
  });

  console.log("imagesUrl", imagesUrl);
  useEffect(() => {
    if (!commentTargetBoard) return;
    axios
      .get(
        `${apiUrl}/driveRouteComment/${commentTargetBoard.boardNo}/${currentCommentPage}`,
        {
          headers: {
            Authorization: `Bearer ${auth.user.accessToken}`,
          },
        }
      )
      .then((result) => {
        const drComment = result.data.drComment;
        setCommentInfo(drComment);
        setHasMoreComment(drComment.length === 10);
      })
      .catch((error) => {
        console.error("댓글 조회 실패:", error);
      });
  }, [commentTargetBoard, currentCommentPage]);

  const handleMoreComments = () => {
    setCurrentCommentPage((prev) => prev + 1);
  };
  useEffect(() => {
    if (
      commentTargetBoard?.boardNo &&
      comment.boardNo !== commentTargetBoard.boardNo
    ) {
      setComment((prev) => ({
        ...prev,
        boardNo: commentTargetBoard.boardNo,
      }));
    }
  }, [commentTargetBoard]);
  // ----------------------댓글 추가----------------------
  const handleComment = () => {
    axios
      .post(`${apiUrl}/driveRouteComment/insert`, comment, {
        headers: {
          Authorization: `Bearer ${auth.user.accessToken}`,
        },
      })
      .then((result) => {
        alert("댓글이 등록되었습니다.");
        // 댓글 재조회 - 1페이지로 초기화
        setCurrentCommentPage(1);
        axios
          .get(`${apiUrl}/driveRouteComment/${comment.boardNo}/1`, {
            headers: {
              Authorization: `Bearer ${auth.user.accessToken}`,
            },
          })
          .then((res) => {
            const drComment = res.data.drComment;
            setCommentInfo(drComment);
            setHasMoreComment(drComment.length === 10);
            setComment((prev) => ({ ...prev, commentContent: "" }));
          })
          .catch((err) => console.error("댓글 재조회 실패", err));
      })
      .catch((error) => {
        console.error("댓글 등록 실패:", error);
      });
  };

  // ----------------------댓글 삭제----------------------
  const handleDeleteComment = (commentNo) => {
    if (window.confirm("정말 삭제하시겠습니까?")) {
      axios
        .delete(`${apiUrl}/driveRouteComment/delete/${commentNo}`, {
          headers: {
            Authorization: `Bearer ${auth.user.accessToken}`,
          },
        })
        .then((result) => {
          alert("댓글이 삭제되었습니다.");

          // 댓글 재조회
          setCurrentCommentPage(1);
          axios
            .get(
              `${apiUrl}/driveRouteComment/${commentTargetBoard.boardNo}/1`,
              {
                headers: {
                  Authorization: `Bearer ${auth.user.accessToken}`,
                },
              }
            )
            .then((res) => {
              const drComment = res.data.drComment;
              setCommentInfo(drComment);
              setHasMoreComment(drComment.length === 10);
              setComment((prev) => ({ ...prev, commentContent: "" }));
            })
            .catch((err) => console.error("댓글 재조회 실패", err));
        })
        .catch((error) => {
          console.error("댓글 삭제 실패:", error);
        });
    }
  };

  // ----------------------댓글 수정----------------------
  const handleUpdateComment = (commentNo) => {
    axios
      .put(
        `${apiUrl}/driveRouteComment/update`,
        {
          commentContent: editedContent,
          commentNo: commentNo,
        },
        {
          headers: {
            Authorization: `Bearer ${auth.user.accessToken}`,
          },
        }
      )
      .then((result) => {
        alert("댓글이 수정되었습니다.");
        setEditingCommentNo(null);
        // 댓글 재조회
        setCurrentCommentPage(1);
        axios
          .get(`${apiUrl}/driveRouteComment/${commentTargetBoard.boardNo}/1`, {
            headers: {
              Authorization: `Bearer ${auth.user.accessToken}`,
            },
          })
          .then((res) => {
            const drComment = res.data.drComment;
            setCommentInfo(drComment);
            setHasMoreComment(drComment.length === 10);
            setComment((prev) => ({ ...prev, commentContent: "" }));
          })
          .catch((err) => console.error("댓글 재조회 실패", err));
      })
      .catch((error) => {
        console.error("댓글 삭제 실패:", error);
      });
  };
  return (
    <>
      {/* 댓글 모달 */}
      {openCommentModal && (
        <CommentModalWrapper>
          <CloseBtn onClick={() => setOpenCommentModal(false)}>
            <CloseRoundedIcon style={{ fontSize: "40px" }} />
          </CloseBtn>
          <CommentModalLabel>
            <ModalHeader>상세보기</ModalHeader>
            <ModalContent>
              <LeftComment>
                <BoardImage>
                  <Slider {...settings}>
                    {imagesUrl.map((item, index) => {
                      return (
                        <div key={index}>
                          <img
                            src={item}
                            style={{
                              width: "100%",
                              height: "400px",
                              objectFit: "cover",
                              borderRadius: "8px",
                            }}
                            alt={`preview-${index}`}
                          />
                        </div>
                      );
                    })}
                  </Slider>
                </BoardImage>

                <BoardContent>{commentTargetBoard.boardContent}</BoardContent>
              </LeftComment>
              <RightContent>
                <Comments>
                  {commentInfo.map((comment, commentNo) => (
                    <CommentItem key={commentNo}>
                      <CommentTop>
                        <CommentAuthor>{comment.memberNickname}</CommentAuthor>
                        {comment.commentWriter == auth.user.memberNo && (
                          <CommentButtonGroup>
                            {editingCommentNo == comment.commentNo ? (
                              <>
                                <span
                                  className="save"
                                  onClick={() =>
                                    handleUpdateComment(comment.commentNo)
                                  }
                                >
                                  저장
                                </span>
                                <span
                                  className="cancel"
                                  onClick={() => setEditingCommentNo(null)}
                                >
                                  취소
                                </span>
                              </>
                            ) : (
                              <>
                                <span
                                  className="edit"
                                  onClick={() => {
                                    setEditingCommentNo(comment.commentNo);
                                    setEditedContent(comment.commentContent); // 현재 내용 가져오기
                                  }}
                                >
                                  수정
                                </span>
                                <span
                                  className="delete"
                                  onClick={() =>
                                    handleDeleteComment(comment.commentNo)
                                  }
                                >
                                  삭제
                                </span>
                              </>
                            )}
                          </CommentButtonGroup>
                        )}
                      </CommentTop>

                      {editingCommentNo === comment.commentNo ? (
                        <input
                          type="text"
                          value={editedContent}
                          onChange={(e) => setEditedContent(e.target.value)}
                          maxLength={85}
                          style={{ width: "100%", marginTop: "5px" }}
                        />
                      ) : (
                        <CommentText>{comment.commentContent}</CommentText>
                      )}
                    </CommentItem>
                  ))}
                </Comments>
                {hasMoreComment && (
                  <CommentSubmit onClick={handleMoreComments}>
                    댓글 더보기
                  </CommentSubmit>
                )}
                <InsertComment>
                  <Commentarea
                    type="text"
                    placeholder="댓글 달기.."
                    maxLength={85}
                    value={comment.commentContent} // 추가
                    onChange={(e) =>
                      setComment({
                        ...comment,
                        commentContent: e.target.value,
                      })
                    }
                  />
                  <CommentSubmit onClick={handleComment}>게시</CommentSubmit>
                </InsertComment>
              </RightContent>
            </ModalContent>
          </CommentModalLabel>
        </CommentModalWrapper>
      )}
    </>
  );
};
export default SelectComment;
