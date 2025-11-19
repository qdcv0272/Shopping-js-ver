(function () {
  const signupBtn = document.getElementById("signupBtn");
  signupBtn.addEventListener("click", openSignup);

  const findPwBtn = document.getElementById("findPwBtn");
  if (findPwBtn) findPwBtn.addEventListener("click", closeSignup);

  function openSignup() {
    const signup = document.querySelector(".signup-page");
    const login = document.querySelector(".login-page");
    if (signup) signup.classList.remove("d-none");
    if (login) login.classList.add("d-none");
    console.log("@@@ 실행");
  }

  function closeSignup() {
    alert("구현 중");

    return;
    const signup = document.querySelector(".signup-page");
    const login = document.querySelector(".login-page");
    if (signup) signup.classList.add("d-none");
    if (login) login.classList.remove("d-none");
  }
})();
