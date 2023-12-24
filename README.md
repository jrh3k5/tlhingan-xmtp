# tlhingan-xmtp
An XMTP bot used to surface definitions for Klingon words.

## Running

You need to set up an environment that looks like:

```
XMTP_ENV=production
KEY=<hex-encoded private key of the wallet address at which the bot will receive messages>
```

If you are installing this by simply cloning the repo onto your machine, you will need to initialize the submodule to get the Klingon assistant data files installed:

```
git submodule update --init --recursive
```

You can then run:

```
npm run start
```
