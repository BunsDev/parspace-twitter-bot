import Koa from "koa"
import Router from "@koa/router"
import {BotClient} from "./client.js"
import {logger} from "./logger.js"

const bot = new BotClient()

const router = new Router()
router.get("/", async (ctx) => {
  if (bot.isLogin()) {
    ctx.body = "Bot is running"
  } else {
    ctx.body = 'Please goto <a href="/login"> login </a>'
  }
})

router.get("/login", async (ctx) => {
  if (bot.isLogin()) {
    ctx.body = "Bot is running"
    return
  }
  ctx.response.redirect(bot.getAuthURL())
})

router.get("/callback", async (ctx) => {
  const {code, state} = ctx.query as Record<string, string>;
  if (!bot.checkState(state)) {
    return ctx.throw("State isn't matching")
  }
  await bot.run(code);
  ctx.response.redirect("/login")
})

const app = new Koa();
app.use(router.routes()).use(router.allowedMethods())
app.listen(3000)
logger.info({msg: "App is running. Please login"})

process.on("SIGINT", () => {
  process.exit(0)
})
