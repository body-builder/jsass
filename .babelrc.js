module.exports = {
	presets: [
		[
			'@babel/preset-env',
			{
				useBuiltIns: 'entry',
				corejs: '3.0.0',
				modules: false
			}
		]
	],
	plugins: [
		'@babel/plugin-proposal-class-properties',
		'@babel/plugin-transform-modules-commonjs'
	]
};
