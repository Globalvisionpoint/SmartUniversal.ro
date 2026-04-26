window.theme = window.theme || {};

theme.Sections = function Sections() {
  this.constructors = {};
  this.instances = [];

  document.addEventListener(
    "shopify:section:load",
    this._onSectionLoad.bind(this)
  );
  document.addEventListener(
    "shopify:section:unload",
    this._onSectionUnload.bind(this)
  );
  document.addEventListener(
    "shopify:section:select",
    this._onSelect.bind(this)
  );
  document.addEventListener(
    "shopify:section:deselect",
    this._onDeselect.bind(this)
  );
  document.addEventListener(
    "shopify:block:select",
    this._onBlockSelect.bind(this)
  );
  document.addEventListener(
    "shopify:block:deselect",
    this._onBlockDeselect.bind(this)
  );
};

theme.Sections.prototype = Object.assign({}, theme.Sections.prototype, {
  _createInstance: function (container, constructor) {
    var id = container.getAttribute("data-section-id");
    var type = container.getAttribute("data-section-type");

    constructor = constructor || this.constructors[type];

    if (typeof constructor === "undefined") {
      return;
    }

    var instance = Object.assign(new constructor(container), {
      id: id,
      type: type,
      container: container,
    });

    this.instances.push(instance);
  },

  _onSectionLoad: function (evt) {
    var container = document.querySelector(
      '[data-section-id="' + evt.detail.sectionId + '"]'
    );

    if (container) {
      this._createInstance(container);
    }
  },

  _onSectionUnload: function (evt) {
    this.instances = this.instances.filter(function (instance) {
      var isEventInstance = instance.id === evt.detail.sectionId;

      if (isEventInstance) {
        if (typeof instance.onUnload === "function") {
          instance.onUnload(evt);
        }
      }

      return !isEventInstance;
    });
  },

  _onSelect: function (evt) {
    // eslint-disable-next-line no-shadow
    var instance = this.instances.find(function (instance) {
      return instance.id === evt.detail.sectionId;
    });

    if (
      typeof instance !== "undefined" &&
      typeof instance.onSelect === "function"
    ) {
      instance.onSelect(evt);
    }
  },

  _onDeselect: function (evt) {
    // eslint-disable-next-line no-shadow
    var instance = this.instances.find(function (instance) {
      return instance.id === evt.detail.sectionId;
    });

    if (
      typeof instance !== "undefined" &&
      typeof instance.onDeselect === "function"
    ) {
      instance.onDeselect(evt);
    }
  },

  _onBlockSelect: function (evt) {
    // eslint-disable-next-line no-shadow
    var instance = this.instances.find(function (instance) {
      return instance.id === evt.detail.sectionId;
    });

    if (
      typeof instance !== "undefined" &&
      typeof instance.onBlockSelect === "function"
    ) {
      instance.onBlockSelect(evt);
    }
  },

  _onBlockDeselect: function (evt) {
    // eslint-disable-next-line no-shadow
    var instance = this.instances.find(function (instance) {
      return instance.id === evt.detail.sectionId;
    });

    if (
      typeof instance !== "undefined" &&
      typeof instance.onBlockDeselect === "function"
    ) {
      instance.onBlockDeselect(evt);
    }
  },

  register: function (type, constructor) {
    this.constructors[type] = constructor;

    document.querySelectorAll('[data-section-type="' + type + '"]').forEach(
      function (container) {
        this._createInstance(container, constructor);
      }.bind(this)
    );
  },
});

