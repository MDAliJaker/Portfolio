const menuButton = document.querySelector(".menu-btn");
const topbar = document.querySelector(".topbar");
const navLinks = document.querySelectorAll(".nav a");
const revealEls = document.querySelectorAll(".reveal");
const sections = document.querySelectorAll("main section[id]");
const skillsAnchorLinks = document.querySelectorAll('a[href="#skills"]');
const contactForm = document.querySelector("#contact-form");
const formStatus = document.querySelector("#form-status");
const skillSection = document.querySelector("#skills");
const skillPills = document.querySelectorAll(".skill-pill");
let skillsAnimated = false;

function animateSkillPills() {
  if (!skillPills.length) return;
  skillsAnimated = true;

  skillPills.forEach((pill) => {
    const target = Math.max(
      0,
      Math.min(100, Number.parseInt(pill.dataset.percent || "0", 10))
    );
    const percentEl = pill.querySelector(".skill-percent");
    const duration = 900;
    let startTime = null;

    pill.style.setProperty("--fill", "0");
    if (percentEl) percentEl.textContent = "0%";

    const tick = (time) => {
      if (startTime === null) startTime = time;
      const progress = Math.min((time - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(target * eased);

      pill.style.setProperty("--fill", String(current));
      if (percentEl) percentEl.textContent = `${current}%`;

      if (progress < 1) {
        window.requestAnimationFrame(tick);
      }
    };

    window.requestAnimationFrame(tick);
  });
}

if (menuButton && topbar) {
  menuButton.addEventListener("click", () => {
    const expanded = menuButton.getAttribute("aria-expanded") === "true";
    menuButton.setAttribute("aria-expanded", String(!expanded));
    topbar.classList.toggle("menu-open");
  });
}

function getNavOffset() {
  if (!topbar) return 10;
  const topbarHeight = topbar.getBoundingClientRect().height;
  const topbarTop = parseFloat(window.getComputedStyle(topbar).top) || 0;
  return topbarHeight + topbarTop + 10;
}

navLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    topbar?.classList.remove("menu-open");
    menuButton?.setAttribute("aria-expanded", "false");

    const hash = link.getAttribute("href");
    if (!hash || !hash.startsWith("#")) return;

    const targetSection = document.querySelector(hash);
    if (!targetSection) return;

    event.preventDefault();
    const heading = targetSection.querySelector("h2") || targetSection;
    const y =
      heading.getBoundingClientRect().top + window.pageYOffset - getNavOffset();
    window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
    history.replaceState(null, "", hash);

    if (hash === "#skills") {
      window.setTimeout(animateSkillPills, 220);
    }
  });
});

skillsAnchorLinks.forEach((link) => {
  link.addEventListener("click", () => {
    window.setTimeout(animateSkillPills, 220);
  });
});

if (contactForm && formStatus) {
  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const submitButton = contactForm.querySelector("button[type='submit']");
    const action = contactForm.getAttribute("action") || "";

    if (action.includes("your-email@example.com")) {
      formStatus.textContent =
        "Set your real email in the form action to activate message delivery.";
      return;
    }

    submitButton?.setAttribute("disabled", "true");
    formStatus.textContent = "Sending your message...";

    try {
      const response = await fetch(action, {
        method: "POST",
        body: new FormData(contactForm),
        headers: {
          Accept: "application/json",
        },
      });
      const result = await response.json();

      if (response.ok && (result.success === "true" || result.success === true)) {
        formStatus.textContent =
          "Message sent successfully. A confirmation email has been sent to your address.";
        contactForm.reset();
      } else {
        formStatus.textContent =
          "Message could not be sent. Please try again after a moment.";
      }
    } catch (error) {
      formStatus.textContent =
        "Network issue while sending message. Please try again.";
    } finally {
      submitButton?.removeAttribute("disabled");
    }
  });
}

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.18 }
  );

  revealEls.forEach((el, index) => {
    el.style.transitionDelay = `${Math.min(index * 80, 320)}ms`;
    revealObserver.observe(el);
  });

  const navObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = entry.target.getAttribute("id");
        if (!id) return;
        navLinks.forEach((link) => {
          const isActive = link.getAttribute("href") === `#${id}`;
          link.classList.toggle("active", isActive);
        });

        if (id === "skills" && !skillsAnimated) {
          animateSkillPills();
        }
      });
    },
    { threshold: 0.45 }
  );

  sections.forEach((section) => navObserver.observe(section));
} else {
  revealEls.forEach((el) => el.classList.add("visible"));
  if (skillSection) animateSkillPills();
}
