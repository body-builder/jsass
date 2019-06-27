module.exports = {
	sync: function sync(str, number) {
		// console.log('\nSync Sass function');

		const arr = [];
		for (let i = 0; i < number; i++) arr.push(str);

		return arr.join(' ');
	},
	async: function asnyc(str, number) {
		return new Promise((resolve, reject) => {
			// console.log('\nAsync Sass function');
			setTimeout(() => {
				// console.log('\nAsync Sass function resolved');

				const arr = [];
				for (let i = 0; i < number; i++) arr.push(str);

				resolve(arr.join(' '));
			}, 1000);
		});
	}
};
