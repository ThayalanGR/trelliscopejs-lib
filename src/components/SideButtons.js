import React from 'react';
import PropTypes from 'prop-types';
import injectSheet from 'react-jss';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { setActiveSidebar } from '../actions';

import Mousetrap from 'mousetrap';

import SideButton from './SideButton';
import {
  SB_PANEL_LAYOUT, SB_PANEL_FILTER, SB_PANEL_SORT, SB_PANEL_LABELS
} from '../constants';
import { sidebarActiveSelector, contentHeightSelector } from '../selectors/ui';
import { dialogOpenSelector, fullscreenSelector, configSelector } from '../selectors';
import uiConsts from '../assets/styles/uiConsts';

let buttons = [
  {
    icon: 'fas fa-th-large', label: 'Grid', title: SB_PANEL_LAYOUT, key: 'g'
  },
  {
    icon: 'fas fa-tags', label: 'Labels', title: SB_PANEL_LABELS, key: 'l'
  },
  {
    icon: 'fas fa-filter', label: 'Filter', title: SB_PANEL_FILTER, key: 'f'
  },
  {
    icon: 'fas fa-sort', label: 'Sort', title: SB_PANEL_SORT, key: 's'
  }
];

class SideButtons extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      // loaded: false,
      // displayList: [],
      // open: false
    };
  }

  componentDidMount() {
    const { fullscreen, active } = this.props;
    if (fullscreen) {
      Mousetrap.bind(['g', 'l', 'f', 's', 'c', 'enter'], this.handleKey);
      if (active !== '') {
        Mousetrap.bind('esc', this.handleKey);
      }
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps) { // eslint-disable-line camelcase
    if (nextProps.fullscreen) {
      Mousetrap.bind(['g', 'l', 'f', 's', 'c', 'enter'], this.handleKey);
      if (nextProps.active !== '') {
        Mousetrap.bind('esc', this.handleKey);
      }
    } else {
      Mousetrap.unbind(['g', 'l', 'f', 's', 'c', 'esc', 'enter']);
    }
  }

  componentWillUnmount() {
    const { fullscreen } = this.props;
    if (fullscreen) {
      Mousetrap.unbind(['g', 'l', 'f', 's', 'c', 'esc', 'enter']);
    }
  }

  handleKey = (e, k) => {
    const { dialogOpen, setActive } = this.props;

    if (e.target.nodeName === 'INPUT' || dialogOpen) {
      e.stopPropagation();
    } else if (k === 'esc' || k === 'enter') {
      // allow keyboard shortcuts for sidebars
      // if 'esc', close it, otherwise, open according to key code
      setActive('');
    } else {
      const which = [];
      for (let ii = 0; ii < buttons.length; ii += 1) {
        if (buttons[ii].key === k) {
          which.push(buttons[ii].title);
        }
      }
      if (which.length > 0) {
        setActive(which[0]);
      }
    }
  }

  render() {
    const {
      classes, styles, active, setActive, cfg
    } = this.props;

    const buttonsToShow = [];
    cfg.sidebar.gridEnabled && buttonsToShow.push("grid")
    cfg.sidebar.labelsEnabled && buttonsToShow.push("labels");
    cfg.sidebar.filterEnabled && buttonsToShow.push("filter");
    cfg.sidebar.sortEnabled && buttonsToShow.push("sort");

    const showButtons = buttons.filter(item => buttonsToShow.includes(item.label.toLowerCase()));

    return (
      <div className={classes.sideButtonsContainer} style={styles.sideButtonsContainer}>
        <div className={classes.spacer} />
        {showButtons.map((d) => (
          <SideButton
            key={`sidebutton_${d.title}`}
            isActive={d.title === active}
            icon={d.icon}
            title={d.title}
            label={d.label}
            onClick={() => setActive(d.title)}
          />
        ))}
      </div>
    );
  }
}

SideButtons.propTypes = {
  styles: PropTypes.object.isRequired,
  classes: PropTypes.object.isRequired,
  active: PropTypes.string.isRequired,
  dialogOpen: PropTypes.bool.isRequired,
  fullscreen: PropTypes.bool.isRequired,
  setActive: PropTypes.func.isRequired
};

// ------ static styles ------

const staticStyles = {
  sideButtonsContainer: {
    position: 'absolute',
    left: 0,
    top: 0,
    paddingTop: 0,
    width: uiConsts.sideButtons.width,
    background: uiConsts.sideButtons.background,
    boxSizing: 'border-box',
    zIndex: 1000
  },
  spacer: {
    transition: 'height 0.2s',
    height: uiConsts.sidebar.header.height,
    width: uiConsts.sideButtons.width,
    background: uiConsts.sideButtons.spacerBackground
  }
};

// ------ redux container ------

const stateSelector = createSelector(
  contentHeightSelector, sidebarActiveSelector, dialogOpenSelector,
  fullscreenSelector, configSelector,
  (ch, active, dialogOpen, fullscreen, cfg) => ({
    styles: {
      sideButtonsContainer: {
        height: ch,
        top: cfg.header.enabled ? uiConsts.header.height : 0,
        overflow: "auto"
      }
    },
    width: uiConsts.sideButtons.width,
    active,
    dialogOpen,
    fullscreen,
    cfg
  })
);

const mapStateToProps = (state) => (
  stateSelector(state)
);

const mapDispatchToProps = (dispatch) => ({
  setActive: (n) => {
    dispatch(setActiveSidebar(n));
  }
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectSheet(staticStyles)(SideButtons));
