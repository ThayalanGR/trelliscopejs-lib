import React, { Component } from 'react'
import PropTypes from 'prop-types';
import injectSheet from 'react-jss';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { max } from 'd3-array';
import Panel from './Panel';
import { setLabels, setLayout } from '../actions';
import {
  contentWidthSelector, sidebarActiveSelector, contentHeightSelector, windowHeightSelector, windowWidthSelector
} from '../selectors/ui';
import { cogInfoSelector } from '../selectors/display';
import { currentCogDataSelector, filterCardinalitySelector } from '../selectors/cogData';
import {
  configSelector, cogInterfaceSelector, layoutSelector, aspectSelector, labelsSelector,
  panelRenderersSelector, curDisplayInfoSelector, nPerPageSelector, pageNumSelector,
  localPanelsSelector, displayInfoSelector
} from '../selectors';
import uiConsts from '../assets/styles/uiConsts';
// enlarge view stylesheet import
import "../assets/styles/enlarge.css";
import { store } from '..';
// fontawesome import
require('@fortawesome/fontawesome-free/js/all');

class Content extends Component {

  constructor(props) {
    super(props);
    this.enLargedPanelChartHolder = null;
    this.state = {
      isEnlarge: false,
      currentPanelData: {},
    }
    this.enLargeViewGenerator = this.enLargeViewGenerator.bind(this);
    this.enLargePanelHandler = this.enLargePanelHandler.bind(this);
  }

  async enLargePanelHandler(currentPanelData) {
    await this.setState({ isEnlarge: true, currentPanelData });
    const { contentWidth, contentHeight } = this.props.dims;
    let calculatedHeight = ((contentHeight * 95 / 100) * 92 / 100);
    const enLargedChartTitleRef = document.getElementById("enlarged-panel-title");
    const enLargedChartHolderRef = document.getElementById("enlarged-chart-holder");
    let panelTitle = store.getState().cogData[currentPanelData.panelKey].name || "";
    enLargedChartTitleRef.innerText = panelTitle;
    if (this.props.panelInterface.type === 'chart') {
      this.props.panelRenderers[this.props.curDisplayInfo.info.name].fn(this.props.panelInterface,
        contentWidth, calculatedHeight, true, currentPanelData.panelKey, enLargedChartHolderRef, currentPanelData.upperBound, currentPanelData.lowerBound, 0);
    } else if (this.props.panelInterface.type === "image_src") {
      this.props.panelRenderers[this.props.curDisplayInfo.info.name].fn(this.props.panelInterface, contentWidth, calculatedHeight, true, currentPanelData.panelKey, enLargedChartHolderRef);
    }
  }

  getRoundedOffValue(value, scaleValue, isRoundUp = true) {
    let output = value;
    let calc = value % scaleValue;
    if (calc) {
      if (isRoundUp) {
        calc = scaleValue - calc;
        output = output + calc;
      } else
        output = output - calc;
    }
    return output;
  }

  enLargeViewGenerator(cfg) {
    return (
      <div id="enlarge-view-wrapper" className="enlarge-view-wrapper" style={{
        width: `${this.props.dims.contentWidth}px`, height: `${this.props.dims.windowHeight + (cfg.header.enabled ? uiConsts.header.height : 0)}px`, position: 'absolute', top: 0, right: 0
        , zIndex: "1011", background: "white"
      }}
      >
        <div
          className="enlarge-view-close"
          onClick={() =>
            this.setState({
              isEnlarge: false,
              currentPanelData: {}
            })}
        >
          <i className="fas fa-arrow-left"></i>&nbsp;&nbsp;Back to Report
        </div>
        <div className="enlarge-view-core">
          <div id="enlarged-panel-title" className="enlarge-panel-title text-align-center">Panel Title</div>
          <div id="enlarged-chart-holder" className="enlarged-chart-holder"></div>
        </div>
      </div>
    )
  }

  UNSAFE_componentWillReceiveProps(nprops) {
    const { dims } = this.props;
    const totalResChange = (nprops.dims.totalWidth !== dims.totalWidth) || (nprops.dims.totalHeight !== dims.totalHeight);
    const chartResChange = (nprops.dims.pHeight !== dims.pHeight) || (nprops.dims.pWidth !== dims.pWidth);

    if (this.state.isEnlarge && (totalResChange || chartResChange)) {
      this.enLargePanelHandler(this.state.currentPanelData);
    }
  }

  componentWillUnmount() {
    this.setState({
      isEnlarge: false,
      currentPanelData: {}
    })
  }

