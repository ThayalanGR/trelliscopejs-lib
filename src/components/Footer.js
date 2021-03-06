import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import injectSheet from 'react-jss';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { windowWidthSelector, contentHeightSelector } from '../selectors/ui';
import { filterCardinalitySelector } from '../selectors/cogData';
import {
  curDisplayInfoSelector, filterSelector, sortSelector, singlePageAppSelector, configSelector
} from '../selectors';
import FooterChip from './FooterChip';
import uiConsts from '../assets/styles/uiConsts';
import { footerVisiblityHandler } from '../actions';

const Footer = ({
  classes, style, sort, filter, nFilt, nPanels, cfg
}) => {
  let sortContent = '';
  let filterContent = '';
  let spacerContent = '';
  const isFooterEnabled = footerVisiblityHandler(cfg, sort, filter);

  if (sort.length > 0) {
    sortContent = (
      <div className={classes.sectionWrapper}>
        <div className={classes.sectionText}>
          Sorting on:
        </div>
        <div className={classes.chipWrapper}>
          {sort.map((el, i) => (
            <FooterChip
              key={`${el.name}_sortchip`}
              label={el.name}
              icon={el.icon}
              text=""
              index={i}
              type="sort"
            />
          ))}
        </div>
      </div>
    );
  }

  if (filter.length > 0) {
    filterContent = (
      <div className={classes.sectionWrapper}>
        <div className={classes.sectionText}>
          Filtering on:
        </div>
        <div className={classes.chipWrapper}>
          {filter.map((el, i) => (
            <FooterChip
              key={`${el.name}_filterchip`}
              label={el.name}
              icon=""
              text={el.text}
              index={i}
              type="filter"
            />
          ))}
        </div>
        <div className={classes.filterText}>
          {`(${nFilt} of ${nPanels} panels)`}
        </div>
      </div>
    );
  }

  if (filter.length > 0 && sort.length > 0) {
    spacerContent = <div className={classes.spacer} />;
  }

  return (
    isFooterEnabled ?
      <div className={classes.wrapper} style={style}>
        <div className={classes.inner}>
          {sortContent}
          {spacerContent}
          {filterContent}
        </div>
      </div> : <Fragment></Fragment>
  );
};

Footer.propTypes = {
  classes: PropTypes.object.isRequired,
  style: PropTypes.object.isRequired,
  sort: PropTypes.array.isRequired,
  filter: PropTypes.array.isRequired,
  nFilt: PropTypes.number.isRequired,
  nPanels: PropTypes.number
};

Footer.defaultProps = () => ({
  nPanels: 0
});


// ------ static styles ------

const staticStyles = {
  wrapper: {
    position: 'absolute',
    boxSizing: 'border-box',
    left: 0,
    height: uiConsts.footer.height,
    paddingLeft: 10,
    margin: 0,
    lineHeight: `${uiConsts.footer.height}px`,
    fontSize: uiConsts.footer.height * 0.5,
    fontWeight: 300,
    background: uiConsts.footer.background,
    color: uiConsts.footer.color,
    display: 'flex',
    flexDirection: 'row',
    overflowX: 'auto',
    overflowY: 'hidden',
    zIndex: 1001
  },
  inner: {
    display: 'flex',
    flexDirection: 'row',
    whiteSpace: 'nowrap',
    paddingRight: 10
  },
  sectionWrapper: {
    display: 'flex',
    flexDirection: 'row'
  },
  chipWrapper: {
    display: 'flex',
    flexDirection: 'row'
  },
  sectionText: {
    marginRight: 3
  },
  spacer: {
    width: 12
  },
  filterText: {
    marginLeft: 5
  }
};

// ------ redux container ------

const sortInfoSelector = createSelector(
  sortSelector, curDisplayInfoSelector,
  (sort, cdi) => {
    const res = [];
    for (let i = 0; i < sort.length; i += 1) {
      const { name } = sort[i];
      const { type } = cdi.info.cogInfo[name];
      let icon = 'icon-sort-amount';
      if (type === 'factor') {
        icon = 'icon-sort-alpha';
      } else if (type === 'numeric') {
        icon = 'icon-sort-numeric';
      }
      icon = `${icon}-${sort[i].dir}`;
      res.push({ name, icon });
    }
    return res;
  }
);

const filterInfoSelector = createSelector(
  filterSelector, curDisplayInfoSelector,
  (filter, cdi) => {
    const keys = Object.keys(filter.state);
    const res = [];
    for (let i = 0; i < keys.length; i += 1) {
      const curState = filter.state[keys[i]];
      if (curState.value !== undefined) {
        let text = '';
        if (curState.varType === 'numeric') {
          if (curState.value.from === undefined && curState.value.to !== undefined) {
            text = `< ${curState.value.to}`;
          } else if (curState.value.from !== undefined && curState.value.to === undefined) {
            text = `> ${curState.value.from}`;
          } else if (curState.value.from !== undefined && curState.value.to !== undefined) {
            text = `${curState.value.from} -- ${curState.value.to}`;
          }
        } else if (curState.varType === 'factor') {
          const charLimit = 15;
          const n = curState.value.length;
          let textLength = 0;
          let idx = 0;
          while (idx < n && textLength <= charLimit) {
            textLength = textLength + curState.value[idx].length + 2;
            idx += 1;
          }
          if (idx === n) {
            // build a string of selected values
            text = curState.value.sort().join(', ');
          } else {
            // just show "k of n"
            const tot = cdi.info.cogInfo[curState.name].levels.length;
            text = `${curState.value.length} of ${tot}`;
          }
        }
        res.push({ name: keys[i], text });
      }
    }
    return res;
  }
);

const stateSelector = createSelector(
  windowWidthSelector, sortInfoSelector, filterInfoSelector,
  filterCardinalitySelector, curDisplayInfoSelector, singlePageAppSelector,
  contentHeightSelector, configSelector,
  (ww, sort, filter, nFilt, cdi, singlePage, ch, cfg) => ({
    style: {
      width: ww,
      bottom: 0
    },
    sort,
    filter,
    nFilt,
    cfg,
    nPanels: cdi.info.n
  })
);

const mapStateToProps = (state) => (
  stateSelector(state)
);

export default connect(
  mapStateToProps
)(injectSheet(staticStyles)(Footer));
