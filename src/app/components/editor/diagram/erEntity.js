(function (angular) {
	'use strict';

	function EntityController($scope, $element, $attrs, $compile, $uibModal) {
		var ctrl = this;

		ctrl.connectors = [];

		ctrl.$onInit = function () {
			ctrl.entity.dom = $element;
			// add handler
			angular.element($element).draggable({
				drag: function (event, ui) {
					if (ui.position.left < 0) {
						ui.position.left = 0;
					}
					if (ui.position.top < 0) {
						ui.position.top = 0;
					}

					ctrl.redrawConnectors();
				}
			});
		};

		/*
		 Rendering related
		 */
		$scope.$on('attr:done', function () {
			ctrl.alignAttributes();
		});

		$scope.$on('attr:remove', function () {
			ctrl.alignAttributes();
		});

		ctrl.alignAttributes = function () {
			var radius = 200, // radius of the circle
				elementWidth = 100 / 2,
				elementHeight = 28 / 2;

			var fields = angular.element('#entity-' + ctrl.entity.name + ' er-attribute'),
				width = $element.width(),
				height = $element.height(),
				angle = 0,
				step = (2 * Math.PI) / fields.length;

			// for drawing
			fields.each(function () {
				var x = Math.round(width / 2 + radius * Math.cos(angle) - elementWidth);
				var y = Math.round(height / 2 + radius * Math.sin(angle) - elementHeight);
				angular.element(this).css({
					position: 'absolute',
					left: x + 'px',
					top: y + 'px'
				});

				angle += step;
			});

			ctrl.redrawConnectors();
		};

		ctrl.redrawConnectors = function () {
			ctrl.connectors.forEach(function (e) {
				e.redraw();
			});
		}

		ctrl.addConnectors = function (connector) {
			ctrl.connectors.push(connector);
		};

		ctrl.removeConnectors = function (index) {
			var connector = ctrl.connectors[index];
			connector.destroy();
			this.connectors.splice(index, 1);
		};

		/*
		 Attribute realted
		 */
		ctrl.addAttribute = function ($itemScope) {
			ctrl.addNewAttributeModal().then(function (data) {
				var newAttr = ctrl.entity.addAttribute(data);
				ctrl.addConnectors(new Connector(ctrl.entity, newAttr));
			});
		};

		/**
		 * Edit an attribute
		 * @param index array index of the attribute
		 */
		ctrl.editAttribute = function (index) {
			ctrl.editAttributeModal(ctrl.entity.getAttribute(index)).then(function (data) {
				ctrl.entity.editAttribute(index, data);
				ctrl.redrawConnectors();
			});
		};

		ctrl.removeAttribute = function (index) {
			ctrl.removeConnectors(index);
			ctrl.entity.removeAttribute(index);
		}

		ctrl.menuOptions = [
			['Add attribute', ctrl.addAttribute],
			null,
			['Rename', function () {
				console.log('Rename');
			}],
			null,
			['Remove', function () {
				console.log('Remove');
			}]
		];

		// modal related
		ctrl.addNewAttributeModal = function () {
			var modalInstance = $uibModal.open({
				templateUrl: 'new-attribute-prompt.html',
				controller: 'AttributeModalCtrl',
				size: 'lg',
				resolve: {
					title: function () {
						return 'Create new attribute';
					}
				}
			});

			return modalInstance.result; // return the promise
		};

		/**
		 *
		 * @param size modal size
		 * @param attribute the Attribute model
		 * @returns {*}
		 */
		ctrl.editAttributeModal = function (attribute) {
			// create a scope for the modal that contains attribute data
			var newScope = $scope.$new(true);
			newScope.attributeData = {
				name: attribute.name,
				type: attribute.type,
				notNull: attribute.notNull,
				isPrimaryKey: attribute.isPrimaryKey,
				isForeignKey: attribute.isForeignKey
			};

			var modalInstance = $uibModal.open({
				templateUrl: 'new-attribute-prompt.html',
				controller: 'AttributeModalCtrl',
				size: 'lg',
				scope: newScope, // pass the scope created
				resolve: {
					title: function () {
						return 'Edit attribute';
					}
				}
			});

			return modalInstance.result; // return the promise
		};
	}

	angular.module('editor').component('erEntity', {
		bindings: {
			entity: '<',
			onUpdate: '&'
		},
		templateUrl: './app/components/editor/diagram/erEntity.html',
		controller: EntityController
	});
})(window.angular);