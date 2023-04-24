/*
 * Copyright (c) 2023, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

const multipleEntry = require('react-app-rewire-multiple-entry')([
    {
        entry: 'src/index.js',
        template: 'public/index.html',
        outPath: '/index2.html'
    },
    {
        entry: 'src/config.js',
        template: 'public/config.html',
        outPath: '/config.html'
    }
]);

module.exports = {
    webpack: function(config, env) {
        multipleEntry.addMultiEntry(config);
        return config;
    }
};