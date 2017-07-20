import "./style.scss";

const VALIDATE = "validate";
const VALIDATE_POPUP = "validate-popup";
const DATA_VALIDATE = "data-validate";
const VALIDATE_ERROR = "validate-error";
const ACTIVE = "active";
const Events = ["change", "paste", "blur", "keyup"];

import { Rules } from "./rules";

const getMessage = el => {
  const types = el.getAttribute(DATA_VALIDATE).split(",").map(type => {
    return type.trim();
  });
  return types
    .filter(type => {
      return !Rules[type].method(el);
    })
    .map(type => {
      return Rules[type].message;
    })
    .join(", ");
};

const onAction = e => {
  const el = e.target;
  if (!el.matches("." + VALIDATE)) {
    return;
  }
  const message = getMessage(el);

  el.classList.toggle(VALIDATE_ERROR, !!message);
  let popup = el.previousElementSibling;
  if (message) {
    if (!popup || !popup.matches("." + VALIDATE_POPUP)) {
      popup = document.createElement("div");
      popup.classList.add(VALIDATE_POPUP);
      const wrap = document.createElement("div");
      wrap.appendChild(popup.cloneNode(true));
      el.insertAdjacentHTML("beforebegin", wrap.innerHTML);
      popup = el.previousElementSibling;
    }
    popup.innerHTML = message;
    window.setTimeout(() => {
      const left =
        el.clientWidth < popup.clientWidth
          ? el.offsetLeft + el.offsetWidth / 2 - 14
          : el.offsetLeft + el.clientWidth - popup.clientWidth + 1;
      const top = el.offsetTop;
      popup.style.left = left + "px";
      popup.style.top = top + "px";
      popup.style.marginTop = -(popup.clientHeight + 8) + "px";
      popup.classList.toggle(ACTIVE, true);
    }, 0);
  } else {
    popup && popup.classList.toggle(ACTIVE, false);
  }
};

const getEl = (el = "body") =>
  typeof el === "string" ? document.querySelector(el) : el;

const onClick = e => {
  const el = e.target;
  if (!el.matches("." + VALIDATE_POPUP)) {
    return;
  }
  const next = el.nextElementSibling;
  if (next.matches("." + VALIDATE)) {
    next.classList.toggle(VALIDATE_ERROR, false);
  }
  el.classList.toggle(ACTIVE, false);
};

const onSubmit = e => {
  const isValid = validation.validate(e.target);
  if (isValid) {
    return true;
  }
  e.preventDefault();
  return false;
};

const setupEventHandlers = (el, setup) => {
  el = getEl(el);
  const action = setup ? "addEventListener" : "removeEventListener";
  const els = el.querySelectorAll("." + VALIDATE);
  Array.prototype.forEach.call(els, el => {
    Events.forEach(e => {
      el[action](e, onAction);
    });
  });

  document[action]("click", onClick);

  if (el.nodeName === "FORM") {
    el[action]("submit", onSubmit);
  }
};

const validation = {
  /**
   * Initialize the validation fields
   * 
   * @param {Element|string} Container or specific form
   */
  init: el => {
    setupEventHandlers(el, true);
  },

  /**
   * Deactivate the validation fields
   * 
   * @param {Element|string} Container or specific form
   */
  destroy: el => {
    validation.hide(el);
    setupEventHandlers(el, false);
  },

  /**
   * Hide all opened popups inside of the containers
   * 
   * @param {Element|string} Container or specific form
   */
  hide: el => {
    el = getEl(el);
    const els = el.querySelectorAll("." + VALIDATE_POPUP);
    Array.prototype.forEach.call(els, el => {
      el.classList.toggle(ACTIVE, false);
      const next = el.nextElementSibling;
      if (next.matches("." + VALIDATE)) {
        next.classList.toggle(VALIDATE_ERROR, false);
      }      
    });
  },

  /**
   * Show error popups inside of the container
   * 
   * @param {Element} el Container
   */
  highlight: el => {
    el = getEl(el);
    const els = el.querySelectorAll("." + VALIDATE);
    Array.prototype.forEach.call(els, el => {
      const event = document.createEvent("HTMLEvents");
      event.initEvent("blur", true, false);
      el.dispatchEvent(event);
    });
  },

  /**
   * Check if all input fields inside of the container are valid
   * 
   * @param {Element} el Container
   * @returns {boolean} True if all input fields inside of the container are valid
   */
  isValid: el => {
    el = getEl(el);
    const els = el.querySelectorAll("." + VALIDATE);
    const isValid = Array.prototype.every.call(els, el => {
      return !getMessage(el);
    });
    return isValid;
  },

  /**
   * Validate all input fields in the DOM container 
   * 
   * @param {Element} el Container
   * @returns {boolean} True if all input fields inside of the container are valid
   */
  validate: el => {
    validation.highlight(el);
    return validation.isValid(el);
  },

  /**
   * Returns the set of the predefined rules
   * 
   * @returns {object} Rules
   * 
   * ruleName: {
   *   message: "Message when element didn't pass the rule",
   *   method: el => boolean
   * }
   * 
   */
  getRules: () => {
    return Rules;
  }
};

export default validation;
