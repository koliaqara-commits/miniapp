const tg = window.Telegram?.WebApp;

if (tg) {
  tg.ready();

  tg.expand();

  tg.setHeaderColor("#f4f5fb");

  tg.setBackgroundColor("#f4f5fb");
}

const API_URL =
  "http://localhost:3000";

const state = {
  filter: "active",

  balances: {
    Stars: 0,
    TON: 0,
    USDT: 0,
    RUB: 0,
  },

  deals: [],

  transactions: [],
};

const views =
  document.querySelectorAll(".view");

const navItems =
  document.querySelectorAll(".nav-item");

const dealList =
  document.querySelector("#dealList");

const balanceGrid =
  document.querySelector("#balanceGrid");

const transactionList =
  document.querySelector(
    "#transactionList"
  );

const dealForm =
  document.querySelector("#dealForm");

const dealPage =
  document.querySelector("#dealPage");

function showView(id) {
  views.forEach((view) =>
    view.classList.toggle(
      "active",
      view.id === id
    )
  );

  navItems.forEach((item) =>
    item.classList.toggle(
      "active",
      item.dataset.view === id
    )
  );
}

function formatAmount(
  amount,
  currency
) {
  const value = Number(amount)
    .toLocaleString("ru-RU", {
      maximumFractionDigits: 2,
      minimumFractionDigits:
        Number.isInteger(
          Number(amount)
        )
          ? 0
          : 2,
    });

  return `${value} ${currency}`;
}

async function loadUserData() {
  const user =
    tg?.initDataUnsafe?.user;

  if (!user) return;

  try {
    const response = await fetch(
      `${API_URL}/api/user/${user.id}`
    );

    const data =
      await response.json();

    state.balances =
      data.balances;

    state.transactions =
      data.transactions;

    renderBalances();

    renderTransactions();
  } catch (error) {
    console.error(error);
  }
}

async function loadDeals() {
  const user =
    tg?.initDataUnsafe?.user;

  if (!user) return;

  try {
    const response = await fetch(
      `${API_URL}/api/deals/${user.id}`
    );

    const deals =
      await response.json();

    state.deals = deals;

    renderDeals();
  } catch (error) {
    console.error(error);
  }
}

async function createDeal(data) {
  const user =
    tg?.initDataUnsafe?.user;

  if (!user) return;

  const response = await fetch(
    `${API_URL}/api/deals/create`,
    {
      method: "POST",

      headers: {
        "Content-Type":
          "application/json",
      },

      body: JSON.stringify({
        userId: user.id,

        ...data,
      }),
    }
  );

  const result =
    await response.json();

  return result.deal;
}

function renderDeals() {
  const deals =
    state.filter === "active"
      ? state.deals.filter(
          (deal) =>
            deal.status !== "Получена"
        )
      : state.deals;

  if (!deals.length) {
    dealList.innerHTML = `
      <div class="empty-state">
        У вас пока нет сделок
      </div>
    `;

    return;
  }

  dealList.innerHTML = deals
    .map(
      (deal) => `
      <article
        class="deal-card"
        data-id="${deal.id}"
      >

        <div class="deal-top">

          <div class="deal-tag">
            #${deal.tag}
          </div>

          <div class="status">
            ${deal.status}
          </div>

        </div>

        <div class="asset-row">

          <div class="asset-icon">
            ${
              deal.currency === "TON"
                ? "T"
                : deal.currency === "USDT"
                ? "$"
                : "★"
            }
          </div>

          <div>

            <div class="asset-amount">
              ${formatAmount(
                deal.amount,
                deal.currency
              )}
            </div>

            <div class="asset-title">
              ${deal.title}
            </div>

          </div>

        </div>

        <div class="deal-meta">

          <div>
            Покупатель:
            ${deal.buyer}
          </div>

          <div>
            Продавец:
            ${deal.seller}
          </div>

        </div>

        <div class="deal-date">
          ${deal.date}
        </div>

      </article>
    `
    )
    .join("");
}

