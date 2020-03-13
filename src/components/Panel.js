import React from 'react';
import PropTypes from 'prop-types';
import injectSheet from 'react-jss';
import classNames from 'classnames';
import { fade } from '@material-ui/core/styles/colorManipulator';
import uiConsts from '../assets/styles/uiConsts';
import { store } from '..';
// fontawesome import
require('@fortawesome/fontawesome-free/js/all');

class Panel extends React.Component {

  constructor(props) {
    super(props);

    const initialState = {
      panels: {},
      hover: '',
      isHoverd: false
    };

    this._panel = null;
    this._chart = null;
    this._header = null;
    this._footer = null;

    this.state = initialState;
    this.toggleHover = this.toggleHover.bind(this);
  }

  componentDidMount() {
    if (this.props.panelInterface.type === 'chart') {
      const { pWidth, pHeight } = this.props.dims;
      this.setState({
        currentPanel: {
          panelInterface: this.props.panelInterface,
          ww: this.props.dims.totalWidth,
          hh: this.props.dims.totalHeight,
          post: true,
          panelKey: this.props.panelKey,
          panel: this._chart,
          upperBound: this.props.upperBound,
          lowerBound: this.props.lowerBound
        }
      })
      this.props.panelRenderers[this.props.curDisplayInfo.info.name].fn(this.props.panelInterface,
        pWidth, pHeight, false, this.props.panelKey, this._chart, this.props.upperBound, this.props.lowerBound, this.props.keyIndex);
    } else if (this.props.panelInterface.type === 'image_src') {
      const { pWidth, pHeight } = this.props.dims;
      this.setState({
        currentPanel: {
          panelInterface: this.props.panelInterface,
          ww: this.props.dims.totalWidth,
          hh: this.props.dims.totalHeight,
          isEnlargeView: true,
          panelKey: this.props.panelKey,
          panel: this._chart,
        }
      })
      this.props.panelRenderers[this.props.curDisplayInfo.info.name].fn(this.props.panelInterface,
        pWidth, pHeight, true, this.props.panelKey, this._chart);
    }
  }

  UNSAFE_componentWillReceiveProps(nprops) {
    const { dims } = this.props;
    const { name } = nprops.curDisplayInfo.info;
    const totalResChange = (nprops.dims.totalWidth !== dims.totalWidth) || (nprops.dims.totalHeight !== dims.totalHeight);
    const chartResChange = (nprops.dims.pHeight !== dims.pHeight) || (nprops.dims.pWidth !== dims.pWidth);
    if (totalResChange || chartResChange || nprops.panelKey === this.props.panelKey) {
      if (nprops.panelInterface.type === 'chart') {
        const { pWidth, pHeight } = nprops.dims;
        this.setState({
          currentPanel: {
            panelInterface: nprops.panelInterface,
            ww: nprops.totalWidth,
            hh: nprops.totalHeight,
            post: true,
            panelKey: nprops.panelKey,
            panel: this._chart,
            upperBound: nprops.upperBound,
            lowerBound: nprops.lowerBound
          }
        })
        nprops.panelRenderers[nprops.curDisplayInfo.info.name].fn(nprops.panelInterface,
          pWidth, pHeight, true, nprops.panelKey, this._chart, nprops.upperBound, nprops.lowerBound, nprops.keyIndex);
      } else if (nprops.panelInterface.type === 'image_src') {
        const { pWidth, pHeight } = nprops.dims;
        this.setState({
          currentPanel: {
            panelInterface: nprops.panelInterface,
            ww: nprops.totalWidth,
            hh: nprops.totalHeight,
            post: true,
            panelKey: nprops.panelKey,
            panel: this._chart,
          }
        })
        const panelRenderer = nprops.panelRenderers[name];
        panelRenderer.fn(nprops.panelInterface,
          pWidth, pHeight, true, nprops.panelKey, this._chart);
      }
    }
  }

  componentWillUnmount() {
    this.setState({ isHoverd: false })
  }

  handleHover(val) {
    this.setState({ hover: val });
  }

  toggleHover(hover) {
    // if (this.props.panelInterface.type === 'chart')
    this.setState({ isHoverd: hover })
  }

