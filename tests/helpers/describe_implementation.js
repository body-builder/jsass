const implementations = {
	'Node Sass': require('node-sass'),
	'Dart Sass': require('sass')
};

/**
 * Iterates a specDefinition over the different Sass implementations
 * @param description
 * @param specDefinitions
 */
function describe_implementation(description, specDefinitions) {
	if (typeof specDefinitions !== 'function') throw new Error('describe_implementation needs a function containing the specDefinitions');

	Object.keys(implementations).map((key, index) => {
		const implementation_description = description + ' with ' + key;
		const implementation = implementations[key];

		describe(implementation_description, specDefinitions.bind(null, implementation));
	});
}

module.exports = describe_implementation;
