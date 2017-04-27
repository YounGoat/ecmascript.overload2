/**
 * This example is to show how to:
 *   (1) Create an overloaded function (instanceof overload2.OverloadedFunction) with "new" operator.
 *   (2) Create independent overloading implementation (instanceof overload2.Overload).
 *   (3) Create independent parameters (instanceof overload2.ParamList).
 *   (4) Create independent parameter (instanceof overload2.Param).
 * Search the leading number in code for examples.
 *
 * @author youngoat@163.com
 */

const assert = require('assert');
const overload2 = require('overload2');

/*1*/
// Create an overloaded function.
// Equals to "overload()" but more formal.
var getDay = new overload2.Function();

var justCalled;

/*2*/
// Create an overloading implementation.
var o1 = new overload2.Overload(
	// Parameters.
	Date,

	// Implementation function.
	function(d) {
		justCalled = 'Date';
		return d.getDay();
	});

/*4*/
// Create a parameter whose corresponding argument may be instance of String or null.
var paramString = new overload2.Param(String, 'null');

/*4*/
// Independent parameter is used in creating overloading implementation.
var o2 = new overload2.Overload(
	paramString,
	function(s) {
		justCalled = 'String';
		return new Date(s).getDay();
	});


/*4*/
// Create a parameter whose corresponding argument may be a number between 1 and 31.
var paramDateNumber = new overload2.Param(new overload2.Type(
	function(value) { return typeof value == 'number' && 1 <= value && value <= 31; }
), 'null undefined');

/*3*/
/*4*/
// Create an independent parameters instance.
// Independent parameter is used in creating overloading
var paramlist3 = new overload2.ParamList('number', 'number', paramDateNumber);

/*3*/
// Independent parameters object is used in creating overloading implementation.
var o3 = new overload2.Overload(
	paramlist3,
	function(year, month, date) {
		justCalled = 'paramlist3';
		return new Date(year, month - 1, date).getDay();
	});

/*2*/
// Append independent overloading implementations to existing overloaded function.
getDay.overload(o1).overload(o2).overload(o3);

var day = getDay.call(null, new Date('2000-1-1'));
assert(justCalled, 'Date');

var day = getDay.exec(new String('2000-1-1'));
assert(justCalled, 'String');

var day = getDay.apply(null, [ 2000, 1, 1 ]);
assert(justCalled, 'paramlist3');

// The OverloadedFUnction SHOULD NOT be invoked directly.
try {
	var day = getDay('2000-1-1');
	console.log(day);
} catch (e) {
	assert(e instanceof TypeError);
}

console.log('THIS LINE REACHED MEANS EVERYTHING IS OK.');
