/**
 * Tests class member visibility (public, private, protected)
 *
 *  Copyright (C) 2010,2011 Mike Gerwitz
 *
 *  This file is part of ease.js.
 *
 *  ease.js is free software: you can redistribute it and/or modify it under the
 *  terms of the GNU Lesser General Public License as published by the Free
 *  Software Foundation, either version 3 of the License, or (at your option)
 *  any later version.
 *
 *  This program is distributed in the hope that it will be useful, but WITHOUT
 *  ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 *  FITNESS FOR A PARTICULAR PURPOSE.  See the GNU Lesser General Public License
 *  for more details.
 *
 *  You should have received a copy of the GNU Lesser General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * @author  Mike Gerwitz
 */

var common    = require( './common' ),
    Class     = common.require( 'class' ),
    Interface = common.require( 'interface' ),
    util      = common.require( 'util' ),

    pub  = 'foo',
    prot = 'bar',
    priv = 'baz',

    pubf  = function() { return pub; },
    protf = function() { return prot; },
    privf = function() { return priv; },

    // new anonymous class instance
    Foo = Class.extend( {
        'public pub':      pub,
        'protected peeps': prot,
        'private parts':   priv,

        'public pubf':     pubf,
        'protected protf': protf,
        'private privf':   privf,


        'virtual public getProp': function( name )
        {
            // return property, allowing us to break encapsulation for
            // protected/private properties (for testing purposes)
            return this[ name ];
        },


        /**
         * Does the same as the above, but we won't override this one
         */
        'public nonOverrideGetProp': function( name )
        {
            return this[ name ];
        },


        /**
         * Allows us to set a value from within the class
         */
        'public setValue': function( name, value )
        {
            this[ name ] = value;
        },


        'public getSelf': function()
        {
            return this;
        },


        'virtual public getSelfOverride': function()
        {
            // override me
        },


        'public getPrivProp': function()
        {
            return this.parts;
        },


        'public invokePriv': function()
        {
            return this._priv();
        },


        'private _priv': function()
        {
            return priv;
        },
    }),

    // instance of Foo
    foo = Foo(),

    // subtype
    SubFoo  = Foo.extend({
        'private _pfoo': 'baz',

        'override public getSelfOverride': function()
        {
            // return this from overridden method
            return this;
        },


        /**
         * We have to override this so that 'this' is not bound to the supertype
         */
        'override public getProp': function( name )
        {
            // return property, allowing us to break encapsulation for
            // protected/private properties (for testing purposes)
            return this[ name ];
        },


        'private myOwnPrivateFoo': function() {},
    }),
    sub_foo = SubFoo(),

    sub_sub_foo = SubFoo.extend( {} )()
;


