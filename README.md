[![](https://img.shields.io/npm/v/osu-api-extended?color=AD745F&style=for-the-badge)](https://www.npmjs.org/package/osu-api-extended)
[![](https://img.shields.io/bundlephobia/min/@aqilcont/osu-api-extended?color=5FAE89&label=size&style=for-the-badge)](https://www.npmjs.org/package/osu-api-extended)
[![](https://img.shields.io/npm/dm/osu-api-extended?color=625FAD&style=for-the-badge)](https://npm-stat.com/charts.html?package=osu-api-extended)
![](https://img.shields.io/npm/l/osu-api-extended?color=AD5F8C&style=for-the-badge)

# osu-api-extended

quick links: [Features](#features) [Usage](#usage) &#8203; / &#8203; [Install](#installation) &#8203; / &#8203; [V1 Api](#api-v1) &#8203; / &#8203; [V2 Api](#api-v2)

<br>
<br>

## Features
- Api
  - osu api v1: [official documentation](https://github.com/ppy/osu-api/wiki)
  - osu api v2: [official documentation](https://osu.ppy.sh/docs/index.html)
- **Auto** session refresh
- You need to login only once on application start (preferable in main server file)
- Built-in **Tools**
  - `tools.build_url` - Create link for `user`, `score`, `editor_timing` and others
  - `tools.calculate_accuracy` - Calculate accuracy from play hits
  - `tools.calculate_hits` - Calculate hits if play was an FC
  - `tools.calculate_mods` - Calculate mods Number/Name from Number/Name
  - `tools.calculate_net_pp` - Calculate how much pp would you gain from a play
  - `tools.calculate_pp` - Create link for `user`, `score`, `editor_timing` and others
  - `tools.calculate_rank` - Calculate rank from play hits
  - `tools.calculate_total_passed_objects` - Calculate total passed objects
  - `tools.country_details` - Get country name and code by providing country name/code
  - `tools.download_beatmaps` - Downloads a beatmap or beatmap set by given ID. (Supports different hosts)

<br>
<br>

## Installation

```
npm i osu-api-extended
```

```
yarn install osu-api-extended
```

```
pnpm install osu-api-extended
```

```
bun install osu-api-extended
```

<br>
<br>

## Quickstart

Links: [create your client here](https://osu.ppy.sh/home/account/edit#oauth 'https://osu.ppy.sh/home/account/edit#oauth') &#8203; / &#8203; [get your api key here](https://osu.ppy.sh/p/api 'https://osu.ppy.sh/p/api')

quick links: [v2 - client auth](#client-auth) &#8203; / &#8203; [v2 - lazer auth](#lazer-auth) &#8203; / &#8203; [v2 - cli auth](#lazer-auth)

<br> 

### Client Auth

```js
import { auth } from 'osu-api-extended';


async function main() {
  try {
    await auth.login({
      type: 'v2',
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      cachedTokenPath: './client.json' // path to a file where will be stored auth token to prevent spam auth to osu
    });

    const result = await v2.users.details({ user: 'mrekk', mode: 'osu', key: '@' });
    if (result.error != null) {
      console.log(result.error);
      return;
    };


    console.log(result);
  } catch (error) {
    console.log(error);
  };
};

main();
```

<br>

### Lazer Auth

Authorization though your account

```js
import { auth } from 'osu-api-extended';


async function main() {
  try {
    await auth.login({
      type: 'v2',
      login: LOGIN,
      password: PASSWORD,
      cachedTokenPath: './lazer.json' // path to a file where will be stored auth token to prevent spam auth to osu
    });

    const result = await v2.me.details();
    if (result.error != null) {
      console.log(result.error);
      return;
    };


    console.log(result);
  } catch (error) {
    console.log(error);
  };
};

main();
```

<br>

### CLI Auth

```js
import { auth } from 'osu-api-extended';


async function main() {
  try {
    await auth.login({
      type: 'cli',
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      redirect_url: REDIRECT_URL,
      scopes: ['public'],
      cachedTokenPath: './cli.json' // path to a file where will be stored auth token to prevent spam auth to osu
    });

    const result = await v2.me.details();
    if (result.error != null) {
      console.log(result.error);
      return;
    };


    console.log(result);
  } catch (error) {
    console.log(error);
  };
};

main();
```

<br>

### Discord Verify

```js
import { Client } from 'discord.js';
import { auth } from 'osu-api-extended';

const discord_bot = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessages] }); // no clue why i need those intents


// send this link to user
discord_bot.on('messageCreate', async message => {
  if (message.author.bot) return;
  if (!message.content.startsWith('!')) return;

  const [command, value1, value2] = message.content.split('!').join('').split(' ');
  logger('command', { _c: 'yellowBright', v: command }, value1, value2);

  if (command == 'verify') {
    const url = const url = auth.build_url({
      client_id: CLIENT_ID,
      redirect_url: REDIRECT_URL,
      scopes: ['identify'],
      state: message.author.id
    });


    message.reply(`Verify via this link: ${url}`);
    return;
  };
});



// somewhere else verify this
function verifyUser(code, state) {
  // it returns user object
  const verify = await auth.authorize({
    code: code,
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    redirect_url: REDIRECT_URL
  });


  console.log(verify);
};
```

<br>

### Website login

[Nitro](https://nitro.unjs.io) framework example

```js
import { auth } from 'osu-api-extended';


// /auth page
export default defineEventHandler(event => {
  const build_url = auth.build_url({
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URL,
    scopes: ['identify'],
  });


  return sendRedirect(event, build_url);
});


// /callback page
export default defineEventHandler(async event => {
  const { code } = getQuery(event);
  const verify = await auth.authorize({
    code: code.toString(),

    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    redirect_url: REDIRECT_URL,
  });


  setCookie(event, 'user_id', verify.id.toString());
  setCookie(event, 'user_name', verify.username.toString());

  setCookie(event, 'access_token', verify.access_token);
  setCookie(event, 'refresh_token', verify.refresh_token);


  return sendRedirect(event, '/');
});
```

<br>
<br>

## Tools

```javascript
import { tools } from 'osu-api-extended';


function build_url() {
  try {
    const result = tools.build_url({ type: 'beatmap', value: 4397592 });
    if (result.error != null) {
      console.log(result.error);
      return;
    };


    console.log(result);
  } catch (error) {
    console.log(error);
  };
};


function download_beatmaps() {
  try {
    const set_id = 320118;
    const progress_update = (...args) => {
      console.log(args);
    };


    const result = await tools.download_beatmaps({
      type: 'set',
      host: 'gatari',
      id: set_id,
      file_path: `./cache/${set_id}.osz`,
      progress_track_fn: progress_update
    });
    if (result.error != null) {
      console.log(result.error);
      return;
    };


    console.log(result);
  } catch (error) {
    console.log(error);
  };
};


function calculate_accuracy() {
  try {
    const hits = { 300: 123, 100: 12, 50: 1, 0: 1 };
    const result = tools.calculate_accuracy(hits, 'osu');
    if (result.error != null) {
      console.log(result.error);
      return;
    };


    console.log(result);
  } catch (error) {
    console.log(error);
  };
};


function calculate_mods() {
  try {
    const result = tools.calculate_mods('HDDT');
    // or
    const result = tools.calculate_mods(72);
    // or
    const result = tools.calculate_mods([{ acronym: "EZ" }]);
    if (result.error != null) {
      console.log(result.error);
      return;
    };


    console.log(result);
  } catch (error) {
    console.log(error);
  };
};


function country_details() {
  try {
    const result = tools.country_details('US');
    // or
    const result = tools.country_details('United States');
    if (result.error != null) {
      console.log(result.error);
      return;
    };


    console.log(result);
  } catch (error) {
    console.log(error);
  };
};


function calculate_rank() {
  try {
    const hits = { 300: 123, 100: 12, 50: 1, 0: 1 };
    const result = tools.calculate_rank(hits, 72, 'osu');
    if (result.error != null) {
      console.log(result.error);
      return;
    };


    console.log(result);
  } catch (error) {
    console.log(error);
  };
};


function calculate_total_passed_objects() {
  try {
    const hits = { 300: 123, 100: 12, 50: 1, 0: 1 };
    const result = tools.calculate_total_passed_objects(hits, 'osu');
    if (result.error != null) {
      console.log(result.error);
      return;
    };


    console.log(result);
  } catch (error) {
    console.log(error);
  };
};
  
  
function calculate_hits() {
  try {
    const hits = { 300: 123, 100: 12, 50: 1, 0: 1 };
    const result = tools.calculate_hits(hits, 'osu');
    if (result.error != null) {
      console.log(result.error);
      return;
    };


    console.log(result);
  } catch (error) {
    console.log(error);
  };
};


function calculate_net_pp() {
  try {
    const plays = [1000, 900, 800, 700];
    const scores = [{ id: 123, pp: 1000 }, { id: 123, pp: 555 }, { id: 123, pp: 234 }, { id: 123, pp: 100 }];
    const result = tools.calculate_net_pp(plays, 400);
    // or 
    const result = tools.calculate_net_pp(scores, 400);
    if (result.error != null) {
      console.log(result.error);
      return;
    };


    console.log(result);
  } catch (error) {
    console.log(error);
  };
};
```

# Dependencies

zero

- `request.ts` by [AqilCont](https://github.com/AqilCont 'https://github.com/AqilCont')