  render() {

    const { classes, dims, labels, labelArr, removeLabel, cfg } = this.props;
    const { hover } = this.state;
    const bWidth = dims.ww;
    const state = store.getState();
    const panelDecisionObj = state.xyDecisonArray[this.props.keyIndex];
    const styles = {
      bounding: {
        width: dims.totalWidth,
        height: dims.totalHeight,
        background: panelDecisionObj.alternateBG.enabled && panelDecisionObj.background ? panelDecisionObj.alternateBG.backgroundColor : cfg.panelOptions.backgroundColor,
        border: `${cfg.panelOptions.borderSize}px solid ${cfg.panelOptions.borderColor}`,
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'relative'
      },
      enLargeIcon: {
        position: 'absolute',
        top: '5px',
        right: '8px',
        zIndex: '100',
        fontSize: '16px',
        color: 'gray',
        "&:hover": {
          background: "#efefef"
        }
      },
      panelTitle: {
        width: "100%",
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        padding: '5px 5px',
        boxSizing: 'border-box',
        fontSize: `${cfg.panelTitle.fontSize}px`,
        textAlign: cfg.panelTitle.textAlignment,
        background: cfg.panelTitle.backgroundColor,
        color: cfg.panelTitle.color,
        fontFamily: cfg.panelTitle.fontFamily
      },
      panel: {
        width: dims.pWidth,
        height: dims.pHeight
      },
      labelTable: {
        width: "100%",
        backgroundColor: cfg.labels.backgroundColor,
        color: cfg.labels.color
      },
      labelRow: {
        width: bWidth,
        height: dims.labelHeight,
        lineHeight: `${dims.labelHeight}px`
      },
      labelSpan: {
        fontSize: dims.fontSize,
        position: 'absolute'
      },
      labelClose: {
        fontSize: dims.fontSize,
        lineHeight: `${dims.labelHeight}px`
      },
      labelInner: {
        height: dims.labelHeight
      },
      labelNameCell: {
        paddingLeft: (dims.labelPad / 2) + 2,
        paddingRIght: (dims.labelPad / 2) + 2,
        width: dims.labelWidth
      },
      labelValueCell: {
        paddingLeft: (dims.labelPad / 2) + 2,
        paddingRIght: (dims.labelPad / 2) + 2
      },
      linkIcon: {
        textDecoration: 'none',
        fontSize: dims.fontSize - 2
      }
    };



    const name = store.getState().cogData[this.props.panelKey].name;

    const panelTitle = {
      enabled: cfg.panelTitle.enabled,
      name,
      position: cfg.panelTitle.position
    };

    const labelsDom = <table ref={d => this._footer = d} className={classes.labelTable} style={styles.labelTable}>
      <tbody>
        {labels.map((d, i) => {
          let labelDiv;
          const removeLabelDiv = (
            <button
              type="button"
              className={classes.labelClose}
              style={({
                ...styles.labelClose,
                ...(hover !== d.name && { display: 'none' })
              })}
              onClick={() => removeLabel(d.name, labelArr)}
            >
              <i className="icon-times-circle" />
            </button>
          );
          if (d.type === 'href') {
            labelDiv = (
              <div className={classes.labelInner} style={styles.labelInner}>
                <a
                  style={{ ...styles.labelSpan, textDecoration: 'none' }}
                  href={d.value}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <i className="icon-open" style={styles.linkIcon} />
                </a>
              </div>
            );
          } else {
            labelDiv = (
              <div
                className={classes.labelInner}
                style={styles.labelInner}
                title={d.value}
              >
                <span className={classes.labelP} style={styles.labelSpan}>{d.value}</span>
              </div>
            );
          }
          return (
            <tr
              key={`${d.name}`}
              className={classNames({
                [classes.labelRow]: true,
                [classes.labelRowHover]: hover === d.name
              })}
              style={styles.labelRow}
              onMouseOver={() => this.handleHover(d.name)}
              onFocus={() => this.handleHover(d.name)}
              onMouseOut={() => this.handleHover('')}
              onBlur={() => this.handleHover('')}
            >
              <td
                className={`${classes.labelCell} ${classes.labelNameCell}`}
                style={styles.labelNameCell}
              >
                <div className={classes.labelInner} style={styles.labelInner}>
                  <span style={styles.labelSpan}>{d.name}</span>
                </div>
              </td>
              <td
                className={classes.labelCell}
                style={styles.labelValueCell}
              >
                <div className={classes.labelOuter}>
                  {labelDiv}
                  {removeLabelDiv}
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>;

    const panelTitleDom = <div ref={d => this._header = d} style={styles.panelTitle}>{panelTitle.name}</div>;

    const panelContentDom = <div className={classes.panel} ref={d => this._chart = d} style={styles.panel}></div>;

    return (
      <div
        className={classes.bounding}
        style={styles.bounding}
        ref={(d) => { this._panel = d; }}
        onMouseEnter={() => {
          this.toggleHover(true)
        }}
        onMouseLeave={() => this.toggleHover(false)}
      >
        {this.state.isHoverd &&
          <div className="enLargeIcon" style={styles.enLargeIcon} onClick={() => {
            this.setState({ isHoverd: false })
            this.props.enLargePanelHandler(this.state.currentPanel)
          }} title="Expand View">
            <i className="fas fa-expand-alt" ></i>
          </div>
        }
        {cfg.labels.enabled && cfg.labels.position === "top" && labelsDom}
        {panelTitle.enabled && panelTitle.position === 'top' && panelTitleDom}
        {panelContentDom}
        {panelTitle.enabled && panelTitle.position === 'bottom' && panelTitleDom}
        {cfg.labels.enabled && cfg.labels.position === "bottom" && labelsDom}
      </div>
    );
  }

}

Panel.propTypes = {
  labels: PropTypes.array.isRequired,
  labelArr: PropTypes.array.isRequired,
  cfg: PropTypes.object.isRequired,
  panelKey: PropTypes.string.isRequired,
  dims: PropTypes.object.isRequired,
  rowIndex: PropTypes.number.isRequired,
  iColIndex: PropTypes.number.isRequired,
  classes: PropTypes.object.isRequired,
  panelRenderers: PropTypes.object.isRequired,
  panelInterface: PropTypes.object,
  panelData: PropTypes.object,
  displayInfo: PropTypes.object.isRequired,
  curDisplayInfo: PropTypes.object.isRequired,
  relDispPositions: PropTypes.array.isRequired,
  removeLabel: PropTypes.func.isRequired,
  upperBound: PropTypes.number.isRequired,
  lowerBound: PropTypes.number.isRequired
};

Panel.defaultProps = () => ({
  panelInterface: undefined,
  panelData: undefined
});

const staticStyles = {
  bounding: {
    transitionProperty: 'all',
    transitionDuration: uiConsts.trans.duration,
    transitionTimingFunction: uiConsts.trans.timing,
    overflow: 'hidden',
    padding: 0,
    boxSizing: 'border-box',
    border: '1px solid #ddd'
  },
  panel: {
    transitionProperty: 'all',
    transitionDuration: uiConsts.trans.duration,
    transitionTimingFunction: uiConsts.trans.timing,
    boxSizing: 'border-box',
    textAlign: 'center',
    overflow: 'hidden',
    color: '#bbb'
  },
  labelTable: {
    transitionProperty: 'all',
    transitionDuration: uiConsts.trans.duration,
    transitionTimingFunction: uiConsts.trans.timing,
    padding: 0,
    tableLayout: 'fixed',
    borderSpacing: 0,
    boxSizing: 'border-box'
  },
  labelRow: {
    transitionProperty: 'all',
    transitionDuration: uiConsts.trans.duration,
    transitionTimingFunction: uiConsts.trans.timing,
  },
  labelRowHover: {
    background: fade("#f3f3f3", 0.2)
  },
  labelCell: {
    paddingTop: 0,
    paddingBottom: 0
  },
  labelNameCell: {
    borderRight: '1px solid #fff',
    fontWeight: 400
  },
  labelOuter: {
    position: 'relative',
    overflow: 'hidden'
  },
  labelInner: {
    paddingRight: 3,
    overflow: 'hidden',
    whiteSpace: 'normal',
    verticalAlign: 'middle',
    position: 'relative'
  },
  labelP: {
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    width: '100%',
    margin: 0,
    fontWeight: 350
  },
  labelClose: {
    transition: '1s',
    position: 'absolute',
    top: 0,
    right: 2,
    cursor: 'pointer',
    border: 'none',
    background: 'none',
    padding: 0,
    margin: 0,
    opacity: 0.5
  }
};

export default injectSheet(staticStyles)(Panel);
