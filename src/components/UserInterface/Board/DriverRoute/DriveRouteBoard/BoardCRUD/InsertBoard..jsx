const InsertBoard = () => {
  const handleInsertBoard = async () => {
    if (!boardContent || boardContent.trim() === "") {
      alert("내용을 입력해주세요.");
      return;
    } else if (boardContent.length < 5 || boardContent.length > 200) {
      alert("내용은 5자 이상 200자 이하로 입력해주세요.");
      return;
    } else if (boardImage.length < 2 || boardImage.length > 10) {
      alert("사진을 2장 이상 10장 이하로로 첨부해주세요.");
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
            setBoards([...drBoard]);
            setCurrentPage(1); // 페이지 초기화

            return axios.get(`${apiUrl}/driveRouteBoard/selectLikes`, {
              headers: {
                Authorization: `Bearer ${auth.user.accessToken}`,
              },
            });
          })
          .then((res) => {
            setBoardLikesInfo([...res.data]);
          })
          .catch((err) => {
            console.error("게시물/좋아요 재조회 실패", err);
          });
      });
  };
  return;
  <></>;
};
export default InsertBoard;
