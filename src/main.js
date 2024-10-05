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
  const linkRegex = /https:\/\/www\.divulgadorinteligente\.com\//i;
  const url = message.text.match(linkRegex);
  let lowestPlanPrice = 0;
  let lowestPlanName = ""; 

  try {
    await ctx.reply("Buscando dados...");
    const response = await axios.get(url);

    const $ = cheerio.load(response.data);
    const prices = [];
    const planNames = [];

    $('.head').each((i,element) => {
      const name = $(element).text().trim();
      planNames.push(name);
    })

    $('.currency').each((i,   element) => {
      const priceText = $(element).text().trim();
      const price = parseFloat(priceText);
      if (price > 0) {
        prices.push(price);
      }
    });

    $('.cent').each((i,   element) => {
      if(!isNaN(element)){
        const centText = $(element).text().trim();
        const cent = parseFloat(centText);
        prices[i] =+ (cent/100)
      }
    });

    if (prices.length > 0) {
      lowestPlanPrice = Math.min(...prices);
      const lowestPriceIndex = prices.findIndex(price => price === lowestPlanPrice);
      lowestPlanName = planNames[lowestPriceIndex]
      await ctx.reply(
        `O plano pago mais barato é o "${lowestPlanName}" e custa R$${lowestPlanPrice}`
      );
    } else {
      await ctx.reply("Nenhum preço encontrado");
    }

  } catch (error) {
    console.error("Erro ao buscar os dados:", error);
    await ctx.reply("Ocorreu um erro ao buscar os dados.");
  }
}

main();
