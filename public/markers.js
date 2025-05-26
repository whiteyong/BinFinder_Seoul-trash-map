// Declare the naver variable before using it
window.naver = window.naver || {}

// 현재 위치 저장 변수
window.currentUserLocation = null
// 선택된 마커 정보 저장
window.selectedMarkerData = null

// Declare the clearMarkers function before using it
function clearMarkers() {
  if (window.markers) {
    window.markers.forEach((markerObj) => {
      markerObj.marker.setMap(null)
    })
    window.markers = []
  }
}

// 두 지점 간의 거리를 계산하는 함수 (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371 // 지구의 반지름 (km)
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c // 거리 (km)

  // 1km 미만이면 미터로, 1km 이상이면 km로 표시
  if (distance < 1) {
    return Math.round(distance * 1000) + "m"
  } else {
    return distance.toFixed(1) + "km"
  }
}

// 현재 위치 가져오기 함수
function getCurrentLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by this browser."))
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }
        window.currentUserLocation = location

        // 위치 정보를 가져온 후 열린 인포윈도우가 있다면 업데이트
        updateOpenInfoWindow()

        resolve(location)
      },
      (error) => {
        console.warn("위치 정보를 가져올 수 없습니다:", error.message)
        reject(error)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5분간 캐시
      },
    )
  })
}

// 열린 인포윈도우 업데이트 함수
function updateOpenInfoWindow() {
  if (window.selectedMarker && window.selectedMarkerData && window.selectedMarker.infoWindow) {
    const content = createInfoWindowContent(window.selectedMarkerData)
    window.selectedMarker.infoWindow.setContent(content)

    // 닫기 버튼 이벤트 리스너 다시 추가
    setTimeout(() => {
      const closeButton = document.querySelector(".info-window-close")
      if (closeButton) {
        closeButton.onclick = (e) => {
          e.stopPropagation()
          window.selectedMarker.infoWindow.close()
          window.selectedMarker.setIcon({
            url: "/public/trashcan.svg",
            size: new window.naver.maps.Size(30, 40),
            scaledSize: new window.naver.maps.Size(30, 40),
            anchor: new window.naver.maps.Point(15, 40),
          })
          window.selectedMarker = null
          window.selectedMarkerData = null
        }
      }
    }, 100)
  }
}

// 1. 인포윈도우 내용 생성 함수 - 거리 정보 추가
function createInfoWindowContent(item) {
  // 주소 정보 설정
  const district = item["구"] || ""
  const roadAddress = item["도로명 주소"] || ""
  const addressParts = roadAddress.split(" ")
  const shortAddress = addressParts.length > 0 ? addressParts[0] : ""

  // 쓰레기통 유형 설정
  const trashTypeText = item["수거 쓰레기 종류"] || ""
  let formattedTrashType = "Trash can"

  if (trashTypeText.includes("일반쓰레기") && trashTypeText.includes("재활용")) {
    formattedTrashType = "Trash can, Separate Trash can"
  } else if (trashTypeText.includes("일반쓰레기")) {
    formattedTrashType = "Trash can"
  } else if (trashTypeText.includes("재활용")) {
    formattedTrashType = "Separate Trash can"
  }

  // 거리 계산
  let distanceText = ""
  if (window.currentUserLocation && item["Latitude"] && item["Longitude"]) {
    const trashCanLat = Number.parseFloat(item["Latitude"])
    const trashCanLng = Number.parseFloat(item["Longitude"])

    if (!isNaN(trashCanLat) && !isNaN(trashCanLng)) {
      const distance = calculateDistance(
        window.currentUserLocation.lat,
        window.currentUserLocation.lng,
        trashCanLat,
        trashCanLng,
      )
      distanceText = `
  <div style="
    display: flex;
    align-items: center;
    font-size: 13px;
    margin-top: 4px;
  ">
    <img src="/public/distance.svg" style="
      width: 16px;
      height: 16px;
      margin-right: 6px;
      vertical-align: middle;
    " alt="거리" />
    <span style="color: #666;">현재 위치에서</span>
    <span style="color: #007bff; font-weight: 500; margin-left: 4px;">${distance}</span>
  </div>
`
    }
  } else if (!window.currentUserLocation) {
    // 위치 정보가 없을 때 표시할 메시지
    distanceText = `
  <div style="
    display: flex;
    align-items: center;
    font-size: 13px;
    margin-top: 4px;
  ">
    <img src="/public/distance.svg" style="
      width: 16px;
      height: 16px;
      margin-right: 6px;
      vertical-align: middle;
      opacity: 0.5;
    " alt="거리" />
    <span style="color: #999; font-style: italic;">위치 정보 가져오는 중...</span>
  </div>
`
  }

  // 이미지와 동일한 스타일의 인포윈도우 HTML 생성
  return `
    <div style="
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
      padding: 20px;
      min-width: 280px;
      max-width: 320px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      position: relative;
    ">
      <!-- 닫기 버튼 -->
      <button class="info-window-close" style="
        position: absolute;
        top: 16px;
        right: 16px;
        background: none;
        border: none;
        font-size: 20px;
        color: #999;
        cursor: pointer;
        padding: 4px;
        line-height: 1;
      ">&times;</button>
      
      <!-- 제목 -->
      <h3 style="
        margin: 0 30px 16px 0;
        font-size: 18px;
        font-weight: 600;
        color: #333;
        line-height: 1.3;
      ">${item["세부 위치"] || "쓰레기통 위치"}</h3>
      
      <!-- 주소 정보 -->
      <div style="
        display: flex;
        align-items: center;
        margin-bottom: 12px;
        font-size: 14px;
        color: #666;
      ">
        <img src="/public/carbon_location-filled.svg" style="
          width: 16px;
          height: 16px;
          margin-right: 8px;
          vertical-align: middle;
        " alt="위치" />
        <span>${district} > ${shortAddress}</span>
      </div>
      
      <!-- 거리 정보 -->
      ${distanceText}
      
      <!-- 쓰레기통 타입 -->
      <div style="
        font-size: 14px;
        color: #888;
        margin-top: 8px;
      ">${formattedTrashType}</div>
    </div>
  `
}

