import Jasmine from 'jasmine';
import { SpecReporter } from 'jasmine-spec-reporter';
import './tests/helpers/implementation_iterator';

var jasmine = new Jasmine();
jasmine.loadConfigFile('./jasmine.json');
jasmine.addReporter(new SpecReporter({
	spec: {
		displayPending: true
	}
})); // prettier-ignore
jasmine.execute();
