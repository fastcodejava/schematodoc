var _ = require('lodash');
var stream = require('fs');
var alternateFunc = require('./generateOutput');

var yaml = require('js-yaml');
//var jsonToyaml = require('json2yaml'); //require('write-yaml');
var output ='';
var outputArray = [];
var arrItem = '';
var file = './output.txt';
var arrOp = './arrOutput.txt';
var fullInput;
var reqd;
var tab = '    ';
var tabsToAdd = '';
var space10 = '          ';

exports.generateDocFromSwagger = function generateDocFromSwagger(inputFilePath, url, method, options, genFunc) {
	var jsonObj = {};
	//console.log('line 1 ' + genFunc);
	//console.log();
	var keyArr = [];
	fullInput = getDefinitionFromSwagger(inputFilePath, url, method, keyArr);
	//console.log(JSON.stringify(fullInput));
	var obj = {};
	var finaloutput = '';
	
	_.each(keyArr, function(key) {
		 _.set(obj, key,  getToRoot(fullInput.definitions, key));
		 //console.log(JSON.stringify(obj));
		 finaloutput = finaloutput + ' \r\n ' + buildStr((_.get(obj, key)).properties, genFunc === undefined ? alternateFunc.generateFunction : genFunc, tabsToAdd);
		 
	});
	//console.log(finaloutput);
	if (!options.save) {
		console.log(finaloutput);
	} else {
		
		if (options.outputFile === inputFilePath) {
			/*var allPaths = fullInput.paths;
			  var path = _.get(allPaths,url);
			  var mthObj = _.get(path,method);
			  var desc = mthObj.description;
			  if (desc === undefined) {
				 mthObj.description = finaloutput; 
			  } else {
				  var str = '';
				  str = '\n ABC \n krish' + ' \t nnnnnkkkk \n'; //finaloutput; //;
				  mthObj.description = desc + _.replace(finaloutput, new RegExp('\t','g'), '    ');
			  }
			  //console.log(yaml.safeDump(fullInput));
			stream.writeFileSync(inputFilePath, yaml.safeDump(fullInput));*/
			stream.writeFileSync(options.outputFile, addDescriptionToSwagger(inputFilePath, finaloutput, url, method));
		} else {
			stream.writeFileSync(options.outputFile, finaloutput);
		}
	}
	
	 
	
	
};

exports.generateDocFromJson = function generateDocFromSwagger(inputFile, key, options, genFunc) {
	var jsonObj = {};
	console.log();
	console.log();
	var keyArr = [];
	fullInput = inputFile;
	var obj = {};
	var finaloutput = '';
	
	
	 _.set(obj, key,  getToRoot(fullInput.definitions, key));
	 console.log(JSON.stringify(obj));
	 finaloutput = finaloutput + ' \n ' + buildStr((_.get(obj, key)).properties, genFunc, tabsToAdd);
		 
	if (options.save) {
		stream.writeFileSync(options.outputFile, finaloutput);
	} else {
		console.log(finaloutput);
	}
	
	
	 
	
};

function addDescriptionToSwagger(inputFilePath, finaloutput, url, method) {
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
	//console.log(_.size(array));
	//console.log(finaloutput);
	_.each(array , function(line, index) {
		if (!methodFound) {
			
			if (_.trim(line) === 'paths:') {
				pathsFound = true;
				//console.log(line);
				//console.log(numberOfIndents(array[i]));
			}
			if (pathsFound && _.trim(line) === url + ':') {
				urlFound = true;
				//console.log(line);
				noOfIndents ++;
				//console.log(numberOfIndents(array[i]));
			}
			if (urlFound && _.trim(line) === method + ':') {
				methodFound = true;
				//console.log(line);
				noOfIndents++;
				//console.log('indents in mth line:' + numberOfIndents(array[i]));
				//console.log('no of indents:' + noOfIndents);
				pathsFound = false;
				urlFound = false;
				return; //continue;
			}
		}
		if (indexInMth == 0) {
			if (indexInDesc == 0){
				if (methodFound) {
					//console.log('---' + line);
					if (_.trim(line) !== '') {
						if (numberOfIndents(line) < noOfIndents) {
							//console.log(line);
							//console.log(numberOfIndents(line));
							indexInMth = index++;
							return {}; //break;
						}
					}
					if (_.startsWith(line, '      description')) {
						console.log('here ' + index);
						descFound = true;
						noOfIndents++;
						return; //continue;
					}
					
					if (descFound) {
						if (_.trim(line) !== '') {
							//console.log('aa' + numberOfIndents(line));
							if (numberOfIndents(line) < noOfIndents + 1) {
								//console.log(array[i]);
								//console.log(numberOfIndents(line) + '--' + index);
								indexInDesc = index++;
								return {}; //break;
							}
						}
					}
					
				}
			}
		}
		
		
	});
	/*for(i in array) {
		if (_.trim(array[i]) === 'paths:') {
			pathsFound = true;
			//console.log(array[i]);
			//console.log(numberOfIndents(array[i]));
		}
		if (pathsFound && _.trim(array[i]) === url + ':') {
			urlFound = true;
			//console.log(array[i]);
			noOfIndents ++;
			//console.log(numberOfIndents(array[i]));
		}
		if (urlFound && _.trim(array[i]) === method + ':') {
			methodFound = true;
			//console.log(array[i]);
			noOfIndents++;
			//console.log('indents in mth line:' + numberOfIndents(array[i]));
			//console.log('no of indents:' + noOfIndents);
			pathsFound = false;
			urlFound = false;
			continue;
		}
		if (methodFound) {
			console.log('---' + array[i]);
			if (_.trim(array[i]) !== '') {
				if (numberOfIndents(array[i]) < noOfIndents) {
					//console.log(array[i]);
					console.log('mm' + numberOfIndents(array[i]));
					indexInMth = i++;
					break;
				}
			}
			if (_.startsWith(array[i], '      description')) {
				console.log('here');
				descFound = true;
				noOfIndents++;
				continue;
			}
			
			if (descFound) {
				if (_.trim(array[i]) !== '') {
					console.log('aa' + numberOfIndents(array[i]));
					console.log(array[i]);
					if (numberOfIndents(array[i]) < noOfIndents + 1) {
						//console.log(array[i]);
						//console.log(numberOfIndents(array[i]) + '--' + i);
						indexInDesc = i++;
						break;
					}
				}
			}
			
		}
	}*/
	
	var finalOPArr1 = finaloutput.split("\r\n");
	/*for ( i = 0; i < finalOPArr1.length; i++) {
		finalOPArr1[i] = indent + indent + indent + indent + space10 + finalOPArr1[i];
	}*/
	var finalOPArr2 = [];
	_.each(finalOPArr1, function(opLine){
		finalOPArr2.push(indent + indent + indent + indent + space10 + opLine);
	});
	finaloutput = finalOPArr2.join("\r\n");

	console.log(indexInDesc);
	console.log(indexInMth);
	if (descFound) {
		//console.log(indexInDesc + 'ss' + array[indexInDesc] + '\n' + finaloutput);
		array.splice(indexInDesc, 0, indent + indent + indent + indent + finaloutput);
		//console.log(array[indexInDesc]);
	} else {
		
		array.splice(indexInMth, 0, indent + indent + indent + 'description : ' + finaloutput);
	}
	return array.join('\n');
}

