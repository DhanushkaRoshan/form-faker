import { faker } from "@faker-js/faker/locale/en";

const MENU_ITEMS = [
  { id: "fill-name", title: "Full Name", tags: ["person", "name"] },
  { id: "fill-firstname", title: "First Name", tags: ["person", "name"] },
  { id: "fill-lastname", title: "Last Name", tags: ["person", "name"] },
  { id: "fill-email", title: "Email", tags: ["contact", "email"] },
  { id: "fill-phone", title: "Phone Number", tags: ["contact", "phone"] },
  { id: "fill-address", title: "Street Address", tags: ["location"] },
  { id: "fill-city", title: "City", tags: ["location"] },
  { id: "fill-zip", title: "Zip Code", tags: ["location"] },
  { id: "fill-country", title: "Country", tags: ["location"] },
  { id: "fill-company", title: "Company", tags: ["company"] },
  { id: "fill-username", title: "Username", tags: ["account"] },
  { id: "fill-password", title: "Password", tags: ["account", "password"] },
  { id: "fill-url", title: "URL", tags: ["web", "url"] },
  { id: "fill-lorem", title: "Lorem Sentence", tags: ["text"] },
  { id: "fill-number", title: "Random Number", tags: ["number"] },
  { id: "fill-date", title: "Date (YYYY-MM-DD)", tags: ["date"] },
  { id: "fill-uuid", title: "UUID", tags: ["misc"] },
  { id: "fill-color", title: "Hex Color", tags: ["color"] },
];

const TYPE_TAG_MAP = {
  email: ["email", "contact"],
  tel: ["phone", "contact"],
  url: ["web", "url"],
  number: ["number"],
  password: ["password", "account"],
  date: ["date"],
  "datetime-local": ["date"],
  month: ["date"],
  week: ["date"],
  color: ["color"],
  textarea: ["text"],
};

const HINT_RULES = [
  { patterns: ["email", "e-mail"], tags: ["email", "contact"] },
  { patterns: ["phone", "tel", "mobile", "fax"], tags: ["phone", "contact"] },
  { patterns: ["first_name", "firstname", "fname"], tags: ["person", "name"] },
  { patterns: ["last_name", "lastname", "lname", "surname"], tags: ["person", "name"] },
  { patterns: ["fullname", "full_name", "your name"], tags: ["person", "name"] },
  { patterns: ["name"], tags: ["person", "name"] },
  { patterns: ["username", "user_name", "login", "handle"], tags: ["account"] },
  { patterns: ["password", "passwd", "secret"], tags: ["password", "account"] },
  { patterns: ["address", "street", "addr"], tags: ["location"] },
  { patterns: ["city", "town", "locality"], tags: ["location"] },
  { patterns: ["zip", "postal", "postcode"], tags: ["location"] },
  { patterns: ["country", "region", "state", "province"], tags: ["location"] },
  { patterns: ["company", "organization", "org", "employer"], tags: ["company"] },
  { patterns: ["url", "website", "homepage", "link"], tags: ["web", "url"] },
  { patterns: ["date", "dob", "birthday"], tags: ["date"] },
  { patterns: ["color", "colour"], tags: ["color"] },
  { patterns: ["comment", "message", "bio", "description", "about", "note"], tags: ["text"] },
];

const GENERATORS = {
  "fill-name": () => faker.person.fullName(),
  "fill-firstname": () => faker.person.firstName(),
  "fill-lastname": () => faker.person.lastName(),
  "fill-email": () => faker.internet.email(),
  "fill-phone": () => faker.phone.number(),
  "fill-address": () => faker.location.streetAddress(),
  "fill-city": () => faker.location.city(),
  "fill-zip": () => faker.location.zipCode(),
  "fill-country": () => faker.location.country(),
  "fill-company": () => faker.company.name(),
  "fill-username": () => faker.internet.userName(),
  "fill-password": () => faker.internet.password({ length: 16 }),
  "fill-url": () => faker.internet.url(),
  "fill-lorem": () => faker.lorem.sentence(),
  "fill-number": () => String(faker.number.int({ min: 1, max: 10000 })),
  "fill-date": () => faker.date.past().toISOString().split("T")[0],
  "fill-uuid": () => faker.string.uuid(),
  "fill-color": () => faker.color.rgb(),
};

function generateValue(type) {
  return (GENERATORS[type] || (() => faker.lorem.word()))();
}

function getHint(fieldInfo) {
  return [fieldInfo.name, fieldInfo.id, fieldInfo.type, fieldInfo.placeholder, fieldInfo.label, fieldInfo.autocomplete]
    .join(" ")
    .toLowerCase();
}

function detectRelevantTags(fieldInfo) {
  const tags = new Set(TYPE_TAG_MAP[fieldInfo.type] || []);
  const hint = getHint(fieldInfo);

  for (const rule of HINT_RULES) {
    if (rule.patterns.some((p) => hint.includes(p))) {
      rule.tags.forEach((t) => tags.add(t));
    }
  }
  return tags;
}

