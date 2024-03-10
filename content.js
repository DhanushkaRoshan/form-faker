let lastRightClickedElement = null;

document.addEventListener("contextmenu", (e) => {
  const el = e.target;
  if (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable) {
    lastRightClickedElement = el;
    browser.runtime.sendMessage({
      action: "field-detected",
      fieldInfo: getFieldInfo(el),
    });
  }
}, true);

function getFieldInfo(element) {
  return {
    name: element.name || "",
    id: element.id || "",
    type: element.type || element.tagName.toLowerCase(),
    placeholder: element.placeholder || "",
    autocomplete: element.autocomplete || "",
    label: element.labels?.[0]?.textContent?.trim() || element.getAttribute("aria-label") || "",
  };
}

function setNativeValue(element, value) {
  const setter =
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set ||
    Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value")?.set;

  if (setter) setter.call(element, value);
  else element.value = value;

  element.dispatchEvent(new Event("input", { bubbles: true }));
  element.dispatchEvent(new Event("change", { bubbles: true }));
}

function getEditableFields() {
  const selector = [
    'input:not([type="hidden"]):not([type="submit"]):not([type="button"])',
    ':not([type="reset"]):not([type="checkbox"]):not([type="radio"])',
    ':not([type="file"]):not([type="image"]):not([readonly]):not([disabled])',
  ].join("");
  const elements = document.querySelectorAll(
    `${selector}, textarea:not([readonly]):not([disabled])`
  );

  return Array.from(elements).map((el, i) => ({ ...getFieldInfo(el), index: i }));
}

browser.runtime.onMessage.addListener((message) => {
  if (message.action === "fill-field" && lastRightClickedElement) {
    if (lastRightClickedElement.isContentEditable) {
      lastRightClickedElement.textContent = message.value;
      lastRightClickedElement.dispatchEvent(new Event("input", { bubbles: true }));
    } else {
      setNativeValue(lastRightClickedElement, message.value);
    }
  }

  if (message.action === "get-all-fields") {
    return Promise.resolve(getEditableFields());
  }

  if (message.action === "fill-all-fields") {
    const elements = document.querySelectorAll(
      'input:not([type="hidden"]):not([type="submit"]):not([type="button"]):not([type="reset"]):not([type="checkbox"]):not([type="radio"]):not([type="file"]):not([type="image"]):not([readonly]):not([disabled]), textarea:not([readonly]):not([disabled])'
    );
    message.values.forEach(({ index, value }) => {
      if (elements[index]) setNativeValue(elements[index], value);
    });
  }
});
