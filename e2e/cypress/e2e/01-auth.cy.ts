describe('Authentication', () => {
  const ts = Date.now();
  const username = `user${ts}`;
  const password = 'Pass@123';

  it('registers a new user and lands on the home page', () => {
    cy.visit('/login');
    cy.contains('button', 'הרשמה').click();
    cy.get('#username').type(username);
    cy.get('input[type="password"]').type(password);
    cy.contains('button[type="submit"]', 'הרשמה').click();
    cy.url().should('eq', Cypress.config().baseUrl + '/');
  });

  it('logs out and logs back in successfully', () => {
    cy.login(username, password);
    cy.contains('button', 'יציאה').click();
    cy.url().should('include', '/login');
    cy.login(username, password);
    cy.url().should('eq', Cypress.config().baseUrl + '/');
  });

  it('shows an error for wrong password', () => {
    cy.visit('/login');
    cy.get('#username').type(username);
    cy.get('input[type="password"]').type('WrongPass@1');
    cy.contains('button[type="submit"]', 'כניסה').click();
    cy.contains('שם משתמש או סיסמה שגויים').should('be.visible');
  });

  it('shows a validation error for short password on register', () => {
    cy.visit('/login');
    cy.contains('button', 'הרשמה').click();
    cy.get('#username').type(`short${ts}`);
    cy.get('input[type="password"]').type('123');
    cy.contains('button[type="submit"]', 'הרשמה').click();
    cy.contains('סיסמה חייבת להכיל לפחות 6 תווים').should('be.visible');
  });
});
