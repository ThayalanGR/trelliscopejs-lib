import { json as d3json } from 'd3-request';
import crossfilter from 'crossfilter2';
import { default as getJSONP } from 'browser-jsonp'; // eslint-disable-line import/no-named-default
import {
  SET_APP_ID, SET_FULLSCREEN, WINDOW_RESIZE, UPDATE_DIMS,
  SET_ERROR_MESSAGE, ACTIVE_SIDEBAR, SET_LAYOUT, SET_LABELS, SET_SORT,
  SET_FILTER, SET_FILTER_VIEW, SELECT_DISPLAY, REQUEST_DISPLAY,
  RECEIVE_DISPLAY, REQUEST_DISPLAY_LIST, RECEIVE_DISPLAY_LIST,
  RECEIVE_COGDATA, REQUEST_CONFIG, RECEIVE_CONFIG,
  SET_DIALOG_OPEN, SET_PANEL_RENDERER, SET_LOCAL_PANELS,
  SB_LOOKUP, SET_DISPSELECT_DIALOG_OPEN, SET_SELECTED_RELDISPS,
  SET_REL_DISP_POSITIONS,
  SET_COG_DATA,
  SET_XY_LABEL_DECISON_ARRAY
} from '../constants';
import {
  groupBy
} from 'lodash';
import { store } from "../index"
import { placeHolder } from '../assets/images';

// highcharts imports 
import Highcharts from 'highcharts';
require('highcharts/modules/map')(Highcharts);
require("highcharts/highcharts-more")(Highcharts);
require("highcharts/modules/dumbbell")(Highcharts);
require("highcharts/modules/lollipop")(Highcharts);
require('highcharts/modules/exporting')(Highcharts);
require("highcharts/modules/accessibility")(Highcharts);

const getJSON = (obj) => d3json(obj.url, (json) => obj.callback(json));

export const setAppID = (id) => ({
  type: SET_APP_ID, id
});

export const setFullscreen = (fullscreen) => ({
  type: SET_FULLSCREEN, fullscreen
});

export const windowResize = (dims) => ({
  type: WINDOW_RESIZE, dims
});

export const setAppDims = (dims) => ({
  type: UPDATE_DIMS, dims
});

export const requestConfig = () => ({
  type: REQUEST_CONFIG
});

export const receiveConfig = (json) => ({
  type: RECEIVE_CONFIG,
  config: json,
  receivedAt: Date.now()
});

export const setActiveSidebar = (active) => ({
  type: ACTIVE_SIDEBAR, active
});

export const setDialogOpen = (isOpen) => ({
  type: SET_DIALOG_OPEN, isOpen
});

export const setDispSelectDialogOpen = (isOpen) => ({
  type: SET_DISPSELECT_DIALOG_OPEN, isOpen
});

export const setLayout = (layout) => ({
  type: SET_LAYOUT, layout
});

export const triggerPBI = (state) => {
  store.getState().pbiCallBack.pbiCallBack(state)
};

export const setLabels = (labels) => ({
  type: SET_LABELS, labels
});

export const setSort = (sort) => ({
  type: SET_SORT, sort
});

export const setFilter = (filter) => ({
  type: SET_FILTER, filter
});

export const setFilterView = (name, which) => ({
  type: SET_FILTER_VIEW, name, which
});

export const requestDisplayList = () => ({
  type: REQUEST_DISPLAY_LIST
});

export const receiveDisplayList = (json) => ({
  type: RECEIVE_DISPLAY_LIST,
  list: json,
  receivedAt: Date.now()
});

export const setSelectedDisplay = (name, group, desc) => ({
  type: SELECT_DISPLAY, name, group, desc
});

export const setSelectedRelDisps = (arr) => ({
  type: SET_SELECTED_RELDISPS,
  which: 'set',
  val: arr
});

export const addRelDisp = (i) => ({
  type: SET_SELECTED_RELDISPS,
  which: 'add',
  val: i
});

export const removeRelDisp = (i) => ({
  type: SET_SELECTED_RELDISPS,
  which: 'remove',
  val: i
});

export const resetRelDisps = (i) => ({
  type: SET_SELECTED_RELDISPS,
  which: 'reset',
  val: i
});

