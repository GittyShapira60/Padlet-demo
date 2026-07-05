declare global {
  namespace Cypress {
    interface Chainable {
      register(username: string, password: string): Chainable<void>;
      login(username: string, password: string): Chainable<void>;
    }
  }
}

Cypress.Commands.add('register', (username: string, password: string) => {
  cy.visit('/login');
  cy.contains('button', 'הרשמה').click();
  cy.get('#username').type(username);
  cy.get('input[type="password"]').type(password);
  cy.contains('button[type="submit"]', 'הרשמה').click();
  cy.url().should('eq', Cypress.config().baseUrl + '/');
});

Cypress.Commands.add('login', (username: string, password: string) => {
  cy.visit('/login');
  cy.contains('button', 'כניסה').click();
  cy.get('#username').type(username);
  cy.get('input[type="password"]').type(password);
  cy.contains('button[type="submit"]', 'כניסה').click();
  cy.url().should('eq', Cypress.config().baseUrl + '/');
});

export {};
