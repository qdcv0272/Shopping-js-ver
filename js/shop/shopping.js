import { OverlayScrollbars } from "overlayscrollbars";
import "overlayscrollbars/overlayscrollbars.css";
import gsap from "gsap";

(function () {
  // ========================================
  // 설정 및 상수
  // ========================================
  const dataUrl = new URL("../../data/products.json", import.meta.url);
  const DEFAULT_PRODUCT_IMAGE = "https://placehold.co/600x400?text=Product";
  const CART_STORAGE_PREFIX = "shoppingCart:";

  // 초기화 상태
  let scrollInstance = null;
  let isInitialized = false;
  let productsLoaded = false;
  let isLoadingProducts = false;
  let currentUserId = null;

  // ========================================
  // 앱 상태 관리
  // ========================================
  const state = {
    products: [], // 전체 상품 목록
    filteredProducts: [], // 필터링된 상품 목록
    filters: {
      search: "", // 검색어
      category: "all", // 선택된 카테고리
      priceRanges: [], // 선택된 가격 범위들
      stockOnly: false, // 재고 있는 상품만 보기
    },
    sort: "recommended", // 정렬 방식
    pageSize: 20, // 페이지당 표시할 상품 수
    cart: [], // 장바구니 [{productId, qty}]
    wishlist: new Set(), // 위시리스트 (상품 ID Set)
    selectedProductId: null, // 현재 선택된 상품 ID
  };

  // ========================================
  // DOM 요소 참조 (캐싱)
  // ========================================
  const refs = {
    // 페이지 기본 요소
    page: null,
    shell: null,

    // 상품 그리드
    productGrid: null,
    productEmpty: null,

    // 검색
    searchInput: null,

    // 상품 상세보기
    detailSection: null,
    detailClose: null,
    detailImage: null,
    detailCategory: null,
    detailName: null,
    detailPrice: null,
    detailDescription: null,
    detailStock: null,
    detailPopularity: null,
    detailAdd: null,

    // 필터 및 정렬
    categoryItems: [],
    priceCheckboxes: [],
    sortTabs: [],
    stockToggle: null,
    pageSizeSelect: null,

    // 사이드바 토글
    categoryToggle: null,
    categoryList: null,
    priceToggle: null,
    priceList: null,

    // 장바구니
    cartItems: null,
    cartEmpty: null,
    cartSubtotal: null,
    cartShipping: null,
    cartTotal: null,
    cartTrigger: null,
    checkoutBtn: null,
    cartSection: null,
  };

  // ========================================
  // 유틸리티 설정
  // ========================================

  // 커스텀 스크롤바 옵션
  const SCROLL_OPTIONS = {
    scrollbars: {
      visibility: "auto", // 자동으로 보이기
      autoHide: "leave", // 마우스가 떠나면 숨김
      autoHideDelay: 600, // 숨김 대기 시간 (ms)
      theme: "os-theme-dark", // 테마
    },
    overflow: { x: "hidden" }, // 가로 스크롤 숨김
  };

  document.addEventListener("shopping:user-changed", handleUserChange);

  // 가격 포맷 (예: 120000 → ₩120,000)
  const formatPrice = (price) => {
    return new Intl.NumberFormat("ko-KR", {
      style: "currency",
      currency: "KRW",
      maximumFractionDigits: 0,
    }).format(price);
  };

  // ========================================
  // 초기화
  // ========================================

  // 페이지가 보여질 때 실행
  document.addEventListener("shopping:page-shown", () => {
    initScroll();
    initShoppingModule().catch((error) => console.error("[쇼핑 모듈] 초기화 실패", error));
  });

  // DOM 로드 시 실행
  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      () => {
        initScroll();
        initShoppingModule().catch(console.error);
      },
      { once: true }
    );
  } else {
    initScroll();
    initShoppingModule().catch(console.error);
  }

  /**
   * 커스텀 스크롤바 초기화
   */
  function initScroll() {
    // 이미 초기화되었으면 종료
    if (scrollInstance) return;

    // DOM 요소 참조
    refs.page = refs.page || document.querySelector(".shopping-page");
    refs.shell = refs.shell || document.querySelector(".shopping-shell");

    // 요소가 없거나 페이지가 숨겨져 있으면 종료
    if (!refs.page || !refs.shell) return;
    if (refs.page.classList.contains("d-none")) return;

    // 스크롤바 적용
    scrollInstance = OverlayScrollbars(refs.shell, SCROLL_OPTIONS);
  }
  /**
   * 모든 DOM 요소 참조를 캐싱하기
   */
  function cacheElements() {
    // 기본 요소
    refs.page = refs.page || document.querySelector(".shopping-page");
    refs.shell = refs.shell || document.querySelector(".shopping-shell");

    // 상품 그리드
    refs.productGrid = refs.productGrid || document.querySelector("[data-product-grid]");
    refs.productEmpty = refs.productEmpty || document.querySelector("[data-product-empty]");

    // 검색
    refs.searchInput = refs.searchInput || document.querySelector("[data-search-input]");

    // 상품 상세보기
    refs.detailSection = refs.detailSection || document.querySelector("[data-product-detail]");
    refs.detailClose = refs.detailClose || document.querySelector("[data-detail-close]");
    refs.detailImage = refs.detailImage || document.querySelector("[data-detail-image]");
    refs.detailCategory = refs.detailCategory || document.querySelector("[data-detail-category]");
    refs.detailName = refs.detailName || document.querySelector("[data-detail-name]");
    refs.detailPrice = refs.detailPrice || document.querySelector("[data-detail-price]");
    refs.detailDescription = refs.detailDescription || document.querySelector("[data-detail-description]");
    refs.detailStock = refs.detailStock || document.querySelector("[data-detail-stock]");
    refs.detailPopularity = refs.detailPopularity || document.querySelector("[data-detail-popularity]");
    refs.detailAdd = refs.detailAdd || document.querySelector("[data-detail-add]");

    // 카테고리 목록
    if (!refs.categoryItems.length) {
      const categoryList = document.querySelector("[data-category-list]");
      if (categoryList) {
        refs.categoryItems = Array.from(categoryList.querySelectorAll("li[data-category]"));
      }
    }

    // 사이드바 토글 버튼
    refs.categoryToggle = refs.categoryToggle || document.querySelector("[data-category-toggle]");
    refs.categoryList = refs.categoryList || document.querySelector("[data-category-list]");
    refs.priceToggle = refs.priceToggle || document.querySelector("[data-price-toggle]");
    refs.priceList = refs.priceList || document.querySelector("[data-price-list]");

    // 가격 필터 체크박스
    if (!refs.priceCheckboxes.length) {
      refs.priceCheckboxes = Array.from(document.querySelectorAll("input[data-range]"));
    }

    // 정렬 탭
    if (!refs.sortTabs.length) {
      refs.sortTabs = Array.from(document.querySelectorAll(".shopping-toolbar .tabs button[data-sort]"));
    }

    // 기타 필터
    refs.stockToggle = refs.stockToggle || document.querySelector("[data-stock-only]");
    refs.pageSizeSelect = refs.pageSizeSelect || document.querySelector("[data-page-size]");

    // 장바구니
    refs.cartItems = refs.cartItems || document.querySelector("[data-cart-items]");
    refs.cartEmpty = refs.cartEmpty || document.querySelector("[data-cart-empty]");
    refs.cartSubtotal = refs.cartSubtotal || document.querySelector("[data-cart-subtotal]");
    refs.cartShipping = refs.cartShipping || document.querySelector("[data-cart-shipping]");
    refs.cartTotal = refs.cartTotal || document.querySelector("[data-cart-total]");
    refs.cartTrigger = refs.cartTrigger || document.querySelector("[data-cart-trigger]");
    refs.checkoutBtn = refs.checkoutBtn || document.querySelector("[data-checkout-btn]");
    refs.cartSection = refs.cartSection || document.querySelector(".shopping-cart");
  }

  // ========================================
  // 이벤트 바인딩
  // ========================================

  /**
   * 모든 이벤트 리스너 등록
   */
  function bindStaticEvents() {
    bindSearchEvent();
    bindSidebarToggleEvents();
    bindCategoryEvents();
    bindPriceFilterEvents();
    bindSortEvents();
    bindStockFilterEvent();
    bindPageSizeEvent();
    bindDetailEvents();
    bindCartEvents();
  }

  /**
   * 검색 이벤트 등록
   */
  function bindSearchEvent() {
    if (!refs.searchInput) return;

    // 디바운스로 검색 성능 최적화 (200ms 대기)
    const handleSearch = debounce((value) => {
      state.filters.search = value.trim();
      applyFiltersAndRender();
    }, 200);

    // 초기값 설정
    state.filters.search = (refs.searchInput.value || "").trim();

    // 입력 이벤트 등록
    refs.searchInput.addEventListener("input", (event) => {
      handleSearch(event.target.value || "");
    });
  }

  /**
   * 사이드바 토글 이벤트 등록
   */
  function bindSidebarToggleEvents() {
    // 카테고리 토글
    if (refs.categoryToggle && refs.categoryList) {
      refs.categoryToggle.addEventListener("click", () => {
        toggleSection(refs.categoryToggle, refs.categoryList);
      });
    }

    // 가격 토글
    if (refs.priceToggle && refs.priceList) {
      refs.priceToggle.addEventListener("click", () => {
        toggleSection(refs.priceToggle, refs.priceList);
      });
    }
  }

  /**
   * 섹션 토글 함수 (GSAP 애니메이션)
   */
  function toggleSection(toggleBtn, contentElement) {
    const isCollapsed = toggleBtn.classList.contains("collapsed");

    if (isCollapsed) {
      // 열기 애니메이션
      toggleBtn.classList.remove("collapsed");
      gsap.to(contentElement, {
        height: "auto",
        opacity: 1,
        duration: 0.4,
        ease: "power2.out",
        onStart: () => {
          contentElement.style.display = "block";
          contentElement.style.overflow = "";
        },
      });
    } else {
      // 닫기 애니메이션
      toggleBtn.classList.add("collapsed");
      gsap.to(contentElement, {
        height: 0,
        opacity: 0,
        duration: 0.3,
        ease: "power2.in",
        onStart: () => {
          contentElement.style.overflow = "hidden";
        },
        onComplete: () => {
          contentElement.style.display = "none";
        },
      });
    }
  }

  function handleUserChange(event) {
    const nextUserId = event && event.detail && event.detail.userId ? String(event.detail.userId) : null;
    if (currentUserId === nextUserId) return;

    currentUserId = nextUserId;

    if (!currentUserId) {
      state.cart = [];
      renderCart();
      return;
    }

    loadCartForUser(currentUserId);
  }

  /**
   * 카테고리 필터 이벤트 등록
   */
  function bindCategoryEvents() {
    if (!refs.categoryItems.length) return;

    // 현재 활성화된 카테고리 찾기
    const activeItem = refs.categoryItems.find((item) => item.classList.contains("active"));
    state.filters.category = activeItem ? activeItem.dataset.category || "all" : "all";

    // 각 카테고리 항목에 클릭 이벤트 등록
    refs.categoryItems.forEach((item, index) => {
      item.addEventListener("click", () => {
        // 상세보기가 열려있으면 먼저 닫기
        if (refs.detailSection && !refs.detailSection.classList.contains("d-none")) {
          hideProductDetail();
        }

        // 이전 활성화된 항목 찾기
        const previousActive = refs.categoryItems.find((el) => el.classList.contains("active"));

        // 모든 항목에서 active 클래스 제거
        refs.categoryItems.forEach((el) => el.classList.remove("active"));

        // 현재 항목에 active 클래스 추가
        item.classList.add("active");

        // 클릭 애니메이션: 선택된 항목 강조
        gsap.fromTo(
          item,
          { scale: 1, backgroundColor: "transparent" },
          {
            scale: 1.05,
            duration: 0.2,
            yoyo: true,
            repeat: 1,
            ease: "power1.inOut",
          }
        );

        // 필터 상태 업데이트 및 렌더링
        state.filters.category = item.dataset.category || "all";
        applyFiltersAndRender();
      });

      // 호버 애니메이션
      item.addEventListener("mouseenter", () => {
        if (!item.classList.contains("active")) {
          gsap.to(item, {
            x: 5,
            duration: 0.3,
            ease: "power2.out",
          });
        }
      });

      item.addEventListener("mouseleave", () => {
        if (!item.classList.contains("active")) {
          gsap.to(item, {
            x: 0,
            duration: 0.3,
            ease: "power2.out",
          });
        }
      });
    });
  }

  /**
   * 가격 필터 이벤트 등록
   */
  function bindPriceFilterEvents() {
    if (!refs.priceCheckboxes.length) return;

    // 초기 가격 필터 상태 업데이트
    updatePriceFilters();

    // 각 체크박스에 변경 이벤트 등록
    refs.priceCheckboxes.forEach((checkbox) => {
      checkbox.addEventListener("change", () => {
        updatePriceFilters();
        applyFiltersAndRender();
      });
    });
  }

  /**
   * 정렬 탭 이벤트 등록
   */
  function bindSortEvents() {
    if (!refs.sortTabs.length) return;

    // 현재 활성화된 정렬 탭 찾기
    const activeTab = refs.sortTabs.find((tab) => tab.classList.contains("active"));
    state.sort = activeTab ? activeTab.dataset.sort || "recommended" : "recommended";

    // 각 탭에 클릭 이벤트 등록
    refs.sortTabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        // 이미 활성화된 탭이면 무시
        if (tab.classList.contains("active")) return;

        // 모든 탭에서 active 클래스 제거
        refs.sortTabs.forEach((btn) => btn.classList.remove("active"));
        // 현재 탭에 active 클래스 추가
        tab.classList.add("active");

        // 정렬 상태 업데이트 및 렌더링
        state.sort = tab.dataset.sort || "recommended";
        applyFiltersAndRender();
      });
    });
  }

  /**
   * 재고 필터 이벤트 등록
   */
  function bindStockFilterEvent() {
    if (!refs.stockToggle) return;

    // 초기값 설정
    state.filters.stockOnly = refs.stockToggle.checked;

    // 체크박스 변경 이벤트
    refs.stockToggle.addEventListener("change", (event) => {
      state.filters.stockOnly = event.target.checked;
      applyFiltersAndRender();
    });
  }

  /**
   * 페이지 크기 변경 이벤트 등록
   */
  function bindPageSizeEvent() {
    if (!refs.pageSizeSelect) return;

    // 초기값 설정
    state.pageSize = Number.parseInt(refs.pageSizeSelect.value, 10) || state.pageSize;

    // select 변경 이벤트
    refs.pageSizeSelect.addEventListener("change", (event) => {
      const value = Number.parseInt(event.target.value, 10);
      state.pageSize = Number.isNaN(value) ? state.pageSize : value;
      applyFiltersAndRender();
    });
  }

  /**
   * 상품 상세보기 이벤트 등록
   */
  function bindDetailEvents() {
    // 닫기 버튼
    if (refs.detailClose) {
      refs.detailClose.addEventListener("click", () => {
        hideProductDetail();
      });
    }

    // 장바구니 추가 버튼
    if (refs.detailAdd) {
      refs.detailAdd.addEventListener("click", handleDetailAddToCart);
    }
  }

  /**
   * 장바구니 관련 이벤트 등록
   */
  function bindCartEvents() {
    // 장바구니 아이템 삭제
    if (refs.cartItems) {
      refs.cartItems.addEventListener("click", (event) => {
        const removeBtn = event.target.closest("[data-remove-id]");
        if (removeBtn) {
          removeFromCart(removeBtn.dataset.removeId || "");
        }
      });
    }

    // 장바구니로 스크롤
    if (refs.cartTrigger && refs.cartSection) {
      refs.cartTrigger.addEventListener("click", () => {
        refs.cartSection.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }

    // 결제 버튼
    if (refs.checkoutBtn) {
      refs.checkoutBtn.addEventListener("click", () => {
        const totals = getCartTotals();
        if (!totals.count) return;
        alert(`총 ${formatPrice(totals.total)} 결제를 진행합니다.`);
      });
    }
  }

  // ========================================
  // 상품 데이터 처리
  // ========================================

  /**
   * 원시 데이터를 표준 형식으로 변환
   * @param {Object} raw - 원시 상품 데이터
   * @returns {Object|null} - 정규화된 상품 데이터 또는 null
   */
  function normalizeProduct(raw) {
    // ID가 없으면 무효한 데이터
    if (!raw || !raw.id) return null;

    // 가격을 숫자로 변환
    const price = typeof raw.price === "number" ? raw.price : Number(raw.price) || 0;

    return {
      id: String(raw.id),
      name: raw.name || "상품명 미정",
      category: raw.category || "기타",
      price,
      description: raw.description || "",
      image: raw.image || "",
      badge: raw.badge || null,
      stock: typeof raw.stock === "number" ? raw.stock : 0,
      popularity: typeof raw.popularity === "number" ? raw.popularity : 0,
      createdAt: raw.createdAt || new Date().toISOString(),
      isRecommended: Boolean(raw.isRecommended),
      cta: raw.cta === "wishlist" ? "wishlist" : "cart",
    };
  }

  /**
   * 필터를 적용하고 화면에 렌더링
   */
  function applyFiltersAndRender() {
    // 상품이 아직 로드되지 않았으면 대기 메시지 표시
    if (!state.products.length) {
      setGridMessage("상품 정보를 준비 중입니다...");
      return;
    }

    // 필터링 및 정렬
    const filtered = filterProducts(state.products);
    state.filteredProducts = sortProducts(filtered);

    // 화면에 표시
    renderProducts();
  }

  /**
   * 상품 목록에 필터 적용
   * @param {Array} list - 필터링할 상품 목록
   * @returns {Array} - 필터링된 상품 목록
   */
  function filterProducts(list) {
    const { search, category, priceRanges, stockOnly } = state.filters;
    let result = list.slice(); // 복사본 생성

    // 1. 카테고리 필터
    if (category && category !== "all") {
      result = result.filter((item) => item.category === category);
    }

    // 2. 가격 필터
    if (priceRanges.length) {
      result = result.filter((item) => priceRanges.some((range) => matchesPriceRange(item.price, range)));
    }

    // 3. 재고 필터
    if (stockOnly) {
      result = result.filter((item) => item.stock > 0);
    }

    // 4. 검색어 필터
    if (search) {
      const keyword = search.toLowerCase();
      result = result.filter((item) => `${item.name} ${item.description} ${item.category}`.toLowerCase().includes(keyword));
    }

    return result;
  }

  /**
   * 상품 목록을 선택된 방식으로 정렬
   * @param {Array} list - 정렬할 상품 목록
   * @returns {Array} - 정렬된 상품 목록
   */
  function sortProducts(list) {
    const data = list.slice(); // 복사본 생성
    const sortKey = state.sort;

    // 날짜 문자열을 숫자로 변환
    const getDateValue = (value) => Date.parse(value) || 0;

    switch (sortKey) {
      case "popular": // 인기순
        return data.sort((a, b) => b.popularity - a.popularity || b.price - a.price);

      case "latest": // 최신순
        return data.sort((a, b) => getDateValue(b.createdAt) - getDateValue(a.createdAt));

      case "priceAsc": // 가격 낮은순
        return data.sort((a, b) => a.price - b.price);

      case "recommended": // 추천순 (기본값)
      default:
        return data.sort((a, b) => {
          // 1순위: 추천 여부
          if (a.isRecommended !== b.isRecommended) {
            return a.isRecommended ? -1 : 1;
          }
          // 2순위: 인기도
          if (b.popularity !== a.popularity) {
            return b.popularity - a.popularity;
          }
          // 3순위: 가격 낮은순
          return a.price - b.price;
        });
    }
  }

  // ========================================
  // 화면 렌더링
  // ========================================

  /**
   * 상품 그리드를 화면에 표시
   */
  function renderProducts() {
    if (!refs.productGrid) return;

    // 기존 콘텐츠 제거
    refs.productGrid.innerHTML = "";

    // 필터링된 상품이 없으면 빈 메시지 표시
    if (!state.filteredProducts.length) {
      setGridMessage("조건에 맞는 상품이 없습니다.");
      if (refs.productEmpty) {
        refs.productGrid.appendChild(refs.productEmpty);
      }
      return;
    }

    // 빈 메시지 숨김
    if (refs.productEmpty) {
      refs.productEmpty.classList.add("d-none");
    }

    // 상품 카드 생성 (페이지 크기만큼)
    const fragment = document.createDocumentFragment();
    state.filteredProducts.slice(0, state.pageSize).forEach((product) => {
      fragment.appendChild(createProductCard(product));
    });
    refs.productGrid.appendChild(fragment);
  }

  /**
   * 단일 상품 카드 DOM 생성
   * @param {Object} product - 상품 데이터
   * @returns {HTMLElement} - 상품 카드 요소
   */
  function createProductCard(product) {
    // 메인 컨테이너
    const article = document.createElement("article");
    article.className = "product-card";
    article.dataset.productId = product.id;
    article.tabIndex = 0; // 키보드 접근성

    // 클릭 이벤트
    article.addEventListener("click", () => handleProductSelect(product));
    article.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        handleProductSelect(product);
      }
    });

    // 배지 (있으면)
    if (product.badge && product.badge.label) {
      const badge = document.createElement("div");
      badge.className = `badge${product.badge.tone === "hot" ? " hot" : ""}`;
      badge.textContent = product.badge.label;
      article.appendChild(badge);
    }

    // 상품 이미지
    const img = document.createElement("img");
    img.src = product.image || DEFAULT_PRODUCT_IMAGE;
    img.alt = product.name;
    article.appendChild(img);

    // 상품 정보 컨테이너
    const body = document.createElement("div");
    body.className = "product-card-body";
    article.appendChild(body);

    // 상품명
    const title = document.createElement("h3");
    title.textContent = product.name;
    body.appendChild(title);

    // 가격
    const price = document.createElement("p");
    price.className = "price";
    price.textContent = formatPrice(product.price);
    body.appendChild(price);

    // 설명
    const desc = document.createElement("p");
    desc.className = "desc product-description";
    desc.textContent = product.description || "";
    body.appendChild(desc);

    // 메타 정보 (재고, 인기도)
    const meta = document.createElement("p");
    meta.className = "desc product-meta";
    meta.textContent = product.stock > 0 ? `재고 ${product.stock}개 · 인기 ${product.popularity}` : "품절";
    body.appendChild(meta);

    return article;
  }

  // ========================================
  // 상품 상세보기
  // ========================================

  /**
   * 상품 선택 핸들러
   */
  function handleProductSelect(product) {
    state.selectedProductId = product.id;
    showProductDetail(product);
  }

  /**
   * 상품 상세보기 화면 표시
   */
  function showProductDetail(product) {
    if (!refs.detailSection) return;

    // 그리드 숨기고 상세보기 표시
    if (refs.productGrid) {
      refs.productGrid.classList.add("d-none");
    }
    refs.detailSection.classList.remove("d-none");

    // 상세 정보 업데이트
    if (refs.detailImage) {
      refs.detailImage.src = product.image || DEFAULT_PRODUCT_IMAGE;
      refs.detailImage.alt = product.name;
    }
    if (refs.detailCategory) refs.detailCategory.textContent = product.category;
    if (refs.detailName) refs.detailName.textContent = product.name;
    if (refs.detailPrice) refs.detailPrice.textContent = formatPrice(product.price);
    if (refs.detailDescription) {
      refs.detailDescription.textContent = product.description || "상세 설명이 없습니다.";
    }
    if (refs.detailStock) {
      refs.detailStock.textContent = product.stock > 0 ? `재고 ${product.stock}개` : "품절";
    }
    if (refs.detailPopularity) {
      refs.detailPopularity.textContent = `인기 ${product.popularity}`;
    }

    updateDetailActionState(product);
  }

  /**
   * 상품 상세보기 화면 닫기
   */
  function hideProductDetail() {
    state.selectedProductId = null;

    // 상세보기 숨기고 그리드 표시
    if (refs.detailSection) {
      refs.detailSection.classList.add("d-none");
    }
    if (refs.productGrid) {
      refs.productGrid.classList.remove("d-none");
    }

    // 버튼 초기화
    if (refs.detailAdd) {
      refs.detailAdd.disabled = true;
      refs.detailAdd.textContent = "장바구니 추가";
    }
  }

  /**
   * 상세보기 버튼 상태 업데이트
   */
  function updateDetailActionState(product) {
    if (!refs.detailAdd) return;

    const isSoldOut = product.stock <= 0;
    refs.detailAdd.disabled = isSoldOut;
    refs.detailAdd.textContent = isSoldOut ? "품절" : "장바구니 추가";
  }

  /**
   * 상세보기에서 장바구니 추가
   */
  function handleDetailAddToCart() {
    if (!state.selectedProductId) return;

    const product = state.products.find((item) => item.id === state.selectedProductId);
    if (!product) return;

    addToCart(product);
  }

  // ========================================
  // 위시리스트 관리
  // ========================================

  /**
   * 위시리스트 토글 (추가/제거)
   */
  function toggleWishlist(productId) {
    if (state.wishlist.has(productId)) {
      state.wishlist.delete(productId);
    } else {
      state.wishlist.add(productId);
    }
    renderProducts();
  }

  // ========================================
  // 장바구니 관리
  // ========================================

  function getCartStorageKey(userId) {
    return `${CART_STORAGE_PREFIX}${userId}`;
  }

  function persistCart() {
    if (!currentUserId) return;

    try {
      const payload = state.cart.map((item) => ({
        productId: item.productId,
        qty: item.qty,
      }));
      localStorage.setItem(getCartStorageKey(currentUserId), JSON.stringify(payload));
    } catch (error) {
      console.error("[쇼핑 모듈] 장바구니 저장 실패", error);
    }
  }

  function loadCartForUser(userId) {
    if (!userId) return;

    try {
      const raw = localStorage.getItem(getCartStorageKey(userId));
      if (!raw) {
        state.cart = [];
        renderCart();
        return;
      }

      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        throw new Error("잘못된 장바구니 데이터 형식");
      }

      const sanitized = parsed
        .map((item) => {
          const productId = item && item.productId ? String(item.productId) : null;
          if (!productId) return null;
          const qty = Math.max(1, Number.parseInt(item.qty, 10) || 1);
          return { productId, qty };
        })
        .filter(Boolean);

      state.cart = sanitized;
    } catch (error) {
      console.error("[쇼핑 모듈] 장바구니 불러오기 실패", error);
      state.cart = [];
    }

    renderCart();
  }

  /**
   * 장바구니에 상품 추가
   */
  function addToCart(product) {
    // 품절 상품은 추가할 수 없음
    if (product.stock <= 0) return;

    // 이미 장바구니에 있는 상품인지 확인
    const existing = state.cart.find((item) => item.productId === product.id);

    if (existing) {
      // 재고보다 많이 담을 수 없음
      if (existing.qty >= product.stock) return;
      existing.qty += 1;
    } else {
      // 새로운 상품 추가
      state.cart.push({ productId: product.id, qty: 1 });
    }

    renderCart();
    persistCart();
  }

  /**
   * 장바구니에서 상품 제거
   */
  function removeFromCart(productId) {
    const next = state.cart.filter((item) => item.productId !== productId);

    // 변경이 없으면 종료
    if (next.length === state.cart.length) return;

    state.cart = next;
    renderCart();
    persistCart();
  }

  /**
   * 장바구니 UI 렌더링
   */
  function renderCart() {
    if (!refs.cartItems) return;

    // 기존 콘텐츠 제거
    refs.cartItems.innerHTML = "";

    // 빈 장바구니 처리
    if (!state.cart.length) {
      if (refs.cartEmpty) {
        refs.cartEmpty.classList.remove("d-none");
        refs.cartItems.appendChild(refs.cartEmpty);
      }
      updateCartSummary();
      return;
    }

    // 빈 메시지 숨김
    if (refs.cartEmpty) {
      refs.cartEmpty.classList.add("d-none");
    }

    // 장바구니 아이템 생성
    const fragment = document.createDocumentFragment();
    state.cart.forEach((item) => {
      const product = state.products.find((p) => p.id === item.productId);
      if (!product) return;

      const cartItem = document.createElement("div");
      cartItem.className = "cart-item";

      // 상품 정보
      const info = document.createElement("div");
      const title = document.createElement("p");
      title.textContent = product.name;
      const meta = document.createElement("small");
      meta.textContent = `${formatPrice(product.price)} · 수량 ${item.qty}`;
      info.appendChild(title);
      info.appendChild(meta);

      // 삭제 버튼
      const removeBtn = document.createElement("button");
      removeBtn.type = "button";
      removeBtn.className = "link-btn";
      removeBtn.dataset.removeId = product.id;
      removeBtn.textContent = "삭제";

      cartItem.appendChild(info);
      cartItem.appendChild(removeBtn);
      fragment.appendChild(cartItem);
    });

    refs.cartItems.appendChild(fragment);
    updateCartSummary();
  }

  /**
   * 장바구니 요약 정보 업데이트
   */
  function updateCartSummary() {
    const totals = getCartTotals();

    // 금액 표시
    if (refs.cartSubtotal) {
      refs.cartSubtotal.textContent = formatPrice(totals.subtotal);
    }
    if (refs.cartShipping) {
      refs.cartShipping.textContent = totals.shipping ? formatPrice(totals.shipping) : "무료";
    }
    if (refs.cartTotal) {
      refs.cartTotal.textContent = formatPrice(totals.total);
    }

    // 버튼 상태
    if (refs.checkoutBtn) {
      refs.checkoutBtn.disabled = totals.count === 0;
    }

    // 장바구니 배지
    if (refs.cartTrigger) {
      refs.cartTrigger.textContent = `장바구니 (${totals.count})`;
    }
  }

  /**
   * 장바구니 총액 계산
   * @returns {Object} - { subtotal, shipping, total, count }
   */
  function getCartTotals() {
    let subtotal = 0; // 상품 금액
    let count = 0; // 상품 개수

    state.cart.forEach((item) => {
      const product = state.products.find((p) => p.id === item.productId);
      if (!product) return;

      subtotal += product.price * item.qty;
      count += item.qty;
    });

    // 배송비: 0원이거나 5만원 이상이면 무료, 아니면 3000원
    const shipping = subtotal === 0 || subtotal >= 50000 ? 0 : 3000;

    return {
      subtotal,
      shipping,
      total: subtotal + shipping,
      count,
    };
  }

  // ========================================
  // 유틸리티 함수
  // ========================================

  /**
   * 체크된 가격 필터를 상태에 반영
   */
  function updatePriceFilters() {
    state.filters.priceRanges = refs.priceCheckboxes
      .filter((checkbox) => checkbox.checked)
      .map((checkbox) => {
        const min = checkbox.dataset.min !== undefined ? Number(checkbox.dataset.min) : null;
        const max = checkbox.dataset.max !== undefined ? Number(checkbox.dataset.max) : null;
        return {
          min: Number.isNaN(min) ? null : min,
          max: Number.isNaN(max) ? null : max,
        };
      });
  }

  /**
   * 가격이 주어진 범위에 맞는지 확인
   * @param {number} price - 확인할 가격
   * @param {Object} range - { min, max } 범위
   * @returns {boolean}
   */
  function matchesPriceRange(price, range) {
    if (!range) return true;

    const meetsMin = range.min === null || price >= range.min;
    const meetsMax = range.max === null || price < range.max;

    return meetsMin && meetsMax;
  }

  /**
   * 그리드에 메시지 표시
   * @param {string} message - 표시할 메시지
   * @param {boolean} isError - 에러 메시지 여부
   */
  function setGridMessage(message, isError = false) {
    if (!refs.productEmpty) return;

    refs.productEmpty.textContent = message;
    refs.productEmpty.classList.toggle("is-error", Boolean(isError));
    refs.productEmpty.classList.remove("d-none");

    if (refs.productGrid && !refs.productEmpty.isConnected) {
      refs.productGrid.innerHTML = "";
      refs.productGrid.appendChild(refs.productEmpty);
    }
  }

  /**
   * 디바운스: 함수 호출을 지연시켜 성능 최적화
   * @param {Function} fn - 실행할 함수
   * @param {number} wait - 대기 시간 (ms)
   * @returns {Function}
   */
  function debounce(fn, wait = 200) {
    let timer = null;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), wait);
    };
  }

  // ========================================
  // 모듈 초기화
  // ========================================

  /**
   * 쇼핑 모듈 초기화
   */
  async function initShoppingModule() {
    // DOM이 준비되지 않았으면 대기
    if (document.readyState === "loading") return;

    // DOM 요소 참조 캐싱
    cacheElements();
    if (!refs.page) return;

    // 한 번만 실행할 초기화 작업
    if (!isInitialized) {
      bindStaticEvents(); // 이벤트 리스너 등록
      renderCart(); // 장바구니 초기 표시
      isInitialized = true;
    }

    // 상품 데이터 로드
    try {
      await loadProductsOnce();
    } catch (error) {
      return; // 에러 메시지는 loadProductsOnce 내부에서 처리
    }

    // 초기 화면 렌더링
    applyFiltersAndRender();
  }

  /**
   * 상품 데이터를 한 번만 로드
   */
  async function loadProductsOnce() {
    // 이미 로드되었거나 로딩 중이면 종료
    if (productsLoaded || isLoadingProducts) return;

    // 로딩 메시지 표시
    if (refs.productEmpty) {
      setGridMessage("상품을 불러오는 중입니다...");
    }

    isLoadingProducts = true;

    try {
      // JSON 파일 가져오기
      const response = await fetch(dataUrl.href);
      if (!response.ok) {
        throw new Error(`상품 데이터를 불러오지 못했습니다. (status ${response.status})`);
      }

      // JSON 파싱
      const raw = await response.json();
      if (!Array.isArray(raw)) {
        throw new Error("상품 데이터 형식이 올바르지 않습니다.");
      }

      // 데이터 정규화 및 저장
      state.products = raw.map(normalizeProduct).filter(Boolean);
      productsLoaded = true;
    } catch (error) {
      console.error("[쇼핑 모듈] 상품 로딩 실패", error);
      setGridMessage("상품을 불러오지 못했습니다. 새로고침 해주세요.", true);
      throw error;
    } finally {
      isLoadingProducts = false;
    }
  }
})();
