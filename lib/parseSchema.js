var _ = require('lodash');
var stream = require('fs');
var alternateFunc = require('./generateOutput');
var keywords =  require('./keywords-mapping.js').keywordMapping;
var format =  require('./keywords-mapping.js').formatMapping;

var yaml = require('js-yaml');
//var jsonToyaml = require('json2yaml'); //require('write-yaml');
var output ='';
var outputArray = [];
var arrItem = '';
var file = './output.txt';
var arrOp = './arrOutput.txt';
var fullInput;
var reqd;
var space2 = '  ';
var spacesToAdd = '';
var space10 = '          ';

(function(){
    var schematodoc = {};
    exports.generateDocFromSwagger = function generateDocFromSwagger(inputFilePath, url, method, options, genFunc) {
		
		try {
		  stats = stream.statSync(inputFilePath);
		}
		catch (e) {
		  console.log("File - " + inputFilePath + " - does not exist.");
		  return;
		}
		var jsonObj = {};
		var keyArr = [];
		fullInput = getDefinitionFromSwagger(inputFilePath, url, method, keyArr);
		var obj = {};
		var finaloutput = '';
		var descTitle = '';
		var finalObj = {};
		var methDetail = 'For method ' + method + ', ';
		if (options.serializer || '') {
			_.merge(keywords, options.serializer);
		}
		descTitle = (format.formatStart || '') + (format.descTitle || '') + (format.formatEnd || '');
		finaloutput = finaloutput + descTitle;
		_.each(keyArr, function(key) {
			_.set(obj, key.key,  getToRoot(fullInput.definitions, key.key));
			finalObj.method = method;
			finalObj.type = key.type;
			finalObj.code = key.code;
			finalObj.fields = obj;
			var title = methDetail + finalObj.type + ', ' + finalObj.code + ' \r\n ';
			
			
			console.log(JSON.stringify(finalObj));
			finaloutput = finaloutput + ' \r\n ' + title + buildStr((_.get(finalObj.fields, key.key)).properties, genFunc === undefined ? alternateFunc.generateFunction : genFunc, spacesToAdd, spacesToAdd, keywords);
		});
		
		if ( finaloutput !== '') {
			if (!options.save) {
				console.log(finaloutput);
			} else {
				if (options.outputFile=== inputFilePath) {
					if (options.overwriteDesc) {
						stream.writeFileSync(options.outputFile, addDescriptionToSwagger(inputFilePath, finaloutput, url, method, options.overwriteDesc, false));
					}  else if (options.append) {
						stream.writeFileSync(options.outputFile, addDescriptionToSwagger(inputFilePath, finaloutput, url, method, false, options.append));
					}  else {
						addDescriptionToSwagger(inputFilePath, finaloutput, url, method, options.overwriteDesc, options.append);
					}
				} else {
					stream.writeFileSync(options.outputFile, finaloutput);
				}
			}
		}
		
		
		 
		
		
	};

    if (!module.parent) {
        schematodoc.generateDocFromSwagger(process.argv[2], process.argv[3], process.argv[4], process.argv[5]);
    }
})();



exports.generateDocFromJson = function generateDocFromSwagger(inputFile, key, options, genFunc) {
	var jsonObj = {};
	console.log();
	console.log();
	var keyArr = [];
	fullInput = inputFile;
	var obj = {};
	var finaloutput = '';
	 _.set(obj, key,  getToRoot(fullInput.definitions, key));
	
	if (options.serializer || '') {
		_.merge(keywords, options.serializer);
	}	
	 finaloutput = finaloutput + ' \n ' + buildStr((_.get(obj, key)).properties, genFunc, spacesToAdd, spacesToAdd, keywords);
		 
	if (options.save) {
		stream.writeFileSync(options.outputFile, finaloutput);
	} else {
		console.log(finaloutput);
	}
	
	
	 
	
};

