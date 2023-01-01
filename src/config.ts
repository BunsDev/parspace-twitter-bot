import dotenv from "dotenv"
dotenv.config()

export const config = {
  twitter: {
    client_id: (process.env.TWITTER_CLIENT_ID ?? "").trim(),
    client_secret: (process.env.TWITTER_CLIENT_SECRET ?? "").trim(),
    callback: (process.env.TWITTER_OAUTH_CALLBACK ?? "http://127.0.0.1:3000/callback").trim()
  },
  ethereum: {
    endpoint: (process.env.ETHEREUM_ENDPOINT ?? "").trim()
  }
}