theme.collectionSlider = (function () {
  function sliderProduct(e) {
    let sliderContainer = "",
      extraLargeDesktopShow = 4,
      largeDesktopShow = 3,
      tabletShow = 3,
      mobileShow = 2,
      sliderRows = parseInt(e.dataset.sliderRows),
      sliderGrid = "column",
      sliderLoop = e.dataset.loop;

    if (sliderLoop === "true") {
      sliderLoop = true;
    } else {
      sliderLoop = false;
    }

    if (sliderRows > 1) {
      sliderGrid = "row";
      sliderLoop = false;
    }
    if (e.dataset.sliderEnable === "true") {
      sliderContainer = e.querySelector(".productSlider");
      extraLargeDesktopShow = parseInt(e.dataset.showExtraLarge);
      largeDesktopShow = parseInt(e.dataset.showLarge);
      tabletShow = parseInt(e.dataset.showTablet);
      mobileShow = parseInt(e.dataset.showMobile);
    }

    var swiper = new Swiper(sliderContainer, {
      loop: sliderLoop,
      slidesPerView: mobileShow,
      spaceBetween: 20,
      grid: {
        rows: sliderRows,
        fill: sliderGrid,
      },
      pagination: {
        el: e.querySelector(".swiper-pagination"),
        clickable: true,
      },
      navigation: {
        nextEl: e.querySelector(".product_slider_wrapper .swiper-button-next"),
        prevEl: e.querySelector(".product_slider_wrapper .swiper-button-prev"),
      },
      breakpoints: {
        640: {
          slidesPerView: mobileShow,
        },
        750: {
          slidesPerView: tabletShow,
        },
        992: {
          slidesPerView: largeDesktopShow,
        },
        1200: {
          slidesPerView: extraLargeDesktopShow,
        },
      },
    });
    // Slide thumbnail height
    const slideThumbHeight = () => {
      const proudctThumbnails = e.querySelectorAll(".card--client-height");
      if (proudctThumbnails.length > 0) {
        const productThumbnailHeight = proudctThumbnails[0];
        e.style.setProperty(
          "--slider-navigation-top-offset",
          `${productThumbnailHeight.clientHeight / 2}px`
        );
      }
    };
    slideThumbHeight();
    window.addEventListener("resize", () => {
      slideThumbHeight();
    });
  }
  return sliderProduct;
})();

