var _ = require('lodash');
var stream = require('fs');
var yaml = require('js-yaml');
var output ='';
; //'{\n\tproperties[';
var outputArray = [];
var arrItem = '';
var file = './output.txt';
var arrOp = './arrOutput.txt';
//var keyProcessed= [];
var fullInput;
var reqd;


exports.generateDocFromSwagger = function generateDocFromSwagger(inputFilePath, genFunc, url, method) {
	var jsonObj = {}
	console.log();
	console.log();
	//var tabsToAdd = '';
	var keyArr = [];
	fullInput = getDefinitionFromSwagger(inputFilePath, url, method, keyArr);
	//console.log('MEMEMEME' + JSON.stringify(key));
	var obj = {};
	
	_.each(keyArr, function(key) {
		 _.set(obj, key,  getToRoot(fullInput.definitions, key));
		 //console.log(JSON.stringify(obj));
		 var finaloutput = buildStr((_.get(obj, key)).properties, genFunc, '');
		 console.log(finaloutput);
		
	});
	
};

function getDefinitionFromSwagger(inputFilePath, url, method, keyArr) {
	
	try {
	  var doc = yaml.safeLoad(stream.readFileSync(inputFilePath, 'utf8'));
	  //console.log(JSON.stringify(doc));
	  var allPaths = doc.paths;
	  var path = _.get(allPaths,url);
	  var mthObj = _.get(path,method);
	  var parameters = mthObj.parameters;
	  console.log(parameters);
	  
	  var ref;
	  var schema;
	  //console.log(parameters[0].in);
	  if (parameters[0].in === 'body' && parameters[0].schema != undefined) {
		ref = parameters[0].schema.$ref;
		if (_.startsWith(ref, 'http')) {
		
		} else if (_.startsWith(ref, '#')) {
			//_.set( key, 'key',_.last(ref.split('/')));
			keyArr.push(_.last(ref.split('/')));
		}
	  }
	  
	  var responses = mthObj.responses;
	  //console.log(responses);
	  var res = _.get(responses, '200');
	  //console.log(res);
	  schema = res.schema;
	 
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
	  //console.log(key);
	  var errRes =  responses.default;
	  
	  
	  
	  
	 
	 
	} catch (e) {
	  console.log(e);
	} 
	return doc;
}


function buildStr(obj, genFunc, tabsToAdd) {
	var formattedStr = '';
    //var tabsToAdd = '';
	//console.log('----------' + JSON.stringify(obj));
	_.each(obj, function(property) {
		//console.log('KK' + JSON.stringify(property));
	
		if (property.type === 'object' || property.type === 'array') {
			console.log('******');
			formattedStr = formattedStr +  '\n' + tabsToAdd + genFunc(property);
			//console.log('inbetween' + formattedStr);
			if (property.type === 'array') {
				formattedStr = formattedStr + '\n\t' + tabsToAdd + property.reference + '\n' + tabsToAdd + '\t\t(';
			}
			formattedStr = formattedStr + '\n' +tabsToAdd + '\n' + buildStr(property.properties, genFunc, tabsToAdd + '\t');
			if (property.type === 'array') {
				formattedStr = formattedStr + '\n' +tabsToAdd + '\t)\n' + tabsToAdd + ')'
			}
			//tabsToAdd = ;
		} else {
			formattedStr = formattedStr +  '\n' + tabsToAdd + genFunc(property);
		}
	
	});
	
	return formattedStr;

}

function getToRoot(input, key) {
	var item = _.get(input, key);
	//console.log('KEY-' + key);
	
	//console.log(item);
	var parentObj={}
	
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
			//if (_.has(reqd, key)) {
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
			//buildObjectData(item, itemObj);															
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
		//var refKey = _.get(fullInput.definitions, ref);
	
		//keyProcessed.push(ref);
		//console.log('***************' + JSON.stringify(refKey));
		//itemObj.type = 'object';
		itemObj.reference = ref;
		itemObj.properties = processProperties(_.get(fullInput.definitions, ref).properties, _.get(fullInput.definitions, ref).required);
		//itemObj.properties = getToRoot(fullInput.definitions, ref)
		//_.set(itemObj, ref , getToRoot(fullInput.definitions, ref));
		
	}
	
}

function buildStringData(item, itemObj) {
	console.log('In String type');
	var finalStr = '';
	var desc = isUndefined(item.description);
	var min = isUndefined(item.minLength);
	var max = isUndefined(item.maxLength);
	var pattern = isUndefined(item.pattern);
	var format = isUndefined(item.format);
	var example = isUndefined(item.example);
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
}


function buildIntegerData(item, itemObj) {
	console.log('In Integer type');
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
	console.log('In Array type');
	
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
		//console.log(arrKeys);
		if (_.has(items, '$ref')) {
			itemObj.items = 'object';
			processRef(items, itemObj);
			
		} else if (_.has(items, 'type')) {
			//console.log("/n***********************\n" + JSON.stringify(items));
			var child = {};
			processType(items, child)
			_.set(itemObj, "", child);
		   //console.log(itemObj);
			
		}
		
	}
		
}

function buildbooleanData(item, itemObj) {
	console.log('In Boolean type');
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