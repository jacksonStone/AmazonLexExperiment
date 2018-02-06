const AWS = require('aws-sdk');
const fs = require('fs');
const credentials = JSON.parse(fs.readFileSync('credentials.json', 'UTF-8'));
const awsSecretKey = credentials.amazon.AWSSecretKey;
const awsAccessKeyId = credentials.amazon.AWSAccessKeyId;
const awsCreds = new AWS.Credentials(awsAccessKeyId, awsSecretKey);
const REGION = 'us-east-1';
const newBot = require('./example_bot');

var buildingService = new AWS.LexModelBuildingService({
	apiVersion: '2017-04-19',
	credentials: awsCreds,
	region: REGION
});

var invoke = function(method, params){
	return buildingService[method](params).promise();
}

var createWholeBot = async function(botMetadata) {
	await createSlotTypes(botMetadata.customSlotTypes);
	await createIntents(botMetadata.intents);
	await createBot(botMetadata.bot);
};

var createSlotTypes = async function(slotTypes) {
	for(let i = 0; i < slotTypes.length; i++) {
		let slotType = slotTypes[i];
		let formattedSlot = {
			name: slotType.name
		};
		let values = [];
		for(let j = 0; j < slotType.enumerationValues.length; j++) {
			var value = slotType.enumerationValues[j];
			values.push({value});
		}
		formattedSlot.enumerationValues = values;
		try {
			await invoke('putSlotType', formattedSlot);
		} catch(e) {
			var existingSlotType = await invoke('getSlotType',{ version: "$LATEST", name: formattedSlot.name});
			formattedSlot.checksum = existingSlotType.checksum;
			await invoke('putSlotType', formattedSlot);
		}
	}
};
var createIntents = async function(intents) {

};
var createBot = async function(bot){

};


createWholeBot(newBot);

console.log(newBot);



