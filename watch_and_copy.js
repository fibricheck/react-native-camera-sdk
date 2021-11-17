const chokidar = require('chokidar');
const copyfiles = require('copyfiles');

chokidar.watch('build').on('change', (file, path) => {
    copyfiles(
        [file, '../fibricheck_react_native/node_modules/@fibricheck/react-native-sdk'],
        // [file, '../fibricheck_react_native/node_modules/@fibricheck/react-native-sdk'],
        { verbose: true },
        () => { }
    );
});