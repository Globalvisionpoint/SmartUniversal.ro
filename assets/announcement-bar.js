const announcementCloseButtonLabel = "Inchide";

function ensureAccessibleCloseButtons(root = document) {
  root.querySelectorAll(".close__announcement--bar").forEach((button) => {
    button.setAttribute("aria-label", announcementCloseButtonLabel);
    button.setAttribute("title", announcementCloseButtonLabel);

    if (!button.querySelector(".visually-hidden")) {
      const srText = document.createElement("span");
      srText.className = "visually-hidden";
      srText.textContent = announcementCloseButtonLabel;
      button.appendChild(srText);
    }
  });
}

function getAnnouncementElements() {
  return {
    openButton: document.getElementById("announcement-more-info"),
    wrapper: document.querySelector(".announcement-collapsible-content"),
  };
}

function hideAnnouncementPanel() {
  const { openButton, wrapper } = getAnnouncementElements();
  if (!openButton || !wrapper) return;

  wrapper.classList.remove("open");
  openButton.classList.remove("show--dropdown");
  slideUp(wrapper);
}

function showAnnouncementPanel() {
  const { openButton, wrapper } = getAnnouncementElements();
  if (!openButton || !wrapper) return;

  wrapper.classList.add("open");
  openButton.classList.add("show--dropdown");
  slideDown(wrapper);
}

theme.announcement = function announcementModule() {
  ensureAccessibleCloseButtons();
};

document.addEventListener("click", (event) => {
  const openButton = event.target.closest("#announcement-more-info");
  if (openButton) {
    event.preventDefault();
    const { wrapper } = getAnnouncementElements();
    if (!wrapper) return;

    if (wrapper.classList.contains("open")) {
      hideAnnouncementPanel();
    } else {
      showAnnouncementPanel();
    }
    return;
  }

  const collapsibleCloseButton = event.target.closest(
    ".announcement-collapsible-content .close__announcement--bar"
  );
  if (collapsibleCloseButton) {
    event.preventDefault();
    hideAnnouncementPanel();
    return;
  }

  const timerCloseButton = event.target.closest(".announcement--timer-close-btn");
  if (timerCloseButton) {
    event.preventDefault();
    const announcementBar = timerCloseButton.closest(".announcement__bar--container");
    if (announcementBar) {
      announcementBar.remove();
    }
  }
});

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