function addDescriptionToSwagger(inputFilePath, finaloutput, url, method, overwriteDesc, append) {
	var swaggerFile = stream.readFileSync(inputFilePath, 'utf8');
	var array = swaggerFile.toString().split("\n");
	var pathsFound = false;
	var urlFound = false;
	var methodFound = false;
	var indent = '  ';
	var noOfIndents = 0;
	var descFound = false;
	var indexInDesc = 0;
	var indexInMth = 0;
	var indexInDescStart = 0;
	_.each(array , function(line, index) {
		if (!methodFound) {
			
			if (_.trim(line) === 'paths:') {
				pathsFound = true;
			}
			if (pathsFound && _.trim(line) === url + ':') {
				urlFound = true;
				noOfIndents ++;
			}
			if (urlFound && _.trim(line) === method + ':') {
				methodFound = true;
				noOfIndents++;
				pathsFound = false;
				urlFound = false;
				return;
			}
		}
		if (indexInMth == 0) {
			if (indexInDesc == 0){
				if (methodFound) {
					if (_.trim(line) !== '') {
						if (numberOfIndents(line) < noOfIndents) {
							indexInMth = index++;
							if (descFound && indexInDesc == 0) {
								indexInDesc = index -1;
							}
							return {};
						}
					}
					if (_.startsWith(line, '      description')) {
						//console.log('here ' + index);
						descFound = true;
						indexInDescStart = index ++;
						noOfIndents++;
						return; 
					}
					
					if (descFound) {
						if (_.trim(line) !== '') {
							if (numberOfIndents(line) < noOfIndents + 1) {
								indexInDesc = index++;
								return {}; 
							}
						}
					}
					
				}
			}
		}
		
		
	});
	
	var finalOPArr1 = finaloutput.split("\r\n");
	var finalOPArr2 = [];
	_.each(finalOPArr1, function(opLine) {
		finalOPArr2.push(indent + indent + indent + indent + space10 + opLine);
	});
	finaloutput = finalOPArr2.join("\r\n");

	if (descFound) {
		if (overwriteDesc) {
			//console.log(indexInDesc + '-' + indexInDescStart);
			var linesToRemove = indexInDesc - indexInDescStart;
			array.splice(indexInDescStart, linesToRemove, indent + indent + indent  + 'description: ');
			array.splice(indexInDescStart + 1, 0, indent + indent + indent + indent + finaloutput);
			console.log('Added description at line: ' + indexInDescStart);
		} else if (append) {
			array.splice(indexInDesc, 0, indent + indent + indent + indent + finaloutput);
			console.log('Added description at line: ' + indexInDesc);
		} else {
			console.log('Description is already present for url: ' + url + ', method: ' + method + '.');
			console.log(finaloutput);
		}
		/*array.splice(indexInDesc, 0, indent + indent + indent + indent + finaloutput);
		console.log('Added description at line: ' + indexInDesc);*/
	} else {
		
		array.splice(indexInMth, 0, indent + indent + indent + 'description: ' + finaloutput);
		console.log('Added description at line: ' + indexInMth);
	}
	return array.join('\n');
}

function getDefinitionFromSwagger(inputFilePath, url, method, keyArr) {
	var doc;
	try {
	  doc = yaml.load(appendTextToAnchorVariable(inputFilePath));
	  var allPaths = doc.paths;
	  var path = _.get(allPaths,url);
	  if (path  === undefined) {
		console.log('URL ' + url + ' not found.');
		return;
	  }
	  var mthObj = _.get(path,method);
	  if (mthObj === undefined) {
		console.log('Method ' + method + ' not found for url ' + url);
		return;
	  }
	  var parameters = mthObj.parameters;
	  var ref;
	  var schema;
	  var bodyParam = _.filter(mthObj.parameters, {'in' : 'body'} );
	  if (!_.isEmpty(bodyParam)) {
		  if (bodyParam[0].schema !== undefined) {
			ref = bodyParam[0].schema.$ref;
			if (_.startsWith(ref, 'http')) {
			
			} else if (_.startsWith(ref, '#')) {
				var reqObj = {};
				reqObj.type = 'Request';
				reqObj.code = 'in-body';
				reqObj.key = _.last(ref.split('/'));
				keyArr.push(reqObj);
			}
		  }
	  }
	  
	  var responses = mthObj.responses;
	  var resKeys = _.keys(responses);
	  var schemaFound = false;
	  _.each(responses, function(response, index){
		   
		 if (index === 'default' && schemaFound === true) {
			 return;
		 }  
		 if (response.schema !== undefined) {
			schemaFound = true;
			schema = response.schema;
			if (schema.type === 'array') {
				ref = schema.items.$ref;
			} else {
				ref = schema.$ref;
			}
		
			if (_.startsWith(ref, 'http')) {
					
			} else if (_.startsWith(ref, '#')) {
				var resObj = {};
				resObj.type = 'Response';
				resObj.code = index;
				resObj.key = _.last(ref.split('/'));
				keyArr.push(resObj);
			}
			
		 }
		
	  });
	} catch (e) {
	  console.log(e);
	} 
	return doc;
}


