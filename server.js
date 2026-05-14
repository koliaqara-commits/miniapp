import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import TelegramBot from "node-telegram-bot-api";
import crypto from "crypto";

dotenv.config();

const app = express();

app.use(cors());

app.use(express.json());

const bot = new TelegramBot(
  process.env.BOT_TOKEN,
  {
    polling: true,
  }
);

const ADMIN_ID =
  Number(process.env.ADMIN_ID);

const users = {};

const deals = {};

function createUser(id) {
  if (!users[id]) {
    users[id] = {
      balances: {
        Stars: 0,
        TON: 0,
        USDT: 0,
        RUB: 0,
      },

      transactions: [],
    };
  }

  return users[id];
}

bot.onText(
  /\/start/,
  async (msg) => {
    const id = msg.from.id;

    createUser(id);

    bot.sendMessage(
      id,
      "Kasper connected."
    );
  }
);

bot.onText(
  /\/addbalance (.+) (.+) (.+)/,
  async (msg, match) => {
    if (msg.from.id !== ADMIN_ID)
      return;

    const userId = match[1];

    const amount = Number(match[2]);

    const currency = match[3];

    const user =
      createUser(userId);

    if (
      user.balances[currency] ===
      undefined
    ) {
      return bot.sendMessage(
        ADMIN_ID,
        "Unknown currency."
      );
    }

    user.balances[currency] += amount;

    user.transactions.unshift({
      title:
        "Админ пополнение",

      amount,

      currency,

      date:
        new Date().toLocaleString(
          "ru-RU"
        ),
    });

    bot.sendMessage(
      ADMIN_ID,
      `Пополнено:
${userId}
+${amount} ${currency}`
    );

    bot.sendMessage(
      userId,
      `Баланс пополнен:
+${amount} ${currency}`
    );
  }
);

app.get(
  "/api/user/:id",
  (req, res) => {
    const userId =
      req.params.id;

    const user =
      createUser(userId);

    res.json({
      balances:
        user.balances,

      transactions:
        user.transactions,
    });
  }
);

app.get(
  "/api/deals/:id",
  (req, res) => {
    const userId =
      req.params.id;

    if (!deals[userId]) {
      deals[userId] = [];
    }

    res.json(deals[userId]);
  }
);

app.post(
  "/api/deals/create",
  (req, res) => {
    const {
      userId,
      amount,
      currency,
      title,
      buyer,
    } = req.body;

    if (!deals[userId]) {
      deals[userId] = [];
    }

    const newDeal = {
      id: crypto.randomUUID(),

      tag: Math.random()
        .toString(36)
        .slice(2, 12),

      amount,

      currency,

      title,

      buyer,

      seller: "@kasper",

      status:
        "Ожидание оплаты",

      progress: 2,

      date:
        new Date().toLocaleString(
          "ru-RU"
        ),
    };

    deals[userId].unshift(
      newDeal
    );

    res.json({
      success: true,

      deal: newDeal,
    });
  }
);

app.listen(
  process.env.PORT,
  () => {
    console.log(
      "Server started"
    );
  }
);