export const setRelDispPositions = (obj) => ({
  type: SET_REL_DISP_POSITIONS, obj
});

export const requestDisplay = (name, group) => ({
  type: REQUEST_DISPLAY, name, group
});

export const receiveDisplay = (name, group, json) => ({
  type: RECEIVE_DISPLAY,
  name,
  group,
  info: json,
  receivedAt: Date.now()
});

const receiveCogData = (iface, json) => ({
  type: RECEIVE_COGDATA,
  iface,
  crossfilter: json,
  receivedAt: Date.now()
});

export const setPanelRenderers = (name, fn) => ({
  type: SET_PANEL_RENDERER, name, fn
});

export const setLocalPanels = (dat) => ({
  type: SET_LOCAL_PANELS, dat
});

export const setErrorMessage = (msg) => ({
  type: SET_ERROR_MESSAGE, msg
});

// sidebar visiblity handler
export const sideBarVisiblityHandler = (cfg) => {
  const buttonsToShow = [];
  cfg.sidebar.gridEnabled && buttonsToShow.push("grid")
  cfg.sidebar.labelsEnabled && buttonsToShow.push("labels");
  cfg.sidebar.filterEnabled && buttonsToShow.push("filter");
  cfg.sidebar.sortEnabled && buttonsToShow.push("sort");

  let isSidebarEnabled = cfg.sidebar ? cfg.sidebar.enabled : true;
  if (isSidebarEnabled && buttonsToShow.length)
    isSidebarEnabled = true
  else
    isSidebarEnabled = false

  return isSidebarEnabled;
}

// footer visiblity handler
export const footerVisiblityHandler = (cfg, sort, filter) => {
  let isVisible = false;
  isVisible = (cfg.footer.enabled && (sort.length || filter.length)) ? true : false;
  return isVisible;
}


const setCogData = (cogDatJson) => {
  return {
    type: SET_COG_DATA,
    payload: cogDatJson
  }
}

