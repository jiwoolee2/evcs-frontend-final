const SelectComment = ({
  openCommentModal,
  commentTargetBoard,
  commentInfo,
  editingCommentNo,
  hasMoreComment,
  handleMoreComments,
  comment,
  boardImages,
  handleComment,
  handleDeleteComment,
  handleUpdateComment,
}) => {
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
                    {boardImages
                      .filter(
                        (item) => item.boardNo === commentTargetBoard.boardNo
                      )
                      .map((item, index) => {
                        return (
                          <div key={index}>
                            <img
                              src={item.boardImage}
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