  render() {
    const { classes, contentStyle, ccd, ci, cinfo, cfg, layout, labels, dims, panelRenderers, panelInterface, panelData, removeLabel, curDisplayInfo, displayInfo, relDispPositions } = this.props;
    let ret = <div />;

    if (ci && ccd && cinfo && panelRenderers.fn !== null) {
      const panelLabels = [];
      for (let i = 0; i < ccd.length; i += 1) {
        const curLabels = [];
        for (let j = 0; j < labels.length; j += 1) {
          curLabels.push({
            name: labels[j],
            value: ccd[i][labels[j]],
            type: cinfo[labels[j]].type,
            desc: cinfo[labels[j]].desc
          });
        }
        panelLabels.push(curLabels);
      }
      let panelMatrix = [];
      const max = [];
      const min = [];
      for (let i = 0; i < ccd.length; i += 1) {
        let rr;
        let cc;
        if (layout.arrange === 'row') {
          rr = Math.floor(i / layout.ncol);
          cc = i % layout.ncol;
        } else {
          rr = i % layout.nrow;
          cc = Math.floor(i / layout.nrow);
        }
        if (panelInterface.type === 'chart') {
          let temp = panelData[ccd[i].__index].data.map(a => a.data)
          temp = temp.filter(e => e !== null)
          max.push(Math.max(...temp))
          min.push(Math.min(...temp))

        }
        panelMatrix.push(
          {
            rowIndex: rr,
            colIndex: cc,
            iColIndex: layout.ncol - cc - 1,
            key: i,
            labels: panelLabels[i],
            index: ccd[i].__index,
            values: ccd[i]
          }
        );
      }

      panelMatrix.sort((a, b) => ((a.key > b.key) ? 1 : ((b.key > a.key) ? -1 : 0)));
      if (cfg.panelFilter.enabled) {
        let type = cfg.panelFilter.type;
        let size = cfg.panelFilter.size;
        let panelFilterLabel = `${cfg.panelFilter.name}Value`;
        let panelLength = panelMatrix.length;
        if (panelLength >= size) {
          switch (type) {
            case "top":
              panelMatrix = panelMatrix.sort((a, b) => (a.values[panelFilterLabel] < b.values[panelFilterLabel] ? 1 : (b.values[panelFilterLabel] < a.values[panelFilterLabel] ? -1 : 0)))
              panelMatrix = panelMatrix.slice(0, size)
              break;
            case "bottom":
              panelMatrix = panelMatrix.sort((a, b) => (a.values[panelFilterLabel] > b.values[panelFilterLabel] ? 1 : (b.values[panelFilterLabel] > a.values[panelFilterLabel] ? -1 : 0)))
              panelMatrix = panelMatrix.slice(0, size)
              break;
            case "topNbottom":
              if ((size * 2) <= panelLength) {
                let topPanels = [...panelMatrix];
                topPanels = topPanels.sort((a, b) => (a.values[panelFilterLabel] < b.values[panelFilterLabel] ? 1 : (b.values[panelFilterLabel] < a.values[panelFilterLabel] ? -1 : 0)))
                let bottomPanels = [...panelMatrix];
                bottomPanels = bottomPanels.sort((a, b) => (a.values[panelFilterLabel] > b.values[panelFilterLabel] ? 1 : (b.values[panelFilterLabel] > a.values[panelFilterLabel] ? -1 : 0)))
                topPanels = topPanels.slice(0, size)
                bottomPanels = bottomPanels.slice(0, size)
                panelMatrix = [...topPanels, ...bottomPanels];
              }
              break;
            case "all":
              break;
            default:
              break;
          }
        }
        if (cfg.panelFilter.type === "all") {

        }
      }
      const upperBound = this.getRoundedOffValue(Math.max(...max), 100)
      const lowerBound = this.getRoundedOffValue(Math.min(...min), 100, false);

      ret = (
        !this.state.isEnlarge ?
          <div className={classes.content} style={{ ...contentStyle, top: cfg.header.enabled ? uiConsts.header.height : 0 }}>
            {panelMatrix.map((el, keyIndex) => {
              return <Panel
                key={`${el.index}`}
                cfg={cfg}
                panelKey={el.index.toString()}
                labels={el.labels}
                labelArr={labels}
                iface={ci}
                panelRenderers={panelRenderers}
                panelData={panelData[el.index]}
                panelInterface={panelInterface}
                removeLabel={removeLabel}
                dims={dims}
                rowIndex={el.rowIndex}
                iColIndex={el.iColIndex}
                curDisplayInfo={curDisplayInfo}
                displayInfo={displayInfo}
                relDispPositions={relDispPositions}
                upperBound={upperBound}
                lowerBound={lowerBound}
                enLargePanelHandler={this.enLargePanelHandler}
                keyIndex={keyIndex}
              />
            })}
          </div> : this.enLargeViewGenerator(cfg)
      );
    }

    return (ret);

  }

}

