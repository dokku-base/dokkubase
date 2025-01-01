---
title: Server islands
description: Combine high performance static HTML with dynamic server-rendered content.
i18nReady: true
---

Server islands allow you to on-demand render dynamic or personalized "islands" individually, without sacrificing the performance of the rest of the page.

This means your visitor will see the most important parts of your page sooner, and allows your main content to be more aggressively cached, providing faster performance.

## Server island components

A server island is a normal server-rendered [Astro component](/en/basics/astro-components/) that is instructed to delay rendering until its contents are available.

Your page will be rendered immediately with any specified [fallback content as a placeholder](#server-island-fallback-content). Then, the component's own contents are fetched on the client and displayed when available.

With [an adapter installed](/en/guides/on-demand-rendering/#server-adapters) to perform the delayed rendering, add the [`server:defer` directive](/en/reference/directives-reference/#server-directives) to any component on your page to turn it into its own island:

```astro title="src/pages/index.astro" "server:defer"
---
import Avatar from '../components/Avatar.astro';
---
<Avatar server:defer />
```

These components can do [anything you normally would in an on-demand rendered page](/en/guides/on-demand-rendering/#on-demand-rendering-features) using an adapter, such as fetch content, and access cookies:

```astro title="src/components/Avatar.astro"
---
import { getUserAvatar } from '../sessions';
const userSession = Astro.cookies.get('session');
const avatarURL = await getUserAvatar(userSession);
---
<img alt="User avatar" src={avatarURL} />
```

## Server island fallback content

When using the `server:defer` attribute on a component to delay its rendering, you can "slot" in default loading content using the included named `"fallback"` slot.

Your fallback content will be rendered along with the rest of the page initially on page load and will be replaced with your component's content when available.

To add fallback content, add `slot="fallback"` on a child (other components or HTML elements) passed to your server island component:

```astro
---
import Avatar from '../components/Avatar.astro';
import GenericAvatar from '../components/GenericAvatar.astro';
---
<Avatar server:defer>
  <GenericAvatar slot="fallback" />
</Avatar>
```

This fallback content can be things like:

- A generic avatar instead of the user's own.
- Placeholder UI such as custom messages.
- Loading indicators such as spinners.


## How it works 

Server island implementation happens mostly at build-time where component content is swapped out for a small script.

Each of the islands marked with `server:defer` is split off into its own special route which the script fetches at run time. When Astro builds your site it will omit the component and inject a script in its place, and any content you’ve marked with `slot="fallback"`.

When the page loads in the browser, these components will be requested to a special endpoint that renders them and returns the HTML. This means that users will see the most critical parts of the page instantly. Fallback content will be visible for a short amount of time before the dynamic islands are then loaded.

Each island is loaded independently from the rest. This means a slower island won't delay the rest of your personalized content from being available.

This rendering pattern was built to be portable. It does not depend on any server infrastructure so it will work with any host you have, from a Node.js server in a Docker container to the serverless provider of your choice.

## Caching

The data for server islands is retrieved via a `GET` request, passing props as an encrypted string in the URL query. This allows caching data with the [`Cache-Control` HTTP header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control) using standard `Cache-Control` directives.

However, [the browser limits URLs to a maximum length of 2048 bytes](https://chromium.googlesource.com/chromium/src/+/master/docs/security/url_display_guidelines/url_display_guidelines.md#url-length) for practical reasons and to avoid causing denial-of-service problems. If your query string causes your URL to exceed this limit, Astro will instead send a `POST` request that contains all props in the body. 

`POST` requests are not cached by browsers because they are used to submit data, and could cause data integrity or security issues. Therefore, any existing caching logic in your project will break. Whenever possible, pass only necessary props to your server islands and avoid sending entire data objects and arrays to keep your query small.

## Accessing the page URL in a server island

In most cases you, your server island component can get information about the page rendering it by [passing props](/en/basics/astro-components/#component-props) like in normal components. 

However, server islands run in their own isolated context outside of the page request. `Astro.url` and `Astro.request.url` in a server island component both return a URL that looks like `/_server-islands/Avatar` instead of the current page's URL in the browser. Additionally, if you are prerendering the page you will not have access to information such as query parameters in order to pass as props.

To access information from the page's URL, you can check the [Referer](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referer) header, which will contain the address of the page that is loading the island in the browser:

```astro
---
const referer = Astro.request.headers.get('Referer');
const url = new URL(referer);
const productId = url.searchParams.get('product');
---
```

## Reusing the encryption key

Astro uses [cryptography](https://developer.mozilla.org/en-US/docs/Glossary/Cryptography) to hash props passed to server islands to prevent accidentally leaking secrets. The props are hashed using a key that is generated during the build.

For most hosts, this happens transparently and there is nothing that you as a developer need to do. If you are using rolling deployments in an environment such as Kubernetes, you may run into issues where the frontend and backend are temporarily out of sync and the keys don't match.

To solve this, you can create a key with the Astro CLI and then reuse it for all of your deployments. This ensures that each user's frontend is talking to a backend that has the right key.

Generate a key using `astro create-key`:

```shell
astro create-key
```

This will create a key that you can set as the `ASTRO_KEY` environment variable wherever your hosting environment requires, such as in a `.env` file:

```ini title=".env"
ASTRO_KEY=zyM5c0qec+1Sgi4K+AejFX9ufbig7/7wIZjxOjti9Po=
```