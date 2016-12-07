var keywordMapping  =  {
	requiredText: "-Required",
    discriminatorText: "-Discriminator",
	minimumLengthText: "Minimum Length",
	maximumLengthText: "Maximum Length",
	patternText: "Pattern",
	exampleText: "Example",
	formatText: "Format",
	defaultText: "Default",
	minimumText: "Minimum",
	maximumText: "Maximum",
	multipleOfText: "Multiple Of",
	exclusiveMinimumText: "Exclusive Minimum",
	exclusiveMaximumText: "Exclusive Maximum",
	descriptionText: "Description",
	additionalItems: "Additional Items",
	itemsText: "Items",
	minimumItemsText: "Minimum Items",
	maximumItemsText: "Maximum Items",
	uniqueItemsText: "Unique Items",
	separator: ",",
	openningParanthesis: "(",
	closingParanthesis: ")",
	emptyText: "",
	valuesText: "Values-",
	optionalText: "",
	objectStart: "{",
	objectEnd: "}",
	arrayStart: "[",
	arrayEnd: "]",
	arrayText: "array",
	enumSeperator: "-"
  };

var formatMapping = {
	formatStart: "<h>",
	formatEnd: "</h>",
	descTitle: "Description added by schematodoc module."
	
}  
 
module.exports = {
	keywordMapping: keywordMapping,
	formatMapping: formatMapping
};
