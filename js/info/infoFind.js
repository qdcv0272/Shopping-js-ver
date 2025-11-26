import { gsap } from "gsap";

(function () {
  document.addEventListener("DOMContentLoaded", function () {
    const findPwBtn = document.querySelector(".find-pw-btn");
    const findIdBtn = document.querySelector(".find-id-btn");

    const infoPwPage = document.querySelector(".info-pw-page");
    const infoIdPage = document.querySelector(".info-id-page");

    const infoClosePwBtn = document.querySelector(".info-close-pw-btn");
    const infoCloseIdBtn = document.querySelector(".info-close-id-btn");

    const infoPwIdInput = infoPwPage ? infoPwPage.querySelector(".info-pw-id") : document.querySelector(".info-pw-id");
    const infoPwEmailInput = infoPwPage ? infoPwPage.querySelector(".info-pw-email") : document.querySelector(".info-pw-email");
    const infoPwSubmit = infoPwPage ? infoPwPage.querySelector(".info-pw-check") : document.querySelector(".info-pw-check");

    const infoIdEmailInput = infoIdPage ? infoIdPage.querySelector(".info-id-email") : document.querySelector(".info-id-email");
    const infoIdSubmit = infoIdPage ? infoIdPage.querySelector(".info-id-check") : document.querySelector(".info-id-check");

    const infoResetPanel = infoPwPage ? infoPwPage.querySelector(".info-reset-panel") : null;
    const infoResetGuide = infoPwPage ? infoPwPage.querySelector(".info-reset-guide") : null;
    const infoResetCodeInput = infoPwPage ? infoPwPage.querySelector(".info-reset-code") : null;
    const infoResetCodeHint = infoPwPage ? infoPwPage.querySelector(".info-reset-code-hint") : null;
    const infoResetResendBtn = infoPwPage ? infoPwPage.querySelector(".info-reset-resend") : null;
    const infoResetPasswordFields = infoPwPage ? infoPwPage.querySelector(".info-reset-password-fields") : null;
    const infoResetPasswordInput = infoPwPage ? infoPwPage.querySelector(".info-reset-password") : null;
    const infoResetPasswordConfirm = infoPwPage ? infoPwPage.querySelector(".info-reset-password-confirm") : null;
    const infoResetPasswordHint = infoPwPage ? infoPwPage.querySelector(".info-reset-password-hint") : null;
    const infoResetSubmit = infoPwPage ? infoPwPage.querySelector(".info-reset-submit") : null;

    const infoResultPwManager = createInfoResultManager(
      infoPwPage ? infoPwPage.querySelector(".info-result-pop.pw-page") : document.querySelector(".info-result-pop.pw-page"),
      { onClose: handlePwResultClose }
    );
    const infoResultIdManager = createInfoResultManager(
      infoIdPage ? infoIdPage.querySelector(".info-result-pop.id-page") : document.querySelector(".info-result-pop.id-page")
    );

    let pendingPwReset = null;
    let resetCodeVerified = false;

    const validateEmail = (value) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value);

    const updatePwSubmitState = () => {
      if (!infoPwSubmit) return;
      const idValue = infoPwIdInput ? (infoPwIdInput.value || "").trim() : "";
      const emailValue = infoPwEmailInput ? (infoPwEmailInput.value || "").trim() : "";
      const ready = idValue.length >= 4 && validateEmail(emailValue);
      if (ready) {
        infoPwSubmit.removeAttribute("disabled");
      } else {
        infoPwSubmit.setAttribute("disabled", "");
      }
    };

    const updateIdSubmitState = () => {
      if (!infoIdSubmit) return;
      const emailValue = infoIdEmailInput ? (infoIdEmailInput.value || "").trim() : "";
      if (validateEmail(emailValue)) {
        infoIdSubmit.removeAttribute("disabled");
      } else {
        infoIdSubmit.setAttribute("disabled", "");
      }
    };

    if (findPwBtn) {
      findPwBtn.addEventListener("click", function () {
        infoFindPwOpen();
      });
    }

    if (findIdBtn) {
      findIdBtn.addEventListener("click", function () {
        infoFindIdOpen();
      });
    }

    if (infoClosePwBtn) {
      infoClosePwBtn.addEventListener("click", () => {
        if (infoPwPage) infoPwPage.classList.add("d-none");
        if (infoResultPwManager) infoResultPwManager.hide();
        clearResetWorkflow();
      });
    }

    if (infoCloseIdBtn) {
      infoCloseIdBtn.addEventListener("click", () => {
        if (infoIdPage) infoIdPage.classList.add("d-none");
        if (infoResultIdManager) infoResultIdManager.hide();
      });
    }

    if (infoPwIdInput) {
      infoPwIdInput.addEventListener("input", updatePwSubmitState);
    }
    if (infoPwEmailInput) {
      infoPwEmailInput.addEventListener("input", updatePwSubmitState);
    }
    updatePwSubmitState();

    if (infoResetCodeInput) {
      infoResetCodeInput.addEventListener("input", handleResetCodeInput);
    }
    if (infoResetResendBtn) {
      infoResetResendBtn.addEventListener("click", handleResetResend);
    }
    if (infoResetPasswordInput) {
      infoResetPasswordInput.addEventListener("input", updateResetSubmitState);
    }
    if (infoResetPasswordConfirm) {
      infoResetPasswordConfirm.addEventListener("input", updateResetSubmitState);
    }
    if (infoResetSubmit) {
      infoResetSubmit.addEventListener("click", handleResetSubmit);
    }

    if (infoIdEmailInput) {
      infoIdEmailInput.addEventListener("input", updateIdSubmitState);
    }
    updateIdSubmitState();

    if (infoIdSubmit) {
      infoIdSubmit.addEventListener("click", () => {
        try {
          const email = infoIdEmailInput ? (infoIdEmailInput.value || "").trim() : "";
          if (!validateEmail(email)) {
            if (infoResultIdManager) infoResultIdManager.show("유효한 이메일을 입력하세요.");
            return;
          }
          const raw = localStorage.getItem("users");
          const users = raw ? JSON.parse(raw) : [];
          const found = users.find((u) => (u.email || "").toLowerCase() === email.toLowerCase());
          if (found) {
            if (infoResultIdManager)
              infoResultIdManager.show("나의 아이디는 " + (found.id || "(없음)") + " 이다", found.id || "");
          } else {
            if (infoResultIdManager) infoResultIdManager.show("등록된 이메일이 없습니다.");
          }
        } catch (e) {
          if (infoResultIdManager) infoResultIdManager.show("오류가 발생했습니다.");
        }
      });
    }

    if (infoPwSubmit) {
      infoPwSubmit.addEventListener("click", () => {
        try {
          const idValue = infoPwIdInput ? (infoPwIdInput.value || "").trim() : "";
          const email = infoPwEmailInput ? (infoPwEmailInput.value || "").trim() : "";
          if (idValue.length < 4 || !validateEmail(email)) {
            if (infoResultPwManager) infoResultPwManager.show("아이디와 이메일을 확인하세요.");
            return;
          }
          const raw = localStorage.getItem("users");
          const users = raw ? JSON.parse(raw) : [];
          const found = users.find(
            (u) => (u.id || "").toLowerCase() === idValue.toLowerCase() && (u.email || "").toLowerCase() === email.toLowerCase()
          );
          if (found) {
            clearResetWorkflow();
            if (infoResultPwManager)
              infoResultPwManager.show("나의 비밀번호는 " + (found.password || "(없음)") + " 이다", found.password || "", {
                id: found.id || "",
                email: found.email || "",
              });
          } else {
            if (infoResultPwManager) infoResultPwManager.show("등록된 정보가 없습니다.");
          }
        } catch (e) {
          if (infoResultPwManager) infoResultPwManager.show("오류가 발생했습니다.");
        }
      });
    }

    function infoFindPwOpen() {
      if (infoPwPage) {
        infoPwPage.classList.remove("d-none");
        clearResetWorkflow();
        updatePwSubmitState();
      }
    }

    function infoFindIdOpen() {
      if (infoIdPage) {
        infoIdPage.classList.remove("d-none");
        updateIdSubmitState();
      }
    }

    function handlePwResultClose(payload = {}) {
      const { hide, meta } = payload || {};
      if (typeof hide === "function") hide();
      if (!meta || !meta.email || !meta.id) return;
      startPasswordReset(meta);
    }

    function startPasswordReset(meta) {
      const email = (meta.email || "").trim();
      const id = (meta.id || "").trim();
      if (!email || !id) return;
      const code = generateVerificationCode();
      pendingPwReset = {
        email,
        id,
        code,
        expiresAt: Date.now() + 5 * 60 * 1000,
      };
      resetCodeVerified = false;
      showResetPanel(email, code);
      console.info("[INFO] Password reset code sent:", code);
    }

    function showResetPanel(email, code) {
      if (!infoResetPanel) return;
      infoResetPanel.classList.remove("d-none");
      if (infoResetGuide) infoResetGuide.textContent = maskEmail(email) + " 로 6자리 인증번호를 전송했습니다.";
      if (infoResetCodeHint)
        infoResetCodeHint.textContent = "이메일을 확인한 뒤 인증번호를 입력하세요. (테스트 코드: " + code + ")";
      if (infoResetCodeInput) {
        infoResetCodeInput.value = "";
        infoResetCodeInput.focus();
      }
      togglePasswordFields(false, true);
      updateResetSubmitState();
    }

    function handleResetResend() {
      if (!pendingPwReset) {
        if (infoResetCodeHint) infoResetCodeHint.textContent = "비밀번호 찾기를 먼저 완료하세요.";
        return;
      }
      startPasswordReset({ email: pendingPwReset.email, id: pendingPwReset.id });
    }

    function handleResetCodeInput() {
      if (!infoResetCodeInput) return;
      infoResetCodeInput.value = (infoResetCodeInput.value || "").replace(/[^0-9]/g, "").slice(0, 6);
      if (!pendingPwReset) {
        if (infoResetCodeHint) infoResetCodeHint.textContent = "다시 비밀번호 찾기를 진행하세요.";
        resetCodeVerified = false;
        togglePasswordFields(false);
        updateResetSubmitState();
        return;
      }
      if (Date.now() > pendingPwReset.expiresAt) {
        resetCodeVerified = false;
        if (infoResetCodeHint) infoResetCodeHint.textContent = "인증번호가 만료되었습니다. 재전송을 눌러주세요.";
        togglePasswordFields(false);
        updateResetSubmitState();
        return;
      }
      const code = infoResetCodeInput.value;
      resetCodeVerified = code.length === 6 && code === pendingPwReset.code;
      if (resetCodeVerified) {
        if (infoResetCodeHint) infoResetCodeHint.textContent = "인증되었습니다. 새 비밀번호를 입력하세요.";
        togglePasswordFields(true);
      } else {
        if (infoResetCodeHint)
          infoResetCodeHint.textContent = code.length === 6 ? "인증번호가 일치하지 않습니다." : "인증번호 6자리를 입력하세요.";
        togglePasswordFields(false);
      }
      updateResetSubmitState();
    }

    function togglePasswordFields(visible, resetValues = false) {
      if (!infoResetPasswordFields) return;
      if (visible) {
        infoResetPasswordFields.classList.remove("d-none");
      } else {
        infoResetPasswordFields.classList.add("d-none");
      }
      if (resetValues) {
        if (infoResetPasswordInput) infoResetPasswordInput.value = "";
        if (infoResetPasswordConfirm) infoResetPasswordConfirm.value = "";
        if (infoResetPasswordHint) infoResetPasswordHint.textContent = "";
      }
      if (infoResetSubmit) infoResetSubmit.setAttribute("disabled", "");
    }

    function updateResetSubmitState() {
      if (!infoResetSubmit) return;
      const newPw = infoResetPasswordInput ? infoResetPasswordInput.value || "" : "";
      const confirmPw = infoResetPasswordConfirm ? infoResetPasswordConfirm.value || "" : "";
      const pwValid = newPw ? validatePassword(newPw) : false;
      const ready = resetCodeVerified && pwValid && newPw === confirmPw;

      if (infoResetPasswordHint) {
        if (!newPw && !confirmPw) {
          infoResetPasswordHint.textContent = "";
        } else if (!pwValid) {
          infoResetPasswordHint.textContent = "대문자/소문자/특수문자를 포함해 6자 이상 입력하세요.";
        } else if (newPw !== confirmPw) {
          infoResetPasswordHint.textContent = "비밀번호가 서로 다릅니다.";
        } else {
          infoResetPasswordHint.textContent = "사용 가능한 비밀번호입니다.";
        }
      }

      if (ready) {
        infoResetSubmit.removeAttribute("disabled");
      } else {
        infoResetSubmit.setAttribute("disabled", "");
      }
    }

    function handleResetSubmit() {
      if (!resetCodeVerified || !pendingPwReset) {
        if (infoResetCodeHint) infoResetCodeHint.textContent = "인증번호 확인 후 진행하세요.";
        return;
      }

      const newPw = infoResetPasswordInput ? infoResetPasswordInput.value || "" : "";
      const confirmPw = infoResetPasswordConfirm ? infoResetPasswordConfirm.value || "" : "";
      if (!validatePassword(newPw) || newPw !== confirmPw) {
        updateResetSubmitState();
        return;
      }

      try {
        const raw = localStorage.getItem("users");
        const users = raw ? JSON.parse(raw) : [];
        const idx = users.findIndex(
          (u) =>
            (u.id || "").toLowerCase() === pendingPwReset.id.toLowerCase() &&
            (u.email || "").toLowerCase() === pendingPwReset.email.toLowerCase()
        );
        if (idx === -1) {
          if (infoResetPasswordHint) infoResetPasswordHint.textContent = "계정을 찾을 수 없습니다. 처음부터 다시 시도하세요.";
          return;
        }

        users[idx].password = newPw;
        localStorage.setItem("users", JSON.stringify(users));
        if (infoResultPwManager) infoResultPwManager.show("비밀번호가 변경되었습니다. 새 비밀번호로 로그인하세요.");
        clearResetWorkflow();
      } catch (error) {
        if (infoResetPasswordHint) infoResetPasswordHint.textContent = "비밀번호 변경 중 오류가 발생했습니다.";
      }
    }

    function clearResetWorkflow() {
      pendingPwReset = null;
      resetCodeVerified = false;
      if (infoResetPanel) infoResetPanel.classList.add("d-none");
      if (infoResetGuide) infoResetGuide.textContent = "이메일로 전송된 6자리 번호를 입력하세요.";
      if (infoResetCodeInput) infoResetCodeInput.value = "";
      if (infoResetCodeHint) infoResetCodeHint.textContent = "";
      togglePasswordFields(false, true);
      updateResetSubmitState();
    }
  });

  function createInfoResultManager(popElement, options = {}) {
    if (!popElement) return null;
    const config = options || {};
    const textEl = popElement.querySelector(".info-result-text");
    const copyBtn = popElement.querySelector(".info-result-copy");
    const closeBtn = popElement.querySelector(".info-result-close");
    let storedValue = "";
    let storedMeta = null;

    const show = (message, rawValue = "", meta = null) => {
      if (textEl) textEl.textContent = message;
      storedValue = rawValue;
      storedMeta = meta || null;
      popElement.classList.remove("d-none");
      gsap.killTweensOf(popElement);
      gsap.fromTo(
        popElement,
        { opacity: 0, y: 40, scale: 0.92, filter: "blur(8px)" },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          filter: "blur(0px)",
          duration: 0.45,
          ease: "elastic.out(1, 0.4)",
        }
      );
    };

    const hide = () => {
      if (popElement.classList.contains("d-none")) return;
      storedValue = "";
      storedMeta = null;
      gsap.killTweensOf(popElement);
      gsap.to(popElement, {
        opacity: 0,
        y: 60,
        scale: 0.9,
        filter: "blur(6px)",
        duration: 0.32,
        ease: "power2.in",
        onComplete() {
          popElement.classList.add("d-none");
        },
      });
    };

    if (closeBtn) {
      closeBtn.addEventListener("click", () => {
        if (typeof config.onClose === "function") {
          config.onClose({ hide, storedValue, meta: storedMeta });
        } else {
          hide();
        }
      });
    }

    if (copyBtn) {
      copyBtn.addEventListener("click", async () => {
        if (!storedValue) return;
        await writeTextToClipboard(storedValue);
        hide();
      });
    }

    return { show, hide, getStoredValue: () => storedValue, getMeta: () => storedMeta };
  }

  function generateVerificationCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  function maskEmail(email = "") {
    const trimmed = (email || "").trim();
    const parts = trimmed.split("@");
    if (parts.length !== 2) return trimmed;
    const [user, domain] = parts;
    if (!user) return trimmed;
    if (user.length <= 2) {
      return user[0] + "*".repeat(Math.max(user.length - 1, 0)) + "@" + domain;
    }
    return user[0] + "*".repeat(user.length - 2) + user[user.length - 1] + "@" + domain;
  }

  function validatePassword(pw) {
    if (!pw || pw.length < 6) return false;
    if (!/[a-z]/.test(pw)) return false;
    if (!/[A-Z]/.test(pw)) return false;
    if (!/[!@#$%^&*(),.?"':{}|<>\[\]\\/~`_+=;-]/.test(pw)) return false;
    return true;
  }

  async function writeTextToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
    } catch (e) {
      const tmp = document.createElement("textarea");
      tmp.value = text;
      document.body.appendChild(tmp);
      tmp.select();
      document.execCommand("copy");
      document.body.removeChild(tmp);
    }
  }
})();
