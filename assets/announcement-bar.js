theme.announcement = (function () {
  const closeButtonLabel = "Inchide";

  function ensureAccessibleCloseButtons(root = document) {
    root
      .querySelectorAll(".close__announcement--bar")
      .forEach((button) => {
        button.setAttribute("aria-label", closeButtonLabel);
        button.setAttribute("title", closeButtonLabel);

        if (!button.querySelector(".visually-hidden")) {
          const srText = document.createElement("span");
          srText.className = "visually-hidden";
          srText.textContent = closeButtonLabel;
          button.appendChild(srText);
        }
      });
  }

  function announcementModule(element) {
    const announcement = {
      open: document.getElementById("announcement-more-info"),
      close: document.querySelector(".close__announcement--bar"),
      wrapper: document.querySelector(".announcement-collapsible-content"),
    };

    ensureAccessibleCloseButtons();

    // Hide the announcement bar
    const hide = () => {
      announcement.wrapper.classList.remove("open");
      announcement.open.classList.remove("show--dropdown");
      slideUp(announcement.wrapper);
    };

    // open the announcement bar
    const open = () => {
      announcement.wrapper.classList.add("open");
      announcement.open.classList.add("show--dropdown");
      slideDown(announcement.wrapper);
    };

    // Click open event
    announcement.open?.addEventListener("click", (event) => {
      event.preventDefault();
      let isOpen = announcement.wrapper.classList.contains("open")
        ? true
        : false;
      if (isOpen) {
        hide();
      } else {
        open();
      }
    });

    // Click close event
    announcement.close?.addEventListener("click", (event) => {
      event.preventDefault();
      hide();
    });
  }
  return announcementModule;
})();

class announmentBar extends HTMLElement {
  constructor() {
    super();
    this.addEventListener("click", this.onRemoveAnnouncement);
  }
  onRemoveAnnouncement(event) {
    const closeButton = event.target.closest(".announcement--timer-close-btn");
    if (closeButton) {
      closeButton.closest(".announcement-bar").remove();
    }
  }
}
customElements.define("announcement-bar", announmentBar);

document.addEventListener("DOMContentLoaded", () => {
  ensureAccessibleCloseButtons();

  const announcementObserver = new MutationObserver(() => {
    ensureAccessibleCloseButtons();
  });

  announcementObserver.observe(document.body, {
    childList: true,
    subtree: true,
  });
});
