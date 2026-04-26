theme.headerSticky = (function () {
  function ScrollSticky() {
    const headerStickyWrapper = document.querySelector("header");
    const headerStickyTargetList = document.querySelectorAll(".header__sticky");

    if (!headerStickyWrapper || headerStickyTargetList.length === 0) {
      return;
    }

    const updateStickyState = function () {
      const targetElementTopOffset = TopOffset(headerStickyWrapper).top;
      const shouldStick = window.scrollY > targetElementTopOffset;

      headerStickyTargetList.forEach((headerStickyTarget) => {
        headerStickyTarget.classList.toggle("sticky", shouldStick);
      });
    };

    updateStickyState();
    window.addEventListener("scroll", updateStickyState, { passive: true });
  }
  return ScrollSticky;
})();
