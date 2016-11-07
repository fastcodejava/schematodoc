# schematodoc Document

This library is used to generate document from a schema.
The schema can be in a json file or in a yaml file.
When a json schema is used, we get the documentation for the root key.
When a yaml file is used, we get the documentation for a particular URL and it method.

## Use with Node

    $ npm install schematodoc
	
# Usage

The module need to be executed from another js file. This module generates the documentation in a particular format.
One can use that to get the document in the desired format. 

To execute:

Please do install using `npm install schematodoc` and create a file `test.js` in the app root as shown below.

```js
var gen = require('schematodoc');
var inputFile = './api/swagger/swagger.yaml'; //path to yaml file

var url = 'my_url';
var method = 'post';
gen.generateDocFromSwagger(inputFile, url, method, {save: true, outputFile: inputFile});
```

The generated documentation will be written in the given file.

One can customize the output according to one's needs. You have to create a function similar to the one : https://github.com/fastcodejava/schematodoc/blob/master/lib/generateOutput.js 
and supply the function as shown below :

```js
gen.generateDocFromSwagger(inputFile, url, method, {save: true, outputFile: inputFile}, mygenFunc);
```


```js
var gen = require('schematodoc');
var inputFile = './api/swagger/swagger.yaml'; //path to yaml file

var url = 'my_url';
var method = 'post';
gen.generateDocFromSwagger(inputFile, url, method, {save: false});
```
	
The generated documentation will be written in the console.
