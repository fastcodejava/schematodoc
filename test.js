/**
 * Created by gdev on 7/29/2016.
 */

var gen = require('./lib/parseSchema');
//var gen = require('generatedocument');
var inputFilePath = './swagger2.yaml'; //path to yaml file

var url = '';
var method = 'post';
gen.generateDocFromSwagger(inputFilePath, generateFunction, url, method);

/*uncomment the below lines for json file.
 In the below line give the path for json file*/
/*
 var inputFile = require("./input_swagger.json");
 var key = 'User';
 gen.generateDocFromJson(inputFile, generateFunction, key);*/


function generateFunction(obj) {
    //console.log(obj);
    var str = '';
    switch (obj.type) {
        case 'string' :
            //console.log(obj.name);
            str = obj.name === undefined ? 'String ' + 	((obj.enum === undefined) ? '' : ', Values- ' + obj.enum) :
            obj.name + ((obj.required) ? '-Required' : '') + '(' + obj.type + ((obj.description === undefined) ? '' : ', Description ' + obj.description) +
            ((obj.minLength === undefined) ? '' : ', Minimum Length ' + obj.minLength) + ((obj.maxLength === undefined) ? '' : ', Maximum Length ' + obj.maxLength) +
            ((obj.pattern === undefined) ? '' : ', Pattern ' + obj.pattern) + ((obj.format === undefined) ? '' : ', Format ' + obj.format)  +
            ((obj.example === undefined) ? '' : ', Example ' + obj.example) + ((obj.default === undefined) ? '' : ', Default ' + obj.default) + ')';
            //console.log('********\n' + obj.enum + ' VVV ' + obj.name);
            break;
        case 'integer' :
        case 'number' :
            str = obj.name + ((obj.required) ? '-Required' : '') + '(' + obj.type + ((obj.description === undefined) ? '' : ', Description ' + obj.description) +
                ((obj.minimum === undefined) ? '' : ', Minimum ' + obj.minimum) + ((obj.maximum === undefined) ? '' : ', Maximum ' + obj.maximum) +
                ((obj.exclusiveMinimum === undefined) ? '' : ', Exclusive Minimum ' + obj.exclusiveMinimum) + ((obj.exclusiveMaximum === undefined) ? '' : ', Exclusive Maximum ' + obj.exclusiveMaximum) +
                ((obj.multipleOf === undefined) ? '' : ', Multiple Of ' + obj.multipleOf) + ((obj.example === undefined) ? '' : ', Example ' + obj.example) +
                ((obj.default === undefined) ? '' : ', Default ' + obj.default) + ')';
            break;
        case 'enum' :
            str = obj.name + ((obj.required) ? '-Required' : '') + '(' + obj.type + ', [' + obj.values + '])';
            break;
        case 'boolean' :
            str = obj.name + ((obj.required) ? '-Required' : '') + '(' + obj.type + ((obj.description === undefined) ? '' : ', Description ' + obj.description) +
                ((obj.items === undefined) ? '' : ', Items ' + obj.items) + ((obj.additionalItems === undefined) ? '' : ', Additional Items ' + obj.additionalItems) +
                ((obj.default === undefined) ? '' : ', Default ' + obj.default) +
                ')';
            break;
        case 'object' :
            str = obj.name + '\n\t' + obj.reference;
            break;
        case 'array' :
            str = obj.name+ '(' + obj.type + ((obj.description === undefined) ? '' : ', Description ' + obj.description) +
                ((obj.minItems === undefined) ? '' : ', Minimum Items ' + obj.minItems) + ((obj.maxItems === undefined) ? '' : ', Maximum Items ' + obj.maxItems) +
                ((obj.additionalItems === undefined) ? '' : ', Additional Items ' + obj.additionalItems) + ((obj.uniqueItems === undefined) ? '' : ', Unique Items ' + obj.uniqueItems) +
                ((obj.default === undefined) ? '' : ', Default ' + obj.default) ;
        //',\n\t\t' + obj.reference + '\n\t\t\t(';
        //')';
    }
    return str;
}