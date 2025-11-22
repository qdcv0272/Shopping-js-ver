import { gsap } from "gsap";

(function () {
  document.addEventListener("DOMContentLoaded", function () {
    const findPwBtn = document.querySelector(".find-pw-btn");
    const findIdBtn = document.querySelector(".find-id-btn");

    const infoPwPage = document.querySelector(".info-pw-page");
    const infoIdPage = document.querySelector(".info-id-page");

    const infoClosePwBtn = document.querySelector(".info-close-pw-btn");
    const infoCloseIdBtn = document.querySelector(".info-close-id-btn");

    const infoResultPop = document.querySelector(".info-result-pop");
    const infoResultText = document.querySelector(".info-result-text");
    const infoResultClose = document.querySelector(".info-result-close");
    let lastFoundId = "";
    const infoResultCopy = document.querySelector(".info-result-copy");

    const infoIdSubmit = document.querySelector(".info-id-check");

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
      });
    }

    if (infoCloseIdBtn) {
      infoCloseIdBtn.addEventListener("click", () => {
        if (infoIdPage) infoIdPage.classList.add("d-none");
      });
    }

    if (infoResultClose) {
      infoResultClose.addEventListener("click", () => {
        hideInfoResult();
      });
    }
    if (infoResultCopy) {
      infoResultCopy.addEventListener("click", async () => {
        if (!lastFoundId) return;
        const text = lastFoundId;
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
        hideInfoResult();
      });
    }

    if (infoIdSubmit) {
      infoIdSubmit.addEventListener("click", () => {
        try {
          // console.log("EE");

          const idEmailInput = infoIdPage ? infoIdPage.querySelector(".info-id-email") : document.querySelector(".info-id-email");
          const email = idEmailInput ? (idEmailInput.value || "").trim() : "";
          const validateEmail = (v) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v);
          if (!validateEmail(email)) {
            showInfoResult("유효한 이메일을 입력하세요.");
            return;
          }
          const raw = localStorage.getItem("users");
          const users = raw ? JSON.parse(raw) : [];
          const found = users.find((u) => (u.email || "").toLowerCase() === email.toLowerCase());
          if (found) {
            showInfoResult("나의 아이디는 " + (found.id || "(없음)") + " 이다", found.id || "");
          } else {
            showInfoResult("등록된 이메일이 없습니다.");
          }
        } catch (e) {
          showInfoResult("오류가 발생했습니다.");
        }
      });
    }

    function infoFindPwOpen() {
      if (infoPwPage) infoPwPage.classList.remove("d-none");
    }
    function infoFindIdOpen() {
      if (infoIdPage) {
        infoIdPage.classList.remove("d-none");
        // when opening id-find page, ensure its submit is disabled until valid email entered
        const idSubmit = infoIdPage.querySelector(".info-submit");
        if (idSubmit) idSubmit.setAttribute("disabled", "");
        const idEmail = infoIdPage.querySelector(".info-id-email");
        if (idEmail) {
          // validate email format and enable submit when valid
          const validateEmail = (v) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v);
          const handler = function () {
            const v = (this.value || "").trim();
            if (idSubmit) {
              if (validateEmail(v)) idSubmit.removeAttribute("disabled");
              else idSubmit.setAttribute("disabled", "");
            }
          };
          idEmail.addEventListener("input", handler);
          // run once to set initial state
          handler.call(idEmail);
        }
      }
    }

    function showInfoResult(message, rawId = "") {
      if (!infoResultPop) return;
      if (infoResultText) infoResultText.textContent = message;
      lastFoundId = rawId;
      infoResultPop.classList.remove("d-none");
      gsap.killTweensOf(infoResultPop);
      gsap.fromTo(
        infoResultPop,
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
    }

    function hideInfoResult() {
      if (!infoResultPop || infoResultPop.classList.contains("d-none")) return;
      gsap.killTweensOf(infoResultPop);
      gsap.to(infoResultPop, {
        opacity: 0,
        y: 60,
        scale: 0.9,
        filter: "blur(6px)",
        duration: 0.32,
        ease: "power2.in",
        onComplete() {
          infoResultPop.classList.add("d-none");
        },
      });
    }
  });
})();
