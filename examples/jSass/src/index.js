import { JSass, JSass_mod_jQuery } from '../../../src/JSass';

// Connecting Sass and JS
window.jSass = new JSass(require('./jSass.scss'));

// Patching jQuery to be able to use our Sass selectors directly in jQuery
JSass_mod_jQuery(window.jSass, window.jQuery);

import './styles.scss';

$(document).ready(function() {
	// We can get the value of any variables from the jSass instance.
	const backgroundColors = window.jSass.get('$backgroundColors');
	// With using `JSass_mod_jQuery`, we can use Sass's selectors directly in jQuery.
	const $target = $('$targetSelector');

	console.info('Processed variables:', window.jSass._variables.global);
	console.info('jSass.get("$backgroundColors")', window.jSass.get('$backgroundColors'));
	console.info('jQuery("$targetSelector")', window.jQuery('$targetSelector'));

	let currentColor = 0;
	const timeout = 1500;

	function updateColors() {
		if (currentColor < backgroundColors.length - 1) {
			currentColor++;
		} else {
			currentColor = 0;
		}

		$target.animate({
			backgroundColor: backgroundColors[currentColor]
		}, timeout);

	}

	setInterval(updateColors, timeout);
	updateColors();
});
