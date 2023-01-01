interface Store {
  twitter: {
    oauthState?: string,
    login: boolean
  }
}

export const store: Store = {
  twitter: {
    login: false
  } 
}