function buildStr(obj, genFunc, spacesToAdd, origSpace, serializer) {
	var formattedStr = '';
	_.each(obj, function(property) {
			
		if (property.type === 'object' || property.type === 'array') {
			formattedStr = formattedStr +  '\r\n' + origSpace  +  genFunc(property, serializer);
			if (property.type === 'array') {
				
				if (property.itemType !== undefined) {
					formattedStr = formattedStr  + origSpace  + ', ' + genFunc(property.itemType, serializer) + ')';
					
				} else {
					var origTab = spacesToAdd;
					spacesToAdd = (spacesToAdd === '' ? spacesToAdd + space2 : spacesToAdd);
					formattedStr = formattedStr + '\r\n' + origSpace  + serializer.arrayStart; //tabsToAdd + //'\r\n' + 
					formattedStr = formattedStr + spacesToAdd  + buildStr(property.properties, genFunc, spacesToAdd + space2 , spacesToAdd, serializer); //' \t \t ');
					formattedStr = formattedStr + '\r\n' + origSpace  + serializer.arrayEnd + '\r\n' + origSpace + ')';
					spacesToAdd = origTab;
				}
				
			} else {
					
				if (_.size(property.properties) === 1 && property.properties[0].type === 'string') {
					formattedStr = formattedStr  + serializer.openningParanthesis  + genFunc(property.properties[0], serializer) + serializer.closingParanthesis;
					
					//formattedStr = formattedStr  + '{'   +  buildStr(property.properties, genFunc, spacesToAdd + space2  , spacesToAdd, serializer) + '\r\n' + origSpace + ' ' +'}';	
				} else if (_.size(property.properties) === 1 && _.has(property.properties[0], 'itemType')) {
					formattedStr = formattedStr  + serializer.objectStart + genFunc(property.properties[0], serializer) + genFunc(property.properties[0].itemType, serializer) + serializer.objectEnd;
					
				} else {
					var origTab = spacesToAdd;
					spacesToAdd = (spacesToAdd === '' ? spacesToAdd + space2 : spacesToAdd);
					formattedStr = formattedStr + '\r\n' + origSpace + serializer.objectStart +  buildStr(property.properties, genFunc, spacesToAdd + space2  , spacesToAdd, serializer) + '\r\n' + origSpace + serializer.objectEnd;	
					spacesToAdd = origTab;
				}
				
				
			}
		} else {
			formattedStr = formattedStr +  '\r\n' + origSpace + genFunc(property, serializer);
		}
	
	});
	
	return formattedStr;
}

function numberOfTabs(text) {
  var count = 0;
  var index = 0;
  while (text.charAt(index++) === "\t") {
    count++;
  }
  return count;
}

function numberOfIndents(text) {
  var count = 0;
  var index = 0;
  while (text.charAt(index++) === ' ') {
    count++;
  }
  return count/2;
}


function getToRoot(input, key) {
	var item = _.get(input, key);
	var parentObj={};
	parentObj.properties = processProperties(item.properties, item.required, item.discriminator, item.readOnly);
	return parentObj;
}