// 2. 마커 생성 및 클릭 이벤트 함수 - 성능 최적화 버전
function createMarkersFromCSV() {
  console.log("📍 최적화된 마커 생성 시작")

  // 현재 위치 가져오기 (한 번만 실행)
  if (!window.currentUserLocation) {
    getCurrentLocation()
      .then((location) => {
        console.log("현재 위치 가져오기 성공:", location)
      })
      .catch((error) => {
        console.log("현재 위치 가져오기 실패:", error.message)
      })
  }

  // 기존 마커들 제거
  if (window.clearMarkers) {
    window.clearMarkers()
  }

  // 지도 이동/줌 이벤트에 마커 업데이트 연결
  const map = window.map

  // 지도 이동이 끝났을 때 마커 업데이트
  window.naver.maps.Event.addListener(map, "idle", () => {
    updateVisibleAreaMarkers()
  })

  // 지도 클릭 시 선택된 마커 해제 및 인포윈도우 닫기
  window.naver.maps.Event.addListener(map, "click", () => {
    if (window.selectedMarker) {
      // 선택된 마커를 기본 상태로 되돌림
      window.selectedMarker.setIcon({
        url: "/public/trashcan.svg",
        size: new window.naver.maps.Size(30, 40),
        scaledSize: new window.naver.maps.Size(30, 40),
        anchor: new window.naver.maps.Point(15, 40),
      })

      // 인포윈도우 닫기
      if (window.selectedMarker.infoWindow) {
        window.selectedMarker.infoWindow.close()
      }

      // 선택 상태 초기화
      window.selectedMarker = null
      window.selectedMarkerData = null

      console.log("지도 클릭으로 마커 선택 해제")
    }
  })

  // 초기 마커 로드
  updateVisibleAreaMarkers()
}

