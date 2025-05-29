document.addEventListener("DOMContentLoaded", () => {
  const menuButton = document.getElementById("menuButton");
  const closeMenu = document.getElementById("closeMenu");
  const closeMenuFromAbout = document.getElementById("closeMenuFromAbout");
  const sideMenu = document.getElementById("sideMenu");
  const menuOverlay = document.getElementById("menuOverlay");
  const locationDetail = document.getElementById("locationDetail");
  const closeDetail = document.getElementById("closeDetail");
  const loadingIndicator = document.getElementById("loadingIndicator");
  const totalCount = document.getElementById("totalCount");
  const visibleCount = document.getElementById("visibleCount");

  // 드로워 뷰 관련 요소들
  const mainMenuView = document.getElementById("mainMenuView");
  const aboutView = document.getElementById("aboutView");
  const termsView = document.getElementById("termsView");
  const locationTermsView = document.getElementById("locationTermsView");
  const aboutBinFinder = document.getElementById("aboutBinFinder");
  const serviceTerms = document.getElementById("serviceTerms");
  const locationTerms = document.getElementById("locationTerms");
  const backToMenu = document.getElementById("backToMenu");
  const backToMenuFromTerms = document.getElementById("backToMenuFromTerms");
  const backToMenuFromLocation = document.getElementById(
    "backToMenuFromLocation"
  );
  const closeMenuFromTerms = document.getElementById("closeMenuFromTerms");
  const closeMenuFromLocation = document.getElementById(
    "closeMenuFromLocation"
  );
  const privacyView = document.getElementById("privacyView");
  const privacyPolicy = document.getElementById("privacyPolicy");
  const backToMenuFromPrivacy = document.getElementById(
    "backToMenuFromPrivacy"
  );
  const closeMenuFromPrivacy = document.getElementById("closeMenuFromPrivacy");

  let map = null;
  window.map = map;
  let markers = [];
  window.markers = markers;
  let trashCanData = [];
  let currentFilter = "all";
  let currentDistrict = "all";
  let visibleMarkers = 0;
  let selectedMarker = null; // 현재 선택된 마커
  window.selectedMarker = selectedMarker;
  let currentLocationMarker = null; // 현재 위치 마커
  let isWatchingLocation = false; // 위치 추적 활성화 여부
  let watchId = null; // 위치 추적 ID
  const defaultCenter = new window.naver.maps.LatLng(37.5665, 126.978); // 서울 중심 좌표(기본값)

  // 현위치 버튼 생성 및 추가
  const currentLocationButton = document.createElement("button");
  currentLocationButton.id = "currentLocationButton";
  currentLocationButton.className = "current-location-button";
  currentLocationButton.innerHTML = '<i class="fas fa-crosshairs"></i>';

  // 드로워 뷰 관리 함수들
  function showMainMenu() {
    sideMenu.classList.remove("expanded");
    mainMenuView.classList.add("active");
    aboutView.classList.remove("active");
    termsView.classList.remove("active");
    locationTermsView.classList.remove("active");
    privacyView.classList.remove("active");
  }

  function showAboutView() {
    sideMenu.classList.add("expanded");
    mainMenuView.classList.remove("active");
    aboutView.classList.add("active");
    termsView.classList.remove("active");
    locationTermsView.classList.remove("active");
    privacyView.classList.remove("active");
  }

  function showTermsView() {
    sideMenu.classList.add("expanded");
    mainMenuView.classList.remove("active");
    aboutView.classList.remove("active");
    termsView.classList.add("active");
    locationTermsView.classList.remove("active");
    privacyView.classList.remove("active");
  }

  function showLocationTermsView() {
    sideMenu.classList.add("expanded");
    mainMenuView.classList.remove("active");
    aboutView.classList.remove("active");
    termsView.classList.remove("active");
    locationTermsView.classList.add("active");
    privacyView.classList.remove("active");
  }

  function showPrivacyView() {
    sideMenu.classList.add("expanded");
    mainMenuView.classList.remove("active");
    aboutView.classList.remove("active");
    termsView.classList.remove("active");
    locationTermsView.classList.remove("active");
    privacyView.classList.add("active");
  }

  function closeSideMenu() {
    sideMenu.classList.remove("show", "expanded");
    mainMenuView.classList.add("active");
    aboutView.classList.remove("active");
    termsView.classList.remove("active");
    locationTermsView.classList.remove("active");
    privacyView.classList.remove("active");
  }

  function showLoading(show) {
    // 로딩 인디케이터를 항상 숨김 상태로 유지
    if (loadingIndicator) {
      loadingIndicator.style.display = "none";
    }
  }

  function clearMarkers() {
    markers.forEach((markerObj) => {
      if (markerObj.marker.infoWindow?.getMap()) {
        console.log("🗑️ 마커 정보창 닫기");
        markerObj.marker.infoWindow.close();
      }
      markerObj.marker.setMap(null);
    });
    markers = [];
    window.markers = markers;
    console.log("🧹 기존 마커 제거 완료");
  }
  window.clearMarkers = clearMarkers;

  function parseCSVRow(row) {
    const result = [];
    let insideQuotes = false;
    let currentValue = "";

    for (let i = 0; i < row.length; i++) {
      const char = row[i];

      if (char === '"') {
        insideQuotes = !insideQuotes;
      } else if (char === "," && !insideQuotes) {
        result.push(currentValue);
        currentValue = "";
      } else {
        currentValue += char;
      }
    }
    result.push(currentValue);
    return result;
  }

  function parseCSVAndLoadData(csvText) {
    try {
      console.log("📦 CSV 로딩 시작");
      showLoading(true);
      const rows = csvText.split("\n");
      const headers = rows[0].split(",");
      console.log("📋 헤더 확인:", headers);

      const data = [];

      for (let i = 1; i < rows.length; i++) {
        if (!rows[i].trim()) continue;
        const values = parseCSVRow(rows[i]);
        if (values.length < headers.length) continue;

        const item = {};
        for (let j = 0; j < headers.length; j++) {
          item[headers[j].trim()] = values[j].trim();
        }

        data.push(item);
      }

      trashCanData = data;
      window.trashCanData = trashCanData;
      console.log("✅ CSV 파싱 완료 - 쓰레기통 개수:", trashCanData.length);

      if (totalCount) {
        totalCount.textContent = `총 ${data.length}개의 쓰레기통`;
      }

      // 지오코딩 대신 CSV의 위도/경도 데이터를 사용하여 마커 생성
      // createMarkersFromCSV();
      if (window.createMarkersFromCSV) {
        window.createMarkersFromCSV();
      }

      // 페이지 로드 시 위치 권한 요청
      requestLocationPermission();
    } catch (error) {
      console.error("❌ CSV 파싱 중 오류 발생:", error);
      alert("CSV 파싱에 실패했습니다.");
    } finally {
      showLoading(false);
    }
  }

  function createMarkerElement(markerType) {
    const markerElement = document.createElement("div");
    markerElement.className = `marker ${markerType}`;
    markerElement.style.width = "24px";
    markerElement.style.height = "24px";
    markerElement.style.borderRadius = "50%";
    markerElement.style.border = "2px solid white";
    markerElement.style.backgroundColor =
      markerType === "trashcan"
        ? "#188FFF"
        : markerType === "seperatecan"
        ? "#188FFF"
        : "#188FFF";
    return markerElement;
  }

  async function loadCSVFromLocalFile() {
    try {
      const response = await fetch("./trashCanData.csv");
      const csvText = await response.text();
      parseCSVAndLoadData(csvText);
    } catch (error) {
      console.error("❌ 로컬 CSV 불러오기 실패:", error);
      alert("CSV 파일을 불러오는 데 실패했습니다.");
    }
  }

  function initMap() {
    const mapOptions = {
      center: defaultCenter,
      zoom: 18,
      minZoom: 16, // 최소 축소 레벨(더 작게 축소 불가)
      maxZoom: 20, // 최대 확대 레벨(더 크게 확대 불가)
      zoomControl: true,
      zoomControlOptions: {
        position: window.naver.maps.Position.RIGHT_CENTER,
      },
    };

    map = new window.naver.maps.Map("map", mapOptions);
    window.map = map;
    console.log("🗺 지도 초기화 완료");

    // 현위치 버튼 추가
    const mapContainer = document.querySelector(".map-container");
    if (mapContainer) {
      mapContainer.appendChild(currentLocationButton);
    } else {
      console.error("지도 컨테이너를 찾을 수 없습니다.");
    }
  }

  // 페이지 로드 시 위치 권한 요청 함수
  function requestLocationPermission() {
    // 브라우저가 geolocation API를 지원하는지 확인
    if (navigator.geolocation) {
      // 브라우저 기본 위치 권한 요청 UI 사용
      navigator.geolocation.getCurrentPosition(
        // 성공 콜백
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const currentPos = new window.naver.maps.LatLng(lat, lng); // 여기서 lat, lng 사용

          // 지도 이동
          map.setCenter(currentPos);
          map.setZoom(16);

          // 현위치 마커 생성
          createCurrentLocationMarker(currentPos, position.coords.accuracy);

          console.log("✅ 위치 권한 허용됨, 현재 위치:", lat, lng);
        },
        // 오류 콜백
        (error) => {
          console.log("❌ 위치 권한 거부됨 또는 오류 발생:", error.code);

          // 위치 권한이 거부되었거나 오류가 발생한 경우 기본 위치 사용
          map.setCenter(defaultCenter);
          map.setZoom(13);

          // 오류 코드에 따른 처리
          switch (error.code) {
            case error.PERMISSION_DENIED:
              console.log("사용자가 위치 정보 제공을 거부했습니다.");
              break;
            case error.POSITION_UNAVAILABLE:
              console.log("위치 정보를 사용할 수 없습니다.");
              break;
            case error.TIMEOUT:
              console.log("위치 정보 요청 시간이 초과되었습니다.");
              break;
            case error.UNKNOWN_ERROR:
              console.log("알 수 없는 오류가 발생했습니다.");
              break;
          }
        },
        // 옵션
        {
          enableHighAccuracy: true, // 높은 정확도 요청
          timeout: 10000, // 10초 타임아웃
          maximumAge: 0, // 캐시된 위치 정보를 사용하지 않음
        }
      );
    } else {
      // geolocation API를 지원하지 않는 브라우저
      console.log("❌ 이 브라우저는 위치 정보를 지원하지 않습니다.");
      map.setCenter(defaultCenter);
      map.setZoom(13);
    }
  }

  // 현위치 마커 생성 함수
  function createCurrentLocationMarker(position, accuracy) {
    // 이미 현위치 마커가 있으면 제거
    if (currentLocationMarker !== null) {
      if (currentLocationMarker.accuracyCircle) {
        currentLocationMarker.accuracyCircle.setMap(null);
      }
      currentLocationMarker.setMap(null);
    }

    // 현위치 마커 생성
    currentLocationMarker = new window.naver.maps.Marker({
      position: position,
      map: map,
      icon: {
        content:
          '<div style="width: 20px; height: 20px; background-color: #188FFF; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3);"></div>',
        anchor: new window.naver.maps.Point(10, 10),
      },
      zIndex: 1000,
    });

    // 정확도 표시 원 추가
    const accuracyCircle = new window.naver.maps.Circle({
      map: map,
      center: position,
      radius: accuracy,
      strokeColor: "#188FFF",
      strokeOpacity: 0.3,
      strokeWeight: 1,
      fillColor: "#188FFF",
      fillOpacity: 0.1,
    });

    // 정확도 원도 함께 업데이트하기 위해 저장
    currentLocationMarker.accuracyCircle = accuracyCircle;

    // 위치 추적 활성화 상태로 변경
    isWatchingLocation = true;
    currentLocationButton.classList.add("active");
  }

  // 위치 추적 시작
  function startWatchingLocation() {
    showLoading(true);

    if (navigator.geolocation) {
      // 위치 추적 시작 - 브라우저 기본 위치 권한 요청 사용
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const currentPos = new window.naver.maps.LatLng(lat, lng);

          // 첫 위치 수신 시 지도 이동
          if (!isWatchingLocation) {
            map.setCenter(currentPos);
            map.setZoom(16);
          }

          // 현위치 마커 생성 또는 업데이트
          if (currentLocationMarker === null) {
            // 마커 생성
            createCurrentLocationMarker(currentPos, position.coords.accuracy);
          } else {
            // 마커 위치 업데이트
            currentLocationMarker.setPosition(currentPos);

            // 정확도 원 업데이트
            if (currentLocationMarker.accuracyCircle) {
              currentLocationMarker.accuracyCircle.setCenter(currentPos);
              currentLocationMarker.accuracyCircle.setRadius(
                position.coords.accuracy
              );
            }
          }

          // 상태 업데이트
          isWatchingLocation = true;
          currentLocationButton.classList.add("active");
          showLoading(false);
        },
        (error) => {
          showLoading(false);
          console.error("위치 정보 오류:", error);

          let errorMessage = "위치 정보를 가져오는데 실패했습니다.";
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage =
                "위치 정보 접근이 거부되었습니다. 브라우저 설정에서 위치 권한을 허용해주세요.";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = "위치 정보를 사용할 수 없습니다.";
              break;
            case error.TIMEOUT:
              errorMessage = "위치 정보 요청 시간이 초과되었습니다.";
              break;
          }

          alert(errorMessage);
          stopWatchingLocation();

          // 위치 권한이 거부된 경우 기본 위치로 이동
          map.setCenter(defaultCenter);
          map.setZoom(13);
        },
        {
          enableHighAccuracy: true,
          maximumAge: 0,
          timeout: 10000,
        }
      );
    } else {
      showLoading(false);
      alert("이 브라우저에서는 위치 정보를 지원하지 않습니다.");

      // 위치 정보를 지원하지 않는 경우 기본 위치로 이동
      map.setCenter(defaultCenter);
      map.setZoom(13);
    }
  }

  // 위치 추적 중지
  function stopWatchingLocation() {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      watchId = null;
    }

    // 현위치 마커 제거
    if (currentLocationMarker !== null) {
      // 정확도 원 제거
      if (currentLocationMarker.accuracyCircle) {
        currentLocationMarker.accuracyCircle.setMap(null);
      }

      // 마커 제거
      currentLocationMarker.setMap(null);
      currentLocationMarker = null;
    }

    // 상태 업데이트
    isWatchingLocation = false;
    currentLocationButton.classList.remove("active");
  }

  // 두 지점 간의 거리를 계산하는 함수 (Haversine 공식)
  function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371000; // 지구 반지름 (미터)
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance; // 미터 단위 거리 반환
  }

  // 각도를 라디안으로 변환하는 함수
  function toRad(degrees) {
    return degrees * (Math.PI / 180);
  }

  function init() {
    initMap();
    loadCSVFromLocalFile();

    // 초기 상태 설정
    showMainMenu();

    // 현위치 버튼 클릭 이벤트 - 브라우저 기본 위치 권한 요청 사용
    currentLocationButton.addEventListener("click", () => {
      if (isWatchingLocation) {
        // 이미 위치 추적 중이면 중지
        stopWatchingLocation();
      } else {
        // 브라우저 기본 위치 권한 요청 사용
        startWatchingLocation();
      }
    });

    // 닫기 버튼 클릭 시 상세 정보 패널 닫기
    if (closeDetail) {
      closeDetail.addEventListener("click", () => {
        if (locationDetail) {
          locationDetail.classList.remove("show");
        }
      });
    }

    // 메뉴 버튼 클릭 이벤트
    if (menuButton) {
      menuButton.addEventListener("click", () => {
        if (sideMenu) {
          sideMenu.classList.add("show");
          showMainMenu();
        }
      });
    }

    // 메뉴 닫기 버튼 클릭 이벤트
    if (closeMenu) {
      closeMenu.addEventListener("click", () => {
        closeSideMenu();
      });
    }

    // About 화면에서 메뉴 닫기 버튼 클릭 이벤트
    if (aboutBinFinder) {
      aboutBinFinder.addEventListener("click", () => {
        showAboutView();
      });
    }

    // 서비스 이용약관 클릭 이벤트
    if (serviceTerms) {
      serviceTerms.addEventListener("click", () => {
        showTermsView();
      });
    }

    // 위치기반서비스 이용약관 클릭 이벤트
    if (locationTerms) {
      locationTerms.addEventListener("click", () => {
        showLocationTermsView();
      });
    }

    // 뒤로가기 버튼 클릭 이벤트
    if (backToMenu) {
      backToMenu.addEventListener("click", () => {
        showMainMenu();
      });
    }

    // 약관 화면에서 뒤로가기 버튼 클릭 이벤트
    if (backToMenuFromTerms) {
      backToMenuFromTerms.addEventListener("click", () => {
        showMainMenu();
      });
    }

    // 위치기반서비스 약관 화면에서 뒤로가기 버튼 클릭 이벤트
    if (backToMenuFromLocation) {
      backToMenuFromLocation.addEventListener("click", () => {
        showMainMenu();
      });
    }

    // 위치기반서비스 약관 화면에서 메뉴 닫기 버튼 클릭 이벤트
    if (closeMenuFromLocation) {
      closeMenuFromLocation.addEventListener("click", () => {
        closeSideMenu();
      });
    }

    // 약관 화면에서 메뉴 닫기 버튼 클릭 이벤트
    if (closeMenuFromTerms) {
      closeMenuFromTerms.addEventListener("click", () => {
        closeSideMenu();
      });
    }

    // 개발자 모드 설정
    setupDevMode();

    // 메뉴 오버레이 클릭 이벤트 - 기존 코드를 다음으로 교체
    if (menuOverlay) {
      menuOverlay.addEventListener("click", (e) => {
        // 오버레이 자체를 클릭했을 때만 메뉴 닫기 (이벤트 버블링 방지)
        if (e.target === menuOverlay) {
          closeSideMenu();
        }
      });
    }

    // 추가로 사이드 메뉴 전체 영역에서도 배경 클릭 시 닫기 처리
    if (sideMenu) {
      sideMenu.addEventListener("click", (e) => {
        // 사이드 메뉴 배경(오버레이 부분)을 클릭했을 때만 닫기
        if (e.target === sideMenu) {
          closeSideMenu();
        }
      });
    }

    // 개인정보 처리방침 클릭 이벤트
    if (privacyPolicy) {
      privacyPolicy.addEventListener("click", () => {
        showPrivacyView();
      });
    }

    // 개인정보 처리방침 화면에서 뒤로가기 버튼 클릭 이벤트
    if (backToMenuFromPrivacy) {
      backToMenuFromPrivacy.addEventListener("click", () => {
        showMainMenu();
      });
    }

    // 개인정보 처리방침 화면에서 메뉴 닫기 버튼 클릭 이벤트
    if (closeMenuFromPrivacy) {
      closeMenuFromPrivacy.addEventListener("click", () => {
        closeSideMenu();
      });
    }
  }

  // 개발자 모드 토글을 위한 키보드 단축키 (Ctrl+Shift+D)
  document.addEventListener("keydown", (e) => {
    if (e.ctrlKey && e.shiftKey && e.key === "D") {
      e.preventDefault();

      const currentDevMode = document.body.classList.contains("dev-mode");

      if (currentDevMode) {
        document.body.classList.remove("dev-mode");
        localStorage.setItem("devMode", "false");
      } else {
        document.body.classList.add("dev-mode");
        localStorage.setItem("devMode", "true");
      }
    }
  });

  // 개발자 모드 설정 함수 (정의되지 �����은 경우 추가)
  function setupDevMode() {
    // 로컬 스토리지에서 개발자 모드 설정 불러오기
    const devMode = localStorage.getItem("devMode") === "true";
    if (devMode) {
      document.body.classList.add("dev-mode");
    }
  }

  // 초기화
  init();
});
