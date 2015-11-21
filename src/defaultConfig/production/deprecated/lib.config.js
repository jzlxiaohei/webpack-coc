import shareConfig from './_share.config'
import clone from 'clone'

const libConfig = clone(shareConfig);
//libConfig.externals={}
libConfig.entry={
    lib:'[src_path]/lib/lib.js'
}
export default libConfig