import React from 'React';
import { isArray } from 'art-lib/src/utils/lang';
import { trim } from 'art-lib/src/utils/string';
import merge from '../utils/merge';
import classnames from 'classnames';
export default class CoreComponent extends React.Component {
    constructor(props, context) {
        super(props, context);
    }
    mergeProps(deep = true, target, ...source) {
        return merge(deep, target, ...source);
    }
    applyArgs(prefix, ...args) {
        if (isArray(args[0])) {
            args = args[0];
        }
        return { [`v-${prefix}`]: args.length ? trim(args.join(' ')).replace(/\s+/ig, ' ') : '' };
    }
    classNames(...args) {
        const result = classnames(args);
        return result;
    }
    className(...args) {
        return this.classNames.apply(this, args.concat([this.props.className]));
    }
}