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