/**
 * Creates a promise, which can be resolved/rejected from outside of its scope.
 * (credits to https://stackoverflow.com/a/54411328/3111787)
 */
class Deferred {
	constructor(handler) {
		this.promise = new Promise((resolve, reject) => {
			this.reject = reject;
			this.resolve = resolve;
			if (typeof handler === 'function') {
				handler(resolve, reject);
			}
		});

		this.promise.resolve = this.resolve;
		this.promise.reject = this.reject;

		return this.promise;
	}
}

module.exports = Deferred;
