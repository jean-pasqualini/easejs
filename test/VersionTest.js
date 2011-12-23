/**
 * Tests version.js
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
        this.version = this.require( 'version' );
    },


    'Can retrieve major version number': function()
    {
        this.assertOk( typeof this.version.major === 'number',
            'Major version number should be available'
        );
    },


    'Can retrieve minor version number': function()
    {
        this.assertOk( typeof this.version.minor === 'number',
            'Minor version number should be available'
        );
    },


    'Can retrieve revision version number': function()
    {
        this.assertOk( typeof this.version.rev === 'number',
            'Revision version number should be available'
        );
    },


    'Array of version numbers is available': function()
    {
        this.assertEqual( this.version.major, this.version[ 0 ] );
        this.assertEqual( this.version.minor, this.version[ 1 ] );
        this.assertEqual( this.version.rev, this.version[ 2 ] );
    },


    'Version string is available': function()
    {
        this.assertEqual( this.version.join( '.' ), this.version.toString(),
            'Version string should be made available'
        );
    },
} );
