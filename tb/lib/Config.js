const merge = require('deepmerge')
const defaultConfig = require('../config/default.json');
const config = require(`../tort${process.env.NODE_ENV ? `.${process.env.NODE_ENV}` : ''}.config.json`);
const finalConfig = merge(defaultConfig,config);



function getBaseDir(){
    let dir;
    require.main.paths.every(path => {
        dir = path.split('node_modules')[0];
        if(__dirname.startsWith(dir)){
            return false;
        }else{
            dir = null;
            return true;
        }
    })
    return dir;
}

module.exports = finalConfig;

