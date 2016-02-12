jest.dontMock('../ServiceOverlay');
jest.dontMock('../ServiceTable');
jest.dontMock('../../mixins/GetSetMixin');
jest.dontMock('../../stores/MarathonStore');
jest.dontMock('../../stores/MesosSummaryStore');
jest.dontMock('../../utils/MesosSummaryUtil');
jest.dontMock('../../utils/RequestUtil');
jest.dontMock('../../utils/ResourceTableUtil');
jest.dontMock('../../utils/StringUtil');
jest.dontMock('../../stores/__tests__/fixtures/state.json');
jest.dontMock('../../utils/Util');

var React = require('react');
var ReactDOM = require('react-dom');
var TestUtils = require('react-addons-test-utils');

var MesosSummaryStore = require('../../stores/MesosSummaryStore');
var ServiceTable = require('../ServiceTable');
var HealthLabels = require('../../constants/HealthLabels');

// That is a single snapshot from
// http://srv5.hw.ca1.mesosphere.com:5050/master/state.json
var stateJSON = require('../../stores/__tests__/fixtures/state.json');

MesosSummaryStore.init();
MesosSummaryStore.processSummary(stateJSON);

function getTable(isAppsProcessed) {
  return TestUtils.renderIntoDocument(
    <ServiceTable services={[]}
      healthProcessed={isAppsProcessed} />
  );
}

describe('ServiceTable', function () {

  describe('#renderHealth', function () {

    beforeEach(function () {
      this.services = MesosSummaryStore.get('states').lastSuccessful().getServiceList().getItems();
    });

    it('should have loaders on all services', function () {
      var table = getTable(false);

      this.services.slice(0).forEach(function (row) {
        var healthlabel = TestUtils.renderIntoDocument(
          table.renderHealth(null, row)
        );

        var node = ReactDOM.findDOMNode(healthlabel);
        expect(node.classList.contains('loader-small')).toBeTruthy();
      });
    });

    it('should have N/A health status on all services', function () {
      var table = getTable(true);

      this.services.slice(0).forEach(function (row) {
        var healthlabel = TestUtils.renderIntoDocument(
          table.renderHealth(null, row)
        );
        expect(ReactDOM.findDOMNode(healthlabel).innerHTML).toEqual(HealthLabels.NA);
      });
    });

  });

});
