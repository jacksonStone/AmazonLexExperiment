const AWS = require('aws-sdk');
const fs = require('fs');
const credentials = JSON.parse(fs.readFileSync('credentials.json', 'UTF-8'));
const awsSecretKey = credentials.amazon.AWSSecretKey;
const awsAccessKeyId = credentials.amazon.AWSAccessKeyId;
const awsCreds = new AWS.Credentials(awsAccessKeyId, awsSecretKey);
const REGION = 'us-east-1';
const LATEST = '$LATEST';
const newBot = require('./example_bot');

var buildingService = new AWS.LexModelBuildingService({
	apiVersion: '2017-04-19',
	credentials: awsCreds,
	region: REGION
});

var invoke = function(method, params){
	return buildingService[method](params).promise();
}
var getFetchBody = function(resourceName, params) {
	if(resourceName==='Bot') {
		return {
			name:params.name,
			versionOrAlias:LATEST
		}
	}
	if(resourceName === 'SlotType' || resourceName === 'Intent') {
		return {
			version: LATEST, 
			name: params.name
		}
	}
}
var putResourceWithChecksum = async function(resourceName, params){
	try {
		await invoke('put'+resourceName, params);
	}
	catch(e){
		let currentResource = await invoke('get'+resourceName, getFetchBody(resourceName, params));
		params.checksum = currentResource.checksum;
		await invoke('put'+resourceName, params);
	}
}

var createWholeBot = async function(botMetadata) {
	await createSlotTypes(botMetadata.customSlotTypes);
	await createIntents(botMetadata.intents);
	await createBot(botMetadata);
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
		await putResourceWithChecksum('SlotType', formattedSlot);
	}
};
var formatSlotsForIntent = function(slots) {
	var formattedSlots = [];
	for(let i = 0; i < slots.length; i++) {
		let slot = slots[i];
		let formattedSlot = {
			name:slot.name,
			slotConstraint: slot.required ? 'Required' : 'Optional',
			slotType:slot.slotType,
			slotTypeVersion:LATEST,
			valueElicitationPrompt:{
				maxAttempts:2, 
				messages: [{
					content: slot.question,
					contentType: "PlainText"
				}],
			}
		};
		formattedSlots.push(formattedSlot);
	}
	return formattedSlots;
}
var formatIntent = function(intentMetadata) {
	var intent = {
		name:intentMetadata.name,
		sampleUtterances:intentMetadata.sampleUtterances,
		slots:formatSlotsForIntent(intentMetadata.slots),
		fulfillmentActivity:{type:'ReturnIntent'}
	};

	return intent;
}
var createIntents = async function(intents) {
	for(let i = 0; i < intents.length; i++) {
		await putResourceWithChecksum('Intent', formatIntent(intents[i]));
	}
};
var createBot = async function(botMetadata){
	const bot = botMetadata.bot;
	const intents = botMetadata.intents;
	const formattedBot = {
		childDirected: false, /* required */
  	locale: 'en-US', /* required */
  	name: bot.name,
  	idleSessionTTLInSeconds:120,
  	intents: intents.map(intent => {
  		return {
  			intentName:intent.name,
  			intentVersion:LATEST
  		}
  	}),
  	processBehavior:'SAVE',
  	voiceId:'Joanna'
	};
	await putResourceWithChecksum('Bot', formattedBot);
};


createWholeBot(newBot);

console.log(newBot);



