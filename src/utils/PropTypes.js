import PropTypes from 'prop-types';
import PlayStatus from '../constants/PlayStatus';

const powerOf2 = (props, propName, componentName) => {
  const prop = props[propName];
  if (prop == null) return null;
  return Math.sqrt(prop) % 1 === 0
    ? null
    : new Error(`[PropTypes] Prop ${propName} must be a power of 2`);
};

powerOf2.isRequired = (props, propName, componentName) => {
  const prop = props[propName];
  return Math.sqrt(prop) % 1 === 0
    ? null
    : new Error(`[PropTypes] Prop ${propName} must be a power of 2`);
};

const statusNumbers = Object.keys(PlayStatus).map(k => PlayStatus[k]);
const playStatus = PropTypes.oneOf(statusNumbers);

export { powerOf2, playStatus };
