var Dropdown = function (_Component2) {
  _inherits(Dropdown, _Component2);

  function Dropdown(el, options) {
    _classCallCheck(this, Dropdown);

    var _this9 = _possibleConstructorReturn(this, (Dropdown.__proto__ || Object.getPrototypeOf(Dropdown)).call(this, Dropdown, el, options));

    _this9.el.M_Dropdown = _this9;
    Dropdown._dropdowns.push(_this9);

    _this9.id = M.getIdFromTrigger(el);
    _this9.dropdownEl = document.getElementById(_this9.id);
    _this9.$dropdownEl = $(_this9.dropdownEl);

    /**
     * Options for the dropdown
     * @member Dropdown#options
     * @prop {String} [alignment='left'] - Edge which the dropdown is aligned to
     * @prop {Boolean} [autoFocus=true] - Automatically focus dropdown el for keyboard
     * @prop {Boolean} [constrainWidth=true] - Constrain width to width of the button
     * @prop {Element} container - Container element to attach dropdown to (optional)
     * @prop {Boolean} [coverTrigger=true] - Place dropdown over trigger
     * @prop {Boolean} [closeOnClick=true] - Close on click of dropdown item
     * @prop {Boolean} [hover=false] - Open dropdown on hover
     * @prop {Number} [inDuration=150] - Duration of open animation in ms
     * @prop {Number} [outDuration=250] - Duration of close animation in ms
     * @prop {Function} onOpenStart - Function called when dropdown starts opening
     * @prop {Function} onOpenEnd - Function called when dropdown finishes opening
     * @prop {Function} onCloseStart - Function called when dropdown starts closing
     * @prop {Function} onCloseEnd - Function called when dropdown finishes closing
     */
    _this9.options = $.extend({}, Dropdown.defaults, options);

    /**
     * Describes open/close state of dropdown
     * @type {Boolean}
     */
    _this9.isOpen = false;

    /**
     * Describes if dropdown content is scrollable
     * @type {Boolean}
     */
    _this9.isScrollable = false;

    /**
     * Describes if touch moving on dropdown content
     * @type {Boolean}
     */
    _this9.isTouchMoving = false;

    _this9.focusedIndex = -1;
    _this9.filterQuery = [];

    // Move dropdown-content after dropdown-trigger
    if (!!_this9.options.container) {
      $(_this9.options.container).append(_this9.dropdownEl);
    } else {
      _this9.$el.after(_this9.dropdownEl);
    }

    _this9._makeDropdownFocusable();
    _this9._resetFilterQueryBound = _this9._resetFilterQuery.bind(_this9);
    _this9._handleDocumentClickBound = _this9._handleDocumentClick.bind(_this9);
    _this9._handleDocumentTouchmoveBound = _this9._handleDocumentTouchmove.bind(_this9);
    _this9._handleDropdownClickBound = _this9._handleDropdownClick.bind(_this9);
    _this9._handleDropdownKeydownBound = _this9._handleDropdownKeydown.bind(_this9);
    _this9._handleTriggerKeydownBound = _this9._handleTriggerKeydown.bind(_this9);
    _this9._setupEventHandlers();
    Dropdown._count++;
    return _this9;
  }

  _createClass(Dropdown, [{
    key: "destroy",


    /**
     * Teardown component
     */
    value: function destroy() {
      this._resetDropdownStyles();
      this._removeEventHandlers();
      Dropdown._dropdowns.splice(Dropdown._dropdowns.indexOf(this), 1);
      this.el.M_Dropdown = undefined;
    }

    /**
     * Setup Event Handlers
     */

  }, {
    key: "_setupEventHandlers",
    value: function _setupEventHandlers() {
      // Trigger keydown handler
      this.el.addEventListener('keydown', this._handleTriggerKeydownBound);

      // Item click handler
      this.dropdownEl.addEventListener('click', this._handleDropdownClickBound);

      // Hover event handlers
      if (this.options.hover) {
        this._handleMouseEnterBound = this._handleMouseEnter.bind(this);
        this.el.addEventListener('mouseenter', this._handleMouseEnterBound);
        this._handleMouseLeaveBound = this._handleMouseLeave.bind(this);
        this.el.addEventListener('mouseleave', this._handleMouseLeaveBound);
        this.dropdownEl.addEventListener('mouseleave', this._handleMouseLeaveBound);

        // Click event handlers
      } else {
        this._handleClickBound = this._handleClick.bind(this);
        this.el.addEventListener('click', this._handleClickBound);
      }
    }

    /**
     * Remove Event Handlers
     */

  }, {
    key: "_removeEventHandlers",
    value: function _removeEventHandlers() {
      this.el.removeEventListener('keydown', this._handleTriggerKeydownBound);
      this.dropdownEl.removeEventListener('click', this._handleDropdownClickBound);

      if (this.options.hover) {
        this.el.removeEventListener('mouseenter', this._handleMouseEnterBound);
        this.el.removeEventListener('mouseleave', this._handleMouseLeaveBound);
        this.dropdownEl.removeEventListener('mouseleave', this._handleMouseLeaveBound);
      } else {
        this.el.removeEventListener('click', this._handleClickBound);
      }
    }
  }, {
    key: "_setupTemporaryEventHandlers",
    value: function _setupTemporaryEventHandlers() {
      // Use capture phase event handler to prevent click
      document.body.addEventListener('click', this._handleDocumentClickBound, true);
      document.body.addEventListener('touchend', this._handleDocumentClickBound);
      document.body.addEventListener('touchmove', this._handleDocumentTouchmoveBound);
      this.dropdownEl.addEventListener('keydown', this._handleDropdownKeydownBound);
    }
  }, {
    key: "_removeTemporaryEventHandlers",
    value: function _removeTemporaryEventHandlers() {
      // Use capture phase event handler to prevent click
      document.body.removeEventListener('click', this._handleDocumentClickBound, true);
      document.body.removeEventListener('touchend', this._handleDocumentClickBound);
      document.body.removeEventListener('touchmove', this._handleDocumentTouchmoveBound);
      this.dropdownEl.removeEventListener('keydown', this._handleDropdownKeydownBound);
    }
  }, {
    key: "_handleClick",
    value: function _handleClick(e) {
      e.preventDefault();
      this.open();
      console.log(this)
    }
  }, {
    key: "_handleMouseEnter",
    value: function _handleMouseEnter() {
      this.open();
    }
  }, {
    key: "_handleMouseLeave",
    value: function _handleMouseLeave(e) {
      var toEl = e.toElement || e.relatedTarget;
      var leaveToDropdownContent = !!$(toEl).closest('.dropdown-content').length;
      var leaveToActiveDropdownTrigger = false;

      var $closestTrigger = $(toEl).closest('.dropdown-trigger');
      if ($closestTrigger.length && !!$closestTrigger[0].M_Dropdown && $closestTrigger[0].M_Dropdown.isOpen) {
        leaveToActiveDropdownTrigger = true;
      }

      // Close hover dropdown if mouse did not leave to either active dropdown-trigger or dropdown-content
      if (!leaveToActiveDropdownTrigger && !leaveToDropdownContent) {
        this.close();
      }
    }
  }, {
    key: "_handleDocumentClick",
    value: function _handleDocumentClick(e) {
      var _this10 = this;

      var $target = $(e.target);
      if (this.options.closeOnClick && $target.closest('.dropdown-content').length && !this.isTouchMoving) {
        // isTouchMoving to check if scrolling on mobile.
        setTimeout(function () {
          _this10.close();
        }, 0);
      } else if ($target.closest('.dropdown-trigger').length || !$target.closest('.dropdown-content').length) {
        setTimeout(function () {
          _this10.close();
        }, 0);
      }
      this.isTouchMoving = false;
    }
  }, {
    key: "_handleTriggerKeydown",
    value: function _handleTriggerKeydown(e) {
      // ARROW DOWN OR ENTER WHEN SELECT IS CLOSED - open Dropdown
      if ((e.which === M.keys.ARROW_DOWN || e.which === M.keys.ENTER) && !this.isOpen) {
        e.preventDefault();
        this.open();
      }
    }

    /**
     * Handle Document Touchmove
     * @param {Event} e
     */

  }, {
    key: "_handleDocumentTouchmove",
    value: function _handleDocumentTouchmove(e) {
      var $target = $(e.target);
      if ($target.closest('.dropdown-content').length) {
        this.isTouchMoving = true;
      }
    }

    /**
     * Handle Dropdown Click
     * @param {Event} e
     */

  }, {
    key: "_handleDropdownClick",
    value: function _handleDropdownClick(e) {
      // onItemClick callback
      if (typeof this.options.onItemClick === 'function') {
        var itemEl = $(e.target).closest('li')[0];
        this.options.onItemClick.call(this, itemEl);
      }
    }

    /**
     * Handle Dropdown Keydown
     * @param {Event} e
     */

  }, {
    key: "_handleDropdownKeydown",
    value: function _handleDropdownKeydown(e) {
      if (e.which === M.keys.TAB) {
        e.preventDefault();
        this.close();

        // Navigate down dropdown list
      } else if ((e.which === M.keys.ARROW_DOWN || e.which === M.keys.ARROW_UP) && this.isOpen) {
        e.preventDefault();
        var direction = e.which === M.keys.ARROW_DOWN ? 1 : -1;
        var newFocusedIndex = this.focusedIndex;
        var foundNewIndex = false;
        do {
          newFocusedIndex = newFocusedIndex + direction;

          if (!!this.dropdownEl.children[newFocusedIndex] && this.dropdownEl.children[newFocusedIndex].tabIndex !== -1) {
            foundNewIndex = true;
            break;
          }
        } while (newFocusedIndex < this.dropdownEl.children.length && newFocusedIndex >= 0);

        if (foundNewIndex) {
          this.focusedIndex = newFocusedIndex;
          this._focusFocusedItem();
        }

        // ENTER selects choice on focused item
      } else if (e.which === M.keys.ENTER && this.isOpen) {
        // Search for <a> and <button>
        var focusedElement = this.dropdownEl.children[this.focusedIndex];
        var $activatableElement = $(focusedElement).find('a, button').first();

        // Click a or button tag if exists, otherwise click li tag
        if (!!$activatableElement.length) {
          $activatableElement[0].click();
        } else if (!!focusedElement) {
          focusedElement.click();
        }

        // Close dropdown on ESC
      } else if (e.which === M.keys.ESC && this.isOpen) {
        e.preventDefault();
        this.close();
      }

      // CASE WHEN USER TYPE LETTERS
      var letter = String.fromCharCode(e.which).toLowerCase(),
          nonLetters = [9, 13, 27, 38, 40];
      if (letter && nonLetters.indexOf(e.which) === -1) {
        this.filterQuery.push(letter);

        var string = this.filterQuery.join(''),
            newOptionEl = $(this.dropdownEl).find('li').filter(function (el) {
          return $(el).text().toLowerCase().indexOf(string) === 0;
        })[0];

        if (newOptionEl) {
          this.focusedIndex = $(newOptionEl).index();
          this._focusFocusedItem();
        }
      }

      this.filterTimeout = setTimeout(this._resetFilterQueryBound, 1000);
    }

    /**
     * Setup dropdown
     */

  }, {
    key: "_resetFilterQuery",
    value: function _resetFilterQuery() {
      this.filterQuery = [];
    }
  }, {
    key: "_resetDropdownStyles",
    value: function _resetDropdownStyles() {
      this.$dropdownEl.css({
        display: '',
        width: '',
        height: '',
        left: '',
        top: '',
        'transform-origin': '',
        transform: '',
        opacity: ''
      });
    }
  }, {
    key: "_makeDropdownFocusable",
    value: function _makeDropdownFocusable() {
      // Needed for arrow key navigation
      this.dropdownEl.tabIndex = 0;

      // Only set tabindex if it hasn't been set by user
      $(this.dropdownEl).children().each(function (el) {
        if (!el.getAttribute('tabindex')) {
          el.setAttribute('tabindex', 0);
        }
      });
    }
  }, {
    key: "_focusFocusedItem",
    value: function _focusFocusedItem() {
      if (this.focusedIndex >= 0 && this.focusedIndex < this.dropdownEl.children.length && this.options.autoFocus) {
        this.dropdownEl.children[this.focusedIndex].focus();
      }
    }
  }, {
    key: "_getDropdownPosition",
    value: function _getDropdownPosition() {
      var offsetParentBRect = this.el.offsetParent.getBoundingClientRect();
      var triggerBRect = this.el.getBoundingClientRect();
      var dropdownBRect = this.dropdownEl.getBoundingClientRect();

      var idealHeight = dropdownBRect.height;
      var idealWidth = dropdownBRect.width;
      var idealXPos = triggerBRect.left - dropdownBRect.left;
      var idealYPos = triggerBRect.top - dropdownBRect.top;

      var dropdownBounds = {
        left: idealXPos,
        top: idealYPos,
        height: idealHeight,
        width: idealWidth
      };

      // Countainer here will be closest ancestor with overflow: hidden
      var closestOverflowParent = !!this.dropdownEl.offsetParent ? this.dropdownEl.offsetParent : this.dropdownEl.parentNode;

      var alignments = M.checkPossibleAlignments(this.el, closestOverflowParent, dropdownBounds, this.options.coverTrigger ? 0 : triggerBRect.height);

      var verticalAlignment = 'top';
      var horizontalAlignment = this.options.alignment;
      idealYPos += this.options.coverTrigger ? 0 : triggerBRect.height;

      // Reset isScrollable
      this.isScrollable = false;

      if (!alignments.top) {
        if (alignments.bottom) {
          verticalAlignment = 'bottom';
        } else {
          this.isScrollable = true;

          // Determine which side has most space and cutoff at correct height
          if (alignments.spaceOnTop > alignments.spaceOnBottom) {
            verticalAlignment = 'bottom';
            idealHeight += alignments.spaceOnTop;
            idealYPos -= alignments.spaceOnTop;
          } else {
            idealHeight += alignments.spaceOnBottom;
          }
        }
      }

      // If preferred horizontal alignment is possible
      if (!alignments[horizontalAlignment]) {
        var oppositeAlignment = horizontalAlignment === 'left' ? 'right' : 'left';
        if (alignments[oppositeAlignment]) {
          horizontalAlignment = oppositeAlignment;
        } else {
          // Determine which side has most space and cutoff at correct height
          if (alignments.spaceOnLeft > alignments.spaceOnRight) {
            horizontalAlignment = 'right';
            idealWidth += alignments.spaceOnLeft;
            idealXPos -= alignments.spaceOnLeft;
          } else {
            horizontalAlignment = 'left';
            idealWidth += alignments.spaceOnRight;
          }
        }
      }

      if (verticalAlignment === 'bottom') {
        idealYPos = idealYPos - dropdownBRect.height + (this.options.coverTrigger ? triggerBRect.height : 0);
      }
      if (horizontalAlignment === 'right') {
        idealXPos = idealXPos - dropdownBRect.width + triggerBRect.width;
      }
      return {
        x: idealXPos,
        y: idealYPos,
        verticalAlignment: verticalAlignment,
        horizontalAlignment: horizontalAlignment,
        height: idealHeight,
        width: idealWidth
      };
    }

    /**
     * Animate in dropdown
     */

  }, {
    key: "_animateIn",
    value: function _animateIn() {
      var _this11 = this;

      anim.remove(this.dropdownEl);
      anim({
        targets: this.dropdownEl,
        opacity: {
          value: [0, 1],
          easing: 'easeOutQuad'
        },
        scaleX: [0.3, 1],
        scaleY: [0.3, 1],
        duration: this.options.inDuration,
        easing: 'easeOutQuint',
        complete: function (anim) {
          if (_this11.options.autoFocus) {
            _this11.dropdownEl.focus();
          }

          // onOpenEnd callback
          if (typeof _this11.options.onOpenEnd === 'function') {
            _this11.options.onOpenEnd.call(_this11, _this11.el);
          }
        }
      });
    }

    /**
     * Animate out dropdown
     */

  }, {
    key: "_animateOut",
    value: function _animateOut() {
      var _this12 = this;

      anim.remove(this.dropdownEl);
      anim({
        targets: this.dropdownEl,
        opacity: {
          value: 0,
          easing: 'easeOutQuint'
        },
        scaleX: 0.3,
        scaleY: 0.3,
        duration: this.options.outDuration,
        easing: 'easeOutQuint',
        complete: function (anim) {
          _this12._resetDropdownStyles();

          // onCloseEnd callback
          if (typeof _this12.options.onCloseEnd === 'function') {
            _this12.options.onCloseEnd.call(_this12, _this12.el);
          }
        }
      });
    }

    /**
     * Place dropdown
     */

  }, {
    key: "_placeDropdown",
    value: function _placeDropdown() {
      // Set width before calculating positionInfo
      var idealWidth = this.options.constrainWidth ? this.el.getBoundingClientRect().width : this.dropdownEl.getBoundingClientRect().width;
      this.dropdownEl.style.width = idealWidth + 'px';

      var positionInfo = this._getDropdownPosition();
      this.dropdownEl.style.left = positionInfo.x + 'px';
      this.dropdownEl.style.top = positionInfo.y + 'px';
      this.dropdownEl.style.height = positionInfo.height + 'px';
      this.dropdownEl.style.width = positionInfo.width + 'px';
      this.dropdownEl.style.transformOrigin = (positionInfo.horizontalAlignment === 'left' ? '0' : '100%') + " " + (positionInfo.verticalAlignment === 'top' ? '0' : '100%');
    }

    /**
     * Open Dropdown
     */

  }, {
    key: "open",
    value: function open() {
      if (this.isOpen) {
        return;
      }
      this.isOpen = true;

      // onOpenStart callback
      if (typeof this.options.onOpenStart === 'function') {
        this.options.onOpenStart.call(this, this.el);
      }

      // Reset styles
      this._resetDropdownStyles();
      this.dropdownEl.style.display = 'block';

      this._placeDropdown();
      this._animateIn();
      this._setupTemporaryEventHandlers();
    }

    /**
     * Close Dropdown
     */

  }, {
    key: "close",
    value: function close() {
      if (!this.isOpen) {
        return;
      }
      this.isOpen = false;
      this.focusedIndex = -1;

      // onCloseStart callback
      if (typeof this.options.onCloseStart === 'function') {
        this.options.onCloseStart.call(this, this.el);
      }

      this._animateOut();
      this._removeTemporaryEventHandlers();

      if (this.options.autoFocus) {
        this.el.focus();
      }
    }

    /**
     * Recalculate dimensions
     */

  }, {
    key: "recalculateDimensions",
    value: function recalculateDimensions() {
      if (this.isOpen) {
        this.$dropdownEl.css({
          width: '',
          height: '',
          left: '',
          top: '',
          'transform-origin': ''
        });
        this._placeDropdown();
      }
    }
  }], [{
    key: "init",
    value: function init(els, options) {
      return _get(Dropdown.__proto__ || Object.getPrototypeOf(Dropdown), "init", this).call(this, this, els, options);
    }

    /**
     * Get Instance
     */

  }, {
    key: "getInstance",
    value: function getInstance(el) {
      var domElem = !!el.jquery ? el[0] : el;
      return domElem.M_Dropdown;
    }
  }, {
    key: "defaults",
    get: function () {
      return _defaults;
    }
  }]);

  return Dropdown;
}(Component);

/**
 * @static
 * @memberof Dropdown
 */


Dropdown._dropdowns = [];
Dropdown._modalsOpen = 0;
Dropdown._count = 0;

M.Dropdown = Dropdown;

if (M.jQueryLoaded) {
  M.initializeJqueryWrapper(Dropdown, 'dropdown', 'M_Dropdown');
}
})(cash, M.anime);