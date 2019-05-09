// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This is will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

// Unfortunately this does not work...
Cypress.Commands.add('drawVerticalLine', { prevSubject: true }, (subject, x, startY, finishY) => {
  cy.window()
    .then((win) => {
      const eventType = win && win.PointerEvent ? 'pointer' : 'mouse'
      cy.log(`Using ${eventType} events to draw vertical line`, {
        x,
        startY,
        finishY
      })

      cy.wrap(subject).trigger(`${eventType}down`, { which: 1, clientX: x, clientY: startY })
      const points = []
      let y = startY
      while (y !== finishY) {
        y++
        points.push(y)
      }
      cy.wrap(points).each((point) => {
        cy.wrap(subject).trigger(`${eventType}move`, { which: 1, clientX: x, clientY: point })
      })
      cy.wrap(subject).trigger(`${eventType}up`, { which: 1, clientX: x, clientY: startY })
    })
})
// So we just disable PointerEvent instead...
Cypress.on('window:before:load', win => {
  win.PointerEvent = null
})