function openDeal(id) {
  const deal = state.deals.find(
    (item) => item.id === id
  );

  if (!deal) return;

  dealPage.innerHTML = `
    <article class="deal-page-card">

      <div class="deal-page-head">

        <div>

          <div class="deal-page-tag">
            #${deal.tag}
          </div>

          <div class="deal-page-status">
            ${deal.status}
          </div>

        </div>

        <div class="deal-page-amount">
          ${formatAmount(
            deal.amount,
            deal.currency
          )}
        </div>

      </div>

      <div class="deal-info-list">

        <div class="deal-info-item">
          <span>Покупатель</span>
          <strong>${deal.buyer}</strong>
        </div>

        <div class="deal-info-item">
          <span>Продавец</span>
          <strong>${deal.seller}</strong>
        </div>

        <div class="deal-info-item">
          <span>Дата</span>
          <strong>${deal.date}</strong>
        </div>

      </div>

    </article>
  `;

  showView("dealView");
}

function renderBalances() {
  balanceGrid.innerHTML =
    Object.entries(state.balances)
      .map(
        ([currency, amount]) => `
        <article class="balance-card">

          <div class="balance-currency">
            ${currency}
          </div>

          <div class="balance-value">
            ${formatAmount(
              amount,
              currency
            )}
          </div>

        </article>
      `
      )
      .join("");
}

function renderTransactions() {
  if (
    !state.transactions.length
  ) {
    transactionList.innerHTML = `
      <div class="empty-state">
        История транзакций пуста
      </div>
    `;

    return;
  }

  transactionList.innerHTML =
    state.transactions
      .map(
        (item) => `
        <article class="transaction-card">

          <div class="transaction-icon">
            ${
              item.currency === "TON"
                ? "T"
                : item.currency === "Stars"
                ? "★"
                : "$"
            }
          </div>

          <div class="transaction-main">

            <p class="transaction-title">
              ${item.title}
            </p>

            <div class="transaction-date">
              ${item.date}
            </div>

          </div>

          <div class="transaction-amount">
            ${formatAmount(
              item.amount,
              item.currency
            )}
          </div>

        </article>
      `
      )
      .join("");
}

dealForm.addEventListener(
  "submit",
  async (event) => {
    event.preventDefault();

    const form = new FormData(
      dealForm
    );

    const currency =
      form.get("currency");

    const amount = Number(
      form.get("amount")
    );

    const newDeal =
      await createDeal({
        amount,

        currency,

        title: form.get("type"),

        buyer: form.get("buyer"),
      });

    state.deals.unshift(newDeal);

    renderDeals();

    dealForm.reset();

    showView("dealsView");

    tg?.HapticFeedback?.notificationOccurred?.(
      "success"
    );
  }
);

document
  .querySelectorAll(".segment")
  .forEach((button) => {
    button.addEventListener(
      "click",
      () => {
        state.filter =
          button.dataset.filter;

        document
          .querySelectorAll(
            ".segment"
          )
          .forEach((item) =>
            item.classList.toggle(
              "active",
              item === button
            )
          );

        renderDeals();
      }
    );
  });

navItems.forEach((item) => {
  item.addEventListener(
    "click",
    () =>
      showView(
        item.dataset.view
      )
  );
});

document
  .querySelector("#openCreate")
  ?.addEventListener(
    "click",
    () =>
      showView(
        "createView"
      )
  );

dealList.addEventListener(
  "click",
  (event) => {
    const card =
      event.target.closest(
        ".deal-card"
      );

    if (!card) return;

    openDeal(card.dataset.id);
  }
);

document
  .querySelector("#backDeals")
  ?.addEventListener(
    "click",
    () =>
      showView(
        "dealsView"
      )
  );

function hydrateTelegramProfile() {
  const user =
    tg?.initDataUnsafe?.user;

  if (!user) return;

  const name = [
    user.first_name,
    user.last_name,
  ]
    .filter(Boolean)
    .join(" ");

  document.querySelector(
    "#profileName"
  ).textContent =
    name || "Kasper user";

  document.querySelector(
    "#profileMeta"
  ).textContent = user.username
    ? `@${user.username}`
    : `ID ${user.id}`;

  document.querySelector(
    "#avatar"
  ).textContent = (
    user.first_name || "K"
  )
    .slice(0, 1)
    .toUpperCase();
}

hydrateTelegramProfile();

renderDeals();

renderBalances();

renderTransactions();

loadDeals();

loadUserData();