import indexObj from './js/index'
import common from '../common'
import './less/index.less'
import touxiang from './img/touxiang.jpg'

ReactDOM.render(
    <div id="test-dom">
        <img id='touxiang' src={touxiang}/>
    </div>,
    document.body
)