Content.propTypes = {
  contentStyle: PropTypes.object.isRequired,
  ccd: PropTypes.array.isRequired,
  ci: PropTypes.object,
  cinfo: PropTypes.object.isRequired,
  cfg: PropTypes.object.isRequired,
  layout: PropTypes.object.isRequired,
  labels: PropTypes.array.isRequired,
  dims: PropTypes.object.isRequired,
  panelRenderers: PropTypes.object.isRequired,
  panelInterface: PropTypes.object,
  sidebar: PropTypes.string.isRequired,
  curPage: PropTypes.number.isRequired,
  totPages: PropTypes.number.isRequired,
  panelData: PropTypes.object.isRequired,
  displayInfo: PropTypes.object.isRequired,
  relDispPositions: PropTypes.array.isRequired
};

Content.defaultProps = () => ({
  ci: undefined,
  panelInterface: undefined
});

const staticStyles = {
  content: {
    background: '#fdfdfd',
    position: 'absolute',
    top: 0,
    right: 0,
  }
};

// ------ redux container ------
const getTextWidth = (labels, size) => {
  const el = document.createElement('span');
  el.style.fontWeight = 'normal';
  el.style.fontSize = `${size}px`;
  el.style.fontFamily = 'Open Sans';
  el.style.visibility = 'hidden';
  const docEl = document.body.appendChild(el);
  const w = labels.map((lb) => {
    docEl.innerHTML = lb;
    return docEl.offsetWidth;
  });
  document.body.removeChild(docEl);
  return max(w);
};

const relDispPositionsSelector = (state) => state.relDispPositions;

const stateSelector = createSelector(windowWidthSelector, windowHeightSelector, contentWidthSelector, contentHeightSelector, currentCogDataSelector, cogInterfaceSelector, layoutSelector, aspectSelector, labelsSelector, cogInfoSelector, configSelector, panelRenderersSelector, curDisplayInfoSelector, sidebarActiveSelector, pageNumSelector, filterCardinalitySelector, nPerPageSelector, localPanelsSelector, relDispPositionsSelector, displayInfoSelector, (ww, wh, cw, ch, ccd, ci, layout, aspect, labels, cinfo, cfg, panelRenderers, cdi, sidebar, curPage, card, npp, localPanels, rdp, di) => {
  const pPad = uiConsts.content.panel.pad;
  let preW = Math.round(cw / layout.ncol, 0);
  let preH = Math.round(preW * aspect, 0);
  if ((preH * layout.nrow) > ch) {
    preH = Math.round(ch / layout.nrow, 0);
    preW = Math.round(preH / aspect, 0);
  }
  let labelHeight = (Math.min(preW, preH)) * 0.08;
  labelHeight = Math.max(Math.min(labelHeight, 26), 13);

  const labelPad = (labelHeight / 1.625) - 4;

  const fontSize = labelHeight - labelPad;

  const nLabels = labels.length;
  const wExtra = (pPad + 2) * (layout.ncol + 1);
  let newW = Math.round((cw - wExtra) / layout.ncol, 0);
  let newH = Math.round(newW * aspect, 0);
  let wOffset = 0;
  const hOffset = uiConsts.header.height;
  const labelWidth = getTextWidth(labels, fontSize) + labelPad;
  const panelData = localPanels;
  return ({
    contentStyle: {
      width: cw,
      height: ch,
      display: 'grid',
      gridTemplateColumns: `repeat(${layout.ncol}, auto)`,
      gridTemplateRows: `repeat(${layout.nrow}, auto)`,
      boxSizing: 'border-box',
    },
    ccd,
    ci,
    cinfo,
    cfg,
    layout,
    labels,
    dims: {
      ww: newW,
      hh: newH,
      labelHeight,
      labelWidth,
      labelPad,
      fontSize,
      nLabels,
      pWidth: cw / layout.ncol,
      pHeight: (ch / layout.nrow) - (nLabels * labelHeight),
      wOffset,
      hOffset,
      pPad,
      windowWidth: ww,
      windowHeight: wh,
      contentWidth: cw,
      contentHeight: ch,
      totalWidth: cw / layout.ncol,
      totalHeight: ch / layout.nrow
    },
    panelRenderers,
    panelInterface: cdi.info.panelInterface,
    sidebar,
    curPage,
    totPages: Math.ceil(card / npp),
    panelData,
    curDisplayInfo: cdi,
    displayInfo: di,
    relDispPositions: rdp,
  });
});

const mapStateToProps = (state) => (stateSelector(state));

const mapDispatchToProps = (dispatch) => ({
  removeLabel: (name, labels) => {
    const idx = labels.indexOf(name);
    if (idx > -1) {
      const newLabels = Object.assign([], labels);
      newLabels.splice(idx, 1);
      dispatch(setLabels(newLabels));
    }
  },
  setPageNum: (dir, curPage, totPages) => {
    let n = curPage;
    if (dir === 'right') {
      n -= 1;
      if (n < 1) {
        n += 1;
      }
    } else {
      n += 1;
      if (n > totPages) {
        n -= 1;
      }
    }
    dispatch(setLayout({ pageNum: n }));
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(injectSheet(staticStyles)(Content));
