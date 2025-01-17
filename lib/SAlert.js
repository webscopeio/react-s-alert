import React from 'react';
import SAlertContent from './SAlertContent';
import PropTypes from 'prop-types';
import sAlertStore from './s-alert-parts/s-alert-store';
import sAlertTools from './s-alert-parts/s-alert-tools';
import getAlertData from './s-alert-parts/s-alert-data-prep';

const insertFunc = (msg, data, condition) => {
    const id = (data && data.id) || sAlertTools.randomId();
    sAlertStore.dispatch({
        type: 'INSERT',
        data: Object.assign({}, data, {
            id: id,
            condition: condition,
            message: msg
        })
    });
    return id;
};

class SAlert extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            dataRight: [],
            dataLeft: [],
            dataTop: [],
            dataBottom: []
        }
    }
    static info(msg, data) {
        return insertFunc(msg, data, 'info');
    }
    static error(msg, data) {
        return insertFunc(msg, data, 'error');
    }
    static warning(msg, data) {
        return insertFunc(msg, data, 'warning');
    }
    static success(msg, data) {
        return insertFunc(msg, data, 'success');
    }
    static close(id) {
        sAlertStore.dispatch({type: 'REMOVE', data: {id: id}});
    }
    static closeAll() {
        sAlertStore.dispatch({type: 'REMOVEALL'});
    }

    componentDidMount() {
        let storeStateLeft;
        let storeStateRight;
        let storeStateTop;
        let storeStateBottom;

        const addToStoreRight = () => {
            requestAnimationFrame(() => requestAnimationFrame(() => {
                let length;
                storeStateRight = getAlertData('right', this) || [];
                length = storeStateRight.length;
                if (this.props.stack && this.props.stack.limit && length > this.props.stack.limit) {
                    let id = storeStateRight[0].id;
                    sAlertStore.dispatch({type: 'REMOVE', data: {id: id}});
                    storeStateRight = getAlertData('right', this) || [];
                }
                this.setState({dataRight: storeStateRight});
            }));
        };
        this.unsubStoreRight = sAlertStore.subscribe(addToStoreRight);

        const addToStoreLeft = () => {
            requestAnimationFrame(() => requestAnimationFrame(() => {
                let length;
                storeStateLeft = getAlertData('left', this) || [];
                length = storeStateLeft.length;
                if (this.props.stack && this.props.stack.limit && length > this.props.stack.limit) {
                    let id = storeStateLeft[0].id;
                    sAlertStore.dispatch({type: 'REMOVE', data: {id: id}});
                    storeStateLeft = getAlertData('left', this) || [];
                }
                this.setState({dataLeft: storeStateLeft});
            }));
        };
        this.unsubStoreLeft = sAlertStore.subscribe(addToStoreLeft);

        const addToStoreTop = () => {
            requestAnimationFrame(() => requestAnimationFrame(() => {
                let length;
                storeStateTop = getAlertData('full-top', this) || [];
                length = storeStateTop.length;
                if (this.props.stack && this.props.stack.limit && length > this.props.stack.limit) {
                    let id = storeStateTop[0].id;
                    sAlertStore.dispatch({type: 'REMOVE', data: {id: id}});
                    storeStateTop = getAlertData('full-top', this) || [];
                }
                this.setState({dataTop: storeStateTop});
            }));
        };
        this.unsubStoreTop = sAlertStore.subscribe(addToStoreTop);

        const addToStoreBottom = () => {
            requestAnimationFrame(() => requestAnimationFrame(() => {
                let length;
                storeStateBottom = getAlertData('full-bottom', this) || [];
                length = storeStateBottom.length;
                if (this.props.stack && this.props.stack.limit && length > this.props.stack.limit) {
                    let id = storeStateBottom[0].id;
                    sAlertStore.dispatch({type: 'REMOVE', data: {id: id}});
                    storeStateBottom = getAlertData('full-bottom', this) || [];
                }
                this.setState({dataBottom: storeStateBottom});
            }));
        };
        this.unsubStoreBottom = sAlertStore.subscribe(addToStoreBottom);

        // set up global config from global SAlert props
        // only stuff needed for getAlertData
        const globalConfig = {
            contentTemplate: this.props.contentTemplate,
            offset: this.props.offset,
            message: this.props.message,
            stack: this.props.stack,
            html: this.props.html,
            customFields: this.props.customFields,
            position: this.props.position || 'top-right',
            preserveContext: this.props.preserveContext || false
        };
        sAlertTools.setGlobalConfig(globalConfig);
    }
    componentWillUnmount() {
        this.unsubStoreTop();
        this.unsubStoreBottom();
        this.unsubStoreLeft();
        this.unsubStoreRight();
    }
    render() {
        const mapFunc = (alert, index) => {
            const customKey = `alert-key-${alert.id}-${alert.position}`;
            const id = alert.id;
            const condition = sAlertTools.returnFirstDefined(alert.condition, 'info');
            const message = sAlertTools.returnFirstDefined(alert.message, this.props.message, '');
            const position = sAlertTools.returnFirstDefined(alert.position, this.props.position, 'top-right');
            const offset = sAlertTools.returnFirstDefined(alert.offset, this.props.offset, 0);
            const effect = sAlertTools.returnFirstDefined(alert.effect, this.props.effect);
            const boxPosition = alert.boxPosition;
            const beep = sAlertTools.returnFirstDefined(alert.beep, this.props.beep, false);
            const timeout = sAlertTools.returnFirstDefined(alert.timeout, this.props.timeout, 5000);
            const html = sAlertTools.returnFirstDefined(alert.html, this.props.html);
            const onClose = sAlertTools.returnFirstDefined(alert.onClose, this.props.onClose);
            const onShow = sAlertTools.returnFirstDefined(alert.onShow, this.props.onShow);
            const customFields = sAlertTools.returnFirstDefined(alert.customFields, this.props.customFields);
            const contentTemplate = this.props.contentTemplate;

            return (
                <SAlertContent
                    key={customKey}
                    id={id}
                    customFields={customFields}
                    condition={condition}
                    message={message}
                    position={position}
                    effect={effect}
                    boxPosition={boxPosition}
                    beep={beep}
                    timeout={timeout}
                    html={html}
                    onClose={onClose}
                    onShow={onShow}
                    contentTemplate={contentTemplate} />
            );
        };
        const sAlertElemsRight = this.state.dataRight.map(mapFunc);
        const sAlertElemsLeft = this.state.dataLeft.map(mapFunc);
        const sAlertElemsTop = this.state.dataTop.map(mapFunc);
        const sAlertElemsBottom = this.state.dataBottom.map(mapFunc);
        return (
            <div className="s-alert-wrapper">
                {sAlertElemsRight}
                {sAlertElemsLeft}
                {sAlertElemsTop}
                {sAlertElemsBottom}
            </div>
        );
    }
}

SAlert.propTypes = {
    message: PropTypes.string,
    position: PropTypes.string,
    offset: PropTypes.number,
    stack: PropTypes.oneOfType([
        PropTypes.bool,
        PropTypes.object
    ]),
    effect: PropTypes.string,
    beep: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.object,
        PropTypes.bool
    ]),
    timeout: PropTypes.oneOfType([
        PropTypes.oneOf(['none']),
        PropTypes.number
    ]),
    html: PropTypes.bool,
    preserveContext: PropTypes.bool,
    onClose: PropTypes.func,
    onShow: PropTypes.func,
    customFields: PropTypes.object,
    contentTemplate: PropTypes.func
};

export default SAlert;