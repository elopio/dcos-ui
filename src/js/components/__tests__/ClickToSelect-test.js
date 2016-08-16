jest.dontMock('../ClickToSelect');

/* eslint-disable no-unused-vars */
const React = require('react');
/* eslint-enable no-unused-vars */
const ReactDOM = require('react-dom');
const TestUtils = require('react-addons-test-utils');

const ClickToSelect = require('../ClickToSelect');

describe('ClickToSelect', function () {

  beforeEach(function () {
    this.spy = {selectAllChildren: jasmine.createSpy()};
    this.getSelection = document.getSelection;

    // Mock this document function, which is unsupported by jest.
    document.getSelection = function () {
      return this.spy;
    }.bind(this);

    this.container = document.createElement('div');
    this.instance = ReactDOM.render(
      <ClickToSelect>
        <span>hello text</span>
      </ClickToSelect>,
      this.container
    );
  });

  afterEach(function () {
    ReactDOM.unmountComponentAtNode(this.container);
    document.getSelection = this.getSelection;
  });

  it('sets selection when node is clicked', function () {
    var element = TestUtils.scryRenderedDOMComponentsWithTag(
      this.instance,
      'span'
    )[0];

    TestUtils.Simulate.click(element);

    expect(this.spy.selectAllChildren).toHaveBeenCalled();
  });

});
