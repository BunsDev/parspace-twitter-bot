import {auth, Client} from "twitter-api-sdk"
import {config} from "./config.js"
import crypto from "node:crypto"
import {ParaspaceMM, Provider, Environment, NetworkName, Types} from "paraspace-api"
import interval from "interval-promise"

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
    console.log(`expected: ${this.#oauthState}, actual: ${state}`)
    return state === this.#oauthState
  }

  getAuthURL() {
    this.#oauthState = crypto.randomBytes(64).toString("hex");
    this.#oauthState = "whatthefuck"
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
      this.#currentHeight = await this.#provider.getProvider().getBlockNumber();
      this.#reportTweets()
    } catch (e) {
      console.log(JSON.stringify(e, null, 2))
    }
  }

  async dryrun() {
    await this.#provider.init()
    console.log(new Date().toString())
    this.#generateTweets().then(() => interval(async () => {this.#generateTweets()}, 10000))
  }

  async #generateTweets() {
    const pool: Types.IPool = this.#provider.connectContract(ParaspaceMM.Pool)
    const provider = this.#provider.getProvider()
    // const blockHeight = await provider.getBlockNumber();
    const blockHeight = 16313638

    if (blockHeight === this.#currentHeight) {
      return null
    }

    const {transactions} = await provider.getBlockWithTransactions(16313638)
    const tweets = transactions.filter(tx => tx.to === pool.address).map(tx => {
      const description = pool.interface.parseTransaction(tx)
      return [description.name, tx.hash]
    }).map(([name, hash]) => `${name}: ${hash}`)
    return tweets.join("\n")
  }

  async #reportTweets() {
    const tweets = await this.#generateTweets();
    if(tweets !== null) {
      await this.#client.tweets.createTweet({
        text: await this.#generateTweets()
      })
    }
  }
}
