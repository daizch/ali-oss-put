## ali-oss-put

### install 

```sh
$ npm i ali-oss-put -D
```

### config
configuration file ``.aliossputrc``
```json
{
    "accessKeyId": "***",
    "accessKeySecret": "***",
    "region": "oss-cn-hangzhou", //more like oss-cn-shenzhen
    "bucket": "static", //your own bucket name
    "prefix": "my/public/", // oss directory path
    "src":"dist", // upload directory
    "ignore": "*.js$" //opt, filter files is not put to oss
    "silent": true //default be true
}
```


### usage
use in package.json

```json
{
  "scripts": {
    "upload": "ali-oss-put"
  }
}
```

or use in js file 

```javascript
const aliOssPut= require('.ali-oss-put')

aliOssPut()
```