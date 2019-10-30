const sleep = require('util').promisify(setTimeout);

module.exports = {
	sync: function sync(str, number) {
		// console.log('\nSync Sass function');

		const arr = [];
		for (let i = 0; i < number; i++) arr.push(str);

		return arr.join(' ');
	},
	async: function asnyc(str, number) {
		return new Promise((resolve, reject) => {
			// console.log('\nFunction returning promise');
			setTimeout(() => {
				// console.log('\nPromise resolved');

				const arr = [];
				for (let i = 0; i < number; i++) arr.push(str);

				resolve(arr.join(' '));
			}, 1000);
		});
	},
	async_es6: async function(str, number) {
		// console.log('\nAsync Sass function');
		await sleep(1000);
		// console.log('\nAsync Sass function resolved');

		const arr = [];
		for (let i = 0; i < number; i++) arr.push(str);

		return arr.join(' ');
	}
};
