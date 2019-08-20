import React from 'react';
import PropTypes from 'prop-types';
import injectSheet from 'react-jss';
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import ListSubheader from '@material-ui/core/ListSubheader';
import red from '@material-ui/core/colors/red';

const redA200 = red.A200;

const DisplayList = ({
  classes, di, displayGroups, handleClick, cfg
}) => {
  const groupKeys = Object.keys(displayGroups);

  const makeSubheader = (groupName, n) => {
    if (n > 1) {
      return <ListSubheader style={{ fontSize: 20, color: 'black' }}>{groupName}</ListSubheader>;
    }
    return <ListSubheader />;
  };

  const displayList = groupKeys.map((k) => (
    <div className={classes.groupContainer} key={k}>
      <GridList
        cellHeight={200}
        cols={3}
        className={classes.gridList}
      >
        {makeSubheader(k, groupKeys.length)}
        {displayGroups[k].map((i) => (
          <GridListTile
            key={i}
            className={classes.gridTile}
            title={(
              <div className={classes.gridTitle}>
                {di[i].name}
              </div>
            )}
            subtitle={(
              <span style={{ fontSize: 13 }}>
                {di[i].desc}
                <br />
                <span className={classes.gridSubtitle}>
                  {di[i].n}
                  &nbsp;panels,
                  {di[i].updated.substring(0, di[i].updated.length - 3)}
                </span>
              </span>
            )}
            titleBackground="rgba(0, 0, 0, 0.80)"
            onClick={() => handleClick(di[i].name, di[i].group, di[i].desc)}
          >
            <img
              src={`${cfg.cog_server.info.base}/${di[i].group}/${di[i].name}/thumb.png`}
              alt={di[i].name}
              className={classes.img}
              key={`img${i}`}
            />
          </GridListTile>
        ))}
      </GridList>
    </div>
  ));

  return (
    <div className={classes.container}>
      {displayList}
    </div>
  );
};

// ------ static styles ------

const staticStyles = {
  container: {
    height: 400,
    overflowY: 'auto'
  },
  groupContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-around'
  },
  gridList: {
    width: 700,
    marginBottom: 24
  },
  gridTile: {
    cursor: 'pointer'
  },
  gridTitle: {
    fontWeight: 400,
    color: redA200
  },
  gridSubtitle: {
    fontStyle: 'italic',
    fontSize: 11
  },
  img: {
    opacity: 1,
    '&:hover': {
      opacity: 0.7
    }
  }
};

DisplayList.propTypes = {
  classes: PropTypes.object.isRequired,
  di: PropTypes.array.isRequired,
  displayGroups: PropTypes.object.isRequired,
  handleClick: PropTypes.func.isRequired,
  cfg: PropTypes.object.isRequired
};

export default injectSheet(staticStyles)(DisplayList);
