#   Change Log

Notable changes to this project will be documented in this file. This project adheres to [Semantic Versioning 2.0.0](http://semver.org/).

##	[0.0.3] -2017-05

``overload2()`` will create a new overloaded function. Before, in v0.0.2, the overloaded function may be appended with an implementation meanwhile being created, if ``overload2()`` is called with arguments. This pattern is not only ambiguous, but also restrict the future expandability of *overload2* (arguments passed to ``overload2()`` SHOULD be used to define attributes concerned with overloading, instead of specific implementation). So, since this version, ``overload2()`` will return an overloaded function _WITHOUT ANY IMPLEMENTATION__. And programmers must implement it by calling ``.overload()`` method.

##	[0.0.1] - 2017-04

Released.

---
This CHANGELOG.md follows [*Keep a CHANGELOG*](http://keepachangelog.com/).
