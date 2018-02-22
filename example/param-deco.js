/**
 * This example is to show how to decorate your param.
 * @author youngoat@163.com
 */

const assert = require('assert');
const overload2 = require('overload2');

var getYear = overload2()
	.overload(
		// Decorators are appended to the param after datatype.
		// Decorator "null" means actual value `null` is accepted.
		// Decorator "undefined" means actual value `undefined` is accepted.
		// ATTENTION: Decorators are case insensitive.
		[ Date, 'null', 'unDefined' ],

		function f_date(d) {
			if (d === null || d === undefined) {
				d = new Date(0);
			}
			return 1900 + d.getYear();
		}
	)

	.default(
		function f_now() {
			return 1900 + (new Date).getYear();
		}
	)
	;

// f_date() invoked.
var year = getYear(null);
assert.equal(1970, year);

// f_date() invoked.
var year = getYear(undefined);
assert.equal(1970, year);

var year = getYear();

console.log('THIS LINE REACHED MEANS EVERYTHING IS OK.');
