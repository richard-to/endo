require(['../js/config'], function() {
require(['Endo'], function(Endo) {

	// Navigation View Controller Tests

	test("Test no root controller specified", function() {
		raises(function() {
			var nc = new Endo.NavigationViewController();
		});
	});

	test("Test init root controller", function() {
		var root = new Endo.ViewController();
		var nc = new Endo.NavigationViewController({
			rootViewController: root
		});

		ok(root === nc.topViewController());
	});

	test("Test init view controllers", function() {
		var root = new Endo.ViewController();
		var top = new Endo.ViewController();
		var nc = new Endo.NavigationViewController({
			viewControllers: [root, top]
		});

		ok(top === nc.topViewController());
		ok(root === nc.rootViewController);
	});

	test("Test init root view controller override", function() {
		var root = new Endo.ViewController();
		var top = new Endo.ViewController();
		var nc = new Endo.NavigationViewController({
			viewControllers: [root, top],
			rootViewController: root
		});

		ok(root === nc.topViewController());
		ok(root === nc.rootViewController);
	});

	test("Test push/pop", function() {
		var root = new Endo.ViewController();
		var top = new Endo.ViewController();
		var nc = new Endo.NavigationViewController({
			viewControllers: [root, top]
		});

		nc.popViewController();
		ok(root === nc.topViewController());

		nc.popViewController();
		ok(root === nc.topViewController());

		nc.pushViewController(top);
		ok(top === nc.topViewController());
	});

	test("Test pop to root", function() {
		var root = new Endo.ViewController();
		var mid = new Endo.ViewController();
		var top = new Endo.ViewController();
		var nc = new Endo.NavigationViewController({
			viewControllers: [root, mid, top]
		});

		nc.popToRootViewController();
		ok(root === nc.topViewController());
	});					
});
});