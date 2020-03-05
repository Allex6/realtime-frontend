# RealTime Frontend

[![NPM version]](https://www.npmjs.com/package/realtime-frontend)

## Features

RealTime Frontend allows the developer to follow changes in the interface he is developing in real time. For each change made by him in an html file, and / or a css file, the changes are reflected on his screen in about **2 - 3 seconds, without the page reloading.**

It is necessary that he import the file 'client.js' inside the html page that he wants to follow in real time. 

You can find this client.js file in the "node_modules/realtime-frontend/lib/client.js" path.

## Behavior

### This tool uses the [Socket.io](https://www.npmjs.com/package/socket.io) library to maintain a stable communication between the client and the NodeJs server. By default, communication is done at "http://localhost:9000".

#### The operation is very simple, actually. look:

First you add the client file to the html file that you want to follow the development in real time.
In your main file (server side), call the realtime-frontend module using:

```js
const RealTime = require ('realtime-frontend');
let app = new RealTime ();
```

**It is important to remember that you need to use the socket client in the html file.**

This will cause the communication between client and server to be established using socket.

This is enough for our tool to keep an eye on the html file that has the client.js file and on the css files that are required by the html, like style sheets for example.

Now any change in one of the files being watched will result in a visual change in its interface.
Also the addition of new style sheets to your html file will also make them visible. As soon as a change is detected, it will also be noticed visually.

#### Dependecies

For the tool to work properly, the following dependencies must be installed:

* Express in version 4.15.2
* JSDOM in version 16.2.0
* Socket.io in version 2.3.0

## License

[MIT](LICENSE)