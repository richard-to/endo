require(['../js/config'], function() {
require(['Endo'], function(Endo) {

    // Navigation View Controller Tests
    // --------------------------------

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

    test("Test segue", function() {
        
        var segueView = new Endo.ViewController();        
        var segueIdentifier = 'segueTest';
        var segueIdentifierResult;

        var TestViewController = Endo.ViewController.extend({
            el: '<p><a class="test"></a></p>',
            events: {
                'click .test': 'nextView'
            },
            nextView: function(events) {
                this.performSegue(segueIdentifier);    
            },
            prepareSegue: function(segue) {
                segueIdentifierResult = segue.identifier;
            }
        });

        var root = new TestViewController({
            segues: {
                segueTest: segueView
            }
        });
        var nc = new Endo.NavigationViewController({
            rootViewController: root
        });

        root.$('.test').trigger('click');

        ok(segueIdentifierResult === segueIdentifier);
        ok(segueView === nc.topViewController());
    });                            
});
});