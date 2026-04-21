if (!customElements.get("product-form")) {
  customElements.define(
    "product-form",
    class ProductForm extends HTMLElement {
      constructor() {
        super();

        this.form = this.querySelector("form");
        this.form.addEventListener("submit", this.onSubmitHandler.bind(this));
        this.buyNowButton = this.form.querySelector('[data-buy-now="true"]');
        this.buyNowButton?.addEventListener("click", (evt) => {
          evt.preventDefault();
          this.processProductAction(this.buyNowButton, true);
        });
        this.cartNotification = document.querySelector("cart-notification");
        this.cartItems = document.querySelector("cart-items");
        this.quickViewWarpper = document.getElementById("quickViewWrapper");
      }

      onSubmitHandler(evt) {
        evt.preventDefault();
        const submitButton = evt.submitter || this.form.querySelector('[name="add"]');
        this.processProductAction(submitButton, false);
      }

      processProductAction(submitButton, redirectToCheckout = false) {
        if (!submitButton || this.form.dataset.loading === "true") return;

        this.form.dataset.loading = "true";
        submitButton.setAttribute("aria-disabled", "true");

        if (redirectToCheckout) {
          submitButton.classList.add("loading-visible");
        } else {
          submitButton.setAttribute("disabled", true);
          submitButton.classList.add("loading");
        }

        let config = fetchConfig("javascript");
        config.headers["X-Requested-With"] = "XMLHttpRequest";
        delete config.headers["Content-Type"];

        let formData = new FormData(this.form);
        if (this.cartNotification) {
          formData.append(
            "sections",
            this.cartNotification
              .getSectionsToRender()
              .map((section) => section.id)
          );
          this.cartNotification.setActiveElement(document.activeElement);
        }

        if (this.cartItems) {
          formData.append(
            "sections",
            this.cartItems
              .getSectionsToRender()
              .map((section) => section.section)
          );
        }

        formData.append("sections_url", window.location.pathname);
        config.body = formData;

        fetch(`${routes.cart_add_url}`, config)
          .then((response) => response.json())
          .then((parsedState) => {
            if (parsedState.status) {
              this.handleErrorMessage(parsedState.description);
              return;
            }

            if (redirectToCheckout) {
              window.location.href = "/checkout";
              return;
            }

            if (this.cartNotification) {
              this.cartNotification.renderContents(parsedState);
            }

            if (this.cartItems) {
              this.cartItems.renderContents(parsedState);
            }

            document.querySelector(".product-form__error-message-wrapper")?.classList.add("no-js-inline");
          })
          .catch((e) => {
            console.error(e);
          })
          .finally(() => {
            delete this.form.dataset.loading;
            submitButton.classList.remove("loading", "loading-visible");
            submitButton.removeAttribute("disabled");
            submitButton.removeAttribute("aria-disabled");
            this.quickViewWarpper?.classList.remove("show__modal");
            document.body.classList.remove("overflow-hidden");
          });
      }

      handleErrorMessage(errorMessage = false) {
        this.errorMessageWrapper =
          this.errorMessageWrapper ||
          this.querySelector(".product-form__error-message-wrapper");
        this.errorMessage =
          this.errorMessage ||
          this.errorMessageWrapper.querySelector(
            ".product-form__error-message"
          );
        this.errorMessageWrapper.toggleAttribute("hidden", !errorMessage);

        if (errorMessage) {
          this.errorMessage.textContent = errorMessage;
          this.errorMessageWrapper.classList.remove("no-js-inline");
        }
      }
    }
  );
}
