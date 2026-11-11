/* Shared chrome as Web Components.
   <site-nav>    top bar, the round menu button and the slide-in menu
   <site-footer> the dark contact block that closes every page */
(function () {
  "use strict";

  const root = document.documentElement;
  const EMAIL = "adusumillinirdesh@gmail.com";
  const LINKEDIN = "https://www.linkedin.com/in/nirdeshadusumilli/";
  const GITHUB = "https://github.com/nirdeshadusumilli2007";

  const PAGES = [
    ["index.html", "Home"],
    ["portfolio.html", "Work"],
    ["resume.html", "Resume"]
  ];

  function currentFile() {
    const f = (location.pathname.split("/").pop() || "").toLowerCase();
    return f === "" ? "index.html" : f;
  }

  function link(href, text, cur) {
    return '<a href="' + href + '"' + (href === cur ? ' aria-current="page"' : "") + ">" + text + "</a>";
  }

  class SiteNav extends HTMLElement {
    connectedCallback() {
      const cur = currentFile();
      const light = this.getAttribute("tone") === "light";
      const top = PAGES.slice(1).map(function (p) { return link(p[0], p[1], cur); }).join("") + '<a href="#contact">Contact</a>';
      const all = PAGES.map(function (p) { return "<li>" + link(p[0], p[1], cur) + "</li>"; }).join("") + '<li><a href="#contact">Contact</a></li>';

      this.innerHTML =
        '<header class="nav' + (light ? " nav-light" : "") + '">' +
          '<a class="brand" href="index.html">&copy; Nirdesh Adusumilli</a>' +
          '<nav class="nav-links" aria-label="Primary">' + top + "</nav>" +
          '<button class="nav-menu" type="button" data-menu aria-expanded="false" aria-controls="menu">Menu</button>' +
        "</header>" +
        '<button class="menu-btn" type="button" data-menu data-mag aria-expanded="false" aria-controls="menu" aria-label="Open menu"><i></i><i></i></button>' +
        '<div class="shade" data-menu-close></div>' +
        '<div class="drawer" id="menu" role="dialog" aria-modal="true" aria-label="Menu" inert>' +
          '<nav aria-label="Menu"><p class="label">Navigation</p><ul class="drawer-links">' + all + "</ul></nav>" +
          '<div class="drawer-soc"><p class="label">Socials</p><ul>' +
            '<li><a class="ul" href="' + LINKEDIN + '" rel="noopener">LinkedIn</a></li>' +
            '<li><a class="ul" href="' + GITHUB + '" rel="noopener">GitHub</a></li>' +
            '<li><a class="ul" href="mailto:' + EMAIL + '">Email</a></li>' +
          "</ul></div>" +
        "</div>";

      const drawer = this.querySelector(".drawer");
      const fixedBtn = this.querySelector(".menu-btn");
      const buttons = this.querySelectorAll("[data-menu]");
      let opener = null;

      function setOpen(open) {
        root.classList.toggle("menu-open", open);
        drawer.inert = !open;
        buttons.forEach(function (b) { b.setAttribute("aria-expanded", String(open)); });
        fixedBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
        if (open) {
          const first = drawer.querySelector("a");
          if (first) first.focus({ preventScroll: true });
        } else if (opener && drawer.contains(document.activeElement)) {
          opener.focus({ preventScroll: true });
        }
      }

      buttons.forEach(function (b) {
        b.addEventListener("click", function () {
          const open = !root.classList.contains("menu-open");
          if (open) opener = b.offsetParent ? b : fixedBtn;
          setOpen(open);
        });
      });
      this.querySelector("[data-menu-close]").addEventListener("click", function () { setOpen(false); });
      drawer.addEventListener("click", function (e) { if (e.target.closest("a")) setOpen(false); });
      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && root.classList.contains("menu-open")) setOpen(false);
      });

      /* the round button takes over once the top bar is out of view */
      function onScroll() { root.classList.toggle("scrolled", window.scrollY > 130); }
      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll();
    }
  }

  class SiteFooter extends HTMLElement {
    connectedCallback() {
      this.innerHTML =
        '<footer class="foot" id="contact">' +
          '<div class="foot-in">' +
            '<div class="foot-top">' +
              '<h2 class="foot-h">Let&rsquo;s work<br>together</h2>' +
              '<p class="foot-note"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true" focusable="false"><path d="M19 5 5 19M5 8v11h11"/></svg>Open to AI engineering and software engineering internships.</p>' +
            "</div>" +
            '<div class="foot-line"><a class="orb orb-accent" data-mag href="mailto:' + EMAIL + '"><span>Get in touch</span></a></div>' +
            '<div class="foot-pills">' +
              '<a class="pill" href="mailto:' + EMAIL + '">' + EMAIL + "</a>" +
              '<a class="pill" href="Nirdesh_Adusumilli_Resume.pdf" download>Resume (PDF)</a>' +
            "</div>" +
          "</div>" +
          '<div class="foot-bar">' +
            "<div><h3>Based in</h3><p>Terre Haute, IN</p></div>" +
            '<div><h3>Local time</h3><p data-clock>Eastern Time</p></div>' +
            '<div class="foot-soc"><h3>Socials</h3><ul>' +
              '<li><a class="ul" href="' + LINKEDIN + '" rel="noopener">LinkedIn</a></li>' +
              '<li><a class="ul" href="' + GITHUB + '" rel="noopener">GitHub</a></li>' +
              '<li><a class="ul" href="mailto:' + EMAIL + '">Email</a></li>' +
            "</ul></div>" +
          "</div>" +
        "</footer>";

      /* the time in Terre Haute, refreshed twice a minute */
      const clock = this.querySelector("[data-clock]");
      let fmt = null;
      try {
        fmt = new Intl.DateTimeFormat("en-US", { hour: "2-digit", minute: "2-digit", timeZone: "America/Indiana/Indianapolis", timeZoneName: "short" });
      } catch (e) { /* keep the plain label */ }
      if (fmt) {
        const tick = function () { clock.textContent = fmt.format(new Date()); };
        tick();
        setInterval(tick, 30000);
      }
    }
  }

  if (!customElements.get("site-nav")) customElements.define("site-nav", SiteNav);
  if (!customElements.get("site-footer")) customElements.define("site-footer", SiteFooter);
})();