function processProperties(properties, reqd, discriminator, readonly) {
	var prop = [];
	var allKeys = _.keys(properties);
		_.each(allKeys, function(key) {
			var item = _.get(properties, key);
			var itemObj = {};
			itemObj.name = key;
			if (_.indexOf(reqd, key) > -1) {
				itemObj.required = true;
			}
			if (_.isEqual(discriminator, key)) {
				itemObj.discriminator = true;
			}
			if (_.has(item, 'type')) {
				processType (item, itemObj);
			}
			
			if (_.has(item, '$ref')) {
				itemObj.type = 'object';
				processRef (item, itemObj);
			}
			if (_.has(item, 'enum')) {
				itemObj.type = 'enum';	
				_.set(itemObj, 'values' ,_.join( item.enum, ','));
			}
			
			
			prop.push(itemObj);
		});
	reqd = '';
	return prop;
}

function processType (item, itemObj) {
	var propType = item.type;
	switch (propType) {
		case 'string' :
			itemObj.type = propType;
			buildStringData(item, itemObj);
			break;
		case 'integer':
		case 'number' :
			itemObj.type = propType;
			buildIntegerData(item, itemObj);
			break;
		case 'boolean' :
			itemObj.type = propType;
			buildbooleanData(item, itemObj);
			break;
		case 'array' :
			itemObj.type = propType;
			buildArrayData(item, itemObj);
			break;
		case 'object' :
			itemObj.child = processProperties(item.properties, item.required, item.discriminator, item.readOnly);
			break;
		case 'enum' :
			break;
			
		default:
			console.log('nothing to do');
			break;
	}
}

function processRef (item, itemObj) {
	var propRef = item.$ref;
	if (_.startsWith(propRef, 'http')) {
		
	} else if (_.startsWith(propRef, '#')) {
		var ref = _.last(propRef.split('/'));
		var refDefinition = _.get(fullInput.definitions, ref);
		if (refDefinition.type !== undefined) {
			var child = {};
			processType(refDefinition, child);
			itemObj.reference = ref;
			if (_.has(child, 'child')) {
				itemObj.properties = child.child;
			} else {
				itemObj.properties = [child];
			}
		} else if (refDefinition.properties !== undefined) {
			itemObj.reference = ref;
			itemObj.properties = processProperties(refDefinition.properties, refDefinition.required, refDefinition.discriminator, refDefinition.readOnly);
		} else if (_.has(refDefinition, 'enum')) {
			itemObj.type = 'enum';	
			_.set(itemObj, 'values' ,_.join( refDefinition.enum, ','));
		}
		
	}
	
}

function buildStringData(item, itemObj) {
	//console.log('In String type');
	var finalStr = '';
	var desc = isUndefined(item.description);
	var min = isUndefined(item.minLength);
	var max = isUndefined(item.maxLength);
	var pattern = isUndefined(item.pattern);
	var format = isUndefined(item.format);
	var example = isUndefined(item.example);
	var enumVal = isUndefined(item.enum);
	var defaultVal = isUndefined(item.default);
	
	if (desc !== '') {
		itemObj.description = desc;
	}
	
	if (min !== '') {
		itemObj.minLength = min;
		
	} 
	if (max !== '') {
		itemObj.maxLength = max;
	}
	
	if (pattern !== '') {
		itemObj.pattern = pattern;
	} 
	
	if (format !== '') {
		itemObj.format = format;
	}
	
	if (example !== '') {
		itemObj.example = escapeColon(example);
	}
	
	if (defaultVal !== '') {
		itemObj.default = escapeColon(defaultVal);
		//console.log(itemObj.default);
	}
	
	if (enumVal !== '') {
		itemObj.enum = _.join( enumVal, ',');
	}
}


