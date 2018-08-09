import React, { PureComponent } from 'react';
import { Group } from 'react-art';
import Tile from './Tile';
import _ from 'lodash';
import dummyGrid from '../utilities/dummyGrid'

class Grid extends PureComponent {
  render() {
    var positions = dummyGrid(10, 10, 50)

    var hexGrid = _.map(positions, function(hexRow, index) {
      var rowElements = _.map(hexRow, function(hexData) {
        var hexKey = hexData.keyName;
        return (
          <Tile
            key={hexKey}
            centre={hexData.pixelCoordinates}
            isReachable={hexData.isReachable}
            isSelected={hexData.isSelected}
          />
        );
      });

      return <Group key={'row_' + index}>{rowElements}</Group>;
    });

    return <Group>{hexGrid}</Group>;
  }
}

export default Grid;