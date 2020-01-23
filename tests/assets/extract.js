const sassExtract = require('sass-extract');
const fs = require('fs');

const inputFile = './sass-variables.scss';
const outputFile = './sass-extract-sass-variables.json';

// prettier-ignore
sassExtract
	.render({
		file: inputFile
	}, {
		plugins: [
			{
				run: () => ({
					postExtract: (extracted) => {
						// Removing source paths from the output
						Object.keys(extracted.global).map((key, index) => {
							delete extracted.global[key].sources;

							extracted.global[key].declarations.map((item, index) => {
								delete extracted.global[key].declarations[index].in;
							});
						});

						return extracted;
					}
				})
			}
		]
	})
	.then((rendered) => {
		fs.writeFile(outputFile, JSON.stringify(rendered.vars, null, 2), function(err) {
			if (err) {
				console.log(err);
			} else {
				console.log(`File '${outputFile}' saved`);
			}
		});
	});
