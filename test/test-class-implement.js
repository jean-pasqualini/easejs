/**
 * Tests class interface implement method
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
    assert    = require( 'assert' ),

    Class         = common.require( 'class' ),
    Interface     = common.require( 'interface' ),
    AbstractClass = common.require( 'class_abstract' )
;


// test with and without abstract keyword
var Type = Interface.extend( {
        'abstract foo': [],
    }),

    Type2 = Interface.extend( {
        foo2: [],
    }),

    Foo       = {},
    PlainFoo  = Class.extend(),
    PlainFoo2 = {}
;


require( 'common' ).testCase(
{
    'Class exports contain implement method for no base class': function()
    {
        this.assertOk(
            ( Class.implement instanceof Function ),
            "Class provides method to implement interfaces"
        );
    },


    'Clsss object contains implement method for self as base': function()
    {
        this.assertOk(
            ( PlainFoo.implement instanceof Function ),
            "Classes contain an implement() method"
        );
    },


    'Can implement interface from an empty base': function()
    {
        this.assertDoesNotThrow( function()
        {
            Class.implement( Type, Type2 );
        }, Error, "Class can implement interfaces" );
    },


    /**
     * Initially, the implement() method returned an abstract class. However, it
     * doesn't make sense to create a class without any actual definition (and
     * there's other implementation considerations that caused this route to be
     * taken). One wouldn't do "class Foo implements Type", and not provide any
     * body.
     *
     * Therefore, implement() should return nothing useful until extend() is
     * called on it.
     */
    'Result of implement is not usable as a class': function()
    {
        var result = Class.implement( Type );

        this.assertEqual(
            ( Class.isClass( result ) ),
            false,
            "Result of implement operation on class is not usable as a Class"
        );
    },


    /**
     * As a consequence of the above, we must extend with an empty definition
     * (base) in order to get our abstract class.
     */
    'Abstract methods are copied into new class using empty base': function()
    {
        Foo = AbstractClass.implement( Type, Type2 ).extend( {} );

        this.assertOk(
            ( ( Foo.prototype.foo instanceof Function )
                && ( Foo.prototype.foo2 instanceof Function )
            ),
            "Abstract methods are copied into the new class prototype " +
                "(empty base)"
        );
    },


    'Can implement interface atop an exist class': function()
    {
        this.assertDoesNotThrow( function()
        {
            PlainFoo.implement( Type, Type2 );
        }, Error, "Classes can implement interfaces" );
    },


    /**
     * Ensure the same system mentioned above also applies to the extend()
     * method on existing classes
     */
    'Implementing interface atop existing class not usable by default':
    function()
    {
        var result = PlainFoo.implement( Type );

        this.assertEqual(
            ( Class.isClass( result ) ),
            false,
            "Result of implementing interfaces on an existing base is not " +
                "usable as a Class"
        );
    },


    'Abstract method copied into new class using existing base': function()
    {
        PlainFoo2 = AbstractClass.implement( Type, Type2 )
            .extend( PlainFoo, {} );

        this.assertOk(
            ( ( PlainFoo2.prototype.foo instanceof Function )
                && ( PlainFoo2.prototype.foo2 instanceof Function )
            ),
            "Abstract methods are copied into the new class prototype " +
                "(concrete base)"
        );
    },


    /**
     * Since interfaces can contain only abstract methods, it stands to reason
     * that any class implementing an interface without providing any concrete
     * methods should be abstract by default.
     */
    'Classes implementing interfaces are considered abstract by default':
    function()
    {
        this.assertEqual(
            ( Foo.isAbstract() && PlainFoo2.isAbstract() ),
            true,
            "Classes that implements interface(s) are considered abstract if " +
                "the implemented methods have no concrete implementations"
        );
    },


    'Instances of classes are instances of their implemented interfaces':
    function()
    {
        // concrete implementation so that we can instantiate it
        var ConcreteFoo = Foo.extend(
            {
                'foo':  function() {},
                'foo2': function() {},
            }),

            concrete_inst = ConcreteFoo()
        ;

        this.assertOk(
            ( concrete_inst.isInstanceOf( Type )
                && concrete_inst.isInstanceOf( Type2 )
            ),
            "Instances of classes implementing interfaces are considered to " +
                "be instances of the implemented interfaces"
        );

        this.assertEqual(
            ConcreteFoo.isAbstract(),
            false,
            "Concrete implementations are not considered to be abstract"
        );
    },


    /**
     * Consider the following scenario:
     *
     * MyClass.implement( Type ).extend( MyOtherClass, {} );
     *
     * What the above is essentially saying is: "I'd like to extend MyClass by
     * implementing Type. Oh, no, wait, I'd actually like it to extend
     * MyOtherClass." That doesn't make sense! Likely, it's unintended. Prevent
     * confusion and bugs. Throw an error.
     */
    'Cannot specify parent after implementing atop existing class': function()
    {
        this.assertThrows( function()
            {
                // should not be permitted
                PlainFoo.implement( Type, Type2 ).extend( PlainFoo2, {} );
            },
            Error,
            "Cannot specify new parent for extend() when implementing from " +
                "existing class"
        );
    },


    /**
     * Opposite of the above test. If a parent wasn't specified to begin with,
     * then we're fine to specify it in extend().
     */
    'Can specify parent if implementing atop empty class': function()
    {
        this.assertDoesNotThrow(
            function()
            {
                // this /should/ work
                AbstractClass.implement( Type ).extend( PlainFoo, {} );
            },
            Error,
            "Can specify parent for exetnd() when implementing atop an " +
                "empty base"
        );
    },


    /**
     * If more than two arguments are given to extend(), then the developer
     * likely does not understand the API. Throw an error to prevent some
     * bugs/confusion.
     */
    'Throws exception if extend contains too many arguments': function()
    {
        this.assertThrows( function()
        {
            Class.implement( Type ).extend( PlainFoo, {}, 'extra' );
        }, Error, "extend() after implementing accepts no more than two args" );
    },
} );

