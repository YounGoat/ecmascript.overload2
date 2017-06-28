/**
 * This example is to show the basic usage of *overload2*.
 *
 * @author youngoat@163.com
 */

const assert = require('assert');
const overload2 = require('overload2');

// Create a function with overloaded implementations.
var getDay = overload2()
	// Create an overloaded implementation with method overload().
	// The last argument is the implementation function,
	// and the previous is/are used to qualify the datatypes or number of real arguments.
	.overload(
		Date, // consturctor function
		function date_instance(d) { return d.getDay(); }
	)
	.overload(
		'string', // predefined datatype
		function date_string(s) { return new Date(s).getDay(); }
	)
	.overload(
		'number', 'number', 'number',
		function ymd(year, month, date) {
			return new Date(year, month - 1, date).getDay();
		}
	)
	.overload(
		2, // length of arguments
		function md(month, date) {
			var d = new Date;
			return d.setMonth(month - 1), d.setDate(date), d.getDay();
		}
	)
	.overload(
		'*', Date, '*',
		function select(some, d, others) {
			return d.getDay();
		}
	)
	;

// date_instance(d) invoked
var day = getDay(new Date('2000-1-1'));
assert.equal(day, 6);

// date_string(s) invoked
var day = getDay('2000-1-1');
assert.equal(day, 6);

// ymd(year, month, date) invoked
var day = getDay(2000, 1, 1);
assert.equal(day, 6);

// md(month, date) invoked
var day = getDay(1, 1);
assert(0 <= day && day <= 6);

var day = getDay('a', 'b', new Date('2000-1-1'), 'c', 'd');
assert.equal(day, 6);

console.log('THIS LINE REACHED MEANS EVERYTHING IS OK.');
