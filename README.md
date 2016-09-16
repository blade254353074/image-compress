# image-compress
🗜 Browser side image compress &amp; upload example, Android 4.0 compatible.

# Quick Look 

[https://blade254353074.github.io/image-compress/](https://blade254353074.github.io/image-compress/)

This page contain the image compressing and uploading actions step by step.

# How to start

1. Install dependency & start the server

```bash
$ npm install

$ npm run server
```

2. Open [http://localhost:8080/](http://localhost:8080/)

# Features

**1. File upload test server**

I use two api interface to recive image file:

* /api/upload/multiparty

  Using [expressjs/node-multiparty](https://github.com/expressjs/node-multiparty),

  file at `/server/upload-multiparty.js`.

* /api/upload/multer

  Using [expressjs/multer](https://github.com/expressjs/multer),

  file at `/server/upload-multer.js`.

And, I use [expressjs/cors](https://github.com/expressjs/cors) to make sure all the requests can be sent by browser, whatever crossing domain.

**2. Browser side**

* FilReader
* window.URL
* Canvas
* Blob
* BlobBuilder
* atob
* Uint8Array
* [multipart/form-data](https://tools.ietf.org/html/rfc7578) 
* FormData
* XMLHttpRequest

For details to see the article at [https://sebastianblade.com/browser-side-image-compress-and-upload/](https://sebastianblade.com/browser-side-image-compress-and-upload/).
