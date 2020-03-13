import React from 'react';
import PropTypes from 'prop-types';
import injectSheet from 'react-jss';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
// import DisplayInfo from './DisplayInfo';
// import RelatedDisplays from './RelatedDisplays';
// import DisplaySelect from './DisplaySelect';
import Pagination from './Pagination';
// import HeaderLogo from './HeaderLogo';
import { setSelectedDisplay, fetchDisplay, setDialogOpen } from '../actions';
import { windowWidthSelector } from '../selectors/ui';
import { relatedDisplayGroupsSelector, displayGroupsSelector } from '../selectors/display';

import {
  appIdSelector, configSelector, displayListSelector,
  selectedDisplaySelector, dialogOpenSelector
} from '../selectors';

import uiConsts from '../assets/styles/uiConsts';

class Header extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      singleLoaded: props.selectedDisplay.name !== '',
      singleDisplay: props.displayList.isLoaded && props.displayList.list.length <= 1
    };
  }

  UNSAFE_componentWillReceiveProps(nprops) { // eslint-disable-line camelcase
    const { singleLoaded } = this.state;
    // handle loading a single display if necessary
    // TODO: Why do this here? Why not in actions/index.js?
    const singleDisplay = nprops.displayList.isLoaded && nprops.displayList.list.length <= 1;
    this.setState({ singleDisplay });

    if (!singleLoaded && singleDisplay && nprops.selectedDisplay.name !== '') {
      this.setState({ singleLoaded: true });
    } else if (!singleLoaded && singleDisplay) {
      nprops.selectDisplay(
        nprops.displayList.list[0].name,
        nprops.displayList.list[0].group,
        nprops.displayList.list[0].desc,
        nprops.cfg,
        nprops.appId,
        window.location.hash
      );
      this.setState({ singleLoaded: true });
    }
  }

  render() {
    const {
      classes, styles, selectedDisplay, cfg
    } = this.props;
    const ispaginationEnabled = cfg.header.pagination
    const isHeaderEnabled = cfg.header.enabled
    const displayName = selectedDisplay.name;
    // const displayDesc = selectedDisplay.desc;
    const pagination = <Pagination />;

    return (
      isHeaderEnabled ?
        <div className={classes.headerContainer} style={styles.headerContainer}>
          <div className={classes.nameDescContainer} >
            <div className={classes.displayName} >
              {displayName}
            </div>
            {/* <div className={classes.displayDesc} >
              {displayDesc}
            </div> */}
          </div>
          {ispaginationEnabled &&
            <div className={classes.paginationContainer} >
              {pagination}
            </div>
          }
        </div> : ""
    );
  }
}

Header.propTypes = {
  styles: PropTypes.object.isRequired,
  classes: PropTypes.object.isRequired,
  // eslint-disable-next-line react/no-unused-prop-types
  cfg: PropTypes.object.isRequired,
  // eslint-disable-next-line react/no-unused-prop-types
  appId: PropTypes.string.isRequired,
  displayList: PropTypes.object.isRequired,
  displayGroups: PropTypes.object.isRequired,
  selectedDisplay: PropTypes.object.isRequired,
  relatedDisplayGroups: PropTypes.object.isRequired,
  dialogOpen: PropTypes.bool.isRequired,
  // eslint-disable-next-line react/no-unused-prop-types
  selectDisplay: PropTypes.func.isRequired,
  doSetDialogOpen: PropTypes.func.isRequired
};

// ------ static styles ------

const staticStyles = {
  headerContainer: {
    position: 'absolute',
    boxSizing: 'border-box',
    top: 0,
    right: 0,
    width: uiConsts.header.width,
    height: `${uiConsts.header.height}px`,
    background: uiConsts.header.background,
    color: uiConsts.header.color,
    borderBottom: `1px solid ${uiConsts.header.borderColor}`,
    borderTop: `1px solid ${uiConsts.header.borderColor}`,
    borderLeft: `1px solid ${uiConsts.header.borderColor}`,
    margin: 0,
    fontSize: uiConsts.header.fontSize,
    fontWeight: 300,
    zIndex: 1010,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 10px 0 10px'
  },
  nameDescContainer: {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  paginationContainer: {
    marginRight: '100px',
    height: 'inherit'
  },

  displayName: {
    fontSize: 16,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  displayDesc: {
    fontWeight: '300',
    fontSize: 10,
    fontStyle: 'italic',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  }
};

// ------ redux container ------

const styleSelector = createSelector(
  appIdSelector, windowWidthSelector, displayListSelector, displayGroupsSelector,
  selectedDisplaySelector, relatedDisplayGroupsSelector, configSelector, dialogOpenSelector,
  (appId, ww, dl, dg, sd, rdg, cfg, dialogOpen) => ({
    styles: {
      headerContainer: {
        width: ww
      },
      headerSubContainer: {
        left: uiConsts.header.height
          * ((dl.list.length <= 1 ? 0 : 1) + (sd.name === '' ? 0 : 1) + (Object.keys(rdg).length === 0 ? 0 : 1)),
        width: ww - ((uiConsts.header.height
          * ((dl.list.length <= 1 ? 0 : 1) + (sd.name === '' ? 0 : 1) + (Object.keys(rdg).length === 0 ? 0 : 1))
          + uiConsts.header.logoWidth + 30))
      },
      displayName: {
        lineHeight: `${sd.desc === '' ? 48 : 26}px`,
        paddingTop: sd.desc === '' ? 0 : 5
      }
    },
    appId,
    cfg,
    displayList: dl,
    displayGroups: dg,
    selectedDisplay: sd,
    relatedDisplayGroups: rdg,
    dialogOpen
  })
);

const mapStateToProps = (state) => (
  styleSelector(state)
);

const mapDispatchToProps = (dispatch) => ({
  selectDisplay: (name, group, desc, cfg, appId, hash) => {
    dispatch(setSelectedDisplay(name, group, desc));
    dispatch(fetchDisplay(name, group, cfg, appId, hash));
  },
  doSetDialogOpen: (isOpen) => {
    dispatch(setDialogOpen(isOpen));
  }
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectSheet(staticStyles)(Header));
