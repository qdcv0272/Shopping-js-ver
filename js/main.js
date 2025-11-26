import { gsap } from "gsap";
import "./signup/signup.js";
import "./info/infoFind.js";

document.addEventListener("DOMContentLoaded", function () {
  const shoppingPage = document.querySelector(".shopping-page"); // 로그인 성공 후 페이지
  const logoutBtn = document.querySelector("[data-logout-btn]"); // 로그 아웃

  const idInput = document.querySelector(".login-id"); // 아이디 인풋
  const pwInput = document.querySelector(".login-password"); // 비번 인풋
  const saveCheckbox = document.querySelector(".login-saveid"); // 아이디 저장 체크박스
  const loginBtn = document.querySelector(".login-btn"); // 로그인 버튼
  const loginPage = document.querySelector(".login-page"); // 로그인 페이지

  const errorPop = document.querySelector(".error-pop"); // 아이디 비번 틀렸을때 팝업
  const errorBtn = errorPop.querySelector(".error-btn");

  const successPop = document.querySelector(".success-pop"); // 성공팝업
  const successBtn = successPop.querySelector(".success-btn"); // 성공팝업 확인

  let _errorHideTimer = null;
  let currentUser = null;

  // 로그인 키
  // 로그인후 새로고침 했을때 로그인 해지 방지
  const STORAGE_KEYS = {
    savedId: "savedLoginId",
    users: "users",
    session: "shoppingActiveUserId",
  };

  // Load saved id
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.savedId);
    if (saved) idInput.value = saved;
  } catch (e) {
    // ignore
  }

  // event
  errorBtn.addEventListener("click", hideErrorPopImmediate); // 아이디 비번 틀렸을때의 팝업
  successBtn.addEventListener("click", hideSuccessPopImmediate); // 로그인 성공 후 팝업

  idInput.addEventListener("input", updateButtonState);
  pwInput.addEventListener("input", updateButtonState);

  loginBtn.addEventListener("click", function () {
    if (loginBtn.hasAttribute("disabled")) return;

    // 입력값 가져오기
    const id = idInput ? idInput.value.trim() : "";
    const pw = pwInput ? pwInput.value || "" : "";

    const foundUser = findUserById(id);
    const authOk = foundUser && foundUser.password === pw;

    if (!authOk) {
      // 로그인 실패: 에러 팝업 표시 후 더 이상 진행하지 않음
      showErrorPop(3500);
      return;
    }

    persistSession(foundUser.id);
    currentUser = foundUser;
    notifyUserChange(foundUser.id);

    if (saveCheckbox && saveCheckbox.checked) {
      localStorage.setItem(STORAGE_KEYS.savedId, id);
    } else {
      localStorage.removeItem(STORAGE_KEYS.savedId);
    }

    showShoppingView();
    showSuccessPop();
  });

  logoutBtn.addEventListener("click", handleLogout);

  tryRestoreSession();
  updateButtonState();

  // fun
  // gsap
  function hideErrorPopImmediate() {
    if (!errorPop) return;
    // gsap 로드 되었는지, .to()함수가 있는지
    if (typeof gsap !== "undefined" && typeof gsap.to === "function") {
      gsap.to(errorPop, {
        y: -10,
        opacity: 0,
        duration: 0.18,
        onComplete() {
          errorPop.classList.add("d-none");
        },
      });
    } else {
      errorPop.classList.add("d-none");
    }
  }

  function hideSuccessPopImmediate() {
    if (!successPop) return;
    if (typeof gsap !== "undefined" && typeof gsap.to === "function") {
      gsap.to(successPop, {
        y: -10,
        opacity: 0,
        duration: 0.18,
        onComplete() {
          successPop.classList.add("d-none");
        },
      });
    } else {
      successPop.classList.add("d-none");
    }
  }

  function updateButtonState() {
    idInput.value.trim() && pwInput.value.trim() ? loginBtn.removeAttribute("disabled") : loginBtn.setAttribute("disabled", "");
  }

  function tryRestoreSession() {
    let storedId = null;
    try {
      storedId = localStorage.getItem(STORAGE_KEYS.session);
    } catch (e) {
      storedId = null;
    }
    if (!storedId) return;
    const user = findUserById(storedId);
    if (!user) {
      clearSession();
      return;
    }
    currentUser = user;
    showShoppingView();
    notifyUserChange(user.id);
  }

  function findUserById(id) {
    if (!id) return null;
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.users);
      const users = raw ? JSON.parse(raw) : [];
      return users.find((u) => (u.id || "") === id) || null;
    } catch (e) {
      return null;
    }
  }

  function showShoppingView() {
    if (loginPage) loginPage.classList.add("d-none");
    if (shoppingPage) shoppingPage.classList.remove("d-none");
    document.dispatchEvent(new CustomEvent("shopping:page-shown"));
  }

  function persistSession(userId) {
    try {
      localStorage.setItem(STORAGE_KEYS.session, userId);
    } catch (e) {
      /* ignore */
    }
  }

  function clearSession() {
    try {
      localStorage.removeItem(STORAGE_KEYS.session);
    } catch (e) {
      /* ignore */
    }
  }

  function showErrorPop(duration) {
    if (!errorPop) return;
    // show
    errorPop.classList.remove("d-none");
    if (typeof gsap !== "undefined" && typeof gsap.fromTo === "function") {
      gsap.fromTo(errorPop, { y: -8, opacity: 0 }, { y: 0, opacity: 1, duration: 0.22, ease: "power2.out" });
    } else {
      errorPop.style.opacity = "1";
    }
    // auto hide
    if (duration && duration > 0) {
      _errorHideTimer = setTimeout(() => hideErrorPopImmediate(), duration);
    }
  }

  function showSuccessPop() {
    if (!successPop) return;
    successPop.classList.remove("d-none");
    if (typeof gsap !== "undefined" && typeof gsap.fromTo === "function") {
      gsap.fromTo(successPop, { y: -8, opacity: 0 }, { y: 0, opacity: 1, duration: 0.22, ease: "power2.out" });
    } else {
      successPop.style.opacity = "1";
    }
  }

  function handleLogout() {
    clearSession();
    currentUser = null;
    notifyUserChange(null);
    if (pwInput) pwInput.value = "";
    if (loginPage) loginPage.classList.remove("d-none");
    if (shoppingPage) shoppingPage.classList.add("d-none");
    updateButtonState();
  }

  function notifyUserChange(userId) {
    document.dispatchEvent(
      new CustomEvent("shopping:user-changed", {
        detail: { userId: userId || null },
      })
    );
  }
});
