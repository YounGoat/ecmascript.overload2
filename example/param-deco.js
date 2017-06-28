/**
 * This example is to show how to decorate your param.
 * @author youngoat@163.com
 */

const assert = require('assert');
const overload2 = require('overload2');

var getYear = overload2()
	.overload(
		// Decorators are appended to the param after datatype.
		[ Date, 'null', 'undefined' ],

		function date_instance(d) {
			if (d === null || d === undefined) {
				d = new Date(0);
			}
			return 1900 + d.getYear();
		}
	)
	.default(
		function date_others() {
			var d = new Date();
			return 1900 + d.getYear();
		}
	)
	;

// date_instance invoked.
var year = getYear(null);
assert.equal(1970, year);

// date_instance invoked.
var year = getYear(undefined);
assert.equal(1970, year);

console.log('THIS LINE REACHED MEANS EVERYTHING IS OK.');
