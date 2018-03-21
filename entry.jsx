import ReactDOM from 'react-dom';
import Panel from './src/components/panel/index.jsx';

import 'normalize-css/normalize.css';
import 'bulma/css/bulma.css';

import __ from './src/i18n';

window.__ = __;

ReactDOM.render(
    <Panel />,
    document.getElementById('root')
);