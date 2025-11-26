(function () {
  document.addEventListener("DOMContentLoaded", function () {
    window.openSignup = openSignup;
    window.closeSignup = closeSignup;

    // 버튼
    const signupBtn = document.querySelector(".signup-btn"); // 회원가입
    const submitBtn = document.querySelector(".signup-submit"); // 가입 버튼
    const cancelBtn = document.querySelector(".signup-cancel"); // 취소

    //  인풋
    const idInput = document.querySelector(".signup-id"); // 아이디
    const emailInput = document.querySelector(".signup-email"); // 이메일
    const pwInput = document.querySelector(".signup-password"); // 비번
    const pw2Checknput = document.querySelector(".signup-set-password"); // 비번 확인

    // 쳌
    const idCheckBtn = document.querySelector(".signup-id-check-btn"); // 아이디 중복
    const idOkCheckbox = document.querySelector(".signup-id-ok"); // 아이디 중복 체크박스
    const emailCheckBtn = document.querySelector(".signup-email-check-btn"); // 이메일 중복
    const emailOkCheckbox = document.querySelector(".signup-email-ok"); // 이메일 중복 체크박스

    // 힌트
    const idHint = document.querySelector(".signup-id-hint"); // 아이디
    const emailHint = document.querySelector(".signup-email-hint"); // 이메일
    const pwHint = document.querySelector(".signup-password-hint"); // 비번
    const pw2Hint = document.querySelector(".signup-set-password-hint"); // 비번 확인

    // 메시지
    const msg = document.querySelector(".signup-message");

    function updateSubmitState() {
      const hasAllValues = Boolean(
        idInput &&
          idInput.value.trim() &&
          emailInput &&
          emailInput.value.trim() &&
          pwInput &&
          pwInput.value.trim() &&
          pw2Checknput &&
          pw2Checknput.value.trim()
      );
      if (!submitBtn) return;
      if (hasAllValues) {
        submitBtn.removeAttribute("disabled");
      } else {
        submitBtn.setAttribute("disabled", "");
      }
    }

    function setCheckButtonLocked(btn, locked) {
      if (!btn) return;
      if (!btn.dataset.baseLabel) btn.dataset.baseLabel = btn.textContent;
      btn.dataset.locked = locked ? "true" : "false";
      btn.textContent = locked ? "확정" : btn.dataset.baseLabel;
      btn.classList.toggle("locked", locked);
    }

    function lockFieldAfterCheck(input, checkbox, btn) {
      if (checkbox) checkbox.checked = true;
      if (input) {
        input.dataset.locked = "true";
        input.setAttribute("readonly", "true");
        input.classList.add("input-locked");
      }
      setCheckButtonLocked(btn, true);
      updateSubmitState();
    }

    function releaseFieldLock(input, checkbox, btn) {
      if (checkbox) checkbox.checked = false;
      if (input) {
        input.dataset.locked = "false";
        input.removeAttribute("readonly");
        input.classList.remove("input-locked");
      }
      setCheckButtonLocked(btn, false);
      updateSubmitState();
    }

    function isFieldLocked(input) {
      return Boolean(input && input.dataset.locked === "true");
    }

    function resetSignupForm(options = {}) {
      const { clearMessage = true } = options;

      releaseFieldLock(idInput, idOkCheckbox, idCheckBtn);
      releaseFieldLock(emailInput, emailOkCheckbox, emailCheckBtn);

      [idInput, emailInput, pwInput, pw2Checknput].forEach((input) => {
        if (input) input.value = "";
      });

      updateHint(idHint, null, "영어+숫자 조합 4글자 이상", "영어와 숫자를 조합해 4자 이상 입력하세요");
      updateHint(emailHint, null, "이메일 형식입니다", "유효한 이메일 형식이 아닙니다");
      updateHint(pwHint, null, "사용 가능한 비밀번호입니다", "대소문자+특수문자 포함 6자 이상이어야 합니다");
      updateHint(pw2Hint, null, "비밀번호가 일치합니다", "비밀번호가 일치하지 않습니다");

      if (clearMessage && msg) {
        msg.textContent = "";
        msg.style.color = "#d32f2f";
      }

      updateSubmitState();
    }

    // 이벤트
    signupBtn.addEventListener("click", () => {
      openSignup();
    });

    // 정규식에 정확하게 인풋에 입력했는지
    idInput.addEventListener("input", () => {
      const v = idInput.value || "";
      const ok = validateId(v);
      updateHint(idHint, ok, "영어+숫자 조합 4글자 이상", "영어와 숫자를 조합해 4자 이상 입력하세요");
      updateSubmitState();
    });

    emailInput.addEventListener("input", () => {
      const v = emailInput.value || "";
      const ok = validateEmail(v);
      updateHint(emailHint, ok, "이메일 형식입니다", "유효한 이메일 형식이 아닙니다");
      updateSubmitState();
    });

    pwInput.addEventListener("input", () => {
      const v = pwInput.value || "";
      const ok = validatePassword(v);
      updateHint(pwHint, ok, "사용 가능한 비밀번호입니다", "대소문자+특수문자 포함 6자 이상이어야 합니다");
      updateSubmitState();
    });

    pw2Checknput.addEventListener("input", () => {
      const v = pwInput ? pwInput.value || "" : "";
      const v2 = pw2Checknput.value || "";
      const ok = v && v2 && v === v2;
      updateHint(pw2Hint, ok, "비밀번호가 일치합니다", "비밀번호가 일치하지 않습니다");
      updateSubmitState();
    });

    idCheckBtn.addEventListener("click", function () {
      if (isFieldLocked(idInput)) {
        releaseFieldLock(idInput, idOkCheckbox, idCheckBtn);
        if (msg) {
          msg.style.color = "#d32f2f";
          msg.textContent = "아이디를 수정하려면 다시 중복 확인을 진행하세요.";
        }
        return;
      }
      const id = idInput && idInput.value ? idInput.value.trim() : ""; // value

      // 정규식 확인 먼저
      if (!validateId(id)) {
        updateHint(idHint, false, "영어+숫자 조합 4글자 이상", "영어와 숫자를 조합해 4자 이상 입력하세요");
        if (msg) {
          msg.style.color = "#d32f2f";
          msg.textContent = "아이디 형식을 확인하세요.";
        }
        if (idOkCheckbox) idOkCheckbox.checked = false;
        return;
      }
      // 저장된 users에서 중복 검사
      try {
        const raw = localStorage.getItem("users");
        const users = raw ? JSON.parse(raw) : [];
        // const exists = users.some((u) => (u.id || "").toLowerCase() === id.toLowerCase());
        const exists = users.some((u) => (u.id || "") === id);
        if (exists) {
          if (msg) {
            msg.style.color = "#d32f2f";
            msg.textContent = "이미 사용 중인 아이디입니다.";
          }
          updateHint(idHint, false, "영어+숫자 조합 4글자 이상", "이미 사용 중인 아이디입니다.");
          if (idOkCheckbox) idOkCheckbox.checked = false;
        } else {
          if (msg) {
            msg.style.color = "#2e7d32";
            msg.textContent = "사용 가능한 아이디입니다.";
          }
          updateHint(idHint, true, "영어+숫자 조합 4글자 이상", "영어와 숫자를 조합해 4자 이상 입력하세요");
          lockFieldAfterCheck(idInput, idOkCheckbox, idCheckBtn);
        }
      } catch (e) {
        // 혹시 모를 오류
        if (msg) {
          msg.style.color = "#d32f2f";
          msg.textContent = "검사 중 오류가 발생했습니다.";
        }
        if (idOkCheckbox) idOkCheckbox.checked = false;
      }
    });

    emailCheckBtn.addEventListener("click", function () {
      if (isFieldLocked(emailInput)) {
        releaseFieldLock(emailInput, emailOkCheckbox, emailCheckBtn);
        if (msg) {
          msg.style.color = "#d32f2f";
          msg.textContent = "이메일을 수정하려면 다시 중복 확인을 진행하세요.";
        }
        return;
      }
      const email = emailInput && emailInput.value ? emailInput.value.trim() : "";
      if (!validateEmail(email)) {
        updateHint(emailHint, false, "이메일 형식입니다", "유효한 이메일 형식이 아닙니다");
        if (msg) {
          msg.style.color = "#d32f2f";
          msg.textContent = "이메일 형식을 확인하세요.";
        }
        if (emailOkCheckbox) emailOkCheckbox.checked = false;
        return;
      }
      try {
        const raw = localStorage.getItem("users");
        const users = raw ? JSON.parse(raw) : [];
        // const exists = users.some((u) => (u.email || "").toLowerCase() === email.toLowerCase());
        const exists = users.some((u) => (u.email || "") === email);
        if (exists) {
          if (msg) {
            msg.style.color = "#d32f2f";
            msg.textContent = "이미 사용 중인 이메일입니다.";
          }
          updateHint(emailHint, false, "이메일 형식입니다", "이미 등록된 이메일입니다.");
          if (emailOkCheckbox) emailOkCheckbox.checked = false;
        } else {
          if (msg) {
            msg.style.color = "#2e7d32";
            msg.textContent = "사용 가능한 이메일입니다.";
          }
          updateHint(emailHint, true, "이메일 형식입니다", "유효한 이메일 형식이 아닙니다");
          lockFieldAfterCheck(emailInput, emailOkCheckbox, emailCheckBtn);
        }
      } catch (e) {
        if (msg) {
          msg.style.color = "#d32f2f";
          msg.textContent = "검사 중 오류가 발생했습니다.";
        }
        if (emailOkCheckbox) emailOkCheckbox.checked = false;
      }
    });

    submitBtn.addEventListener("click", function () {
      const id = idInput && idInput.value ? idInput.value.trim() : "";
      const email = emailInput && emailInput.value ? emailInput.value.trim() : "";
      const pw = pwInput && pwInput.value ? pwInput.value : "";
      const pw2 = pw2Checknput && pw2Checknput.value ? pw2Checknput.value : "";

      // reset message
      if (msg) {
        msg.style.color = "#d32f2f";
        msg.textContent = "";
      }

      // 버튼을 누를 때 최종 유효성 검사
      if (!validateId(id)) {
        updateHint(idHint, false, "영어+숫자 조합 4글자 이상", "영어와 숫자를 조합해 4자 이상 입력하세요");
        if (msg) msg.textContent = "아이디 규칙을 확인하세요.";
        return;
      }
      updateHint(idHint, true, "영어+숫자 조합 4글자 이상", "영어와 숫자를 조합해 4자 이상 입력하세요");

      if (!validateEmail(email)) {
        updateHint(emailHint, false, "이메일 형식입니다", "유효한 이메일 형식이 아닙니다");
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

      if (!idOkCheckbox || !idOkCheckbox.checked) {
        if (msg) {
          msg.style.color = "#d32f2f";
          msg.textContent = "아이디 중복 검사를 완료하세요.";
        }
        return;
      }

      if (!emailOkCheckbox || !emailOkCheckbox.checked) {
        if (msg) {
          msg.style.color = "#d32f2f";
          msg.textContent = "이메일 중복 검사를 완료하세요.";
        }
        return;
      }

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
        const loginIdInput = document.querySelector(".login-id");
        if (loginIdInput) loginIdInput.value = id.trim();
      } catch (e) {}
      setTimeout(function () {
        if (msg) msg.textContent = "";
        closeSignup();
        resetSignupForm({ clearMessage: false });
      }, 500);
    });

    cancelBtn.addEventListener("click", function () {
      resetSignupForm();
      closeSignup();
    });

    updateSubmitState();
  });

  // 회원가입 버튼
  function openSignup() {
    const signup = document.querySelector(".signup-page");
    const login = document.querySelector(".login-page");
    if (signup) signup.classList.remove("d-none");
    if (login) login.classList.add("d-none");
  }

  function updateHint(el, ok, okText, failText) {
    if (!el) return;
    if (ok === null) {
      // 초기 상태
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

  function closeSignup() {
    const signup = document.querySelector(".signup-page");
    const login = document.querySelector(".login-page");
    if (signup) signup.classList.add("d-none");
    if (login) login.classList.remove("d-none");
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

  // 정규식
  // -아이디 정규표현식- 영어+숫자 조합, 최소 4자, 영문과 숫자 각각 최소 1개 포함
  function validateId(id) {
    if (!id || id.length < 4) return false; // 값이 없거나 길이가 4 미만이면 실패

    // ^[A-Za-z0-9]+$ : 문자열 전체가 영문 대소문자 또는 숫자만으로 이루어져야 함
    if (!/^[A-Za-z0-9]+$/.test(id)) return false;

    // /[A-Za-z]/ : 영문자(대문자 또는 소문자)가 최소 1개 포함되어야 함
    if (!/[A-Za-z]/.test(id)) return false;

    // /[0-9]/ : 숫자가 최소 1개 포함되어야 함
    if (!/[0-9]/.test(id)) return false;

    return true;
  }

  // 이메일 전체 패턴을 검사: "로컬파트@도메인.최상위도메인" 형태인지 확인
  function validateEmail(email) {
    // [^@\s]+     : '@' 또는 공백이 아닌 문자 1개 이상 (로컬파트)
    // @           : '@' 문자
    // [^@\s]+     : '@' 또는 공백이 아닌 문자 1개 이상 (도메인)
    // \.          : '.' 문자 (도메인과 최상위도메인 구분)
    // [^@\s]+     : '@' 또는 공백이 아닌 문자 1개 이상 (최상위도메인)
    return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
  }

  // 비밀번호는 최소 6자, 소문자 1개 이상, 대문자 1개 이상, 특수문자 1개 이상 포함해야 함
  function validatePassword(pw) {
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
})();
