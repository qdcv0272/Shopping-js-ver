(function () {
  document.addEventListener("DOMContentLoaded", function () {
    window.openSignup = openSignup;
    window.closeSignup = closeSignup;

    const signupBtn = document.getElementById("signupBtn");
    if (signupBtn) {
      signupBtn.addEventListener("click", function () {
        try {
          openSignup();
        } catch (e) {
          /* ignore */
        }
      });
    }

    const idInput = document.getElementById("signup-id");
    const emailInput = document.getElementById("signup-email");
    const pwInput = document.getElementById("signup-password");
    const pw2Checknput = document.getElementById("signup-set-password");

    const idHint = document.getElementById("signup-id-hint");
    const emailHint = document.getElementById("signup-email-hint");
    const pwHint = document.getElementById("signup-password-hint");
    const pw2Hint = document.getElementById("signup-set-password-hint");

    // 입력할때마다
    if (idInput) {
      idInput.addEventListener("input", () => {
        const v = idInput.value || "";
        const ok = validateId(v);
        updateHint(idHint, ok, "영어+숫자 조합 4글자 이상", "영어와 숫자를 조합해 4자 이상 입력하세요");
      });
    }
    if (emailInput) {
      emailInput.addEventListener("input", () => {
        const v = emailInput.value || "";
        const ok = validateEmail(v);
        updateHint(emailHint, ok, "이메일 형식입니다", "유효한 이메일 형식이 아닙니다");
      });
    }
    if (pwInput) {
      pwInput.addEventListener("input", () => {
        const v = pwInput.value || "";
        const ok = validatePassword(v);
        updateHint(pwHint, ok, "사용 가능한 비밀번호입니다", "대소문자+특수문자 포함 6자 이상이어야 합니다");
      });
    }
    if (pw2Checknput) {
      pw2Checknput.addEventListener("input", () => {
        const v = pwInput ? pwInput.value || "" : "";
        const v2 = pw2Checknput.value || "";
        const ok = v && v2 && v === v2;
        updateHint(pw2Hint, ok, "비밀번호가 일치합니다", "비밀번호가 일치하지 않습니다");
      });
    }

    function updateHint(el, ok, okText, failText) {
      if (!el) return;
      if (ok === null) {
        el.textContent = okText;
        el.classList.remove("error", "valid");
        return;
      }
      if (ok) {
        el.textContent = okText;
        el.classList.add("valid");
        el.classList.remove("error");
      } else {
        el.textContent = failText;
        el.classList.add("error");
        el.classList.remove("valid");
      }
    }

    const submitBtn = document.getElementById("signupSubmit");
    const cancelBtn = document.getElementById("signupCancel");
    const msg = document.getElementById("signupMessage");

    if (submitBtn) {
      submitBtn.addEventListener("click", function () {
        const id = (document.getElementById("signup-id") || {}).value || "";
        const email = (document.getElementById("signup-email") || {}).value || "";
        const pw = (document.getElementById("signup-password") || {}).value || "";
        const pw2 = (document.getElementById("signup-set-password") || {}).value || "";

        // reset message
        if (msg) {
          msg.style.color = "#d32f2f";
          msg.textContent = "";
        }

        // validations
        if (!validateId(id)) {
          updateHint(idHint, false, "영어+숫자 조합 4글자 이상", "영어와 숫자를 조합해 4자 이상 입력하세요");
          if (msg) msg.textContent = "아이디 규칙을 확인하세요.";
          return;
        }
        updateHint(idHint, true, "영어+숫자 조합 4글자 이상", "영어와 숫자를 조합해 4자 이상 입력하세요");

        if (!validateEmail(email)) {
          updateHint(emailHint, false, "이메일 형식인지 확인합니다", "유효한 이메일 형식이 아닙니다");
          if (msg) msg.textContent = "이메일 형식을 확인하세요.";
          return;
        }
        updateHint(emailHint, true, "이메일 형식입니다", "유효한 이메일 형식이 아닙니다");

        if (!validatePassword(pw)) {
          updateHint(pwHint, false, "대문자+소문자+특수문자 포함 6글자 이상", "대소문자+특수문자 포함 6자 이상이어야 합니다");
          if (msg) msg.textContent = "비밀번호 규칙을 확인하세요.";
          return;
        }
        updateHint(pwHint, true, "사용 가능한 비밀번호입니다", "대소문자+특수문자 포함 6자 이상이어야 합니다");

        if (pw !== pw2) {
          updateHint(pw2Hint, false, "비밀번호와 동일한지 확인합니다", "비밀번호가 일치하지 않습니다");
          if (msg) msg.textContent = "비밀번호가 일치하지 않습니다.";
          return;
        }
        updateHint(pw2Hint, true, "비밀번호가 일치합니다", "비밀번호가 일치하지 않습니다");

        const res = saveUser({ id: id.trim(), email: email.trim(), password: pw });

        if (!res || !res.ok) {
          if (res && res.reason === "duplicate") {
            if (msg) msg.textContent = "이미 사용 중인 아이디입니다. 다른 아이디를 사용해주세요.";
          } else {
            if (msg) msg.textContent = "저장에 실패했습니다. 브라우저 설정을 확인하세요.";
          }
          return;
        }

        if (msg) {
          msg.style.color = "#2e7d32";
          msg.textContent = "회원가입이 완료되었습니다.";
        }

        // 자동으로 로그인 아이디 채우기 및 닫기
        try {
          document.getElementById("loginId").value = id.trim();
        } catch (e) {}
        setTimeout(function () {
          if (msg) msg.textContent = "";
          closeSignup();
        }, 900);
      });
    }

    if (cancelBtn) {
      cancelBtn.addEventListener("click", function () {
        const msg = document.getElementById("signupMessage");
        if (msg) msg.textContent = "";
        closeSignup();
      });
    }
  });

  function openSignup() {
    const signup = document.querySelector(".signup-page");
    const login = document.querySelector(".login-page");
    if (signup) signup.classList.remove("d-none");
    if (login) login.classList.add("d-none");
  }

  function closeSignup() {
    const signup = document.querySelector(".signup-page");
    const login = document.querySelector(".login-page");
    if (signup) signup.classList.add("d-none");
    if (login) login.classList.remove("d-none");
  }

  function validateEmail(email) {
    // 이메일 전체 패턴을 검사: "로컬파트@도메인.최상위도메인" 형태인지 확인
    // [^@\s]+     : '@' 또는 공백이 아닌 문자 1개 이상 (로컬파트)
    // @           : '@' 문자
    // [^@\s]+     : '@' 또는 공백이 아닌 문자 1개 이상 (도메인)
    // \.          : '.' 문자 (도메인과 최상위도메인 구분)
    // [^@\s]+     : '@' 또는 공백이 아닌 문자 1개 이상 (최상위도메인)
    return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
  }

  function validateId(id) {
    // 영어+숫자 조합, 최소 4자, 영문과 숫자 각각 최소 1개 포함
    if (!id || id.length < 4) return false; // 값이 없거나 길이가 4 미만이면 실패

    // ^[A-Za-z0-9]+$ : 문자열 전체가 영문 대소문자 또는 숫자만으로 이루어져야 함
    if (!/^[A-Za-z0-9]+$/.test(id)) return false;

    // /[A-Za-z]/ : 영문자(대문자 또는 소문자)가 최소 1개 포함되어야 함
    if (!/[A-Za-z]/.test(id)) return false;

    // /[0-9]/ : 숫자가 최소 1개 포함되어야 함
    if (!/[0-9]/.test(id)) return false;

    return true;
  }

  function validatePassword(pw) {
    // 비밀번호는 최소 6자, 소문자 1개 이상, 대문자 1개 이상, 특수문자 1개 이상 포함해야 함
    if (!pw || pw.length < 6) return false; // 값이 없거나 길이 6 미만이면 실패

    // /[a-z]/ : 소문자 한 글자 이상 포함 검사
    if (!/[a-z]/.test(pw)) return false;

    // /[A-Z]/ : 대문자 한 글자 이상 포함 검사
    if (!/[A-Z]/.test(pw)) return false;

    // 특수문자 포함 검사:
    // 대괄호 안의 많은 특수문자 중 하나라도 포함되어야 함.
    // 여기서는 !@#$%^&*(),.?"':{}|<>\[]\/~`_+=;- 등을 허용
    // 주의: 일부 문자는 정규식 내부에서 이스케이프(역슬래시) 처리되어 있음
    if (!/[!@#$%^&*(),.?"':{}|<>\[\]\\/~`_+=;-]/.test(pw)) return false;

    return true;
  }

  function saveUser(user) {
    try {
      const raw = localStorage.getItem("users");
      const list = raw ? JSON.parse(raw) : [];
      const exists = list.some((u) => (u.id || "") === (user.id || ""));
      if (exists) return { ok: false, reason: "duplicate" };
      list.push(user);
      localStorage.setItem("users", JSON.stringify(list));
      return { ok: true };
    } catch (e) {
      return { ok: false, reason: "error" };
    }
  }
})();
