theme.counterup = (function () {
  function funfact(e) {
    const wrapper = document.getElementById(`${e.id}`);
    if (wrapper) {
      const counters = wrapper.querySelectorAll(".js-counter");
      const duration = 1000;

      let isCounted = false;
      const onScroll = function () {
        const wrapperPos = wrapper.offsetTop - window.innerHeight;
        if (!isCounted && window.scrollY > wrapperPos) {
          counters.forEach((counter) => {
            const countTo = counter.dataset.count;

            const countPerMs = countTo / duration;

            let currentCount = 0;
            const countInterval = setInterval(function () {
              if (currentCount >= countTo) {
                clearInterval(countInterval);
              }
              counter.textContent = Math.round(currentCount);
              currentCount = currentCount + countPerMs;
            }, 1);
          });
          isCounted = true;
          document.removeEventListener("scroll", onScroll);
        }
      };

      document.addEventListener("scroll", onScroll, { passive: true });
      onScroll();
    }
  }
  return funfact;
})();