function getRelevantItems(fieldInfo) {
  const tags = detectRelevantTags(fieldInfo);
  if (tags.size === 0) return null;

  const filtered = MENU_ITEMS.filter((item) => item.tags.some((t) => tags.has(t)));
  return filtered.length < MENU_ITEMS.length ? filtered : null;
}

function guessFieldType(fieldInfo) {
  const hint = getHint(fieldInfo);

  if (hint.includes("email") || hint.includes("e-mail")) return "fill-email";
  if (hint.includes("phone") || hint.includes("tel") || hint.includes("mobile")) return "fill-phone";
  if (hint.includes("first") && hint.includes("name")) return "fill-firstname";
  if (hint.includes("last") && hint.includes("name")) return "fill-lastname";
  if ((hint.includes("full") && hint.includes("name")) || (hint.includes("name") && !hint.includes("user") && !hint.includes("company"))) return "fill-name";
  if (hint.includes("username") || hint.includes("user_name") || hint.includes("login")) return "fill-username";
  if (hint.includes("password") || hint.includes("passwd")) return "fill-password";
  if (hint.includes("address") || hint.includes("street")) return "fill-address";
  if (hint.includes("city") || hint.includes("town")) return "fill-city";
  if (hint.includes("zip") || hint.includes("postal")) return "fill-zip";
  if (hint.includes("country")) return "fill-country";
  if (hint.includes("company") || hint.includes("organization")) return "fill-company";
  if (hint.includes("url") || hint.includes("website")) return "fill-url";
  if (hint.includes("date") || fieldInfo.type === "date") return "fill-date";
  if (hint.includes("color") || fieldInfo.type === "color") return "fill-color";
  if (fieldInfo.type === "number") return "fill-number";
  if (fieldInfo.type === "textarea" || hint.includes("comment") || hint.includes("message") || hint.includes("bio") || hint.includes("description")) return "fill-lorem";

  return "fill-lorem";
}

// Context menu setup

function createMenu(id, props) {
  browser.contextMenus.create({ id, parentId: "random-inputs", contexts: ["editable"], ...props });
}

browser.contextMenus.create({ id: "random-inputs", title: "🎲 Random Inputs", contexts: ["editable"] });
createMenu("fill-suggested", { title: "✨ Auto Fill (Best Guess)" });
createMenu("sep-suggested", { type: "separator" });

MENU_ITEMS.forEach((item) => createMenu(item.id, { title: item.title }));

createMenu("sep-more", { type: "separator", visible: false });
createMenu("more-options", { title: "📋 All Options", visible: false });

MENU_ITEMS.forEach((item) => {
  browser.contextMenus.create({
    id: "more-" + item.id,
    title: item.title,
    parentId: "more-options",
    contexts: ["editable"],
  });
});

createMenu("sep-fill-all", { type: "separator" });
createMenu("fill-all", { title: "⚡ Fill All Fields on Page" });

// Dynamic menu filtering based on detected field type

let lastFieldInfo = null;

browser.runtime.onMessage.addListener((message) => {
  if (message.action === "field-detected") {
    lastFieldInfo = message.fieldInfo;
  }
});

browser.contextMenus.onShown.addListener((info) => {
  if (!info.contexts.includes("editable") || !lastFieldInfo) return;

  const relevant = getRelevantItems(lastFieldInfo);
  const hasFiltered = relevant !== null;

  const updates = MENU_ITEMS.map((item) =>
    browser.contextMenus.update(item.id, {
      visible: hasFiltered ? relevant.some((r) => r.id === item.id) : true,
    })
  );

  updates.push(
    browser.contextMenus.update("more-options", { visible: hasFiltered }),
    browser.contextMenus.update("sep-more", { visible: hasFiltered })
  );

  const guessed = guessFieldType(lastFieldInfo);
  const label = MENU_ITEMS.find((i) => i.id === guessed)?.title || "Best Guess";
  updates.push(browser.contextMenus.update("fill-suggested", { title: `✨ Auto Fill → ${label}` }));

  Promise.all(updates).then(() => browser.contextMenus.refresh());
});

browser.contextMenus.onHidden.addListener(() => {
  lastFieldInfo = null;
});

// Handle menu clicks

browser.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "fill-all") {
    browser.tabs.sendMessage(tab.id, { action: "get-all-fields" }).then((fields) => {
      const values = fields.map((field) => ({
        index: field.index,
        value: generateValue(guessFieldType(field)),
      }));
      browser.tabs.sendMessage(tab.id, { action: "fill-all-fields", values });
    });
    return;
  }

  if (info.menuItemId === "fill-suggested") {
    const type = lastFieldInfo ? guessFieldType(lastFieldInfo) : "fill-lorem";
    browser.tabs.sendMessage(tab.id, { action: "fill-field", value: generateValue(type) });
    return;
  }

  let id = info.menuItemId;
  if (id.startsWith("more-")) id = id.slice(5);

  if (id.startsWith("fill-")) {
    browser.tabs.sendMessage(tab.id, { action: "fill-field", value: generateValue(id) });
  }
});
