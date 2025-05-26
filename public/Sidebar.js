class Sidebar {
  constructor() {
    this.initElements()
    this.initEventListeners()
    this.showMainMenu()
  }

  initElements() {
    // 사이드바 관련 DOM 요소들
    this.menuButton = document.getElementById("menuButton")
    this.closeMenu = document.getElementById("closeMenu")
    this.closeMenuFromAbout = document.getElementById("closeMenuFromAbout")
    this.sideMenu = document.getElementById("sideMenu")
    this.menuOverlay = document.getElementById("menuOverlay")

    // 드로워 뷰 관련 요소들
    this.mainMenuView = document.getElementById("mainMenuView")
    this.aboutView = document.getElementById("aboutView")
    this.termsView = document.getElementById("termsView")
    this.locationTermsView = document.getElementById("locationTermsView")
    this.aboutBinFinder = document.getElementById("aboutBinFinder")
    this.serviceTerms = document.getElementById("serviceTerms")
    this.locationTerms = document.getElementById("locationTerms")
    this.backToMenu = document.getElementById("backToMenu")
    this.backToMenuFromTerms = document.getElementById("backToMenuFromTerms")
    this.backToMenuFromLocationTerms = document.getElementById("backToMenuFromLocationTerms")
    this.closeMenuFromTerms = document.getElementById("closeMenuFromTerms")
    this.closeMenuFromLocationTerms = document.getElementById("closeMenuFromLocationTerms")
  }

  // 드로워 뷰 관리 함수들
  showMainMenu() {
    this.sideMenu.classList.remove("expanded")
    this.mainMenuView.classList.add("active")
    this.aboutView.classList.remove("active")
    this.termsView.classList.remove("active")
    this.locationTermsView.classList.remove("active")
  }

  showAboutView() {
    this.sideMenu.classList.add("expanded")
    this.mainMenuView.classList.remove("active")
    this.aboutView.classList.add("active")
    this.termsView.classList.remove("active")
    this.locationTermsView.classList.remove("active")
  }

  showTermsView() {
    this.sideMenu.classList.add("expanded")
    this.mainMenuView.classList.remove("active")
    this.aboutView.classList.remove("active")
    this.termsView.classList.add("active")
    this.locationTermsView.classList.remove("active")
  }

  showLocationTermsView() {
    this.sideMenu.classList.add("expanded")
    this.mainMenuView.classList.remove("active")
    this.aboutView.classList.remove("active")
    this.termsView.classList.remove("active")
    this.locationTermsView.classList.add("active")
  }

  closeSideMenu() {
    this.sideMenu.classList.remove("show", "expanded")
    this.mainMenuView.classList.add("active")
    this.aboutView.classList.remove("active")
    this.termsView.classList.remove("active")
    this.locationTermsView.classList.remove("active")
  }

  openSideMenu() {
    if (this.sideMenu) {
      this.sideMenu.classList.add("show")
      this.showMainMenu()
    }
  }

  initEventListeners() {
    // 메뉴 버튼 클릭 이벤트
    if (this.menuButton) {
      this.menuButton.addEventListener("click", () => {
        this.openSideMenu()
      })
    }

    // 메뉴 닫기 버튼 클릭 이벤트
    if (this.closeMenu) {
      this.closeMenu.addEventListener("click", () => {
        this.closeSideMenu()
      })
    }

    // About 화면에서 메뉴 닫기 버튼 클릭 이벤트
    if (this.closeMenuFromAbout) {
      this.closeMenuFromAbout.addEventListener("click", () => {
        this.closeSideMenu()
      })
    }

    // BinFinder 소개 클릭 이벤트
    if (this.aboutBinFinder) {
      this.aboutBinFinder.addEventListener("click", () => {
        this.showAboutView()
      })
    }

    // 서비스 이용약관 클릭 이벤트
    if (this.serviceTerms) {
      this.serviceTerms.addEventListener("click", () => {
        this.showTermsView()
      })
    }

    // 위치기반서비스 이용약관 클릭 이벤트
    if (this.locationTerms) {
      this.locationTerms.addEventListener("click", () => {
        this.showLocationTermsView()
      })
    }

    // 뒤로가기 버튼 클릭 이벤트 (About에서)
    if (this.backToMenu) {
      this.backToMenu.addEventListener("click", () => {
        this.showMainMenu()
      })
    }

    // 약관 화면에서 뒤로가기 버튼 클릭 이벤트
    if (this.backToMenuFromTerms) {
      this.backToMenuFromTerms.addEventListener("click", () => {
        this.showMainMenu()
      })
    }

    // 위치기반서비스 약관 화면에서 뒤로가기 버튼 클릭 이벤트
    if (this.backToMenuFromLocationTerms) {
      this.backToMenuFromLocationTerms.addEventListener("click", () => {
        this.showMainMenu()
      })
    }

    // 약관 화면에서 메뉴 닫기 버튼 클릭 이벤트
    if (this.closeMenuFromTerms) {
      this.closeMenuFromTerms.addEventListener("click", () => {
        this.closeSideMenu()
      })
    }

    // 위치기반서비스 약관 화면에서 메뉴 닫기 버튼 클릭 이벤트
    if (this.closeMenuFromLocationTerms) {
      this.closeMenuFromLocationTerms.addEventListener("click", () => {
        this.closeSideMenu()
      })
    }

    // 메뉴 오버레이 클릭 이벤트
    if (this.menuOverlay) {
      this.menuOverlay.addEventListener("click", (e) => {
        // 오버레이 자체를 클릭했을 때만 메뉴 닫기 (이벤트 버블링 방지)
        if (e.target === this.menuOverlay) {
          this.closeSideMenu()
        }
      })
    }

    // 추가로 사이드 메뉴 전체 영역에서도 배경 클릭 시 닫기 처리
    if (this.sideMenu) {
      this.sideMenu.addEventListener("click", (e) => {
        // 사이드 메뉴 배경(오버레이 부분)을 클릭했을 때만 닫기
        if (e.target === this.sideMenu) {
          this.closeSideMenu()
        }
      })
    }
  }
}

// 전역에서 사용할 수 있도록 export
window.Sidebar = Sidebar
