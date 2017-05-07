#	overload2

__Elegant solution for function overloading in JavaScript.__

[![Build Status](https://travis-ci.org/YounGoat/ecmascript.overload2.svg?branch=master)](https://travis-ci.org/YounGoat/ecmascript.overload2)
[![NPM total downloads](https://img.shields.io/npm/dt/overload2.svg)](https://www.npmjs.com/package/overload2)
[![NPM version](https://img.shields.io/npm/v/overload2.svg)](https://www.npmjs.com/package/overload2)
[![NPM license](https://img.shields.io/npm/l/overload2.svg)](./LICENSE.txt)
[![GitHub stars](https://img.shields.io/github/stars/YounGoat/ecmascript.overload2.svg?style=social&label=Star)](https://github.com/YounGoat/ecmascript.overload2/stargazers)

When you are tired with writing tasteless code to do with arguments, *overload2* will __MAKE THINGS EASY__.

On programming with strongly-typed languages such as C++ and Java, [function overloading](https://en.wikipedia.org/wiki/Function_overloading) is frequently employed to make API more convenient to be used. As a weakly-typed language, JavaScript does not support function overloading. At the same time, fortunately, functions in JavaScript may be passed with any arguments that is why  *overload2* is feasible.

##	Table of contents

*	[Get Started](#get-started)
*	[Datatypes](#datatypes)
*	[Move Forward](#move-forward)
*	[APIs](#apis)
* 	[Examples](#examples)
*	[Why overload2](#why-overload2)
*	[About](#about)
*	[References](#references)

##	Links

*	[CHANGE LOG](./CHANGELOG.md)
*	[Homepage](https://github.com/YounGoat/ecmascript.overload2)

##	Get Started
<a name="get-started"></a>

Install *overload2* firstly.

```bash
# Install overload2 and save as a dependency of current package.
npm install overload2 --save
```

Open node and run next code:

```javascript
const overload2 = require('overload2');

// Create a function with overloaded implementations.
var getDay = overload2()
	// Create an overloaded implementation with method overload().
	// The last argument is the implementation function,
	// and the previous is/are used to qualify the datatypes or number of real arguments.
	.overload(
		Date, // consturctor function
		function foo(d) { return d.getDay(); }
	)
	.overload(
		'string', // predefined datatype
		function bar(s) { return new Date(s).getDay(); }
	)
	.overload(
		'number', 'number', 'number',
		function quz(year, month, date) { return new Date(year, month - 1, date).getDay(); }
	)
	.overload(
		4, // length of arguments
		function four() { console.log('too many arguments'); }
	)
	;

getDay(new Date);
// foo(d) invoked

getDay('2000-1-1');
// bar(s) invoked

getDay(2000, 1, 1);
// quz(year, month, date) invoked

getDay(1, 2, 3, 4);
// four() invoked
```

##	Datatypes
<a name="datatypes"></a>

According to *overload2* , there are different ways to define a datatype.

###	Constructor Function

*overload2* can match any instance with its constructor function, e.g. ``[0,1]`` is matched with ``Array``. See another example:

```javascript
var getDay = overlaod2()
	.overload(Date, function foo(d) { return d.getDay(); })
	.overload(String, function bar(s) { return new Date(s).getDay(); })
	;

getDay(new Date);  // foo() invoked
getDay(new String('2000-1-1'));  // bar() invoked
```

###	Customized Datatype

You may create customized datatypes by ``new overload2.Type(fn)``, e.g.

```javascript
// Create a Type object.
var MonthName = new overload2.Type(function(value) {
	var names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
	return names.indexOf(value) >= 0;
});

// Customized type may be used on overloading.
var getDay = overlaod2()
	.overload(Date, function foo(d) { return d.getDay(); })
	.overload('number', MonthName, 'number', function() {
		return new Date(year, month - 1, date).getDay();
	})
	;

getDay(2000, 'Jan', 1);
```

###	Predefined Datatype

| Predefined Data Type   | Remark |
| :--------------------- | :------------- |
| __overload2.ANY__      | Anything. |
| __overload2.BOOLEAN__  | It must be ``true`` or ``false``, anything else including instance of ``Boolean`` is unmatched. |
| __overload2.CHAR__     | A string whose length equals 1, e.g. "a" |
| __overload2.NUMBER__   | A number, but NOT instance of ``Number``. |
| __overload2.SCALAR__   | A number, string or boolean, but NOT instance of ``Number`, ``String`` or ``Boolean``. |
| __overload2.STRING__   | A string, but NOT instance of ``String``. |

###	Datatype Alias

ATTENTION: Datatype aliases are __CaseSensitive__ strings.

| Alias      | Corresponding Datetype |
| :--------- | :--------------------- |
| *          | __overload2.ANY__      |
| any        | __overload2.ANY__      |
| boolean    | __overload2.BOOLEAN__  |
| char       | __overload2.CHAR__     |
| number     | __overload2.NUMBER__   |
| scalar     | __overload2.SCALAR__   |
| string     | __overload2.STRING__   |

###	Create Datatype With Factory Method

*overload2* offers some factory methods to create frequently used datatypes, e.g. enum.

*	__overload2.enum(item[, ...])__  
	Return an enumeration type.

##	Move Forward
<a name="move-forward"></a>

Beyond the basic use, *overload2* is also suitable with more complex and large-scale programs. See the class hierarchy shown below:  
![overload2 hierarchy](./docs/overload2.png)

The usage of classes in *overload2* is explained in the next table:

| Class                            | Remark     |
| :------------------------------- | :------------- |
| __overload2.OverloadedFunction__ | wrapper of overloaded function, not a function instance itself |
| __overload2.Overload__           | to define overloading implementation |
| __overload2.ParamList__          | to define a parameter list |
| __overload2.Param__              | to define a parameter |
| __overload2.Type__               | wrapper of class (consturctor function), or to customise some datatype  |

Instances of ``Type``, ``Param``, ``ParamList`` and ``Overload`` are able to be created independently and be re-used in creating instances of superior class(es).

Here is an [example](./example/advanced.js) for advanced mode.

##	APIs
<a name="apis"></a>

###	Overloaded Function Instance

``overload2`` itself is a function, when invoked, it will return an overloded function instance.

*	\<fn\> __overload2__()  
	Create a new overloaded function. The function has no implementations before ``.overload()`` called.

*	\<fn\> __\<fn\>.overload__( [ \<datatype\>, ... ] function \<implementation\> )  
	Append an overloading implementation to existing overloaded function.

*	\<fn\> __\<fn\>.default__( function \<implementation\> )  
	Set default implementation function for existing overloaded function.

###	overload2.Type

To define a datatype in context of *overload2*, there are different ways including ``overload2.Type``. And all other datatypes will be converted to instances of ``overload2.Type`` before being used.

*	new __overload2.Type__( function | RegExp \<matcher\> )  
	Here ``matcher`` may be a function or RegExp object.

*	*private* boolean __\<type\>.match__( \<value\> )  
	Return ``true`` if value matches the datatype, otherwise return ``false``.

###	overload2.Param

A Param is made up of  a Type and some decorators. Available decorators are:

| Decorator    | Remark |
| :----------- | :------------- |
| null         | If argument equals null, it matches the parameter. |
| undefined    | If argument equals undefined (the place should be occupied), it matches the parameter. |

*	new __overload2.Param__( string "\<alias\> \<decorator\> ..." )  
	The ``alias`` should be one of alias listed in table [Datatype Alias](#datatype-alias).  

*	new __overload2.Param__( Type | function | string \<datatype\>, string \<decorator(s)\> [ , string \<decorator(s)\> ] )  
	Here ``datatype`` may be instance of ``Type``, or construtor function, or datatype alias.

* 	*private* boolean __\<param\>.satisfy__( \<value\> )  
	To judge if the argument value satisfy the parameter.

* 	Param __overload2.Param.parse__( ? )  
	Arguments suitable for ``new Param()`` are also suitable for the ``Param.parse()``.

###	overload2.ParamList

*	new __overload2.ParamList__( [ Param | Array | String \<param\> [ , ... ]  ] )  
	Here ``param`` may be an instance of ``Param``, or a string or an array which may used as argument(s) for ``new Param()``.

* 	*private* boolean __\<paramList\>.satisfy__( Array | Arguments \<args\> )  
	To check arguments with parameters, return ``true`` if matched or ``false`` if not.

* 	ParamList __overload2.ParamList.parse__( ? )  
	Arguments suitable for ``new ParamList()`` are also suitable for the ``ParamList.parse()``.

###	overload2.Overload

*	new __overload2.Overload__( number <argumentsNumber>, function \<implementation\> )  
	Create an ``Overload`` instance by restricting the number of arguments.

*	new __overload2.Overload__( ParamList, function \<implementation\> )  
	Create an ``Overload`` instance bound to specified ``ParamList``.

*	new __overload2.Overload__( \<param\> [ , ... ] , function \<implementation\> )  
	Create an ``Overload`` instance with optional definitions of ``Param``.

*	new __overload2.Overload__(function \<implementation\> )  
	Create an ``Overload`` instance which will be invoked while arguments length equals 0.

*	Overload __overload2.Overload.parse__( ? )  
	Arguments suitable for ``new Overload()`` are also suitable for the ``Overload.parse()``.

###	overload2.OverloadedFunction

*	new __overload2.OverloadedFunction__()  
	The instance of ``OverloadedFunction`` is a wrapper, not a function itself.

*	__\<wrapper\>.exec__( ... )  
	Run the overloaded function.

*	__\<wrapper\>.apply__( \<scope\>, Array | Arguments \<args\> )   
	Run the overloaded function under specified scope, passing arguments as an array or Arguments instance.

*	__\<wrapper\>.call__( \<scope\> [ , \<arg\> [ , ... ] ] )  
	Run the overloaded function under specified scope, passing arguments one by one.

* 	__\<wrapper\>.overload__( Overload \<overloadInstance\> )  
	Append an overloading implementation.

*  	__\<wrapper\>.overload__( ? )  
	Append an overloading implementation, arguments suitable for ``new Overload()`` are also suitable for the ``<wrapper>.overload()``.

##	Examples
<a name="examples"></a>

*	[Basic Usage](./example/basic.js)   
	To create overloaded function in simple way.

*	[Unit Test](./test/)  
	Another way to understand *overload2* is via reading unit-test code. To run the unit test on the local installed module, please:

	```bash
	# Change to the installing directory of overload2.
	cd node_modules/overload2

	# To install devDependencies.
	npm intall

	# Run test.
	npm test
	```

* 	[Overloaded Constructor Function](./example/constructor.js)   
	Overloaded function created by *overload2* may also be used as class constructor.

*	[Run Overloaded Function Under Specified Scope](./example/scope.js)  
	A function created by *overload2* may also be invoked by `.apply()`, `.call()`, as normal functions do. And, it may also be bound to specified scope with `.bind()`.

*	[Advanced Usage](./example/advanced.js)  
	Use *overload2* in complex situations.

##	Why overload2
<a name="why-overload2"></a>

There have been dozens of packages devoted to function overloading in JavaScript, and some of them are really not bad, e.g.

*	[overloadable](https://www.npmjs.com/package/overloadable)
*	[polymorphic](https://www.npmjs.com/package/polymorphic)
*	[overload-js](https://www.npmjs.com/package/overload-js)
*	[variadic](https://www.npmjs.com/package/variadic.js)
*	...

So, is *overload2* redundant? I donnot know. Each of previous is unsatisfactory more or less, of course *overload2* is not perfect either. Maybe future ECMAScript specification will support function overloading. However, until then, I will depend on *overload2* while coding in JavaScript.

##	About

[![NPM](https://nodei.co/npm/overload2.png?downloads=true&downloadRank=true&stars=true)](https://www.npmjs.com/package/overload2)

##	References

*	MSDN: [Overloading and Signatures](https://msdn.microsoft.com/en-us/library/aa711868.aspx)
*	MSDN: [Signatures and overloading](https://msdn.microsoft.com/en-us/library/aa691131.aspx)
*	StackOverflow: [What is an “internal slot” of an object in JavaScript?](http://stackoverflow.com/questions/33075262/what-is-an-internal-slot-of-an-object-in-javascript)
