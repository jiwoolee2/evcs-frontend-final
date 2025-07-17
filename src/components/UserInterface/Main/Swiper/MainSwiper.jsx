import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { SwiperImg } from "./MainSwiper.styles";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const MainSwiper = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [page, setPage] = useState(1);
  const apiUrl = window.ENV?.API_URL || "http://localhost:8080";
  useEffect(() => {
    axios
      .get(`${apiUrl}/user-events`, {
        params: { page },
      })
      .then((res) => {
        console.log("effect data : ", res.data);
        setEvents(res.data.eventList);
      })
      .catch(console.error);
  }, []);
  return (
    <>
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        spaceBetween={0}
        slidesPerView={1}
        navigation
        pagination={{ clickable: true }}
        autoplay={{ delay: 3000, disableOnInteraction: false }}
        loop={true}
        style={{ width: "1000px", height: "400px" }}
      >
        {events.map((event) => (
          <SwiperSlide
            key={event.eventNo}
            style={{ cursor: "pointer" }}
            onClick={() => navigate("/goEventDetailPage", { state: { event } })}
          >
            <SwiperImg src={event.filePath} alt={event.eventName} />
          </SwiperSlide>
        ))}
      </Swiper>
    </>
  );
};

export default MainSwiper;
