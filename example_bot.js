var newBot = {
	bot: {
		name:'example_bot'
	},
	customSlotTypes: [
		{
			name:'slotTypeOne',
			enumerationValues: [
				'one',
				'two',
				'three',
				'four'
			]
		}, 
		{
			name:'slotTypeTwotwo',
			enumerationValues: [
				'cherry',
				'apple',
				'pineapple',
				'banana'
			]
		}
	],
	intents: [
		{
			name:'intent_1',
			slots:[
				{
					name:'slotTwo',
					required:true,//slotConstraint:'Required'
					slotType:'slotTypeTwo',
					valueElicitationPrompt:"What fruit would you like?"
				},
				{
					name:'slotOne',
					required:true,//slotConstraint:'Required'
					slotType:'slotTypeOne',
					valueElicitationPrompt:"How many would you like?"
				},
			],
			sampleUtterances: [
				'Greetings lex',
				'Greetings lex, I would like {slotOne} {slotTwo}',
				'Greetings lex, I would like a {slotTwo}',
			]
		}
	]
};

module.exports = newBot;