const setCogDatAndState = (iface, cogDatJson, dObjJson, dispatch, hash) => {
  dispatch(setCogData(cogDatJson))
  const hashItems = {};
  hash.replace('#', '').split('&').forEach((d) => {
    const tuple = d.split('=');
    hashItems[tuple[0]] = tuple[[1]];
  });




  for (let i = 0; i < cogDatJson.length; i += 1) {
    cogDatJson[i].__index = i; // eslint-disable-line no-param-reassign
  }

  // dispatch({
  //   type: 
  // })

  dispatch(receiveCogData(iface, crossfilter(cogDatJson)));

  // now we can safely set several other default states that depend
  // on either display or cog data or can't be set until this data is loaded

  // sidebar
  if (hashItems.sidebar) {
    const sb = SB_LOOKUP[parseInt(hashItems.sidebar, 10)];
    dispatch(setActiveSidebar(sb));
  }


  // layout
  // (need to set layout before others because the default layout is 1,1
  //   and will be temporarily honored if this is set later)
  const { layout } = dObjJson.state;

  if (hashItems.nrow) {
    layout.nrow = parseInt(hashItems.nrow, 10);
  }
  if (hashItems.ncol) {
    layout.ncol = parseInt(hashItems.ncol, 10);
  }
  if (hashItems.arr) {
    layout.arrange = hashItems.arr;
  }
  dispatch(setLayout(layout));
  // need to do page number separately because it is recomputed when nrow/ncol are changed
  if (hashItems.pg) {
    dispatch(setLayout({ pageNum: parseInt(hashItems.pg, 10) }));
  }


  // labels
  let { labels } = dObjJson.state;
  if (hashItems.labels) {
    labels = hashItems.labels.split(',');
  }
  dispatch(setLabels(labels));

  // sort
  let { sort } = dObjJson.state;
  if (hashItems.sort) {
    sort = hashItems.sort.split(',').map((d, i) => {
      const vals = d.split(';');
      return ({
        order: i + 1,
        name: vals[0],
        dir: vals[1]
      });
    });
  }
  dispatch(setSort(sort));

  // filter
  const filter = dObjJson.state.filter ? dObjJson.state.filter : {};
  if (hashItems.filter) {
    const fltrs = hashItems.filter.split(',');
    fltrs.forEach((flt) => {
      const fltItems = {};
      flt.split(';').forEach((d) => {
        const tuple = d.split(':');
        fltItems[tuple[0]] = tuple[[1]];
      });
      // fltItems.var
      const fltState = {
        name: fltItems.var,
        type: fltItems.type,
        varType: dObjJson.cogInfo[fltItems.var].type
      };
      if (fltItems.type === 'select') {
        fltState.orderValue = 'ct,desc';
        fltState.value = fltItems.val.split('#').map(decodeURIComponent);
      } else if (fltItems.type === 'regex') {
        const { levels } = dObjJson.cogInfo[fltItems.var];
        const vals = [];
        const rval = new RegExp(decodeURIComponent(fltItems.val), 'i');
        levels.forEach((d) => { if (d.match(rval) !== null) { vals.push(d); } });
        fltState.regex = fltItems.val;
        fltState.value = vals;
        fltState.orderValue = 'ct,desc';
      } else if (fltItems.type === 'range') {
        const from = fltItems.from ? parseFloat(fltItems.from, 10) : undefined;
        const to = fltItems.to ? parseFloat(fltItems.to, 10) : undefined;
        fltState.value = { from, to };
        fltState.valid = true;
        if (from && to && from > to) {
          fltState.valid = false;
        }
      }
      filter[fltItems.var] = fltState;
    });
  }

  let fv = [];
  if (hashItems.fv) {
    fv = hashItems.fv.split(',');
  }

  const ciKeys = Object.keys(dObjJson.cogInfo);
  const fvObj = {
    active: [],
    inactive: []
  };
  for (let i = 0; i < ciKeys.length; i += 1) {
    if (dObjJson.cogInfo[ciKeys[i]].filterable) {
      if (fv.indexOf(ciKeys[i]) > -1) {
        fvObj.active.push(ciKeys[i]);
      } else if (dObjJson.state.filter
        && dObjJson.state.filter[ciKeys[i]] !== undefined) {
        fvObj.active.push(ciKeys[i]);
      } else {
        fvObj.inactive.push(ciKeys[i]);
      }
    }
  }

  dispatch(setFilterView(fvObj, 'set'));

  dispatch(setFilter(filter));

};

const getParsedJSONData = (data) => {
  if (data) {
    return JSON.parse(data);
  }
  return null;
}

