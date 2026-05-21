const { TestEnvironment } = require('jest-environment-jsdom')

class CustomJSDOMEnvironment extends TestEnvironment {
  constructor(config) {
    super(config, {})
    // Make location configurable after construction
    try {
      Object.defineProperty(this.window, 'location', {
        get: () => this.window._location,
        set: (value) => {
          this.window._location = value
        },
        configurable: true,
      })
      // Store the current location
      this.window._location = this.window.location
    } catch (e) {
      // Fallback if location can't be redefined
      console.warn('Could not redefine window.location:', e)
    }
  }
}

module.exports = CustomJSDOMEnvironment
