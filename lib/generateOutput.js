//var keywords =  require('./keywords-mapping.js').keywordMapping;
var _ = require('lodash');

exports.generateFunction = function generateFunction(obj, keywords) {
	//console.log(obj);
	var str = '';
	var defaultValue = '';
	var value = '';
	var outputArr = [];
	
	/*if (serializer !== '') {
		_.merge(keywords, serializer);
	}*/
	switch (obj.type) {
		case 'string' :
			//str = obj.name === undefined ? 'String ' + 	((obj.enum === undefined) ? '' : ', Values- ' + obj.enum) :  
				//	obj.name + ((obj.required) ? '-Required' : '') + ((obj.discriminator) ? '-Discriminator' : '') + '(' + obj.type + ((obj.description === undefined) ? '' : ', Description ' + obj.description) +

			//str = (obj.name === undefined ? 'String ' + ((obj.enum === undefined) ? '' : keywords.separator + ' ' + keywords.valuesText + ' ' + obj.enum) :  
				//	obj.name) + ((obj.required) ?  keywords.requiredText : keywords.optionalText) + ((obj.discriminator) ? keywords.discriminatorText : '') + '(' + obj.type ;
					
					//outputArr.push(keywords.openningParanthesis + obj.type);
					var addClosingParanthesis = false;
					if (obj.name === undefined ) {
						str = 'String ' + 	isUndefined(obj.description, keywords.descriptionText) +((obj.enum === undefined) ? '' : ', Enumeration- ' + obj.enum);
					} else {
					str = 	obj.name + ((obj.required) ?  keywords.requiredText : keywords.optionalText) + ((obj.discriminator) ? keywords.discriminatorText : '');
						outputArr.push(keywords.openningParanthesis + obj.type);
						isUndefined(obj.description, keywords.descriptionText, outputArr);
						addClosingParanthesis = true;
					}
					isUndefined(obj.minLength, keywords.minimumLengthText, outputArr);
					isUndefined(obj.maxLength, keywords.maximumLengthText, outputArr);
					isUndefined(obj.pattern, keywords.patternText, outputArr);
					isUndefined(obj.format, keywords.formatText, outputArr);
					isUndefined(obj.example, keywords.exampleText, outputArr);
					isUndefined(obj.default, keywords.defaultText, outputArr);
					str += outputArr.join(keywords.separator + ' ');
					if (addClosingParanthesis) {
						str += keywords.closingParanthesis;
					}
					
					
			//console.log('********\n' + obj.enum + ' VVV ' + obj.name);
			break;
		case 'integer' :
		case 'number' :
			str = obj.name + ((obj.required) ? keywords.requiredText : keywords.optionalText) + ((obj.discriminator) ? keywords.discriminatorText : '') +
					keywords.openningParanthesis + obj.type + 
					((obj.description === undefined) ? '' : keywords.separator + ' ' + keywords.descriptionText + ' ' + obj.description) +
					((obj.minimum === undefined) ? '' : keywords.separator + ' ' + keywords.minimumText + ' ' + obj.minimum) +
					((obj.maximum === undefined) ? '' : keywords.separator + ' ' + keywords.maximumText + ' ' + obj.maximum) + 
					((obj.exclusiveMinimum === undefined) ? '' : keywords.separator + ' ' + keywords.exclusiveMinimumText + ' ' + obj.exclusiveMinimum) + 
					((obj.exclusiveMaximum === undefined) ? '' : keywords.separator + ' ' + keywords.exclusiveMaximumText + ' ' + obj.exclusiveMaximum) + 
					((obj.multipleOf === undefined) ? '' : keywords.separator + ' ' + keywords.multipleOfText + ' ' + obj.multipleOf) + 
					((obj.example === undefined) ? '' : keywords.separator + ' ' + keywords.exampleText + ' ' + obj.example) + 
					((obj.default === undefined) ? '' : keywords.separator + ' ' + keywords.defaultText + ' ' + obj.default) + ')';
			break;
		case 'enum' :
			str = obj.name + ((obj.required) ? keywords.requiredText : keywords.optionalText) + ((obj.discriminator) ? keywords.discriminatorText : '') +
			keywords.openningParanthesis + obj.type + ', [' + obj.values + '])';
			break;
		case 'boolean' :
			str = obj.name + ((obj.required) ? keywords.requiredText : keywords.optionalText) + ((obj.discriminator) ? keywords.discriminatorText : '') + 
			'(' + obj.type + ((obj.description === undefined) ? '' : keywords.separator + ' ' + keywords.descriptionText + ' ' + obj.description) +
					((obj.items === undefined) ? '' : keywords.separator + ' ' + keywords.itemsText + ' ' + obj.items) + 
					((obj.additionalItems === undefined) ? '' : keywords.separator + ' ' + keywords.additionalItems + ' ' + obj.additionalItems) +
					((obj.default === undefined) ? '' : keywords.separator + ' ' + keywords.defaultText + ' ' + obj.default) + 
					')';
			break;
		case 'object' :
			str = obj.name;// + '\r\n     '; //;+ obj.reference
			break;
		case 'array' :
			str = obj.name === undefined ? keywords.arrayText + keywords.separator + ' ' :
			      obj.name+ '(' + obj.type + ((obj.description === undefined) ? '' : keywords.separator + ' ' + keywords.descriptionText + ' ' + obj.description) +
					((obj.minItems === undefined) ? '' : keywords.separator + ' ' + keywords.minimumItemsText + ' ' + obj.minItems) + 
					((obj.maxItems === undefined) ? '' : keywords.separator + ' ' + keywords.maximumItemsText + ' ' + obj.maxItems) +
					((obj.additionalItems === undefined) ? '' : keywords.separator + ' ' + keywords.additionalItems + ' ' + obj.additionalItems) + 
					((obj.uniqueItems === undefined) ? '' : keywords.separator + ' ' + keywords.uniqueItemsText + ' ' + obj.uniqueItems) +
					((obj.default === undefined) ? '' : keywords.separator + ' ' + keywords.defaultText + ' ' + obj.default) ; 
					//',\n\t\t' + obj.reference + '\n\t\t\t(';
					//')';
	}
	return str;
}

function isUndefined(propItem, keyword, arr) {
	if (propItem === undefined) {
		return '';
	} else {
		if (arr === undefined) {
			return ',' + keyword + ' ' + propItem;
		} else {
			return arr.push(keyword + ' ' + propItem);		
		}
	}
}
