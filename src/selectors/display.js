import { createSelector } from 'reselect';
import { displayListSelector, curDisplayInfoSelector } from '.';

export const relatedDisplayGroupsSelector = createSelector(
  curDisplayInfoSelector, displayListSelector,
  (cdi, dl) => {
    const res = {};
    if (cdi.isLoaded) {
      const keySig = cdi.info.n; // n => keySig
      const dispID = [cdi.info.group, cdi.info.name].join('/');
      // dl.list.forEach((d, i) => {
      const sameKey = dl.n === keySig;  // d => dl
      const curID = [dl.group, dl.name].join('/');
      if (sameKey && curID !== dispID) {
        if (!res[dl.group]) {
          res[dl.group] = [];
        }
        res[dl.group].push(0); // i => 0
      }
      // });
    }
    return res;
  }
);

export const selectedRelDispsSelector = (state) => state.selectedRelDisps;

export const displayAspectsSelector = createSelector(
  curDisplayInfoSelector, displayListSelector, selectedRelDispsSelector,
  (cdi, dl, srd) => {
    const res = [];
    if (dl.isLoaded && cdi.isLoaded) {
      res.push({
        aspect: cdi.info.height / cdi.info.width,
        group: cdi.info.group,
        name: cdi.info.name
      });
    }
    srd.forEach((i) => {
      res.push({
        aspect: dl.list[i].height / dl.list[i].width,
        group: dl.list[i].group,
        name: dl.list[i].name
      });
    });
    return res;
  }
);

export const cogInfoSelector = createSelector(
  curDisplayInfoSelector,
  (cdi) => (
    cdi.info.cogInfo ? cdi.info.cogInfo : {}
  )
);

export const displayGroupsSelector = createSelector(
  displayListSelector,
  (dl) => {
    const dispGroups = {};
    if (dl.list) {
      for (let ii = 0; ii < dl.list.length; ii += 1) {
        if (!dispGroups[dl.list[ii].group]) {
          dispGroups[dl.list[ii].group] = [];
        }
        dispGroups[dl.list[ii].group].push(ii);
      }
    }
    return dispGroups;
  }
);
