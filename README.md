# Generate Document

This libraray is used to generate document from a schema
The schema can be in a json file or in a yaml file.
When a json schema is used, we get the documentation for the root key.
When a yaml file is used, we get the documentation for a particular URL and it method.

## Use with Node

    $ npm install generatedocument
	
# Usage

The module need to be executed from another js file. This module, generates the documentation in a particular format.
One can use that to get the document in the desired format. 
The test.js file has the implementation to execute the module.
There is a generatedocument.js, that has the implementation for generating document from the output given by the module.
If there is no function given by the user, the above function will be used to generate the document.

to execte:

when input file is yaml file:

node test.js 
  
  the generated documentation will be printed in the console
  
node test.js --save
	the generated documentation will be updated in the yaml file, under description of the url and method given.

node test.js --save <file name>

	the generated documentation will be written in the given file.
	
when input file is json schema:

node test.js 
  
  the generated documentation will be printed in the console
  
node test.js --save <file name>

	the generated documentation will be written in the given file.
	
calling the module for yaml file:

    var url =  '/dealers'; -- url for which documentation is needed
	var method = 'put';    -- method for which documentation is needed
	gen.generateDocFromSwagger(inputFilePath, url, method, options);  -- send function name as last parameter, if u have a function
	
calling the module for json file:

    var key = 'User';
	gen.generateDocFromJson(inputFilePath, key, options); -- send function name as last parameter, if u have a function
	
below is the sample in which the module generates the output.


	
	