require( 'common' ).testCase(
{
    /**
     * Public members are the only members added to the instance's prototype to
     * be accessible externally
     */
    'Public members are accessible externally': function()
    {
        this.assertEqual(
            foo.pub,
            pub,
            "Public properties are accessible via public interface"
        );

        this.assertEqual(
            foo.pubf(),
            pub,
            "Public methods are accessible via public interface"
        );
    },


    /**
     * For reasons that are discussed in the next test (writing to public
     * properties), we need to make sure public members are available
     * internally.  Actually, we don't need to test public methods, really, but
     * it's in there for good measure. Who knows what bugs may be introduced in
     * the future.
     *
     * This ensures that the getter is properly proxying the value to us.
     */
    'Public members are accessible internally': function()
    {
        this.assertEqual(
            foo.getProp( 'pub' ),
            pub,
            "Public properties are accessible internally"
        );

        this.assertEqual(
            foo.getProp( 'pubf' )(),
            pub,
            "Public methods are accessible internally"
        );
    },


    /**
     * This may sound like an odd test, but it's actually very important. Due to
     * how private/protected members are implemented, it compromises public
     * members. In fact, public members would not work internally without what
     * is essentially a proxy via setters.
     *
     * This test is to ensure that the setter is properly forwarding writes to
     * the object within the prototype chain containing the public values.
     * Otherwise, setting the value would simply mask it in the prototype chain.
     * The value would appear to have changed internally, but when accessed
     * externally, the value would still be the same. That would obviously be a
     * problem ;)
     */
    'Public properties are writable internally': function()
    {
        var val = 'moomookittypoo';

        // start by setting the value
        foo.setValue( 'pub', val );

        // we should see that change internally...
        this.assertEqual(
            foo.getProp( 'pub' ),
            val,
            "Setting the value of a public property internally should be " +
                "observable /internally/"
        );

        // ...as well as externally
        this.assertEqual(
            foo.pub,
            val,
            "Setting the value of a public property internally should be " +
                "observable /externally/"
        );
    },


    'Protected and private members are not accessible externally': function()
    {
        // browsers that do not support the property proxy will not support
        // encapsulating properties
        if ( util.definePropertyFallback() )
        {
            return;
        }

        this.assertEqual(
            foo.peeps,
            undefined,
            "Protected properties are inaccessible via public interface"
        );

        this.assertEqual(
            foo.parts,
            undefined,
            "Private properties are inaccessible via public interface"
        );

        this.assertEqual(
            foo.protf,
            undefined,
            "Protected methods are inaccessible via public interface"
        );

        this.assertEqual(
            foo.privf,
            undefined,
            "Private methods are inaccessible via public interface"
        );
    },


    /**
     * Protected members should be accessible from within class methods
     */
    'Protected members are accessible internally': function()
    {
        this.assertEqual(
            foo.getProp( 'peeps' ),
            prot,
            "Protected properties are available internally"
        );

        // invoke rather than checking for equality, because the method may be
        // wrapped
        this.assertEqual(
            foo.getProp( 'protf' )(),
            prot,
            "Protected methods are available internally"
        );
    },


    /**
     * Private members should be accessible from within class methods
     */
    'Private members are accessible internally': function()
    {
        this.assertEqual(
            foo.getProp( 'parts' ),
            priv,
            "Private properties are available internally"
        );

        // invoke rather than checking for equality, because the method may be
        // wrapped
        this.assertEqual(
            foo.getProp( 'privf' )(),
            priv,
            "Private methods are available internally"
        );
    },


    /**
     * Inheritance 101; protected members should be available to subtypes
     */
    'Protected members are inherited from parent': function()
    {
        this.assertEqual(
            sub_foo.getProp( 'peeps' ),
            prot,
            "Protected properties are available to subtypes"
        );

        // invoke rather than checking for equality, because the method may be
        // wrapped
        this.assertEqual(
            sub_foo.getProp( 'protf' )(),
            prot,
            "Protected methods are available to subtypes"
        );
    },


    /**
     * Interface 101-2: We do not want private members to be available to
     * subtypes.
     */
    'Private members of supertypes are inaccessible to subtypes': function()
    {
        // browsers that do not support the property proxy will not support
        // encapsulating properties
        if ( util.definePropertyFallback() )
        {
            return;
        }

        this.assertEqual(
            sub_foo.getProp( 'parts' ),
            undefined,
            "Private properties of supertypes should be unavailable to subtypes"
        );

        // invoke rather than checking for equality, because the method may be
        // wrapped
        this.assertEqual(
            sub_foo.getProp( 'privf' ),
            undefined,
            "Private methods of supertypes should be unavailable to subtypes"
        );
    },


    /**
     * For good measure, let's make sure we didn't screw anything up. To ensure
     * that the same object isn't being passed around to subtypes, ensure that
     * multiple class instances do not share prototypes.
     */
    'Protected members are not shared between class instances': function()
    {
        var val = 'foobar';

        foo.setValue( 'prot', val );

        // ensure that class instances do not share values (ensuring the same
        // object isn't somehow being passed around)
        this.assertNotEqual(
            sub_foo.getProp( 'prot' ),
            val,
            "Class instances do not share protected values (subtype)"
        );

        // do the same for multiple instances of the same type
        var sub_foo2 = SubFoo();
        sub_foo2.setValue( 'prot', val );

        this.assertNotEqual(
            sub_foo.getProp( 'prot' ),
            val,
            "Class instances do not share protected values (same type)"
        );
    },


    /**
     * When a method is called, 'this' is bound to the property object
     * containing private and protected members. Returning 'this' would
     * therefore be a very bad thing. Not only would it break encapsulation, but
     * it would likely have other problems down the road.
     *
     * Therefore, we have to check the return value of the method. If the return
     * value is the property object that it was bound to, we need to replace the
     * return value with the actual class instance. This allows us to
     * transparently enforce encapsulation. How sweet is that?
     */
    'Returning self from method should return instance not prop obj': function()
    {
        this.assertDeepEqual(
            foo.getSelf(),
            foo,
            "Returning 'this' from a method should return instance of self"
        );

        // what happens in the case of inheritance?
        this.assertDeepEqual(
            sub_foo.getSelf(),
            sub_foo,
            "Returning 'this' from a super method should return the subtype"
        );

        // finally, overridden methods should still return the instance
        this.assertDeepEqual(
            sub_foo.getSelfOverride(),
            sub_foo,
            "Returning 'this' from a overridden method should return subtype"
        );
    },


    /**
     * This one's a particularly nasty bug that snuck up on me. Private members
     * should not be accessible to subtypes; that's a given. However, they need
     * to be accessible to the parent methods. For example, let's say class Foo
     * contains public method bar(), which invokes private method _baz(). This
     * is perfectly legal. Then SubFoo extends Foo, but does not override method
     * bar().  Invoking method bar() should still be able to invoke private
     * method _baz(), because, from the perspective of the parent class, that
     * operation is perfectly legal.
     *
     * The resolution of this bug required a slight system redesign. The
     * short-term fix was to declare any needed private members are protected,
     * so that they were accessible by the subtype.
     */
    'Parent methods can access private members of parent': function()
    {
        // properties
        this.assertEqual(
            sub_foo.getPrivProp(),
            priv,
            "Parent methods should have access to the private properties of " +
                "the parent"
        );

        // methods
        this.assertEqual(
            sub_foo.invokePriv(),
            priv,
            "Parent methods should have access to the private methods of the " +
                "parent"
        );

        // should apply to super-supertypes too
        this.assertEqual(
            sub_sub_foo.getPrivProp(),
            priv,
            "Parent methods should have access to the private properties of " +
                "the parent (2)"
        );
        this.assertEqual(
            sub_sub_foo.invokePriv(),
            priv,
            "Parent methods should have access to the private methods of the " +
                "parent (2)"
        );
    },


    /**
     * When a parent method is invoked, the parent should not be given access to
     * the private members of the invoking subtype. Why?
     *
     * This is not a matter of whether or not this is possible to do. In fact
     * it's relatively simple to implement. The issue is whether or not it makes
     * sense.  Consider a compiled language. Let's say Foo and SubFoo (as
     * defined in this test case) were written in C++. Should Foo have access to
     * a private property on SubFoo when it is overridden?
     *
     * No - that doesn't make sense. The private member is not a member of Foo
     * and therefore Foo would fail to even compile. Alright, but we don't have
     * such a restriction in our case. So why not implement it?
     *
     * Proponents of such an implementation are likely thinking of the act of
     * inheriting methods as a copy/paste type of scenario. If we inherit public
     * method baz(), and it were a copy/paste type of situation, then surely
     * baz() would have access to all of SubFoo's private members. But that is
     * not the case. Should baz() be defined as a member of Foo, then its scope
     * is restricted to Foo and its supertypes. That is not how OO works. It is
     * /not/ copy/paste. It is inheriting functionality.
     */
    'Parents should not have access to private members of subtypes': function()
    {
        // browsers that do not support the property proxy will not support
        // encapsulating properties
        if ( util.definePropertyFallback() )
        {
            return;
        }

        // property
        this.assertEqual(
            sub_foo.nonOverrideGetProp( '_pfoo' ),
            undefined,
            "Parent should not have access to private properties of subtype " +
                "whena parent method is invoked"
        );

        // member
        this.assertEqual(
            sub_foo.nonOverrideGetProp( '_myOwnPrivateFoo' ),
            undefined,
            "Parent should not have access to private methods of subtype " +
                "when a parent method is invoked"
        );
    },


    /**
     * Visibility escalation (protected -> private) should be permitted
     */
    'Can escalate member visibility': function()
    {
        // escalate
        this.assertDoesNotThrow( function()
        {
            Class(
            {
                'protected foo': 'bar',
                'virtual protected baz': function() {},
            } ).extend( {
                'public foo': 'bar',
                'override public baz': function() {},
            } );
        }, Error, "Can escalate visibility of subtype members" );

        // same level of visibility
        this.assertDoesNotThrow( function()
        {
            Class(
            {
                'protected foo': 'bar',
                'virtual protected baz': function() {},
            } ).extend( {
                'protected foo': 'bar',
                'override protected baz': function() {},
            } );
        }, Error, "Can retain level of visibility for subtype members" );
    },


    /**
     * We should /not/ be able to de-escalate member visibility
     * (public -> {protected,private}
     */
    'Cannot de-escalate member visibility': function()
    {
        // public -> protected
        this.assertThrows( function()
        {
            Class(
            {
                'public foo': 'bar',
            } ).extend( {
                'protected foo': 'bar',
            } );
        }, Error, "Cannot de-escalate visibility of sub-props to protected" );

        this.assertThrows( function()
        {
            Class(
            {
                'virtual public baz': function() {},
            } ).extend( {
                'protected baz': function() {},
            } );
        }, Error, "Cannot de-escalate visibility of sub-methods to protected" );


        // public -> private
        this.assertThrows( function()
        {
            Class(
            {
                'public foo': 'bar',
            } ).extend( {
                'private foo': 'bar',
            } );
        }, Error, "Cannot de-escalate visibility of subtype props to private" );

        this.assertThrows( function()
        {
            Class(
            {
                'virtual public baz': function() {},
            } ).extend( {
                'private baz': function() {},
            } );
        }, Error, "Cannot de-escalate visibility of sub-methods to private" );


        // protected -> private
        this.assertThrows( function()
        {
            Class(
            {
                'protected foo': 'bar',
            } ).extend( {
                'private foo': 'bar',
            } );
        }, Error, "Cannot de-escalate visibility of sub-props to private2" );

        this.assertThrows( function()
        {
            Class(
            {
                'virtual protected baz': function() {},
            } ).extend( {
                'private baz': function() {},
            } );
        }, Error, "Cannot de-escalate visibility of sub-methods to private2" );
    },


    /**
     * With the visibility implementation, it's possible that __super() will not
     * work properly with protected methods. This is because of the override
     * lookup process (which hopefully was fixed in the commit before this test
     * was originally introduced: ce736bea).
     */
    'Calling super method works properly with protected methods': function()
    {
        var val = 'foobar',
            result = Class( {
                'virtual protected foo': function()
                {
                    return val;
                },
            } ).extend(
            {
                // we override to public just so we can call it externally
                'override public foo': function()
                {
                    return this.__super();
                },
            } )().foo();

        this.assertEqual( result, val,
            "__super() calls work with protected overrides"
        );
    },


    /**
     * Concrete implementations of interfaces should have to follow the same
     * visibility de-escalation rules as defined in the above tests (otherwise,
     * that defeats the purpose of an interface). In other words, they must be
     * public.
     */
    'Visibility de-escalation rulse apply to interfaces': function()
    {
        this.assertThrows( function()
        {
            Class.implement( Interface( { 'abstract public foo': [] } ) )
                .extend(
                {
                    // should throw an exception; visibility de-escalation
                    'protected foo': function() {},
                }
            );
        }, Error, "Cannot de-escalate visibility for interface members" );
    },


    /**
     * Due to the way the property object is laid atop of the public members, we
     * need to ensure that protected methods' functionality can /actually/ be
     * overridden, since the protected method is higher in the prototype chain
     * and therefore will be accessed before the public method.
     *
     * We don't care about private -> protected, because that's not possible
     * through inheritance.
     */
    'Can override protected method functionality with public': function()
    {
        // get the result of invoking overridden foo()
        var result = Class(
            {
                'virtual protected foo': function()
                {
                    return false;
                },
            } ).extend(
            {
                // override and escalate visibility of method foo()
                'override public foo': function()
                {
                    return true;
                },
            } )().foo();

        // if the override was successful, we'll be able to invoke the
        // overridden method
        this.assertEqual( result, true,
            "Can properly override protected methods with public"
        );
    },


    /**
     * There was an issue where the private property object was not proxying
     * values to the true protected values. This would mean that when the parent
     * initialized protected values, those values would be unavailable to the
     * subtype. Instead, the value available to the subtype was the value that
     * was assigned as the default value in the class definition.
     */
    'Protected values are available to subtypes when set by parent': function()
    {
        var expected = 5,
            result   = Class(
            {
                'protected val': 0,

                'public __construct': function()
                {
                    this.val = expected;
                },
            } ).extend(
            {
                'public getVal': function()
                {
                    return this.val;
                },
            } )().getVal();

        this.assertEqual( result, expected,
            "Subtypes should have acess to protected properties values set " +
                "by super methods"
        );
    },


    /**
     * There was a bug introduced when we prevented protected members from
     * overriding public (since in the prototype chain, protected members are
     * laid atop public, and this cannot change). This bug would disallow
     * protected members from being overridden by other protected members.
     *
     * This test is both a proof and a regression test.
     */
    'Can properly override protected with protected': function()
    {
        var val    = 'foobar',
            result = Class(
            {
                'virtual protected foo': function() {},
            } ).extend(
            {
                // provide concrete implementation
                'override protected foo': function()
                {
                    return val;
                },

                'public doFoo': function()
                {
                    return this.foo();
                },
            } )().doFoo();
        ;

        // if everything worked as expected, the value of 'val' will have been
        // returned and stored in 'result'
        this.assertEqual( result, val,
            "Protected methods can properly be overriden by another " +
                "protected method"
        );
    },
} );

