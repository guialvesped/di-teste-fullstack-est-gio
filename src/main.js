const axios = require("axios");
const cheerio = require("cheerio");
const { Telegraf } = require("telegraf");

const token = "8053918631:AAE8ZpGUeaueV396UOYhuCxTNKDog_664m0";
const bot = new Telegraf(token);

async function main() {
  bot.start(async (ctx) => {
    return ctx.reply("Olá :)");
  });

  bot.hears(/divulgadorinteligente.com/i, getLowestPrice);

  bot.launch();
  console.log("bot is listening...");
}

async function getLowestPrice(ctx) {
  const { message } = ctx.update;
  const url = message.text;
  let lowestPlanPrice = 0;
  let lowestPlanName = ""; 

  try {
    await ctx.reply("Buscando dados...");
    const response = await axios.get(url);

    const $ = cheerio.load(response.data);
    const prices = [];

    $('.currency').each((element) => {
      const priceText = $(element).text().trim();
      const price = parseFloat(priceText);
      if (price > 0) {
        prices.push(price);
      }
    });

    if (prices.length > 0) {
      lowestPlanPrice = Math.min(...prices);
      await ctx.reply(
        `O plano pago mais barato é o Plano X e custa "${lowestPlanPrice}"`
      );
    } else {
      await ctx.reply("Nenhum preço encontrado");
    }

  } catch (error) {
    await ctx.reply("Ocorreu um erro ao buscar os dados.");
  }
}

main();
