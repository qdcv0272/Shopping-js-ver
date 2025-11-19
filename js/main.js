document.addEventListener("DOMContentLoaded", function () {
  const idInput = document.getElementById("loginId");
  const pwInput = document.getElementById("loginPassword");
  const saveCheckbox = document.getElementById("loginSave");
  const loginBtn = document.getElementById("loginBtn");
  const loginPage = document.querySelector(".login-page");
  const shoppingPage = document.querySelector(".shopping-page");

  // Load saved id
  try {
    const saved = localStorage.getItem("savedLoginId");
    if (saved) idInput.value = saved;
  } catch (e) {
    // ignore
  }

  function updateButtonState() {
    if (idInput.value.trim() && pwInput.value.trim()) {
      loginBtn.removeAttribute("disabled");
    } else {
      loginBtn.setAttribute("disabled", "");
    }
  }

  idInput.addEventListener("input", updateButtonState);
  pwInput.addEventListener("input", updateButtonState);

  loginBtn.addEventListener("click", function () {
    if (loginBtn.hasAttribute("disabled")) return;

    saveCheckbox.checked ? localStorage.setItem("savedLoginId", idInput.value.trim()) : localStorage.removeItem("savedLoginId");

    // 여기서 실제 로그인 요청을 보낼 수 있습니다.
    // 지금은 간단히 로그인 화면을 숨기고 쇼핑 페이지를 보여줍니다.
    if (loginPage) loginPage.classList.add("d-none");
    if (shoppingPage) shoppingPage.classList.remove("d-none");
  });
  updateButtonState();
});