// 현재 화면에 보이는 영역의 마커만 생성하는 함수
function updateVisibleAreaMarkers() {
  const map = window.map
  const bounds = map.getBounds()
  const zoom = map.getZoom()

  // 줌 레벨이 너무 낮으면 마커를 표시하지 않음 (성능 최적화)
  if (zoom < 15) {
    clearMarkers()
    console.log("🔍 줌 레벨이 낮아 마커를 숨김")
    return
  }

  // 현재 화면에 보이는 데이터만 필터링
  const visibleData = window.trashCanData.filter((item) => {
    const lat = Number.parseFloat(item["Latitude"])
    const lng = Number.parseFloat(item["Longitude"])

    if (isNaN(lat) || isNaN(lng)) return false

    const coords = new window.naver.maps.LatLng(lat, lng)
    return bounds.hasLatLng(coords)
  })

  console.log(`📍 화면 내 마커 ${visibleData.length}개 렌더링 (전체: ${window.trashCanData.length}개)`)

  // 기존 마커 제거
  clearMarkers()

  // 화면에 보이는 마커만 생성
  visibleData.forEach((item, index) => {
    const lat = Number.parseFloat(item["Latitude"])
    const lng = Number.parseFloat(item["Longitude"])
    const coords = new window.naver.maps.LatLng(lat, lng)

    // 선택된 마커인지 확인
    const isSelected =
      window.selectedMarkerData &&
      window.selectedMarkerData["Latitude"] === item["Latitude"] &&
      window.selectedMarkerData["Longitude"] === item["Longitude"]

    // 마커 생성
    const marker = new window.naver.maps.Marker({
      position: coords,
      map: map,
      icon: {
        url: isSelected ? "/public/trashcan_detailed.svg" : "/public/trashcan.svg",
        size: new window.naver.maps.Size(30, 40),
        scaledSize: new window.naver.maps.Size(30, 40),
        anchor: new window.naver.maps.Point(15, 40),
      },
    })

    // 인포윈도우 생성
    const infoWindow = new window.naver.maps.InfoWindow({
      content: "",
      borderWidth: 0,
      backgroundColor: "transparent",
      disableAnchor: true,
      pixelOffset: new window.naver.maps.Point(0, -15),
    })

    // 선택된 마커라면 참조만 저장하고 인포윈도우는 자동으로 열지 않음
    if (isSelected) {
      window.selectedMarker = marker
      window.selectedMarkerCoords = coords
      marker.infoWindow = infoWindow

      // 인포윈도우가 이미 열려있었다면 새 마커에서도 열어줌
      if (window.selectedMarker && window.selectedMarker.infoWindow && window.selectedMarker.infoWindow.getMap()) {
        const content = createInfoWindowContent(item)
        infoWindow.setContent(content)
        infoWindow.open(map, marker)

        // 닫기 버튼 이벤트 리스너 추가
        setTimeout(() => {
          const closeButton = document.querySelector(".info-window-close")
          if (closeButton) {
            closeButton.onclick = (e) => {
              e.stopPropagation()
              infoWindow.close()
              marker.setIcon({
                url: "/public/trashcan.svg",
                size: new window.naver.maps.Size(30, 40),
                scaledSize: new window.naver.maps.Size(30, 40),
                anchor: new window.naver.maps.Point(15, 40),
              })
              window.selectedMarker = null
              window.selectedMarkerData = null
            }
          }
        }, 100)
      }
    }

    // 마커 클릭 이벤트
    window.naver.maps.Event.addListener(marker, "click", (e) => {
      if (e && e.domEvent) {
        e.domEvent.stopPropagation()
        e.domEvent.preventDefault()
      }

      // 같은 마커를 다시 클릭한 경우 선택 해제
      if (window.selectedMarker === marker) {
        marker.setIcon({
          url: "/public/trashcan.svg",
          size: new window.naver.maps.Size(30, 40),
          scaledSize: new window.naver.maps.Size(30, 40),
          anchor: new window.naver.maps.Point(15, 40),
        })
        infoWindow.close()
        window.selectedMarker = null
        window.selectedMarkerData = null
        return
      }

      // 이전에 선택된 마커가 있다면 초기화
      if (window.selectedMarker) {
        window.selectedMarker.setIcon({
          url: "/public/trashcan.svg",
          size: new window.naver.maps.Size(30, 40),
          scaledSize: new window.naver.maps.Size(30, 40),
          anchor: new window.naver.maps.Point(15, 40),
        })

        if (window.selectedMarker.infoWindow) {
          window.selectedMarker.infoWindow.close()
        }

        const locationDetail = document.querySelector(".location-detail")
        if (locationDetail) {
          locationDetail.classList.remove("show")
        }
      }

      // 새로운 마커 선택
      marker.setIcon({
        url: "/public/trashcan_detailed.svg",
        size: new window.naver.maps.Size(30, 40),
        scaledSize: new window.naver.maps.Size(30, 40),
        anchor: new window.naver.maps.Point(15, 40),
      })

      window.selectedMarker = marker
      window.selectedMarkerCoords = coords
      window.selectedMarkerData = item // 선택된 마커 데이터 저장

      // 지도 중심 이동을 약간 지연시켜 마커 아이콘 변경이 완료된 후 실행
      setTimeout(() => {
        map.setCenter(coords)
      }, 50)

      // 인포윈도우 내용 생성 및 표시
      console.log("인포윈도우 내용 생성 중:", item)
      const content = createInfoWindowContent(item)
      console.log("생성된 인포윈도우 내용:", content)

      infoWindow.setContent(content)
      infoWindow.open(map, marker)
      marker.infoWindow = infoWindow

      console.log("인포윈도우 열림 완료")

      // 닫기 버튼 이벤트 리스너 추가
      setTimeout(() => {
        const closeButton = document.querySelector(".info-window-close")
        if (closeButton) {
          closeButton.onclick = (e) => {
            e.stopPropagation()
            infoWindow.close()
            // 마커를 기본 상태로 되돌림
            marker.setIcon({
              url: "/public/trashcan.svg",
              size: new window.naver.maps.Size(30, 40),
              scaledSize: new window.naver.maps.Size(30, 40),
              anchor: new window.naver.maps.Point(15, 40),
            })
            window.selectedMarker = null
            window.selectedMarkerData = null
          }
        }
      }, 100)
    })

    marker.infoWindow = infoWindow

    window.markers.push({
      marker: marker,
      data: item,
      type: "trashcan",
      visible: true,
    })
  })

  if (window.updateVisibleMarkers) {
    window.updateVisibleMarkers()
  }
}

// 전역 함수로 노출
window.updateVisibleAreaMarkers = updateVisibleAreaMarkers
