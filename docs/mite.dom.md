# Mite.Dom

## Overview

This file contains a minimalist DOM helper module called `Mite.Dom`. It provides a fluent interface for working with DOM elements, offering methods to select elements, handle events, manipulate form values, and perform form validation.

## Module Information

- **Module**: `Mite.Dom`
- **Author**: Geoff Doty
- **Version**: 1.0
- **License**: MIT
- **Source**: [GitHub Repository](http://github.com/n2geoff/mite)

## Exported Function

### `dom(selector, context = document)`

The main function that creates a DOM helper instance for the specified selector within the given context.

**Parameters:**

- `selector` (string | Element | Element[]): The selector string or DOM element(s) to work with
- `context` (Document | Element): The context within which to search for elements (defaults to `document`)

**Returns:**  
An object with methods for DOM manipulation and event handling.

## Methods

### `el` - Raw Elements Accessor

- **Type**: Property (Array)
- **Description**: Returns the array of raw DOM elements that the helper is operating on.

### `on(event, handler, opts)` - Event Listener Setup

- **Description**: Adds an event listener to all selected elements
- **Parameters:**
    - `event` (string): The event type to listen for
    - `handler` (Function): The callback function to execute when the event occurs
    - `opts` (AddEventListenerOptions): Optional event listener options
- **Returns**: The helper instance (for chaining)

### `off(event, handler, opts)` - Event Listener Removal

- **Description**: Removes an event listener from all selected elements
- **Parameters:**
    - `event` (string): The event type to remove listener from
    - `handler` (Function): The callback function to remove
    - `opts` (AddEventListenerOptions): Optional event listener options
- **Returns**: The helper instance (for chaining)

### `val(newValue)` - Value Getter/Setter

- **Description**: Gets or sets the value of the first element, or sets values for all elements
- **Parameters:**
    - `newValue` (string): Optional value to set on elements
- **Returns**:
    - If `newValue` is provided: The helper instance (for chaining)
    - If `newValue` is not provided: The value of the first element

### `toggle(cls)` - CSS Class Toggler

- **Description**: Toggles a CSS class on all selected elements
- **Parameters:**
    - `cls` (string): The CSS class name to toggle
- **Returns**: The helper instance (for chaining)

### `data()` - Form Data Extraction

- **Description**: Extracts form data from a form element as a plain object
- **Returns**: Object containing form field names as keys and their values as values
- **Note**: Only works with `<form>` elements

### `validate(onInvalid)` - Form Validation

- **Description**: Validates a form and optionally calls a callback for invalid fields
- **Parameters:**
    - `onInvalid` (Function): Optional callback function that receives invalid fields
- **Returns**: Boolean indicating whether the form is valid
- **Note**: Only works with `<form>` elements

## Usage Examples

javascript

```javascript
// Select elements and add event listeners
dom('.button').on('click', handler);

// Get/set form values
dom('#myInput').val('new value');

// Toggle CSS classes
dom('.item').toggle('active');

// Handle form validation
dom('#myForm').validate((invalidFields) => {
    console.log('Invalid fields:', invalidFields);
});
```

## Notes

- The helper is designed to be chainable for fluent API usage
- When a string selector is provided, it uses `querySelectorAll` for selection
- When a DOM element is passed directly, it's wrapped in an array
- The `data()` method only works on form elements
- The `validate()` method uses the browser's built-in form validation API