function buildIntegerData(item, itemObj) {
	//console.log('In Integer type');
	var finalStr = '';
	var desc = isUndefined(item.description);
	var min = isUndefined(item.minimum);
	var max = isUndefined(item.maximum);
	var exclusiveMinimum = isUndefined(item.exclusiveMinimum);
	var exclusiveMaximum = isUndefined(item.exclusiveMaximum);
	var multipleOf = isUndefined(item.multipleOf);
	var defaultVal = isUndefined(item.default);
	
	if (desc !== '') {
		itemObj.description = desc;
	}
	
	if (min !== '') {
		itemObj.minimum = min;
	} 
	
	if (max !== '') {
		itemObj.maximum = max; 
	}
	
	if (exclusiveMinimum !== '') {
		itemObj.exclusiveMinimum = exclusiveMinimum;
	} 
	
	if (exclusiveMaximum !== '') {
		itemObj.exclusiveMaximum = exclusiveMaximum; 
	}
	
	if (multipleOf !== '') {
		itemObj.multipleOf = multipleOf;
	}
	
	if (defaultVal !== '') {
		itemObj.default = defaultVal;
	}
	
}

function buildArrayData(item, itemObj) {
	//console.log('In Array type');
	
	var finalStr = '';
	var desc = isUndefined(item.description);
	var items = isUndefined(item.items);
	var additionalItems = isUndefined(item.additionalItems);
	var minItems = isUndefined(item.minItems);
	var maxItems = isUndefined(item.maxItems);
	var uniqueItems = isUndefined(item.uniqueItems);
	
	if (desc !== '') {
		itemObj.description = desc;
	}
	
	if (minItems !== '') {
		itemObj.minItems = minItems;
	} 

	if (maxItems !== '') {
		itemObj.maxItems = maxItems;
	}
	
	if (uniqueItems !== '') {
		itemObj.uniqueItems = uniqueItems;
	} 
	
	if (additionalItems !== '') {
		itemObj.additionalItems = additionalItems;
	}
	
	if (items !== '') {
		var arrKeys = _.keys(items);
		if (_.has(items, '$ref')) {
			itemObj.items = 'object';
			processRef(items, itemObj);
		} else if (_.has(items, 'type')) {
			var child = {};
			processType(items, child);
			_.set(itemObj, "itemType", child);
		   
		}
		
	}
		
}

function buildbooleanData(item, itemObj) {
	//console.log('In Boolean type');
	var finalStr = '';
	var desc = isUndefined(item.description);
	var items = isUndefined(item.items);
	var additionalItems = isUndefined(item.additionalItems);
	var defaultVal = isUndefined(item.default);
	
	if (desc !== '') {
		itemObj.description = desc;
	}
	
	if (items !== '') {
		itemObj.items = items;
	} 
	
	if (additionalItems !== '') {
		itemObj.additionalItems = additionalItems;
	}
	if (defaultVal !== '') {
		itemObj.default = defaultVal; 
	}
	
}

function isUndefined(propItem) {
	if (propItem === undefined) {
		return '';
	} else {
		return propItem;
	}
}

function escapeColon(value) {
	if(value.indexOf(': ') !== -1) {
		//console.log(value);
		//console.log('i found');
		return value.replace(': ', '\\:\\ ');
	}
}
function appendTextToAnchorVariable(inputFilePath) {
	var updated = [];
	var swaggerFile = stream.readFileSync(inputFilePath, 'utf8');
	var array = swaggerFile.toString().split("\r\n");
	var indexInMth = 0;
	var prefixStr = " FCTEXT";
	_.each(array , function(line, index) {
		var lineContent = line.toString().split(":");	
		if (_.startsWith(_.trim(lineContent[1]), '&')) {
			var newLine = line.concat(prefixStr);
			updated.splice(index, 0,  newLine);
		} else {
			updated.push(line);
		}
	});
	/*
	var print = true;
	_.each(updated , function(line, index) {
		var lineContent = line.toString().split(":");	
		if (_.startsWith(_.trim(lineContent[1]), '&')) {
			console.log(index);
			console.log(  line);
			print = false;
		} else {
			if (print) {
				console.log(index);
				console.log(  line);
			}
		}
		
	});
	
	console.log('i m done');*/
	return updated.join("\r\n");
}