// chart rendering happens here.....
const setPanelInfo = (dObjJson, cfg, dispatch) => {
  if (dObjJson.panelInterface.type === 'chart') {
    dispatch(setPanelRenderers(dObjJson.name, (x, width, height, isEnalrgeView, key, panel, upperBound, lowerBound, index) => {
      const seriesArray = [];

      let element;

      const result = groupBy(x.data[key].data, (item) => item.name);

      const keys = Object.keys(result);
      let type = '';

      keys.map((item, inx) => {

        const typedata = result[item].map(itm => itm.TypeColor);
        let y = typedata[0][inx];
        type = getSeriesType(y.actualType);

        const data = result[item].map((itm) => {
          let dataForm = {
            className: itm.className,
            events: itm.events,
            selectionId: itm.selectionId,
            tooltipPoints: itm.tooltipPoints,
            color: itm.color
          }
          if (type === 'lollipop') dataForm['low'] = itm.data;
          else dataForm['y'] = itm.data;

          return dataForm;

        });


        if (result[item][0].id === y.id) {
          const obj = {
            name: item,
            type,
            color: y.seriesColorData,
            data
          };
          if (type === "area") {
            obj["fillOpacity"] = y.fillOpacity;
          }
          if (type !== "bar" || type !== "column") {
            obj["lineWidth"] = y.strokeWidth;
            obj["dashStyle"] = y.dashStyle;
          }


          seriesArray.push(obj);
        }
        return true;
      });

      if (document.getElementById(`chart_${key}`))
        document.getElementById(`chart_${key}`).remove();

      element = document.createElement('div');
      let temp = 0;
      if (cfg.panelTitle.enabled)
        temp = cfg.panelTitle.fontSize
      element.style.height = `${height - temp}px`;
      element.style.width = `${width}px`;
      element.style.position = "relative";
      element.setAttribute('id', `chart_${key}`);
      try {
        let chartConfig = {
          ...dObjJson.defaultChartConfig
        };

        chartConfig['chart']['renderTo'] = element;
        chartConfig['xAxis']['categories'] = x.xAxis;
        if (!isEnalrgeView) {
          const state = store.getState();
          const xyVisiblity = state.xyDecisonArray[index];
          chartConfig['xAxis']['labels']['enabled'] = xyVisiblity.x
          chartConfig['yAxis']['labels']['enabled'] = xyVisiblity.y
        } else {
          chartConfig['xAxis']['labels']['enabled'] = true
          chartConfig['yAxis']['labels']['enabled'] = true
        }
        chartConfig['yAxis']['min'] = lowerBound;
        chartConfig['yAxis']['max'] = upperBound;
        chartConfig['series'] = seriesArray;
        // bubble appear fix for lollipop chart
        if (type === "lollipop") {
          chartConfig['plotOptions']['series']['marker']['enabled'] = true;
        } else {
          chartConfig['plotOptions']['series']['marker']['enabled'] = false;
        }

        // Custom API Integration
        if (cfg.customAPI) {
          let extendData = getParsedJSONData(cfg.customAPI);
          chartConfig = Object.assign(chartConfig, extendData.json);
        }
        console.log(chartConfig, "chartconfig;...")
        const chart = Highcharts.chart(chartConfig);

        setTimeout(() => {
          chart.reflow();
        }, 0);

      } catch (e) {
        console.error('Highcharts Error ----->>>>', e);
      }
      panel.appendChild(element)
      return element;
    }));
  } else if (dObjJson.panelInterface.type === 'image_src') {
    dispatch(setPanelRenderers(
      dObjJson.name,
      (x, width, height, isEnalrgeView, key, panel) => {
        if (document.getElementById(`img_panel_${key}`))
          document.getElementById(`img_panel_${key}`).remove();
        const imgUrl = x.data[key].Image;
        let divElem = document.createElement("div");
        divElem.style.height = `${height}px`;
        divElem.style.width = `${width}px`;
        divElem.style.display = "flex";
        divElem.style.alignItems = "center";
        divElem.style.justifyContent = "center";
        divElem.style.boxSizing = 'border-box';
        divElem.setAttribute("id", `img_panel_${key}`);
        let imgElem = document.createElement("img");
        imgElem.setAttribute("src", imgUrl);
        imgElem.setAttribute("alt", panel);
        imgElem.style.width = "100%";
        imgElem.style.height = "100%";
        imgElem.style.objectFit = "contain";
        imgElem.setAttribute("onerror", `this.src="${placeHolder}"`)
        divElem.appendChild(imgElem);
        panel.appendChild(divElem);
      })
    );
  }
};

// forms the decison array for x and y axis labling in panels (alternating coloring included.)
const formDecisionArray = (row, column, alternateBG) => {
  const decisionArr = [];
  for (let i = 0; i < row; i++) {
    for (let j = 0; j < column; j++) {
      let obj = { y: false, x: true, background: false, alternateBG };
      if (j === 0) obj.y = true;
      if (alternateBG.enabled) {
        if (alternateBG.type === 'column') {
          if (j % 2) { obj.background = true; }
        } else if (alternateBG.type === 'row') {
          if (i % 2) {
            obj.background = true;
          }
        } else if (alternateBG.type === 'multi') {
          if (i % 2 === 0) {
            if (j % 2) {
              obj.background = true;
            }
          } else {
            if (j % 2 === 0) {
              obj.background = true;
            }
          }
        }
      }
      decisionArr.push(obj);
    }
  }
  return decisionArr;
};

