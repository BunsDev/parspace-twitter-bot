# Para-Space twitter bot

A customize bot for syncing up transactions on paraspace mainnet to twitter


## Requirements 

1. Twitter [developer portal](https://developer.twitter.com/en/portal/dashboard)
2. High rate limits(at least 50 per second) ethereum mainnet endpoint

## Configuration

This bot is configured by environment variables. Before you running it, please make sure you have prepared the requirements mentioned above.

| Environment | Description | Default | Required |
|---|---|---|---|
|TWITTER_CLIENT_ID| Twitter App client id. You can find it in your twitter developer portal dashboard| "" | true |
|TWITTER_CLIENT_SECRET| Twitter App client secrect| "" | true |
|TWITTER_OAUTH_CALLBACK| Oauth2 callback uri | http://127.0.0.1:3000/callback | true |
|ETHEREUM_ENDPOINT| Ethereum mainnet endpoint | "" | true |

## Usage

1. Clone this repo
2. Run `pnpm install && pnpm build`
3. Run `pnpm start`
