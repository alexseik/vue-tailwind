import { VNode, CreateElement } from 'vue';
import HtmlInput from '@/base/HtmlInput';
import CheckboxValue from '@/types/CheckboxValues';
import Key from '@/types/Key';

const isChecked = (model: CheckboxValue, value: CheckboxValue): boolean => {
  if (Array.isArray(model)) {
    return model.indexOf(value) >= 0;
  }

  return model === value;
};

const TToggle = HtmlInput.extend({
  name: 'TToggle',

  props: {
    value: {
      type: [String, Object, Number, Boolean, Array],
      default: true,
    },
    uncheckedValue: {
      type: [String, Object, Number, Boolean, Array],
      default: false,
    },
    model: {
      // v-model
      type: [String, Object, Number, Boolean, Array],
      default: undefined,
    },
    tabindex: {
      type: [String, Number],
      default: 0,
    },
    uncheckedPlaceholder: {
      type: String,
      default: undefined,
    },
    checkedPlaceholder: {
      type: String,
      default: undefined,
    },
    showValue: {
      type: Boolean,
      default: false,
    },
    classes: {
      type: Object,
      default() {
        return {
          wrapper: 'bg-gray-200 focus:outline-none focus:shadow-outline rounded-full border-2 border-transparent',
          wrapperChecked: 'bg-blue-500 focus:outline-none focus:shadow-outline rounded-full border-2 border-transparent',
          button: 'h-5 w-5 rounded-full bg-white shadow  flex items-center justify-center text-gray-400 text-xs',
          buttonChecked: 'h-5 w-5 rounded-full bg-white shadow  flex items-center justify-center text-blue-500 text-xs',
          checkedPlaceholder: 'rounded-full w-5 h-5 flex items-center justify-center text-gray-500 text-xs',
          uncheckedPlaceholder: 'rounded-full w-5 h-5 flex items-center justify-center text-gray-500 text-xs',
        };
      },
    },
    fixedClasses: {
      type: [String, Array, Object],
      default() {
        return {
          wrapper: 'relative inline-flex flex-shrink-0 cursor-pointer transition-colors ease-in-out duration-200',
          wrapperChecked: 'relative inline-flex flex-shrink-0 cursor-pointer transition-colors ease-in-out duration-200',
          button: 'inline-block absolute transform transition ease-in-out duration-200',
          buttonChecked: 'inline-block absolute transform transition ease-in-out duration-200',
          checkedPlaceholder: 'inline-block',
          uncheckedPlaceholder: 'inline-block',
        };
      },
    },
  },

  model: {
    prop: 'model',
    event: 'input',
  },

  data() {
    return {
      isChecked: isChecked(this.model, this.value),
      translateAreaWidth: 0,
    };
  },

  mounted() {
    this.translateAreaWidth = this.getTraslateAmount();
  },

  computed: {
    buttonStyle(): { [key: string]: string} {
      return {
        transform: `translateX(${this.translateAreaWidth}px)`,
      };
    },
    isDisabled() {
      return this.disabled || this.readonly;
    },
    currentValue(): CheckboxValue {
      return this.isChecked ? this.value : this.uncheckedValue;
    },
  },

  watch: {
    model(model) {
      this.isChecked = isChecked(model, this.value);
    },
    isChecked(checked: boolean) {
      let localValue;
      if (Array.isArray(this.model)) {
        localValue = [...this.model];
        const index = localValue.indexOf(this.value);
        if (checked && index < 0) {
          localValue.push(this.value);
        } else if (!checked && index >= 0) {
          localValue.splice(index, 1);
        }
      } else {
        localValue = this.currentValue;
      }

      this.translateAreaWidth = this.getTraslateAmount();

      this.$emit('input', localValue);
      this.$emit('change', localValue);
    },
  },

  methods: {
    getTraslateAmount(): number {
      if (!this.isChecked) {
        return 0;
      }

      return this.$el.clientWidth - (this.$refs.button as HTMLElement).offsetWidth;
    },
    blurHandler(e: FocusEvent) {
      this.$emit('blur', e);
    },

    focusHandler(e: FocusEvent) {
      this.$emit('focus', e);
    },

    getElement(): HTMLDivElement {
      return this.$el as HTMLDivElement;
    },

    blur() {
      this.getElement().blur();
    },

    click() {
      this.getElement().click();
    },

    spaceHandler(e: KeyboardEvent) {
      e.preventDefault();
      this.toggleValue();
    },
    clickHandler() {
      this.toggleValue();
    },
    toggleValue() {
      if (this.isDisabled) {
        return;
      }
      this.isChecked = !this.isChecked;
    },
    setChecked(checked: boolean) {
      this.isChecked = checked;
    },

    focus(options?: FocusOptions | undefined) {
      this.getElement().focus(options);
    },
  },

  render(createElement: CreateElement): VNode {
    const wrapperClass = this.isChecked
      ? this.getElementCssClass('wrapperChecked')
      : this.getElementCssClass('wrapper');

    let defaultSlot = this.$scopedSlots.default ? this.$scopedSlots.default({
      value: this.currentValue,
      uncheckedValue: this.uncheckedValue,
      isChecked: this.isChecked,
    }) : null;

    if (this.showValue && !defaultSlot) {
      defaultSlot = this.isChecked ? this.value : this.uncheckedValue;
    }

    let checkedslot: VNode[] | string | null | undefined = this.$scopedSlots.checked ? this.$scopedSlots.checked({
      value: this.currentValue,
      uncheckedValue: this.uncheckedValue,
      isChecked: this.isChecked,
    }) : null;

    if (this.uncheckedPlaceholder && !checkedslot) {
      checkedslot = this.uncheckedPlaceholder;
    }

    let uncheckedSlot: VNode[] | string | null | undefined = this.$scopedSlots.checked ? this.$scopedSlots.checked({
      value: this.currentValue,
      uncheckedValue: this.uncheckedValue,
      isChecked: this.isChecked,
    }) : null;

    if (this.checkedPlaceholder && !uncheckedSlot) {
      uncheckedSlot = this.checkedPlaceholder;
    }

    return createElement(
      'span',
      {
        class: wrapperClass,
        attrs: {
          role: 'checkbox',
          tabindex: this.tabindex,
          autofocus: this.autofocus,
          'aria-checked': this.isChecked ? 'true' : 'false',
        },
        on: {
          blur: this.blurHandler,
          focus: this.focusHandler,
          click: (e: MouseEvent) => {
            this.clickHandler();
            this.$emit('click', e);
          },
          keydown: (e: KeyboardEvent) => {
            if (e.keyCode === Key.SPACE) {
              this.spaceHandler(e);
            }

            this.$emit('keydown', e);
          },
        },
      },
      [
        createElement(
          'input',
          {
            ref: 'input',
            attrs: {
              value: this.currentValue,
              id: this.id,
              type: 'hidden',
              name: this.name,
              disabled: this.disabled,
              readonly: this.readonly,
              required: this.required,
              autofocus: undefined,
              tabindex: -1,
            },
          },
        ),
        createElement(
          'span',
          {
            class: this.getElementCssClass('checkedPlaceholder'),
            attrs: {
              'aria-hidden': 'true',
            },
          },
          checkedslot,
        ),
        createElement(
          'span',
          {
            class: this.getElementCssClass('uncheckedPlaceholder'),
            attrs: {
              'aria-hidden': 'true',
            },
          },
          uncheckedSlot,
        ),
        createElement(
          'span',
          {
            ref: 'button',
            class: this.isChecked
              ? this.getElementCssClass('buttonChecked')
              : this.getElementCssClass('button'),
            attrs: {
              'aria-hidden': 'true',
            },
            style: this.buttonStyle,
          },
          defaultSlot,
        ),
      ],
    );
  },
});

export default TToggle;