// custom function
const getSeriesType = (actualType) => {

  let type;
  if (actualType === 'column') {
    type = 'column';
  } else if (actualType === 'column-stacked') {
    type = 'column';
  } else if (actualType === 'column-stacked-percent') {
    type = 'column';
  } else if (actualType === 'line') {
    type = 'line';
  } else if (actualType === 'spline') {
    type = 'spline';
  } else if (actualType === 'area') {
    type = 'area';
  } else if (actualType === 'area-stacked') {
    type = 'area';
  } else if (actualType === 'area-stacked-percent') {
    type = 'area';
  } else if (actualType === 'areaspline') {
    type = 'areaspline';
  } else if (actualType === 'areaspline-stacked') {
    type = 'areaspline';
  } else if (actualType === 'areaspline-stacked-percent') {
    type = 'areaspline';
  } else if (actualType === 'bar') {
    type = 'bar';
  } else if (actualType === 'lollipop') {
    type = 'lollipop';
  }

  return type;
}

// set pbi callback
const setPbiCallBack = (callBack) => {
  return {
    type: "SET_PBI_CALLBACK",
    payload: callBack
  }
}

// this won't be used.. in our case (used for fetching config data from remote url)
export const fetchDisplay = (name, group, cfg, id = '', hash = '', getCogData = true) => (dispatch) => {
  dispatch(requestDisplay(name, group));
  const ldCallback = `__loadDisplayObj__${id}_${group}_${name}`;
  const cdCallback = `__loadCogData__${id}_${group}_${name}`;
  window[ldCallback] = (dObjJson) => {
    const iface = dObjJson.cogInterface;
    // now that displayObj is available, we can set the state with this data
    dispatch(receiveDisplay(name, group, dObjJson));
    setPanelInfo(dObjJson, cfg, dispatch);
    // set cog data state as pending while it loads
    if (getCogData) {
      dispatch(receiveCogData(iface));
      // TODO: perhaps do a quick load of initial panels while cog data is loading...
      // (to do this, have displayObj store initial panel keys and cogs)
      window[cdCallback] = (cogDatJson) => {
        // once cog data is loaded, set the state with this data
        // but first add an index column to the data so we can
        // preserve original order or do multi-column sorts
        setCogDatAndState(iface, cogDatJson, dObjJson, dispatch, hash);
      };

      // load the cog data
      if (cfg.data_type === 'jsonp') {
        getJSONP({
          url: `${cfg.display_base}${iface.group}/${iface.name}/cogData.jsonp`,
          callbackName: 'cdCallback',
          error: (err) => dispatch(setErrorMessage(
            `Couldn't load cognostics data: ${err.url}`
          ))
        });
      } else {
        getJSON({
          url: `${cfg.display_base}${iface.group}/${iface.name}/cogData.json`,
          callback: window[cdCallback]
        }).on('error', (err) => dispatch(setErrorMessage(
          `Couldn't load display list: ${err.target.responseURL}`
        )));
      }
    }
  };

  // get displayObj.json so we can find the cog data, etc.
  if (cfg.data_type === 'jsonp') {
    getJSONP({
      url: `${cfg.display_base}${group}/${name}/displayObj.jsonp`,
      callbackName: 'ldCallback',
      error: (err) => dispatch(setErrorMessage(
        `Couldn't load display object: ${err.url}`
      ))
    });
  } else {
    getJSON({
      url: `${cfg.display_base}${group}/${name}/displayObj.json`,
      callback: window[ldCallback]
    }).on('error', (err) => dispatch(setErrorMessage(
      `Couldn't load display list: ${err.target.responseURL}`
    )));
  }

};

const setXYLabelDecisionArray = (config) => {
  const row = config.displayList.state.layout.nrow;
  const column = config.displayList.state.layout.ncol;
  const alternateBG = { enabled: config.config.alternateBackground.enabled };
  if (alternateBG.enabled) {
    alternateBG["type"] = config.config.alternateBackground.type;
    alternateBG["backgroundColor"] = config.config.alternateBackground.backgroundColor;
  }
  return formDecisionArray(row, column, alternateBG);
}

