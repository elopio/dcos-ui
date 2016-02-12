jest.dontMock('../PermissionsTable');
jest.dontMock('../../constants/ActionTypes');
jest.dontMock('../../events/ACLUsersActions');
jest.dontMock('../../events/AppDispatcher');
jest.dontMock('../../stores/ACLStore');
jest.dontMock('../../utils/ResourceTableUtil');
jest.dontMock('../../utils/StringUtil');
jest.dontMock('../../utils/Util');

require('../../utils/StoreMixinConfig');

var React = require('react');
var ReactDOM = require('react-dom');
var TestUtils = require('react-addons-test-utils');

var ActionTypes = require('../../constants/ActionTypes');
var ACLStore = require('../../stores/ACLStore');
var AppDispatcher = require('../../events/AppDispatcher');
var PermissionsTable = require('../PermissionsTable');
var User = require('../../structs/User');

const userDetailsFixture =
  require('../../../../tests/_fixtures/acl/user-with-details.json');

describe('PermissionsTable', function () {

  beforeEach(function () {
    this.instance = TestUtils.renderIntoDocument(
      <PermissionsTable
        permissions={(new User(userDetailsFixture)).getUniquePermissions()}
        itemType="user"
        itemID={userDetailsFixture.uid} />
    );

    this.instance.handleOpenConfirm = jest.genMockFunction();
  });

  describe('#onAclStoreUserRevokeError', function () {

    it('updates state when an error event is emitted', function () {
      AppDispatcher.handleServerAction({
        type: ActionTypes.REQUEST_ACL_USER_REVOKE_ACTION_ERROR,
        data: 'foo bar',
        groupID: 'baz',
        userID: 'unicode'
      });

      expect(this.instance.state.permissionUpdateError).toEqual('foo bar');
      expect(this.instance.state.pendingRequest).toEqual(false);
    });

  });

  describe('#onAclStoreUserRevokeSuccess', function () {
    it('gets called when a success event is emitted', function () {
      this.instance.onAclStoreUserRevokeSuccess = jest.genMockFunction();

      AppDispatcher.handleServerAction({
        type: ActionTypes.REQUEST_ACL_USER_REVOKE_ACTION_SUCCESS,
        data: 'foo bar',
        groupID: 'baz',
        userID: 'unicode'
      });

      expect(this.instance.onAclStoreUserRevokeSuccess.mock.calls.length)
        .toEqual(1);
    });

  });

  describe('#getConfirmModalContent', function () {

    beforeEach(function () {
      this.instance.state.permissionID = 'service.marathon';
    });

    it('returns a message containing the group\'s name and user\'s name',
      function () {
      var modalContent = this.instance.getConfirmModalContent(
        [{rid: 'service.marathon', description: 'Marathon'}]
      );

      var instance = TestUtils.renderIntoDocument(modalContent);
      var node = ReactDOM.findDOMNode(instance);
      var paragraphs = node.querySelector('p');

      expect(paragraphs.textContent)
        .toEqual('Permission to Marathon will be removed.');
    });

    it('returns a message containing the error that was received',
      function () {
      this.instance.state.permissionUpdateError = 'quux';
      var modalContent = this.instance.getConfirmModalContent(
        [{rid: 'service.marathon', description: 'Marathon'}]
      );
      var instance = TestUtils.renderIntoDocument(modalContent);
      var node = ReactDOM.findDOMNode(instance);
      var paragraphs = node.querySelectorAll('p');

      expect(paragraphs[1].textContent)
        .toEqual('quux');
    });

  });

  describe('#renderPermissionLabel', function () {

    it('returns the specified property from the object', function () {
      var label = this.instance.renderPermissionLabel('foo', {foo: 'bar'});
      expect(label).toEqual('bar');
    });

  });

  describe('#renderButton', function () {

    it('calls handleOpenConfirm with the proper arguments', function () {
      var buttonWrapper = TestUtils.renderIntoDocument(
        this.instance.renderButton('foo', {uid: 'bar'})
      );

      var node = ReactDOM.findDOMNode(buttonWrapper);
      var button = node.querySelector('button');

      TestUtils.Simulate.click(button);

      expect(this.instance.handleOpenConfirm.mock.calls[0][0]).toEqual(
        {uid: 'bar'}
      );
    });

  });

  describe('#handleButtonConfirm', function () {
    beforeEach(function () {
      ACLStore.revokeUserActionToResource = jest.genMockFunction();
      ACLStore.revokeGroupActionToResource = jest.genMockFunction();
    });

    it('calls revokeUser if itemType is user', function () {
      var instance = TestUtils.renderIntoDocument(
        <PermissionsTable
          permissions={(new User(userDetailsFixture)).getUniquePermissions()}
          itemType="user"
          itemID={userDetailsFixture.uid} />
      );
      instance.handleButtonConfirm();

      expect(ACLStore.revokeUserActionToResource.mock.calls.length).toEqual(1);
    });

    it('calls revokeGroup if itemType is group', function () {
      var instance = TestUtils.renderIntoDocument(
        <PermissionsTable
          permissions={(new User(userDetailsFixture)).getUniquePermissions()}
          itemType="group"
          itemID={userDetailsFixture.uid} />
      );
      instance.handleButtonConfirm();

      expect(ACLStore.revokeGroupActionToResource.mock.calls.length).toEqual(1);
    });
  });
});
