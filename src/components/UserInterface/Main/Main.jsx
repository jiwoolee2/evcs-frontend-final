import { useNavigate } from "react-router-dom";
import MainSwiper from "./Swiper/MainSwiper";
import NewsMainList from "../News/NewsMainList";
import * as S from "../News/NewsMain/NewsMain.styles";
import {
  MainContainerDiv,
  HeroSection,
  HeroContent,
  HeroText,
  HeroTitle,
  HeroSubtitle,
  HeroDescription,
  CtaButton,
  HeroImageWrapper,
  HeroImage,
  SwiperDiv,
  MainBtnDiv,
  MainATag,
  MainBtnImg,
  MainSpan,
  FeaturesSection,
  SectionContainer,
  SectionTitle,
  FeaturesGrid,
  FeatureCard,
  FeatureIconWrapper,
  FeatureTitle,
  FeatureDescription,
  MainBodyDiv,
  MainLeftDiv,
  MainNewsDiv,
} from "./Main.styles";

export default function Main() {
  const navigate = useNavigate();

  return (
    <MainContainerDiv>
      {/* Hero Section */}
      <HeroSection>
        <HeroContent>
          <HeroText>
            <HeroTitle>어디서든 시작하는 렌트</HeroTitle>
            <HeroSubtitle>전기차 렌트</HeroSubtitle>
            <HeroDescription>
              간편하고 투명한 렌트 서비스로 여러분의 생활을 더 편리하게 만들어
              드립니다.
            </HeroDescription>
            <CtaButton onClick={() => navigate("/timerentalPage")}>
              서비스 시작하기
            </CtaButton>
          </HeroText>
          <HeroImageWrapper>
            <HeroImage src="/images/key.png" alt="Hero" />
          </HeroImageWrapper>
        </HeroContent>
      </HeroSection>

      {/* Quick Links */}
      <MainBtnDiv>
        <MainATag onClick={() => navigate("/timerentalPage")}>
          <MainBtnImg src="images/hourRent.png" alt="시간별 렌트카 대여" />
          <MainSpan>시간별 렌트카 대여</MainSpan>
        </MainATag>
        <MainATag onClick={() => navigate("/longRentCar")}>
          <MainBtnImg src="images/calendar.png" alt="장기 렌트카 대여" />
          <MainSpan>장기 렌트카 대여</MainSpan>
        </MainATag>
        <MainATag onClick={() => navigate("/chargingMap")}>
          <MainBtnImg src="images/chargingRent.png" alt="충전소 위치" />
          <MainSpan>충전소 위치</MainSpan>
        </MainATag>
        <MainATag onClick={() => navigate("/driveRouteBoard")}>
          <MainBtnImg src="images/driveRoot.png" alt="드라이브 루트 게시판" />
          <MainSpan>드라이브 루트 게시판</MainSpan>
        </MainATag>
        <MainATag onClick={() => navigate("/newsMain")}>
          <MainBtnImg src="images/news.png" alt="에너지 뉴스" />
          <MainSpan>에너지 뉴스</MainSpan>
        </MainATag>
      </MainBtnDiv>

      {/* Swiper Section */}
      <SwiperDiv>
        <MainSwiper />
      </SwiperDiv>

      {/* Features Section */}
      <FeaturesSection>
        <SectionContainer>
          <SectionTitle>사이트 서비스</SectionTitle>
          <FeaturesGrid>
            <FeatureCard>
              <FeatureIconWrapper src="images/hourRent.png" />
              <FeatureTitle>간편한 전기차 렌트</FeatureTitle>
              <FeatureDescription>
                몇 번의 클릭만으로 원하는 서비스를 예약할 수 있습니다.
              </FeatureDescription>
            </FeatureCard>
            <FeatureCard>
              <FeatureIconWrapper src="images/question.png" />
              <FeatureTitle>드라이브 경험 공유</FeatureTitle>
              <FeatureDescription>
                본인의 드라이브 경험을 모두에게 공유할 수 있습니다.
              </FeatureDescription>
            </FeatureCard>
            <FeatureCard>
              <FeatureIconWrapper src="images/news.png" />
              <FeatureTitle>최신 뉴스 확인</FeatureTitle>
              <FeatureDescription>
                에너지 관련 최신 이슈에 대해 이야기할 수 있습니다.
              </FeatureDescription>
            </FeatureCard>
          </FeaturesGrid>
        </SectionContainer>
      </FeaturesSection>

      {/* News & Notices Section */}
      <MainBodyDiv>
        <MainLeftDiv>
          <MainNewsDiv>
            <SectionTitle>오늘의 전기차 뉴스</SectionTitle>
            <NewsMainList
              backendUrl={window.ENV?.API_URL || `http://localhost:8080`}
            />
            <S.LoadMoreButton onClick={() => navigate("/newsMain")}>
              뉴스 더보기
            </S.LoadMoreButton>
          </MainNewsDiv>
        </MainLeftDiv>
      </MainBodyDiv>
    </MainContainerDiv>
  );
}