function getDefinitionFromSwagger(inputFilePath, url, method, keyArr) {
	var doc;
	try {
	  doc = yaml.load(stream.readFileSync(inputFilePath, 'utf8'));
	  var allPaths = doc.paths;
	  var path = _.get(allPaths,url);
	  var mthObj = _.get(path,method);
	  var parameters = mthObj.parameters;
	  var ref;
	  var schema;
	  var bodyParam = _.filter(mthObj.parameters, {'in' : 'body'} );
	  if (bodyParam[0].schema !== undefined) {
		ref = bodyParam[0].schema.$ref;
		if (_.startsWith(ref, 'http')) {
		
		} else if (_.startsWith(ref, '#')) {
			keyArr.push(_.last(ref.split('/')));
		}
	  }
	  
	  
	  var responses = mthObj.responses;
	  _.each(responses, function(response){
		   
		 if (response.schema !== undefined) {
			schema = response.schema;
			if (schema.type === 'array') {
				ref = schema.items.$ref;
			} else {
				ref = schema.$ref;
			}
		
			if (_.startsWith(ref, 'http')) {
					
			} else if (_.startsWith(ref, '#')) {
				//_.set( key, 'key',_.last(ref.split('/')));
				keyArr.push(_.last(ref.split('/')));
			}
		 }
	  });
	 
	} catch (e) {
	  console.log(e);
	} 
	return doc;
}


function buildStr(obj, genFunc, tabsToAdd) {
	var formattedStr = '';
	_.each(obj, function(property) {
			
		if (property.type === 'object' || property.type === 'array') {
			formattedStr = formattedStr +  ' \r\n ' + tabsToAdd + genFunc(property);
			if (property.type === 'array') {
				
				if (property.itemType !== undefined) {
					formattedStr = formattedStr  +tabsToAdd  + ', ' + genFunc(property.itemType) + ')';
					
				} else {
					var origTab = tabsToAdd;
					tabsToAdd = tabsToAdd + tab; //' \t ';
					formattedStr = formattedStr + ' \r\n ' + tabsToAdd + '['; //tabsToAdd + //'\r\n' + 
					formattedStr = formattedStr + tabsToAdd + buildStr(property.properties, genFunc, tabsToAdd + tab + tab); //' \t \t ');
					formattedStr = formattedStr + ' \r\n ' +tabsToAdd + tab + '] \r\n ' + tabsToAdd + ')';
					tabsToAdd = origTab;
				}
				
			} else {
				formattedStr = formattedStr + '{' +tabsToAdd  +  buildStr(property.properties, genFunc, tabsToAdd + tab) + '}';
				
			}
		} else {
			//console.log(property.name);
			formattedStr = formattedStr +  ' \r\n ' + tabsToAdd + genFunc(property);
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
	
	parentObj.properties = processProperties(item.properties, item.required );
	
	return parentObj;
}

function processProperties(properties, reqd) {
	var prop = [];
	var allKeys = _.keys(properties);
		_.each(allKeys, function(key) {
			var item = _.get(properties, key);
			var itemObj = {};
			itemObj.name = key;
			if (_.indexOf(reqd, key) > -1) {
				itemObj.required = true;
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
			itemObj.type = propType;
			_.set(itemObj, "" ,getToRoot(item));
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
		if (_.get(fullInput.definitions, ref).type !== undefined) {
			var child = {};
			processType(_.get(fullInput.definitions, ref), child);
			itemObj.reference = ref;
			itemObj.properties = [child];
		} else {
			itemObj.reference = ref;
			itemObj.properties = processProperties(_.get(fullInput.definitions, ref).properties, _.get(fullInput.definitions, ref).required);
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
		itemObj.example = example;
	}
	
	if (defaultVal !== '') {
		itemObj.default = defaultVal;
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
	if (defaultVal) {
		itemObj.default = defaultVal; 
	} else {
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

