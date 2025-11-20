import { gsap } from "gsap";
import "./signup.js";

document.addEventListener("DOMContentLoaded", function () {
  const idInput = document.getElementById("loginId");
  const pwInput = document.getElementById("loginPassword");
  const saveCheckbox = document.getElementById("loginSave");
  const loginBtn = document.getElementById("loginBtn");
  const loginPage = document.querySelector(".login-page");
  const shoppingPage = document.querySelector(".shopping-page");

  const errorPop = document.querySelector(".error-pop");
  const errorBtn = errorPop ? errorPop.querySelector(".error-btn") : null;

  const successPop = document.querySelector(".success-pop");
  const successBtn = successPop ? successPop.querySelector(".success-btn") : null;

  let _errorHideTimer = null;

  // Load saved id
  try {
    const saved = localStorage.getItem("savedLoginId");
    if (saved) idInput.value = saved;
  } catch (e) {
    // ignore
  }

  // event
  if (errorBtn) errorBtn.addEventListener("click", hideErrorPopImmediate); // 아이디 비번 틀렸을때의 팝업
  if (successBtn) successBtn.addEventListener("click", hideSuccessPopImmediate); // 로그인 성공 후 팝업

  if (idInput) idInput.addEventListener("input", updateButtonState);
  if (pwInput) pwInput.addEventListener("input", updateButtonState);

  loginBtn.addEventListener("click", function () {
    if (loginBtn.hasAttribute("disabled")) return;

    // 입력값 가져오기
    const id = idInput.value.trim();
    const pw = pwInput.value || "";

    // check users from localStorage (demo local auth)
    let authOk = false;
    try {
      const raw = localStorage.getItem("users");
      const users = raw ? JSON.parse(raw) : [];
      const found = users.find((u) => (u.id || "") === id); //찾기
      if (found && found.password === pw) authOk = true; // ok
    } catch (e) {
      authOk = false;
    }

    if (!authOk) showErrorPop(500);

    saveCheckbox.checked ? localStorage.setItem("savedLoginId", id) : localStorage.removeItem("savedLoginId");

    // 로그인 성공: 로그인 화면 숨기고 쇼핑 페이지 표시
    if (loginPage) loginPage.classList.add("d-none");
    if (shoppingPage) shoppingPage.classList.remove("d-none");

    showSuccessPop();
  });

  // fun
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

  updateButtonState();
});