// the display list is only loaded once at the beginning // but it needs the config so we'll load config first
export const fetchDisplayList = (config = 'config.jsonp', id = '', singlePageApp = false) => (dispatch) => {
  // don't read from the hash if not in single-page-app mode
  const hash = singlePageApp ? window.location.hash : '';

  const selfContained = !(typeof config === 'string' || config instanceof String);

  if (!selfContained) {

    // check else block.... (this block is used for fetching data from a remote link)

    dispatch(requestConfig());

    const dlCallback = `__loadDisplayList__${id}`;
    const cfgCallback = `__loadTrscopeConfig__${id}`;

    const configBase = config.replace(/[^\/]*$/, ''); // eslint-disable-line no-useless-escape

    const getConfigBase = (txt) => {
      let res = txt;
      if (!(/^https?:\/\/|^file:\/\/|^\//.test(txt))) {
        res = configBase;
        if (txt !== '') {
          res += `${txt}/`;
        }
      }
      return res;
    };

    window[cfgCallback] = (cfg) => {
      // if display_base is empty, we want to use same path as config
      // eslint-disable-next-line no-param-reassign
      cfg.display_base = getConfigBase(cfg.display_base);
      cfg.config_base = configBase; // eslint-disable-line no-param-reassign
      // eslint-disable-next-line no-param-reassign
      cfg.cog_server.info.base = getConfigBase(cfg.cog_server.info.base);
      dispatch(receiveConfig(cfg));

      window[dlCallback] = (json) => {
        dispatch(receiveDisplayList(json));
        // check to see if a display is specified already in the URL
        // and load it if it is
        const hashItems = {};
        hash.replace('#', '').split('&').forEach((d) => {
          const tuple = d.split('=');
          hashItems[tuple[0]] = tuple[[1]];
        });
        if (hashItems.display) {
          const names = json.map((d) => d.name);
          const idx = names.indexOf(hashItems.display);
          if (idx > -1) {
            const dObj = json[idx];
            dispatch(setSelectedDisplay(dObj.name, dObj.group, dObj.desc));
            dispatch(fetchDisplay(dObj.name, dObj.group, cfg, id, hash));
          }
        } else if (singlePageApp && json.length > 1) {
          dispatch(setDialogOpen(true));
          dispatch(setDispSelectDialogOpen(true));
        }
      };

      if (cfg.data_type === 'jsonp') {
        getJSONP({
          url: `${cfg.display_base}displayList.jsonp`,
          callbackName: dlCallback,
          error: (err) => dispatch(setErrorMessage(
            `Couldn't load display list: ${err.url}`
          ))
        });
      } else {
        getJSON({
          url: `${cfg.display_base}displayList.json`,
          callback: window[dlCallback]
        }).on('error', (err) => dispatch(setErrorMessage(
          `Couldn't load display list: ${err.target.responseURL}`
        )));
      }
    };
    // load the config to start
    // try json first and if the file isn't there, try jsonp

    const extRegex = /\.([0-9a-z]+)(?:[\?#]|$)/i; // eslint-disable-line no-useless-escape
    const configExt = config.match(extRegex)[0];

    if (configExt === '.jsonp') {
      getJSONP({
        url: config,
        callbackName: cfgCallback,
        error: (err) => dispatch(setErrorMessage(
          `Couldn't load config: ${err.url}`
        ))
      });
    } else if (configExt === '.json') {
      getJSON({
        url: config,
        callback: window[cfgCallback]
      });
    } else {
      dispatch(setErrorMessage(
        `Config specified as ${config} must have extension '.json' or '.jsonp'`
      ));
    }
  } else {

    // {{main block}}

    // all data for rendering app is self-contained in document
    dispatch(receiveConfig(config.config));

    dispatch(receiveDisplayList(config.displayList));

    const {
      name
    } = config.displayList;
    const {
      group
    } = config.displayList;
    let {
      desc
    } = config.displayList;

    desc = desc ? desc : name;

    dispatch(setSelectedDisplay(name, group, desc));
    dispatch(requestDisplay(name, group));
    const iface = config.displayList.cogInterface;
    dispatch(receiveDisplay(name, group, config.displayList));
    dispatch(receiveCogData(iface));
    dispatch(setLocalPanels(config.displayList.panelInterface.data));
    setCogDatAndState(iface, config.cogData, config.displayList, dispatch, '');
    setPanelInfo(config.displayList, config.config, dispatch);
    dispatch(setPbiCallBack(config.callBack));
  }

  // set xy label decision array
  dispatch({
    type: SET_XY_LABEL_DECISON_ARRAY,
    payload: setXYLabelDecisionArray(config)
  })
};
