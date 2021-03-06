/**
 * Handles building members (properties, methods) in a pre-ES5 environment
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

/**
 * Supertype
 */
var MemberBuilder = require( __dirname + '/MemberBuilder' );

/**
 * Responsible for building class members
 */
module.exports = exports = function FallbackMemberBuilder(
    wrap_method, wrap_override
)
{
    // permit omitting 'new' keyword
    if ( !( this instanceof module.exports ) )
    {
        return new module.exports( wrap_method, wrap_override );
    }

    // invoke parent constructor
    module.exports.prototype.constructor.call( this,
        wrap_method, wrap_override
    );
};

// inherit from MemberBuilder
module.exports.prototype   = new MemberBuilder();
module.exports.constructor = module.exports;


/**
 * Getters/setters are unsupported in a pre-ES5 environment
 *
 * Simply throw an exception, as it clearly represents that the developer did
 * not account for the possibility that their software may have been executed in
 * a pre-ES5 environment.
 */
exports.prototype.buildGetterSetter = function()
{
    throw Error( 'Getters/setters are unsupported in this environment' );
};
