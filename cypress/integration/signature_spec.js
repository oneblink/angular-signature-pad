'use strict'

describe('inline signature', () => {
  it('should update img with dots', () => {
    cy.visit('/docs/index.local.html')

    cy.get('.cypress-inline-signature-pad > .signature-pad')
      .should('be.visible')
      .click(40, 50)
      .click(100, 50)

    cy.get('.cypress-inline-img').should('be.visible')
  })

  it('should update the number of stokes', () => {
    cy.get('.cypress-total-strokes').should('contain', '2')
  })

  it('should clear the image when clicking clear', () => {
    cy.get('.cypress-clear-inline-signature-pad').click()
    cy.get('.cypress-inline-img').should('not.be.visible')
    cy.get('.cypress-total-strokes').should('contain', '0')
  })
})
