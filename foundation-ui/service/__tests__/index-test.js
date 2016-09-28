jest.dontMock('../ServiceFactory');
jest.dontMock('../../services/Hooks');
/* eslint-disable no-unused-vars */
const React = require('react');
/* eslint-enable no-unused-vars */

const Hooks = require('../../services/Hooks');
const ServiceFactory = require('../ServiceFactory');

describe('ServiceFactory', function () {

  beforeEach(function () {
    this.hooks = new Hooks();
    this.hooks.addFilter = jasmine.createSpy('addFilter');
    this.hooks.removeFilter = jasmine.createSpy('removeFilter');
    this.hooks.doAction = jasmine.createSpy('doAction');
    this.service = new ServiceFactory(this.hooks);
  });

  it('calls addFilter and doAction when on is invoked', function () {
    var fakeAction = function () {};
    this.service.on('foo', fakeAction, 11);
    expect(this.hooks.addFilter).toHaveBeenCalledWith('foo', fakeAction, 11);
    expect(this.hooks.doAction).toHaveBeenCalledWith('foo');
    expect(this.hooks.removeFilter).not.toHaveBeenCalled();
  });

  it('calls removeFilter and doAction when removeListener is invoked', function () {
    var fakeAction = function () {};
    this.service.removeListener('foo', fakeAction);
    expect(this.hooks.removeFilter).toHaveBeenCalledWith('foo', fakeAction);
    expect(this.hooks.doAction).toHaveBeenCalledWith('foo');
    expect(this.hooks.addFilter).not.toHaveBeenCalled();
  });

});