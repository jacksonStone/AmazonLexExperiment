var _ = require('lodash');
var metadata = require('./dynamicsMetadata');
var allFields = {};
_.each(metadata, entity=> {
	var fields = entity._m.fields;
	_.each(fields, field => {
		allFields[field.label] = 1;
	})
});

var allFieldLabels = Object.keys(allFields);

var newBot = {
	bot: {
		name:'example_bot'
	},
	customSlotTypes: [
		{
			name:'all_dynamics_fields',
			enumerationValues: allFieldLabels
		},
	],
	intents: [
		{
			name:'intent_dynamics_example',
			slots:[
				{
					name:'slotOne',
					required:true,//slotConstraint:'Required'
					slotType:'all_dynamics_fields',
					question:"What field would you like?"
				},
			],
			sampleUtterances: [
				'Greetings lex',
				'Greetings lex, I would like {slotOne}'
			]
		}
	]
};

module.exports = newBot;

