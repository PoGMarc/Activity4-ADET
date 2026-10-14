document.addEventListener("DOMContentLoaded", function () {
  const menuToggle = document.getElementById("menuToggle");
  const siteNav = document.getElementById("siteNav");

  function setMenuOpen(isOpen) {
    siteNav.classList.toggle("is-open", isOpen);
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
  }

  menuToggle.addEventListener("click", function () {
    setMenuOpen(menuToggle.getAttribute("aria-expanded") !== "true");
  });

  siteNav.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () {
      setMenuOpen(false);
    });
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      setMenuOpen(false);
    }
  });

  const canvas = document.getElementById("matrixCanvas");
  const ctx = canvas.getContext("2d");
  const GLYPHS = "01アイウエオカキクケコサシスセソタチツテトナニヌネノ<>{}/=;";
  const FONT_SIZE = 16;
  let drops = [];
  let rainBg = "#030a05";
  let rainFg = "#00ff41";
  let lastFrame = 0;

  function refreshRainColors() {
    const styles = getComputedStyle(document.documentElement);
    rainBg = styles.getPropertyValue("--bg").trim() || rainBg;
    rainFg = styles.getPropertyValue("--accent").trim() || rainFg;
  }

  function resizeRain() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    const columns = Math.ceil(canvas.width / FONT_SIZE);
    drops = [];
    for (let i = 0; i < columns; i++) {
      drops.push(Math.floor(Math.random() * -40));
    }
    ctx.fillStyle = rainBg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  function drawRain(time) {
    if (time - lastFrame > 50) {
      lastFrame = time;
      ctx.globalAlpha = 0.12;
      ctx.fillStyle = rainBg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.globalAlpha = 1;

      ctx.fillStyle = rainFg;
      ctx.font = FONT_SIZE + "px monospace";
      for (let i = 0; i < drops.length; i++) {
        const glyph = GLYPHS.charAt(Math.floor(Math.random() * GLYPHS.length));
        ctx.fillText(glyph, i * FONT_SIZE, drops[i] * FONT_SIZE);
        if (drops[i] * FONT_SIZE > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    }
    requestAnimationFrame(drawRain);
  }

  refreshRainColors();
  resizeRain();
  window.addEventListener("resize", resizeRain);

  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    requestAnimationFrame(drawRain);
  }

  const themeToggle = document.getElementById("themeToggle");
  const root = document.documentElement;
  const STORAGE_KEY = "portfolio-theme";

  function applyTheme(theme) {
    const nextTheme = theme === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", theme);
    themeToggle.textContent = theme === "dark" ? "Light mode" : "Dark mode";
    themeToggle.setAttribute("aria-label", "Switch to " + nextTheme + " mode");
    refreshRainColors();
  }

  function getSavedTheme() {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch (error) {
      return null;
    }
  }

  function saveTheme(theme) {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch (error) {}
  }

  applyTheme(getSavedTheme() || "dark");

  themeToggle.addEventListener("click", function () {
    const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    applyTheme(next);
    saveTheme(next);
  });

  const CONTACT_EMAIL = "siazon.marc@gmail.com";
  const form = document.getElementById("contactForm");
  const formStatus = document.getElementById("formStatus");

  const rules = {
    name: function (value) {
      const text = value.trim();
      if (text === "") return "Enter your name.";
      if (text.length < 2) return "Your name must have at least 2 characters.";
      return "";
    },
    email: function (value) {
      const text = value.trim();
      if (text === "") return "Enter your email address.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(text)) {
        return "Enter a valid email address, like name@example.com.";
      }
      return "";
    },
    message: function (value) {
      const text = value.trim();
      if (text === "") return "Write a message.";
      if (text.length < 10) return "Your message must have at least 10 characters.";
      return "";
    }
  };

  function validateField(field) {
    const message = rules[field.name](field.value);
    document.getElementById(field.id + "Error").textContent = message;
    field.classList.toggle("invalid", message !== "");
    field.setAttribute("aria-invalid", String(message !== ""));
    return message === "";
  }

  const fields = [form.elements.name, form.elements.email, form.elements.message];

  fields.forEach(function (field) {
    field.addEventListener("blur", function () {
      validateField(field);
    });
    field.addEventListener("input", function () {
      if (field.classList.contains("invalid")) {
        validateField(field);
      }
    });
  });

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    formStatus.textContent = "";

    const allValid = fields.map(validateField).every(Boolean);

    if (!allValid) {
      fields.find(function (field) {
        return field.classList.contains("invalid");
      }).focus();
      return;
    }

    const name = form.elements.name.value.trim();
    const email = form.elements.email.value.trim();
    const message = form.elements.message.value.trim();
    const subject = encodeURIComponent("Portfolio message from " + name);
    const body = encodeURIComponent(message + "\n\nFrom: " + name + " (" + email + ")");

    window.location.href = "mailto:" + CONTACT_EMAIL + "?subject=" + subject + "&body=" + body;

    formStatus.textContent = "Thank you. Your email app should open so you can send the message.";
    form.reset();
  });
});
