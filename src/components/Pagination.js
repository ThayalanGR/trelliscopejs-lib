import React from 'react';
import PropTypes from 'prop-types';
import injectSheet from 'react-jss';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import Mousetrap from 'mousetrap';
import IconButton from '@material-ui/core/IconButton';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import FirstPageIcon from '@material-ui/icons/FirstPage';
import LastPageIcon from '@material-ui/icons/LastPage';
import { setLayout } from '../actions';
import {
  nPerPageSelector, pageNumSelector, dialogOpenSelector,
  fullscreenSelector, cogDataSelector
} from '../selectors';
import { filterCardinalitySelector } from '../selectors/cogData';

class Pagination extends React.Component {
  componentDidMount() {
    const { fullscreen, dialogOpen } = this.props;
    if (fullscreen) {
      Mousetrap.bind('right', () => {
        if (!dialogOpen) {
          this.pageRight();
        }
      });
      Mousetrap.bind('left', () => {
        if (!dialogOpen) {
          this.pageLeft();
        }
      });
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps) { // eslint-disable-line camelcase
    const { dialogOpen } = nextProps;
    if (nextProps.fullscreen) {
      Mousetrap.bind('right', () => {
        if (!dialogOpen) {
          this.pageRight();
        }
      });
      Mousetrap.bind('left', () => {
        if (!dialogOpen) {
          this.pageLeft();
        }
      });
    } else {
      Mousetrap.unbind(['right', 'left']);
    }
  }

  componentWillUnmount() {
    const { fullscreen } = this.props;
    if (fullscreen) {
      Mousetrap.unbind(['right', 'left']);
    }
  }

  pageLeft = () => {
    const { n, handleChange } = this.props;
    let nn = n - 1;
    if (nn < 1) {
      nn += 1;
    }
    return handleChange(nn);
  }

  pageRight = () => {
    const { n, totPages, handleChange } = this.props;
    let nn = n + 1;
    if (nn > totPages) {
      nn -= 1;
    }
    return handleChange(nn);
  }

  pageFirst = () => {
    const { handleChange } = this.props;
    handleChange(1);
  }

  pageLast = () => {
    const { handleChange, totPages } = this.props;
    handleChange(totPages);
  }

  render() {
    const {
      classes, cogData, totPages, totPanels, npp, n
    } = this.props;

    const styles = {
      button: {
        margin: 0,
        padding: 0,
        height: '17px',
        width: '5px'
      },
      progress: {
        width: 120,
        fontSize: 14,
        color: '#444',
        lineHeight: '48px'
      }
    };

    if (cogData.isFetching || (cogData.isLoaded && cogData.crossfilter === undefined)) {
      return (
        <div style={styles.progress}>loading panels...</div>
      );
    }
    if (totPanels === 0) {
      return <div />;
    }

    const pFrom = (npp * (n - 1)) + 1;
    const pTo = Math.min(npp * n, totPanels);
    let pRange = <span>{pFrom}</span>;
    if (pFrom !== pTo) {
      pRange = (
        <span>
          {pFrom}
          &nbsp;
          <span className={classes.pageDash}>-</span>
          &nbsp;
          {pTo}
        </span>
      );
    }
    const txt = (
      <span>
        {pRange}
        <span>
          {` of ${totPanels}`}
        </span>
      </span>
    );
    return (
      <div className={classes.outer}>
        <div className={classes.label}>
          {txt}
        </div>
        <div className={classes.buttonWrap}>
          <div className={classes.buttonDiv}>
            <IconButton
              disabled={n <= 1}
              style={styles.button}
              // iconStyle={styles.icon}
              onClick={() => this.pageFirst()}
            >
              <FirstPageIcon />
            </IconButton>
          </div>
          <div className={classes.buttonText}>
            First
          </div>
        </div>
        <div className={classes.buttonWrap}>
          <div className={classes.buttonDiv}>
            <IconButton
              disabled={n <= 1}
              style={styles.button}
              // iconStyle={styles.icon}
              onClick={() => this.pageLeft()}
            >
              <ChevronLeftIcon />
            </IconButton>
          </div>
          <div className={classes.buttonText}>
            Prev
          </div>
        </div>
        <div className={classes.buttonWrap}>
          <div className={classes.buttonDiv}>
            <IconButton
              disabled={n >= totPages}
              style={styles.button}
              // iconStyle={styles.icon}
              onClick={() => this.pageRight()}
            >
              <ChevronRightIcon />
            </IconButton>
          </div>
          <div className={classes.buttonText}>
            Next
          </div>
        </div>
        <div className={classes.buttonWrap}>
          <div className={classes.buttonDiv}>
            <IconButton
              disabled={n >= totPages}
              style={styles.button}
              // iconStyle={styles.icon}
              onClick={() => this.pageLast()}
            >
              <LastPageIcon />
            </IconButton>
          </div>
          <div className={classes.buttonText}>
            Last
          </div>
        </div>
      </div>
    );
  }
}

Pagination.propTypes = {
  classes: PropTypes.object.isRequired,
  n: PropTypes.number.isRequired,
  npp: PropTypes.number.isRequired,
  totPages: PropTypes.number.isRequired,
  totPanels: PropTypes.number.isRequired,
  dialogOpen: PropTypes.bool.isRequired,
  fullscreen: PropTypes.bool.isRequired,
  handleChange: PropTypes.func.isRequired,
  cogData: PropTypes.object.isRequired
};

// ------ static styles ------

const staticStyles = {
  outer: {
    whiteSpace: 'nowrap',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: `inherit`,
    boxSizing: 'border-box'
  },

  buttonWrap: {
    height: 'height',
    display: "flex",
    flexDirection: "column",
    alignItems: 'center',
    marginLeft: '10px'
  },
  buttonDiv: {
  },
  buttonText: {
    fontSize: '9px',
    paddingTop: '6px'
  },
  pageDash: {
    display: 'inline-block',
    transform: 'scale(1.5,1)' // to deal with some browsers not being able to handle endash
  },
  label: {
    display: 'inline-block',
    fontSize: '14px',
  }
};

// ------ redux container ------

const stateSelector = createSelector(
  pageNumSelector, filterCardinalitySelector, nPerPageSelector,
  dialogOpenSelector, fullscreenSelector, cogDataSelector,
  (n, card, npp, dialogOpen, fullscreen, cogData) => ({
    n,
    totPanels: card,
    totPages: Math.ceil(card / npp),
    npp,
    dialogOpen,
    fullscreen,
    cogData
  })
);

const mapStateToProps = (state) => (
  stateSelector(state)
);

const mapDispatchToProps = (dispatch) => ({
  handleChange: (n) => {
    dispatch(setLayout({ pageNum: n }));
  }
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectSheet(staticStyles)(Pagination));
