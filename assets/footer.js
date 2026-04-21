theme.footerSection = (function () {
  function footer() {
    // Mobile navigation bar
    const mobileNavigateBar = document.querySelector(
      ".mobile__navigation--bar"
    );
    if (mobileNavigateBar) {
      document.documentElement.style.setProperty(
        "--mobile-navigation-bar-height",
        `${mobileNavigateBar.clientHeight}px`
      );

      window.addEventListener("resize", function () {
        document.documentElement.style.setProperty(
          "--mobile-navigation-bar-height",
          `${mobileNavigateBar.clientHeight}px`
        );
      });
    }
    // Footer widget column collapsible
    const isMobileFooterViewport = function () {
      return window.matchMedia("(max-width: 989px)").matches;
    };

    const keepNewsletterOpen = function () {
      document.querySelectorAll(".footer__widget--newsletter").forEach(function (item) {
        const inner = item.querySelector(".footer__widget_inner");
        const toggle = item.querySelector(".footer__widget_toggle");

        if (isMobileFooterViewport()) {
          item.classList.add("active");
          if (inner) {
            inner.style.display = "block";
          }
          if (toggle) {
            toggle.setAttribute("aria-expanded", "true");
          }
        }
      });
    };

    let accordion = true;
    const footerWidgetAccordion = function () {
      accordion = false;
      document
        .querySelectorAll(".footer__widget_toggle")
        .forEach(function (item) {
          // Special handling for newsletter section on mobile/tablet
          const footerWidget = item.closest('.footer__widget');
          const isNewsletter = footerWidget && footerWidget.classList.contains('footer__widget--newsletter');
          const isLockedOpen = footerWidget && footerWidget.classList.contains('footer__widget--locked-open');
          if ((isNewsletter || isLockedOpen) && isMobileFooterViewport()) {
            // Always open, never closable
            footerWidget.classList.add('active');
            const footerWidgetInner = footerWidget.querySelector('.footer__widget_inner');
            if (footerWidgetInner) {
              footerWidgetInner.style.display = 'block';
            }
            // Hide or disable the toggle button
            item.style.display = 'none';
            return;
          }
          // Default accordion behavior for other widgets
          item.addEventListener("click", function () {
            const footerWidget = this.closest(".footer__widget"),
              footerWidgetInner = footerWidget.querySelector(
                ".footer__widget_inner"
              );
            if (footerWidget.classList.contains("active")) {
              footerWidget.classList.remove("active");
              slideUp(footerWidgetInner);
            } else {
              footerWidget.classList.add("active");
              slideDown(footerWidgetInner);
              getSiblings(footerWidget.parentElement).forEach(function (item) {
                const footerWidget = item.querySelector(".footer__widget"),
                  footerWidgetInner = item.querySelector(
                    ".footer__widget_inner"
                  );

                if (
                  footerWidget &&
                  (footerWidget.classList.contains("footer__widget--newsletter") ||
                    footerWidget.classList.contains("footer__widget--locked-open")) &&
                  isMobileFooterViewport()
                ) {
                  footerWidget.classList.add("active");
                  if (footerWidgetInner) {
                    footerWidgetInner.style.display = "block";
                  }
                  return;
                }

                footerWidget.classList.remove("active");
                slideUp(footerWidgetInner);
              });
            }
            keepNewsletterOpen();
          });
        });
    };
    if (accordion) {
      footerWidgetAccordion();
    }
    keepNewsletterOpen();
    // On resize, re-apply always-open for newsletter on mobile/tablet
    window.addEventListener("resize", function () {
      document.querySelectorAll('.footer__widget--newsletter').forEach(function (item) {
        if (isMobileFooterViewport()) {
          item.classList.add('active');
          const inner = item.querySelector('.footer__widget_inner');
          if (inner) {
            inner.style.display = 'block';
          }
          const toggle = item.querySelector('.footer__widget_toggle');
          if (toggle) toggle.style.display = 'none';
        } else {
          const toggle = item.querySelector('.footer__widget_toggle');
          if (toggle) toggle.style.display = '';
        }
      });
    });
    window.addEventListener("resize", function () {
      document.querySelectorAll(".footer__widget").forEach(function (item) {
        if (!isMobileFooterViewport()) {
          item.classList.remove("active");
          item.querySelector(".footer__widget_inner").style.display = "";
        }
      });
      if (accordion) {
        footerWidgetAccordion();
      }
    });
  }
  return footer;
})();
