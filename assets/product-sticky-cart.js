class StickyProVariantSelect extends HTMLElement {
  constructor() {
    super();
    this.addEventListener("change", this.onStickyVariantChange);
  }

  onStickyVariantChange() {
    const varOptions = this.querySelector("select");
    const productForm = document.querySelector(`#product-sticky-form-${this.dataset.section}`);
    const input = productForm?.querySelector('input[name="id"]');

    if (varOptions && input) {
      input.value = varOptions.value;
    }
  }
}

if (!customElements.get("sticky-variant-select")) {
  customElements.define("sticky-variant-select", StickyProVariantSelect);
}

document.addEventListener("DOMContentLoaded", () => {
  const stickySelectedVariant = document.querySelector("#sticky__variant");
  const stickyVariantInput = document.querySelector("#sticky__selected_variant_id");
  const stickyPriceValue = document.querySelector(".product__sticky_price-value");
  const buyButtonForm = document.querySelector(".product_buy_button_form");
  const productStickyWrapper = document.querySelector(".product__sticky");
  const mainVariantInput = buyButtonForm?.querySelector('input[name="id"]');
  const mobileQuery = window.matchMedia("(max-width: 991px)");

  const syncStickyPrice = () => {
    if (!stickyPriceValue) {
      return;
    }

    const salePrice = document.querySelector(".product__info-container .price__sale .price-item--sale");
    const regularPrice = document.querySelector(".product__info-container .price__regular .price-item--regular");
    const fallbackPrice = document.querySelector(".product__info-container .price .price-item");
    const activePrice = salePrice || regularPrice || fallbackPrice;

    if (activePrice?.textContent) {
      stickyPriceValue.textContent = activePrice.textContent.trim();
    }
  };

  const syncStickyVariant = () => {
    if (mainVariantInput && stickyVariantInput) {
      stickyVariantInput.value = mainVariantInput.value;
    }

    if (stickySelectedVariant && mainVariantInput) {
      stickySelectedVariant.value = mainVariantInput.value;
    }

    syncStickyPrice();
  };

  syncStickyVariant();

  if (!buyButtonForm || !productStickyWrapper) {
    return;
  }

  if (mainVariantInput) {
    const variantObserver = new MutationObserver(syncStickyVariant);
    variantObserver.observe(mainVariantInput, { attributes: true, attributeFilter: ["value"] });
    document.addEventListener("change", syncStickyVariant, true);
  }

  const updateStickyBar = () => {
    if (!mobileQuery.matches) {
      productStickyWrapper.classList.remove("sticky");
      document.body.classList.remove("sticky__cart");
      return;
    }

    const rect = buyButtonForm.getBoundingClientRect();
    const buyButtonVisible = rect.top < window.innerHeight && rect.bottom > 0;
    const passedBuyButton = rect.bottom < 0;

    if (passedBuyButton && !buyButtonVisible) {
      productStickyWrapper.classList.add("sticky");
      document.body.classList.add("sticky__cart");
    } else {
      productStickyWrapper.classList.remove("sticky");
      document.body.classList.remove("sticky__cart");
    }
  };

  window.addEventListener("scroll", updateStickyBar, { passive: true });
  window.addEventListener("resize", updateStickyBar);
  window.addEventListener("load", updateStickyBar);

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(updateStickyBar, {
      threshold: [0, 0.1, 0.3, 0.6, 1]
    });
    observer.observe(buyButtonForm);
  }

  updateStickyBar();
});