(function () {
  function normalizeProductTabHeadings(root) {
    (root || document).querySelectorAll('.tab_content').forEach(function (container) {
      if (container.querySelector('h1, h2')) return;

      var firstH3 = container.querySelector('h3');
      if (!firstH3) return;

      var h2 = document.createElement('h2');
      Array.from(firstH3.attributes).forEach(function (attr) {
        h2.setAttribute(attr.name, attr.value);
      });
      h2.innerHTML = firstH3.innerHTML;
      firstH3.replaceWith(h2);
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    normalizeProductTabHeadings(document);
  });

  document.addEventListener('shopify:section:load', function (event) {
    normalizeProductTabHeadings(event.target || document);
  });
})();

(function () {
  function extractYoutubeId(url) {
    if (!url) return '';
    var match = url.match(/embed\/([^?&#"']+)/);
    return match ? match[1] : '';
  }

  function buildAutoplayYoutubeUrl(url) {
    if (!url) return url;

    try {
      var parsed = new URL(url, window.location.origin);
      parsed.searchParams.set('autoplay', '1');
      parsed.searchParams.set('playsinline', '1');
      parsed.searchParams.set('enablejsapi', '1');
      parsed.searchParams.set('rel', '0');
      parsed.searchParams.set('modestbranding', '1');
      parsed.searchParams.set('origin', window.location.origin);
      return parsed.toString();
    } catch (error) {
      var separator = url.indexOf('?') === -1 ? '?' : '&';
      return url + separator + 'autoplay=1&playsinline=1&enablejsapi=1&rel=0&modestbranding=1';
    }
  }

  function triggerYoutubePlayback(frame) {
    if (!frame || !frame.contentWindow) return;

    var commands = [
      '{"event":"command","func":"playVideo","args":""}',
      '{"event":"command","func":"unMute","args":""}'
    ];

    commands.forEach(function (command) {
      try {
        frame.contentWindow.postMessage(command, 'https://www.youtube-nocookie.com');
        frame.contentWindow.postMessage(command, '*');
      } catch (error) {
        // Ignore cross-origin timing issues while the iframe is still booting.
      }
    });
  }

  function toNoCookieYoutube(url) {
    if (!url || url.indexOf('youtube.com/embed/') === -1) return url;
    return url.replace('://www.youtube.com/embed/', '://www.youtube-nocookie.com/embed/');
  }

  function hardenYoutubeEmbeds(root) {
    (root || document)
      .querySelectorAll('iframe[src*="youtube.com/embed/"], iframe[src*="youtube-nocookie.com/embed/"]')
      .forEach(function (frame) {
        var originalSrc = frame.getAttribute('src') || '';
        var noCookieSrc = toNoCookieYoutube(originalSrc);
        if (!noCookieSrc) return;

        if (frame.dataset.youtubeLite === 'true') return;
        frame.dataset.youtubeLite = 'true';

        var videoId = extractYoutubeId(noCookieSrc);
        if (!videoId) return;

        var ratio = 56.25;

        if (!frame.getAttribute('title')) {
          frame.setAttribute('title', 'Video produs');
        }
        frame.setAttribute('loading', 'lazy');
        frame.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');

        function applyBestYoutubePoster() {
          var posterSources = [
            'https://i.ytimg.com/vi/' + videoId + '/maxresdefault.jpg',
            'https://i.ytimg.com/vi/' + videoId + '/hq720.jpg',
            'https://i.ytimg.com/vi/' + videoId + '/mqdefault.jpg',
            'https://i.ytimg.com/vi/' + videoId + '/hqdefault.jpg'
          ];

          function tryPoster(index) {
            if (index >= posterSources.length) return;

            var posterUrl = posterSources[index];
            var image = new Image();

            image.onload = function () {
              if (image.naturalWidth <= 120) {
                tryPoster(index + 1);
                return;
              }

              wrapper.style.backgroundImage = "url('" + posterUrl + "')";
            };

            image.onerror = function () {
              tryPoster(index + 1);
            };

            image.src = posterUrl;
          }

          tryPoster(0);
        }

        var wrapper = document.createElement('div');
        wrapper.className = 'youtube-lite-wrapper';
        wrapper.style.position = 'relative';
        wrapper.style.width = '100%';
        wrapper.style.paddingTop = ratio + '%';
        wrapper.style.backgroundSize = 'cover';
        wrapper.style.backgroundPosition = 'center';
        wrapper.style.borderRadius = '10px';
        wrapper.style.overflow = 'hidden';
        wrapper.style.cursor = 'pointer';
        wrapper.style.maxWidth = '100%';
        applyBestYoutubePoster();

        var play = document.createElement('button');
        play.type = 'button';
        play.className = 'youtube-lite-play';
        play.setAttribute('aria-label', 'Reda video YouTube');
        play.style.position = 'absolute';
        play.style.inset = '0';
        play.style.width = '100%';
        play.style.height = '100%';
        play.style.border = '0';
        play.style.background = 'linear-gradient(to bottom, rgba(0,0,0,0.08), rgba(0,0,0,0.35))';
        play.style.color = '#fff';
        play.style.display = 'flex';
        play.style.alignItems = 'center';
        play.style.justifyContent = 'center';
        play.style.fontSize = '1.1rem';
        play.style.fontWeight = '700';
        play.style.cursor = 'pointer';
        play.innerHTML = '<span style="display:inline-flex;align-items:center;gap:8px;padding:10px 14px;border-radius:999px;background:rgba(17,24,39,.82)"><span aria-hidden="true" style="font-size:1.25rem">▶</span> Reda video</span>';

        play.addEventListener('click', function () {
          var autoplaySrc = buildAutoplayYoutubeUrl(noCookieSrc);

          frame.setAttribute('src', autoplaySrc);
          frame.setAttribute(
            'allow',
            'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
          );
          frame.setAttribute('allowfullscreen', '');
          frame.setAttribute('loading', 'eager');
          frame.style.position = 'absolute';
          frame.style.inset = '0';
          frame.style.width = '100%';
          frame.style.height = '100%';
          frame.style.border = '0';

          frame.addEventListener(
            'load',
            function () {
              triggerYoutubePlayback(frame);
              window.setTimeout(function () {
                triggerYoutubePlayback(frame);
              }, 500);
            },
            { once: true }
          );

          wrapper.innerHTML = '';
          wrapper.appendChild(frame);
        });

        wrapper.appendChild(play);
        frame.parentNode.insertBefore(wrapper, frame);
        frame.remove();
      });
  }

  function getUrlWidth(url) {
    var match = (url || '').match(/[?&]width=(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  }

  function replaceWidthParam(url, width) {
    if (!url) return url;
    if (/[?&]width=\d+/.test(url)) {
      return url.replace(/([?&]width=)\d+/, '$1' + width);
    }
    return url + (url.indexOf('?') === -1 ? '?' : '&') + 'width=' + width;
  }

  function upgradeImageResolution(root) {
    (root || document)
      .querySelectorAll('img.global-media-settings.global-media-settings--no-shadow, .tab_content img[src*="cdn.shopify.com"]')
      .forEach(function (img) {
        var dpr = window.devicePixelRatio || 1;
        var targetWidth = Math.min(2200, Math.ceil(img.clientWidth * dpr));
        if (!targetWidth || targetWidth < 600) return;

        var src = img.getAttribute('src') || '';
        var currentWidth = getUrlWidth(src);
        if (currentWidth >= targetWidth) return;

        img.setAttribute('src', replaceWidthParam(src, targetWidth));

        var srcset = img.getAttribute('srcset');
        if (srcset) {
          var upgraded = srcset
            .split(',')
            .map(function (entry) {
              var trimmed = entry.trim();
              if (!trimmed) return trimmed;
              var parts = trimmed.split(' ');
              parts[0] = replaceWidthParam(parts[0], targetWidth);
              return parts.join(' ');
            })
            .join(', ');
          img.setAttribute('srcset', upgraded);
        }
      });
  }

  function applyBestPracticesBoost(root) {
    hardenYoutubeEmbeds(root);
    upgradeImageResolution(root);
  }

  document.addEventListener('DOMContentLoaded', function () {
    applyBestPracticesBoost(document);
  });

  window.addEventListener('load', function () {
    applyBestPracticesBoost(document);
  });

  document.addEventListener('shopify:section:load', function (event) {
    applyBestPracticesBoost(event.target || document);
  });
})();

document.addEventListener("DOMContentLoaded", function () {
  let sections = new theme.Sections(),
    headerSearchModule = new theme.Sections(),
    headerCartModule = new theme.Sections(),
    headerStickyModule = new theme.Sections();

  sections.register("announcement-bar", theme.announcement);
  sections.register("header", theme.headerSection);
  sections.register("header", theme.headerCategoryMenu);
  headerSearchModule.register("header", theme.headerSearch);
  headerStickyModule.register("header", theme.headerSticky);
  sections.register("footer", theme.footerSection);
  sections.register("slideShow", theme.SlideShow);
  sections.register("product-tab", theme.productTab);
  sections.register("collection-product", theme.collectionProduct);
  sections.register("product-slider", theme.collectionSlider);
  sections.register("counter_up", theme.counterup);
  sections.register("faq-collapse", theme.accordion);
  sections.register("popup-video", theme.video);
  sections.register("lookbook", theme.lookbookSlider);
  sections.register("timeline", theme.timelineSlider);
      setTimeout(function() {
        var compare = document.getElementsByClassName("product__card--add-wishlist");
for (var i = 0; i < compare.length; i++) {
  compare[i].innerHTML = "Compară Produse";
}
    }, 1000);
        setTimeout(function() {
        var compare = document.getElementsByClassName("product__card--remove-wishlist");
for (var i = 0; i < compare.length; i++) {
  compare[i].innerHTML = "Elimină din comparare";
}
    }, 1000);
});

(function () {
  function hideCookiePrivacyUi() {
    var dialogs = document.querySelectorAll(
      ".shopify-pc__banner__dialog, [class*='shopify-pc__banner__dialog'], .shopify-pc__prefs__dialog, [class*='shopify-pc__prefs__dialog']"
    );

    dialogs.forEach(function (el) {
      el.setAttribute("hidden", "hidden");
      el.setAttribute("aria-hidden", "true");
      el.style.setProperty("display", "none", "important");
    });

    var overlays = document.querySelectorAll(
      ".shopify-pc__overlay, [class*='shopify-pc__overlay'], .shopify-pc__backdrop, [class*='shopify-pc__backdrop']"
    );

    overlays.forEach(function (el) {
      el.style.setProperty("display", "none", "important");
    });
  }

  function bindCookieBannerImmediateDismiss() {
    if (window.__cookieBannerImmediateDismissBound) return;
    window.__cookieBannerImmediateDismissBound = true;

    document.addEventListener(
      "click",
      function (event) {
        var button = event.target.closest(
          ".shopify-pc__banner__btns button, .shopify-pc__banner__btns a, [class*='shopify-pc__banner__btns'] button, [class*='shopify-pc__banner__btns'] a, [class*='shopify-pc__prefs__btns'] button, [class*='shopify-pc__prefs__btns'] a, [class*='shopify-pc__prefs__footer'] button, [class*='shopify-pc__prefs__footer'] a"
        );

        if (!button) return;

        var label = (button.textContent || "").toLowerCase().trim();
        var shouldDismiss =
          label.includes("accept") ||
          label.includes("accepta") ||
          label.includes("accep") ||
          label.includes("refuz") ||
          label.includes("decline") ||
          label.includes("save") ||
          label.includes("salveaz");

        if (!shouldDismiss) return;

        setTimeout(hideCookiePrivacyUi, 40);
        setTimeout(hideCookiePrivacyUi, 220);
      },
      true
    );
  }

  function injectDesktopCookieBannerStyles() {
    if (document.getElementById("desktop-cookie-banner-style")) return;

    var style = document.createElement("style");
    style.id = "desktop-cookie-banner-style";
    style.textContent = `
      @media screen and (min-width: 990px) {
        .shopify-pc__banner__dialog,
        [class*="shopify-pc__banner__dialog"] {
          width: min(132rem, calc(100vw - 2.4rem)) !important;
          max-width: 132rem !important;
          min-height: auto !important;
          padding: 1.15rem 1.8rem !important;
          border-radius: 1.2rem !important;
          display: grid !important;
          grid-template-columns: minmax(0, 1fr) auto !important;
          align-items: center !important;
          gap: 0.8rem 1.6rem !important;
          box-sizing: border-box !important;
          margin-left: auto !important;
          margin-right: auto !important;
          left: 0 !important;
          right: 0 !important;
          background: rgb(var(--color-background) / 0.88) !important;
          color: rgb(var(--color-foreground)) !important;
          border: 1px solid rgb(var(--color-foreground) / 0.16) !important;
          box-shadow: 0 0.8rem 2.4rem rgb(0 0 0 / 0.18) !important;
          -webkit-backdrop-filter: blur(14px) saturate(130%) !important;
          backdrop-filter: blur(14px) saturate(130%) !important;
        }

        .shopify-pc__banner__dialog[hidden],
        [class*="shopify-pc__banner__dialog"][hidden],
        .shopify-pc__banner__dialog[aria-hidden="true"],
        [class*="shopify-pc__banner__dialog"][aria-hidden="true"],
        .shopify-pc__banner__dialog[class*="hidden"],
        [class*="shopify-pc__banner__dialog"][class*="hidden"] {
          display: none !important;
        }

        .shopify-pc__banner__body,
        [class*="shopify-pc__banner__body"],
        .shopify-pc__banner__content,
        [class*="shopify-pc__banner__content"] {
          margin: 0 !important;
          padding: 0 !important;
        }

        .shopify-pc__banner__dialog h2,
        .shopify-pc__banner__dialog h3,
        [class*="shopify-pc__banner__dialog"] h2,
        [class*="shopify-pc__banner__dialog"] h3 {
          margin: 0 0 0.55rem !important;
          font-size: 1.65rem !important;
          line-height: 1.38 !important;
          color: rgb(var(--color-foreground)) !important;
          font-weight: 700 !important;
        }

        .shopify-pc__banner__dialog p,
        [class*="shopify-pc__banner__dialog"] p {
          margin: 0 !important;
          font-size: 1.3rem !important;
          line-height: 1.5 !important;
          white-space: normal !important;
          color: rgb(var(--color-foreground) / 0.9) !important;
        }

        .shopify-pc__banner__btns,
        [class*="shopify-pc__banner__btns"] {
          display: flex !important;
          flex-wrap: nowrap !important;
          justify-content: end !important;
          align-items: center !important;
          gap: 0.7rem !important;
          margin: 0 !important;
          width: auto !important;
        }

        .shopify-pc__banner__btns > *,
        [class*="shopify-pc__banner__btns"] > * {
          width: auto !important;
          max-width: none !important;
          margin: 0 !important;
          white-space: nowrap !important;
        }

        .shopify-pc__banner__btns button,
        .shopify-pc__banner__btns a,
        [class*="shopify-pc__banner__btns"] button,
        [class*="shopify-pc__banner__btns"] a {
          min-height: 3rem !important;
          padding: 0.78rem 1.35rem !important;
          font-size: 1.15rem !important;
          line-height: 1.2 !important;
          border-radius: 0.7rem !important;
          border: 1px solid rgb(var(--color-button) / 0.7) !important;
          background: rgb(var(--color-button)) !important;
          color: rgb(var(--color-button-text)) !important;
          font-weight: 600 !important;
        }

        .shopify-pc__banner__btns button:hover,
        .shopify-pc__banner__btns a:hover,
        [class*="shopify-pc__banner__btns"] button:hover,
        [class*="shopify-pc__banner__btns"] a:hover {
          filter: brightness(1.06) !important;
        }
      }

      @media screen and (max-width: 989px) {
        .shopify-pc__banner__dialog,
        [class*="shopify-pc__banner__dialog"] {
          width: calc(100vw - 2.2rem) !important;
          max-width: 33rem !important;
          padding: 0.8rem 1rem !important;
          border-radius: 1rem !important;
          margin-left: auto !important;
          margin-right: auto !important;
          left: 0 !important;
          right: 0 !important;
          box-sizing: border-box !important;
          background: rgb(var(--color-background) / 0.9) !important;
          color: rgb(var(--color-foreground)) !important;
          border: 1px solid rgb(var(--color-foreground) / 0.16) !important;
          box-shadow: 0 0.6rem 1.8rem rgb(0 0 0 / 0.2) !important;
          -webkit-backdrop-filter: blur(12px) saturate(125%) !important;
          backdrop-filter: blur(12px) saturate(125%) !important;
        }

        .shopify-pc__banner__dialog[hidden],
        [class*="shopify-pc__banner__dialog"][hidden],
        .shopify-pc__banner__dialog[aria-hidden="true"],
        [class*="shopify-pc__banner__dialog"][aria-hidden="true"],
        .shopify-pc__banner__dialog[class*="hidden"],
        [class*="shopify-pc__banner__dialog"][class*="hidden"],
        [class*="shopify-pc__prefs__dialog"][hidden],
        [class*="shopify-pc__prefs__dialog"][aria-hidden="true"],
        [class*="shopify-pc__prefs__dialog"][class*="hidden"],
        .shopify-pc__prefs__dialog[hidden],
        .shopify-pc__prefs__dialog[aria-hidden="true"],
        .shopify-pc__prefs__dialog[class*="hidden"] {
          display: none !important;
        }

        .shopify-pc__banner__dialog h2,
        .shopify-pc__banner__dialog h3,
        [class*="shopify-pc__banner__dialog"] h2,
        [class*="shopify-pc__banner__dialog"] h3 {
          font-size: 1.42rem !important;
          line-height: 1.4 !important;
          margin-bottom: 0.4rem !important;
          color: rgb(var(--color-foreground)) !important;
          font-weight: 700 !important;
        }

        .shopify-pc__banner__dialog p,
        [class*="shopify-pc__banner__dialog"] p {
          font-size: 1.2rem !important;
          line-height: 1.5 !important;
          margin-bottom: 0.2rem !important;
          color: rgb(var(--color-foreground) / 0.92) !important;
        }

        .shopify-pc__banner__btns,
        [class*="shopify-pc__banner__btns"] {
          gap: 0.5rem !important;
          margin-top: 0 !important;
          margin-bottom: 0.1rem !important;
        }

        .shopify-pc__banner__btns button,
        .shopify-pc__banner__btns a,
        [class*="shopify-pc__banner__btns"] button,
        [class*="shopify-pc__banner__btns"] a {
          min-height: 2.45rem !important;
          padding: 0.5rem 0.95rem !important;
          font-size: 0.98rem !important;
          margin: 0 !important;
          border-radius: 0.6rem !important;
          border: 1px solid rgb(var(--color-button) / 0.7) !important;
          background: rgb(var(--color-button)) !important;
          color: rgb(var(--color-button-text)) !important;
          font-weight: 600 !important;
        }

        .shopify-pc__banner__btns button:hover,
        .shopify-pc__banner__btns a:hover,
        [class*="shopify-pc__banner__btns"] button:hover,
        [class*="shopify-pc__banner__btns"] a:hover {
          filter: brightness(1.06) !important;
        }

        .shopify-pc__banner__btns > *,
        [class*="shopify-pc__banner__btns"] > * {
          white-space: nowrap !important;
          margin: 0 !important;
        }

        .shopify-pc__banner__dialog a,
        [class*="shopify-pc__banner__dialog"] a {
          margin-top: 0 !important;
          margin-bottom: 0 !important;
        }

        /* ── Preferences panel – compact sizes (mobile) ── */
        [class*="shopify-pc__prefs__dialog"],
        .shopify-pc__prefs__dialog {
          max-height: 90vh !important;
          overflow: hidden !important;
          display: flex !important;
          flex-direction: column !important;
          box-sizing: border-box !important;
        }

        [class*="shopify-pc__prefs__dialog"] h2,
        [class*="shopify-pc__prefs__dialog"] h3,
        .shopify-pc__prefs__dialog h2,
        .shopify-pc__prefs__dialog h3 {
          font-size: 1.15rem !important;
          line-height: 1.35 !important;
          margin-bottom: 0.3rem !important;
        }

        [class*="shopify-pc__prefs__dialog"] p,
        .shopify-pc__prefs__dialog p {
          font-size: 1rem !important;
          line-height: 1.4 !important;
          margin-bottom: 0.2rem !important;
        }

        [class*="shopify-pc__prefs__content"],
        .shopify-pc__prefs__content {
          overflow-y: auto !important;
          flex: 1 1 auto !important;
          -webkit-overflow-scrolling: touch !important;
        }

        [class*="shopify-pc__prefs__btns"] button,
        [class*="shopify-pc__prefs__btns"] a,
        .shopify-pc__prefs__btns button,
        .shopify-pc__prefs__btns a,
        [class*="shopify-pc__prefs__footer"] button,
        [class*="shopify-pc__prefs__footer"] a,
        .shopify-pc__prefs__footer button,
        .shopify-pc__prefs__footer a {
          min-height: 2rem !important;
          padding: 0.35rem 0.7rem !important;
          font-size: 0.88rem !important;
          margin: 0 !important;
        }

        [class*="shopify-pc__prefs__dialog"] button:not([class*="close"]):not([class*="toggle"]),
        .shopify-pc__prefs__dialog button:not([class*="close"]):not([class*="toggle"]) {
          min-height: 2rem !important;
          padding: 0.35rem 0.7rem !important;
          font-size: 0.9rem !important;
        }

        /* ── Checkbox toggle rows (Necesar, Personalizare, etc.) ── */
        [class*="shopify-pc__prefs__toggle"],
        .shopify-pc__prefs__toggle {
          display: flex !important;
          align-items: center !important;
          gap: 0.5rem !important;
          padding: 0.4rem 0 !important;
          margin: 0 !important;
        }

        [class*="shopify-pc__prefs__toggle"] input[type="checkbox"],
        .shopify-pc__prefs__toggle input[type="checkbox"],
        [class*="shopify-pc__prefs__toggle"] input[type="checkbox"] + label::before,
        [class*="shopify-pc__prefs__checkbox"],
        .shopify-pc__prefs__checkbox {
          width: 1.4rem !important;
          height: 1.4rem !important;
          min-width: 1.4rem !important;
          min-height: 1.4rem !important;
          flex-shrink: 0 !important;
        }

        [class*="shopify-pc__prefs__toggle"] label,
        .shopify-pc__prefs__toggle label,
        [class*="shopify-pc__prefs__toggle-label"],
        .shopify-pc__prefs__toggle-label {
          font-size: 1rem !important;
          font-weight: 600 !important;
          line-height: 1.3 !important;
          margin: 0 !important;
        }

        [class*="shopify-pc__prefs__section"],
        .shopify-pc__prefs__section {
          padding: 0.35rem 0 !important;
          margin: 0 !important;
        }

        [class*="shopify-pc__prefs__section"] h3,
        .shopify-pc__prefs__section h3 {
          font-size: 1rem !important;
          font-weight: 600 !important;
          margin: 0 0 0.15rem !important;
        }

        [class*="shopify-pc__prefs__section"] p,
        .shopify-pc__prefs__section p {
          font-size: 0.88rem !important;
          line-height: 1.4 !important;
          margin: 0 !important;
        }
      }
    `;

    document.head.appendChild(style);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      injectDesktopCookieBannerStyles();
      bindCookieBannerImmediateDismiss();
    });
  } else {
    injectDesktopCookieBannerStyles();
    bindCookieBannerImmediateDismiss();
  }
})();


