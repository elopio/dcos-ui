jest.dontMock('../../../utils/DOMUtils');
jest.dontMock('../../../utils/JestUtil');
jest.dontMock('../VersionsModal');

var React = require('react');
var ReactDOM = require('react-dom');
var TestUtils = require('react-addons-test-utils');

var JestUtil = require('../../../utils/JestUtil');
var VersionsModal = require('../VersionsModal');

describe('VersionsModal', function () {

  describe('#onClose', function () {
    beforeEach(function () {
      this.callback = jasmine.createSpy();
      this.instance = TestUtils.renderIntoDocument(
        <VersionsModal onClose={this.callback} versionDump={{}} />
      );
    });

    it('shouldn\'t call the callback after initialization', function () {
      expect(this.callback).not.toHaveBeenCalled();
    });

    it('should call the callback when #onClose is called', function () {
      this.instance.onClose();
      expect(this.callback).toHaveBeenCalled();
    });

  });

  describe('#getContent', function () {
    beforeEach(function () {
      var data = {foo: 'bar'};
      this.instance = TestUtils.renderIntoDocument(
        <VersionsModal onClose={function () {}} versionDump={data} open={true}/>
      );
    });

    it('should return a pre element tag', function () {
      var content = this.instance.getContent();
      var contentInstance = TestUtils.renderIntoDocument(content);

      var node = ReactDOM.findDOMNode(contentInstance);
      var result = node.querySelector('pre');
      expect(result.tagName).toBe('PRE');
    });

    it('should return a pre element tag', function () {
      var content = this.instance.getContent();
      var contentInstance = TestUtils.renderIntoDocument(content);

      var node = ReactDOM.findDOMNode(contentInstance);
      var result = node.querySelector('pre');
      expect(result.innerHTML).toEqual('{\n  "foo": "bar"\n}');
    });

  });

});
