import {auth, Client} from "twitter-api-sdk"
import {config} from "./config.js"
import crypto from "node:crypto"
import {ParaspaceMM, Provider, Environment, NetworkName, Types} from "paraspace-api"
import interval from "interval-promise"
import {logger} from "./logger.js"
import retry from "promise-retry"

export class BotClient {
  #authClient: auth.OAuth2User
  #client: Client
  #oauthState: string
  #isLogin: boolean
  #provider: Provider
  #currentHeight: number

  constructor() {
    this.#authClient = new auth.OAuth2User({
      client_id: config.twitter.client_id,
      client_secret: config.twitter.client_secret,
      callback: config.twitter.callback,
      scopes: ["tweet.read", "tweet.write", "users.read"]
    })
    this.#client = new Client(this.#authClient)
    this.#isLogin = false
    this.#provider = new Provider(Environment.PRODUCTION, NetworkName.mainnet, config.ethereum.endpoint)
  }

  isLogin() {
    return this.#isLogin
  }

  checkState(state: string) {
    logger.debug(`expected: ${this.#oauthState}, actual: ${state}`)
    return state === this.#oauthState
  }

  getAuthURL() {
    this.#oauthState = crypto.randomBytes(64).toString("hex");
    return this.#authClient.generateAuthURL({
      state: this.#oauthState,
      code_challenge_method: "s256"
    })
  }

  async run(code: string) {
    try {
      this.#isLogin = true
      await this.#authClient.requestAccessToken(code)

      await this.#provider.init();
      this.#currentHeight = await retry(() => this.#provider.getProvider().getBlockNumber());
      this.#reportTweets().then(() => interval(() => this.#reportTweets(), 10000))
    } catch (e) {
      console.log(JSON.stringify(e, null, 2))
    }
  }

  async dryrun() {
    await this.#provider.init()
    this.#generateTweets().then(() => interval(async () => {this.#generateTweets()}, 10000))
  }

  async #generateTweets() {
    const pool: Types.IPool = this.#provider.connectContract(ParaspaceMM.Pool)
    const provider = this.#provider.getProvider()
    const blockHeight = await retry(() => provider.getBlockNumber());

    logger.info({msg: `Round#${blockHeight}`, blockHeight, previousHeight: this.#currentHeight})
    if (blockHeight === this.#currentHeight) {
      return [] 
    }

    this.#currentHeight = blockHeight;
    const {transactions} = await retry(() => provider.getBlockWithTransactions(blockHeight))
    const tweets = transactions.filter(tx => tx.to === pool.address).map(tx => {
      const description = pool.interface.parseTransaction(tx)
      return [description.name, tx.hash]
    }).map(([name, hash]) => `${name}: https://etherscan.io/tx/${hash}`)
    logger.info({msg: `${tweets.length} transactions found`, txn: tweets.length})
    return tweets
  }

  async #reportTweets() {
    const tweets = await this.#generateTweets();
    if (tweets.length !== 0) {
      try {
        await retry(this.#client.tweets.createTweet({
          text: tweets.join("\n")
        }))
      } catch (e: any) {
        console.log(JSON.stringify(e, null, 2))
      }
    }
  }
}
