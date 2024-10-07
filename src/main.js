const axios = require("axios");
const cheerio = require("cheerio");
const { Telegraf } = require("telegraf");

const token = "Adicione o Token do seu bot";
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
  const url = message.text.match(linkRegex); //Acha o link do site no meio da mensagem
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
    }) //Pega o nome de todos os planos disponiveis no site

    $('.currency').each((i,   element) => {
      const priceText = $(element).text().trim();
      const price = parseFloat(priceText);
      if (price > 0) {
        prices.push(price);
      }
    });//Pega o preço inteiro dos planos

    $('.cent').each((i,   element) => {
      if(!isNaN(element)){
        const centText = $(element).text().trim();
        const cent = parseFloat(centText);
        prices[i] =+ (cent/100)
      }
    });/*Verifica se há centavos no preço, se houver os adiciona ao valor do preço para ser informado 
    ao cliente
    */

    if (prices.length > 0) {//Se houver preços identifficados dentro da lista
      lowestPlanPrice = Math.min(...prices);//Define o menor
      const lowestPriceIndex = prices.findIndex(price => price === lowestPlanPrice);//Pega o indice do menor preço
      lowestPlanName = planNames[lowestPriceIndex]//Utiliza o indice para pegar o nome do respectivo plano
      await ctx.reply(
        `O plano pago mais barato é o "${lowestPlanName}" e custa R$${lowestPlanPrice}`
      );
    } else {
      await ctx.reply("Nenhum preço encontrado");
    }//Devolve essa mensagem caso nenhum plano não seja detectado

  } catch (error) {
    console.error("Erro ao buscar os dados:", error);
    await ctx.reply("Ocorreu um erro ao buscar os dados.");
  }
}

main();
