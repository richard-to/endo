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

    test("Test push/pop", function() {
        var root = new Endo.ViewController();
        var top = new Endo.ViewController();
        var nc = new Endo.NavigationViewController({
            rootViewController: root
        });

        nc.pushViewController(top);
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
            rootViewController: root
        });

        nc.pushViewController(mid);
        nc.pushViewController(top);
        nc.popToRootViewController();
        ok(root === nc.topViewController());
    });

    test("Test parent/navigation controller", function() {
        var root = new Endo.ViewController();
        var top = new Endo.ViewController();
        var nc = new Endo.NavigationViewController({
            rootViewController: root
        });

        nc.pushViewController(top);

        ok(root.parentViewController === nc);
        ok(root.navigationController === nc);

        ok(top.navigationController === nc);
        nc.popViewController();
        ok(top.navigationController === null);

        nc.pushViewController(top);
        ok(top.navigationController === nc);

    }); 

     test("Test render controller", function() {
        var root = new Endo.ViewController();
        var top = new Endo.ViewController();
        var nc = new Endo.NavigationViewController({
            rootViewController: root
        });

        nc.pushViewController(top);
        ok(root.parentViewController === nc);
        ok(root.navigationController === nc);

        ok(top.navigationController === nc);
        nc.popViewController();
        ok(top.navigationController === null);

        nc.pushViewController(top);
        ok(top.navigationController === nc);

    });                         
});
});