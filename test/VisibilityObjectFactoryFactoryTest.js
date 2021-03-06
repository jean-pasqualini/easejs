/**
 * Tests factory for visibility object factory
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

require( 'common' ).testCase(
{
    caseSetUp: function()
    {
        this.sut = this.require( 'VisibilityObjectFactoryFactory' );

        this.VisibilityObjectFactory =
            this.require( 'VisibilityObjectFactory' );

        this.FallbackVisibilityObjectFactory =
            this.require( 'FallbackVisibilityObjectFactory' );

        this.util = this.require( 'util' );
    },


    /**
     * By default, if supported by our environment, we should use the standard
     * factory to provide proper visibility support.
     */
    'Returns standard factory if not falling back': function()
    {
        // don't bother with the test if we don't support the standard visibility
        // object
        if ( this.util.definePropertyFallback() )
        {
            return;
        }

        this.assertOk(
            ( this.sut.fromEnvironment()
                instanceof this.VisibilityObjectFactory ),
            "Creates standard VisibilityObjectFactory if supported"
        );
    },


    /**
     * If not supported by our environment, we should be permitted to fall back to a
     * working implementation that sacrifices visibility support.
     */
    'Returns fallback factory if falling back': function()
    {
        var old = this.util.definePropertyFallback();

        // force fallback
        this.util.definePropertyFallback( true );

        this.assertOk(
            ( this.sut.fromEnvironment()
                instanceof this.FallbackVisibilityObjectFactory
            ),
            "Creates fallback VisibilityObjectFactory if falling back"
        );

        // restore fallback
        this.util.definePropertyFallback( old );
    },
} );
