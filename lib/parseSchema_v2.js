var _ = require('lodash');
var stream = require('fs');
var yaml = require('js-yaml');
var jsonToyaml = require('write-yaml');
var output ='';
var outputArray = [];
var arrItem = '';
var file = './output.txt';
var arrOp = './arrOutput.txt';
var fullInput;
var reqd;
var tabsToAdd = '';

exports.generateDocFromSwagger = function generateDocFromSwagger(inputFilePath, genFunc, url, method) {
	var jsonObj = {}
	console.log();
	console.log();
	var keyArr = [];
	fullInput = getDefinitionFromSwagger(inputFilePath, url, method, keyArr);
	var obj = {};
	var finaloutput = '';
	
	_.each(keyArr, function(key) {
		 _.set(obj, key,  getToRoot(fullInput.definitions, key));
		 //console.log(JSON.stringify(obj));
		 finaloutput = finaloutput + '\n' + buildStr((_.get(obj, key)).properties, genFunc, tabsToAdd);
		 
	});
	//stream.writeFileSync(file, finaloutput);
	
	 var allPaths = fullInput.paths;
	  var path = _.get(allPaths,url);
	  var mthObj = _.get(path,method);
	  var desc = mthObj.description;
	  if (desc === undefined) {
		 mthObj.description = finaloutput; 
	  } else {
		  mthObj.description = desc + '\n' + finaloutput;
	  }
	  
	jsonToyaml.sync(inputFilePath, fullInput);
	
};

exports.generateDocFromJson = function generateDocFromSwagger(inputFile, genFunc, key) {
	var jsonObj = {}
	console.log();
	console.log();
	var keyArr = [];
	fullInput = inputFile;
	var obj = {};
	var finaloutput = '';
	
	
	 _.set(obj, key,  getToRoot(fullInput.definitions, key));
	 //console.log(JSON.stringify(obj));
	 finaloutput = finaloutput + '\n' + buildStr((_.get(obj, key)).properties, genFunc, tabsToAdd);
		 
	
	stream.writeFileSync(file, finaloutput);
	
	 
	
};

function getDefinitionFromSwagger(inputFilePath, url, method, keyArr) {
	
	try {
	  var doc = yaml.safeLoad(stream.readFileSync(inputFilePath, 'utf8'));
	  var allPaths = doc.paths;
	  var path = _.get(allPaths,url);
	  var mthObj = _.get(path,method);
	  var parameters = mthObj.parameters;
	  var ref;
	  var schema;
	  var bodyParam = _.filter(mthObj.parameters, {'in' : 'body'} );
	  if (bodyParam.schema != undefined) {
		ref = bodyParam.schema.$ref;
		if (_.startsWith(ref, 'http')) {
		
		} else if (_.startsWith(ref, '#')) {
			keyArr.push(_.last(ref.split('/')));
		}
	  }
	  
	  
	  var responses = mthObj.responses;
	  _.each(responses, function(response){
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
			formattedStr = formattedStr +  '\n' + tabsToAdd + genFunc(property);
			if (property.type === 'array') {
				
				if (property.itemType != undefined) {
					formattedStr = formattedStr  +tabsToAdd  + ', ' + genFunc(property.itemType) + ')';
					
				} else {
					var origTab = tabsToAdd;
					tabsToAdd = tabsToAdd + '\t';
					formattedStr = formattedStr + '\n' + tabsToAdd + property.reference + '\n' + tabsToAdd + '(';
					formattedStr = formattedStr + tabsToAdd + buildStr(property.properties, genFunc, tabsToAdd + '\t\t');
					formattedStr = formattedStr + '\n' +tabsToAdd + ')\n' + tabsToAdd + ')';
					tabsToAdd = origTab;
				}
				
			} else {
				formattedStr = formattedStr + '(' +tabsToAdd  +  buildStr(property.properties, genFunc, tabsToAdd + '\t') + ')';
				
			}
		} else {
			//console.log(property.name);
			formattedStr = formattedStr +  '\n' + tabsToAdd + genFunc(property);
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

function getToRoot(input, key) {
	var item = _.get(input, key);
	
	var parentObj={};
	
	parentObj.properties = processProperties(item.properties, item.required );
	
	return parentObj
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
		if (_.get(fullInput.definitions, ref).type != undefined) {
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
	
	if (desc != '') {
		itemObj.description = desc;
	}
	
	if (min != '') {
		itemObj.minLength = min;
		
	} 
	if (max != '') {
		itemObj.maxLength = max;
	}
	
	if (pattern != '') {
		itemObj.pattern = pattern;
	} 
	
	if (format != '') {
		itemObj.format = format;
	}
	
	if (example != '') {
		itemObj.example = example;
	}
	
	if (defaultVal != '') {
		itemObj.default = defaultVal;
	}
	
	if (enumVal != '') {
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
	
	if (desc != '') {
		itemObj.description = desc;
	}
	
	if (min != '') {
		itemObj.minimum = min;
	} 
	
	if (max != '') {
		itemObj.maximum = max; 
	}
	
	if (exclusiveMinimum != '') {
		itemObj.exclusiveMinimum = exclusiveMinimum;
	} 
	
	if (exclusiveMaximum != '') {
		itemObj.exclusiveMaximum = exclusiveMaximum; 
	}
	
	if (multipleOf != '') {
		itemObj.multipleOf = multipleOf;
	}
	
	if (defaultVal != '') {
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
	
	if (desc != '') {
		itemObj.description = desc;
	}
	
	if (minItems != '') {
		itemObj.minItems = minItems;
	} 

	if (maxItems != '') {
		itemObj.maxItems = maxItems;
	}
	
	if (uniqueItems != '') {
		itemObj.uniqueItems = uniqueItems;
	} 
	
	if (additionalItems != '') {
		itemObj.additionalItems = additionalItems;
	}
	
	if (items != '') {
		var arrKeys = _.keys(items);
		if (_.has(items, '$ref')) {
			itemObj.items = 'object';
			processRef(items, itemObj);
			
		} else if (_.has(items, 'type')) {
			var child = {};
			processType(items, child)
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
	
	if (desc != '') {
		itemObj.description = desc;
	}
	
	if (items != '') {
		itemObj.items = items;
	} 
	
	if (additionalItems != '') {
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