describe('Padlet management', () => {
  const ts = Date.now();
  const username = `padletuser${ts}`;
  const password = 'Pass@123';
  const padletTitle = `לוח בדיקה ${ts}`;

  before(() => {
    cy.register(username, password);
  });

  beforeEach(() => {
    cy.login(username, password);
  });

  it('creates a new padlet and displays it on the home page', () => {
    cy.contains('צור לוח').click();
    cy.get('input[placeholder="לוח הרעיונות שלי..."]').clear().type(padletTitle);
    cy.contains('button', 'צור לוח').click();
    cy.contains(padletTitle).should('be.visible');
  });

  it('enters a padlet and shows the creator name and creation time', () => {
    cy.contains(padletTitle).click();
    cy.url().should('include', '/padlets/');
    cy.contains(username).should('be.visible');
    cy.contains('לפני').should('be.visible');
  });

  it('adds a text post to the padlet', () => {
    cy.contains(padletTitle).click();
    cy.url().should('include', '/padlets/');
    cy.get('button[aria-label="הוסף פוסט"]').click();
    cy.contains('button', 'טקסט').click();
    cy.get('input[placeholder*="כותרת"]').type('פוסט בדיקה');
    cy.contains('button', 'שמור').click();
    cy.contains('פוסט בדיקה').should('be.visible');
  });
});
